/**
 * Tests unitaires pour metricsHelpers
 */
import { describe, it, expect } from '@jest/globals';
import {
  escapeCsvValue,
  calculateTrend,
  calculateDateRange,
  calculateZScore,
  calculateMADScore,
} from '../../utils/metricsHelpers.js';

describe('metricsHelpers', () => {
  describe('escapeCsvValue', () => {
    it('should escape commas in CSV values', () => {
      expect(escapeCsvValue('Hello, World')).toBe('"Hello, World"');
    });

    it('should escape quotes in CSV values', () => {
      expect(escapeCsvValue('Say "Hello"')).toBe('"Say ""Hello"""');
    });

    it('should escape newlines in CSV values', () => {
      expect(escapeCsvValue('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    });

    it('should not escape simple values', () => {
      expect(escapeCsvValue('Simple Value')).toBe('Simple Value');
    });

    it('should handle empty strings', () => {
      expect(escapeCsvValue('')).toBe('');
    });

    it('should handle numbers', () => {
      expect(escapeCsvValue('123')).toBe('123');
    });
  });

  describe('calculateTrend', () => {
    it('should calculate positive trend', () => {
      expect(calculateTrend(100, 120)).toBe(20);
    });

    it('should calculate negative trend', () => {
      expect(calculateTrend(100, 80)).toBe(-20);
    });

    it('should handle zero previous value', () => {
      expect(calculateTrend(0, 100)).toBe(0);
    });

    it('should handle zero current value', () => {
      expect(calculateTrend(100, 0)).toBe(-100);
    });

    it('should handle equal values', () => {
      expect(calculateTrend(100, 100)).toBe(0);
    });
  });

  describe('calculateDateRange', () => {
    it('should calculate 7d range', () => {
      const result = calculateDateRange(undefined, undefined, '7d');
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
      expect(result.end.getTime()).toBeGreaterThan(result.start.getTime());
    });

    it('should use provided dates', () => {
      const start = '2024-01-01';
      const end = '2024-01-31';
      const result = calculateDateRange(start, end);
      expect(result.start.toISOString()).toContain('2024-01-01');
      expect(result.end.toISOString()).toContain('2024-01-31');
    });

    it('should default to 30 days', () => {
      const result = calculateDateRange();
      const diffDays = (result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeCloseTo(30, 0);
    });
  });

  describe('calculateZScore', () => {
    it('should calculate z-score correctly', () => {
      const result = calculateZScore(150, [100, 105, 98, 102, 110]);
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for empty array', () => {
      expect(calculateZScore(100, [])).toBe(0);
    });

    it('should return 0 for zero std dev', () => {
      expect(calculateZScore(100, [100, 100, 100])).toBe(0);
    });
  });

  describe('calculateMADScore', () => {
    it('should calculate MAD score correctly', () => {
      const result = calculateMADScore(150, [100, 105, 98, 102, 110]);
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for empty array', () => {
      expect(calculateMADScore(100, [])).toBe(0);
    });
  });
});

