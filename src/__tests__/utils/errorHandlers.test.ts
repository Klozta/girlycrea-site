/**
 * Tests unitaires pour errorHandlers
 */
import { describe, it, expect } from '@jest/globals';
import {
  handleServiceError,
  handleSupabaseError,
  handleExternalServiceError,
  isRetryableError,
} from '../../utils/errorHandlers.js';
import {
  AppError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
} from '../../utils/errors.js';

describe('errorHandlers', () => {
  describe('handleServiceError', () => {
    it('should return AppError as-is', () => {
      const error = new NotFoundError('Product');
      const result = handleServiceError(error, 'test');
      expect(result).toBe(error);
    });

    it('should handle duplicate key errors', () => {
      const error = new Error('duplicate key value violates unique constraint');
      const result = handleServiceError(error, 'test');
      expect(result.statusCode).toBe(409);
    });

    it('should handle foreign key errors', () => {
      const error = new Error('violates foreign key constraint');
      const result = handleServiceError(error, 'test');
      expect(result.statusCode).toBe(400);
    });

    it('should handle not found errors', () => {
      const error = new Error('not found');
      const result = handleServiceError(error, 'test');
      expect(result.statusCode).toBe(404);
    });

    it('should handle connection errors', () => {
      const error = new Error('ECONNREFUSED');
      const result = handleServiceError(error, 'test');
      expect(result).toBeInstanceOf(ExternalServiceError);
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');
      const result = handleServiceError(error, 'test');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('handleSupabaseError', () => {
    it('should handle PGRST116 (table not found)', () => {
      const error = { code: 'PGRST116', message: 'Table not found' };
      const result = handleSupabaseError(error, 'test');
      expect(result.statusCode).toBe(404);
    });

    it('should handle 23505 (unique violation)', () => {
      const error = { code: '23505', message: 'Unique violation' };
      const result = handleSupabaseError(error, 'test');
      expect(result.statusCode).toBe(409);
    });

    it('should handle 23503 (foreign key violation)', () => {
      const error = { code: '23503', message: 'Foreign key violation' };
      const result = handleSupabaseError(error, 'test');
      expect(result.statusCode).toBe(400);
    });

    it('should handle 23502 (not null violation)', () => {
      const error = { code: '23502', message: 'Not null violation' };
      const result = handleSupabaseError(error, 'test');
      expect(result.statusCode).toBe(400);
    });

    it('should handle unknown codes', () => {
      const error = { code: 'UNKNOWN', message: 'Unknown error' };
      const result = handleSupabaseError(error, 'test');
      expect(result).toBeInstanceOf(DatabaseError);
    });
  });

  describe('handleExternalServiceError', () => {
    it('should return ExternalServiceError as-is', () => {
      const error = new ExternalServiceError('Stripe', 'API error');
      const result = handleExternalServiceError(error, 'Stripe', 'test');
      expect(result).toBe(error);
    });

    it('should create ExternalServiceError from Error', () => {
      const error = new Error('API timeout');
      const result = handleExternalServiceError(error, 'Resend', 'test');
      expect(result).toBeInstanceOf(ExternalServiceError);
      expect(result.statusCode).toBe(502);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for 5xx errors', () => {
      const error = new AppError('Server error', 500);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for validation errors', () => {
      const error = new AppError('Validation error', 400, 'VALIDATION_ERROR');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return true for rate limit errors', () => {
      const error = new AppError('Too many requests', 429);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for connection errors', () => {
      const error = new Error('ECONNREFUSED');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for 4xx errors', () => {
      const error = new AppError('Not found', 404);
      expect(isRetryableError(error)).toBe(false);
    });
  });
});



