/**
 * Tests unitaires pour queryHelpers
 */
import { describe, it, expect } from '@jest/globals';
import {
  parsePagination,
  parsePriceRange,
  parseDateRange,
  parseArray,
  parseBoolean,
  parseInteger,
} from '../../utils/queryHelpers.js';

describe('queryHelpers', () => {
  describe('parsePagination', () => {
    it('should parse valid pagination', () => {
      const result = parsePagination({ page: '2', limit: '20' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should use defaults', () => {
      const result = parsePagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should enforce minimum page', () => {
      const result = parsePagination({ page: '0' });
      expect(result.page).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const result = parsePagination({ limit: '200' });
      expect(result.limit).toBe(100);
    });

    it('should handle invalid values', () => {
      const result = parsePagination({ page: 'abc', limit: 'xyz' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('parsePriceRange', () => {
    it('should parse valid price range', () => {
      const result = parsePriceRange({ minPrice: '10', maxPrice: '100' });
      expect(result.minPrice).toBe(10);
      expect(result.maxPrice).toBe(100);
    });

    it('should handle single price', () => {
      const result = parsePriceRange({ minPrice: '50' });
      expect(result.minPrice).toBe(50);
      expect(result.maxPrice).toBeUndefined();
    });

    it('should reject invalid range', () => {
      expect(() => {
        parsePriceRange({ minPrice: '100', maxPrice: '50' });
      }).toThrow();
    });

    it('should handle empty query', () => {
      const result = parsePriceRange({});
      expect(result.minPrice).toBeUndefined();
      expect(result.maxPrice).toBeUndefined();
    });
  });

  describe('parseDateRange', () => {
    it('should parse valid date range', () => {
      const result = parseDateRange({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
    });

    it('should reject invalid range', () => {
      expect(() => {
        parseDateRange({
          startDate: '2024-12-31',
          endDate: '2024-01-01',
        });
      }).toThrow();
    });
  });

  describe('parseArray', () => {
    it('should parse comma-separated values', () => {
      const result = parseArray({ tags: 'a,b,c' }, 'tags');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle array values', () => {
      const result = parseArray({ tags: ['a', 'b'] }, 'tags');
      expect(result).toEqual(['a', 'b']);
    });

    it('should handle empty values', () => {
      const result = parseArray({}, 'tags');
      expect(result).toEqual([]);
    });

    it('should trim values', () => {
      const result = parseArray({ tags: 'a, b , c' }, 'tags');
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  describe('parseBoolean', () => {
    it('should parse true values', () => {
      expect(parseBoolean({ active: 'true' }, 'active')).toBe(true);
      expect(parseBoolean({ active: '1' }, 'active')).toBe(true);
      expect(parseBoolean({ active: 'yes' }, 'active')).toBe(true);
    });

    it('should parse false values', () => {
      expect(parseBoolean({ active: 'false' }, 'active')).toBe(false);
      expect(parseBoolean({ active: '0' }, 'active')).toBe(false);
    });

    it('should use default value', () => {
      expect(parseBoolean({}, 'active', true)).toBe(true);
      expect(parseBoolean({}, 'active', false)).toBe(false);
    });
  });

  describe('parseInteger', () => {
    it('should parse valid integer', () => {
      const result = parseInteger({ count: '42' }, 'count');
      expect(result).toBe(42);
    });

    it('should enforce min/max', () => {
      const result = parseInteger({ count: '5' }, 'count', { min: 10, max: 100 });
      expect(result).toBeUndefined();
    });

    it('should use default value', () => {
      const result = parseInteger({}, 'count', { defaultValue: 0 });
      expect(result).toBe(0);
    });

    it('should handle invalid values', () => {
      const result = parseInteger({ count: 'abc' }, 'count');
      expect(result).toBeUndefined();
    });
  });
});



