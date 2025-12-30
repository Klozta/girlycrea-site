/**
 * Helpers pour parsing et validation des query parameters
 * Centralise la logique de parsing des query params dans les routes
 */
import { Request } from 'express';
import { z } from 'zod';

/**
 * Parse les paramètres de pagination depuis les query params
 * @param query - Les query params de la requête
 * @param defaultLimit - Limite par défaut
 * @returns Objet avec page et limit
 */
export function parsePagination(query: any, defaultLimit: number = 10): { page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || defaultLimit));

  return { page, limit };
}

/**
 * Parse une plage de prix depuis les query params
 * @param query - Les query params
 * @returns Objet avec minPrice et maxPrice (optionnels)
 */
export function parsePriceRange(query: any): { minPrice?: number; maxPrice?: number } {
  const result: { minPrice?: number; maxPrice?: number } = {};

  if (query.minPrice) {
    const min = parseFloat(query.minPrice as string);
    if (!isNaN(min) && min >= 0) {
      result.minPrice = min;
    }
  }

  if (query.maxPrice) {
    const max = parseFloat(query.maxPrice as string);
    if (!isNaN(max) && max >= 0) {
      result.maxPrice = max;
    }
  }

  // Valider que minPrice <= maxPrice
  if (result.minPrice !== undefined && result.maxPrice !== undefined && result.minPrice > result.maxPrice) {
    throw new Error('minPrice ne peut pas être supérieur à maxPrice');
  }

  return result;
}

/**
 * Parse une plage de dates depuis les query params
 * @param query - Les query params
 * @param startKey - Clé pour la date de début (défaut: 'startDate')
 * @param endKey - Clé pour la date de fin (défaut: 'endDate')
 * @returns Objet avec start et end (optionnels)
 */
export function parseDateRange(
  query: any,
  startKey: string = 'startDate',
  endKey: string = 'endDate'
): { start?: Date; end?: Date } {
  const result: { start?: Date; end?: Date } = {};

  if (query[startKey]) {
    const start = new Date(query[startKey] as string);
    if (!isNaN(start.getTime())) {
      result.start = start;
    }
  }

  if (query[endKey]) {
    const end = new Date(query[endKey] as string);
    if (!isNaN(end.getTime())) {
      result.end = end;
    }
  }

  // Valider que start <= end
  if (result.start && result.end && result.start > result.end) {
    throw new Error('startDate ne peut pas être postérieure à endDate');
  }

  return result;
}

/**
 * Parse un tableau de valeurs depuis les query params
 * @param query - Les query params
 * @param key - La clé du paramètre
 * @param separator - Séparateur (défaut: ',')
 * @returns Tableau de valeurs
 */
export function parseArray(query: any, key: string, separator: string = ','): string[] {
  const value = query[key];
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String);
  }

  return String(value)
    .split(separator)
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Parse un booléen depuis les query params
 * @param query - Les query params
 * @param key - La clé du paramètre
 * @param defaultValue - Valeur par défaut si non présent
 * @returns Valeur booléenne
 */
export function parseBoolean(query: any, key: string, defaultValue?: boolean): boolean | undefined {
  const value = query[key];
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const str = String(value).toLowerCase();
  return str === 'true' || str === '1' || str === 'yes';
}

/**
 * Parse un entier depuis les query params avec validation
 * @param query - Les query params
 * @param key - La clé du paramètre
 * @param options - Options de validation
 * @returns Valeur entière ou undefined
 */
export function parseInteger(
  query: any,
  key: string,
  options?: {
    min?: number;
    max?: number;
    defaultValue?: number;
  }
): number | undefined {
  const value = query[key];
  if (value === undefined || value === null) {
    return options?.defaultValue;
  }

  const num = parseInt(String(value), 10);
  if (isNaN(num)) {
    return options?.defaultValue;
  }

  if (options?.min !== undefined && num < options.min) {
    return options.defaultValue;
  }

  if (options?.max !== undefined && num > options.max) {
    return options.defaultValue;
  }

  return num;
}

/**
 * Parse et valide les query params avec un schéma Zod
 * @param query - Les query params
 * @param schema - Schéma Zod pour validation
 * @returns Données validées
 */
export function parseAndValidate<T>(query: any, schema: z.ZodSchema<T>): T {
  return schema.parse(query);
}

/**
 * Schéma Zod pour pagination
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Schéma Zod pour plage de prix
 */
export const priceRangeSchema = z.object({
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  { message: 'minPrice ne peut pas être supérieur à maxPrice' }
);

/**
 * Schéma Zod pour plage de dates
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'startDate ne peut pas être postérieure à endDate' }
);

/**
 * Extraire tous les query params d'une requête Express
 * @param req - La requête Express
 * @returns Objet avec tous les query params
 */
export function getAllQueryParams(req: Request): Record<string, any> {
  return req.query || {};
}


