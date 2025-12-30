/**
 * Helpers pour opérations base de données
 * Fonctions utilitaires pour les requêtes DB
 */
import { supabase, pgPool } from '../config/supabase.js';
import { handleSupabaseError } from './errorHandlers.js';
import { NotFoundError } from './errors.js';

/**
 * Vérifier si une table existe
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    // Si pas d'erreur ou erreur de permission (table existe mais pas d'accès)
    return !error || error.code !== 'PGRST116';
  } catch {
    return false;
  }
}

/**
 * Compter les enregistrements d'une table
 */
export async function countRecords(tableName: string, filters?: Record<string, any>): Promise<number> {
  try {
    let query = supabase.from(tableName).select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Vérifier si un enregistrement existe
 */
export async function recordExists(
  tableName: string,
  column: string,
  value: any
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(column)
      .eq(column, value)
      .limit(1)
      .single();

    return !error && data !== null;
  } catch {
    return false;
  }
}

/**
 * Nettoyer les données avant insertion (supprimer undefined, null si non nécessaire)
 */
export function cleanDataForInsert(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Garder null si explicitement null, supprimer undefined
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Trouver un enregistrement par ID
 * @param table - Nom de la table
 * @param id - ID de l'enregistrement
 * @returns L'enregistrement ou null si non trouvé
 * @throws NotFoundError si strict=true et non trouvé
 */
export async function findById<T>(
  table: string,
  id: string,
  strict: boolean = false
): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('No rows')) {
        if (strict) {
          throw new NotFoundError(table);
        }
        return null;
      }
      throw handleSupabaseError(error, `findById(${table}, ${id})`);
    }

    return data as T;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw handleSupabaseError(error, `findById(${table}, ${id})`);
  }
}

/**
 * Trouver des enregistrements par userId
 * @param table - Nom de la table
 * @param userId - ID de l'utilisateur
 * @param options - Options de tri et pagination
 * @returns Liste des enregistrements
 */
export async function findByUserId<T>(
  table: string,
  userId: string,
  options?: {
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }
): Promise<T[]> {
  try {
    let query = supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.orderDirection !== 'desc' });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw handleSupabaseError(error, `findByUserId(${table}, ${userId})`);
    }

    return (data || []) as T[];
  } catch (error) {
    throw handleSupabaseError(error, `findByUserId(${table}, ${userId})`);
  }
}

/**
 * Paginer une requête Supabase
 * @param query - La requête Supabase builder
 * @param page - Numéro de page (commence à 1)
 * @param limit - Nombre d'éléments par page
 * @returns Objet avec data, total, totalPages, page, limit
 */
export async function paginateQuery<T>(
  query: any,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}> {
  try {
    const offset = (page - 1) * limit;

    // Compter le total
    const countQuery = query.select('*', { count: 'exact', head: true });
    const { count, error: countError } = await countQuery;

    if (countError) {
      throw handleSupabaseError(countError, 'paginateQuery.count');
    }

    // Récupérer les données
    const dataQuery = query.range(offset, offset + limit - 1);
    const { data, error: dataError } = await dataQuery;

    if (dataError) {
      throw handleSupabaseError(dataError, 'paginateQuery.data');
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data || []) as T[],
      total,
      totalPages,
      page,
      limit,
    };
  } catch (error) {
    throw handleSupabaseError(error, 'paginateQuery');
  }
}

/**
 * Insérer un enregistrement et retourner l'enregistrement créé
 * @param table - Nom de la table
 * @param data - Données à insérer
 * @returns L'enregistrement créé
 */
export async function insertOne<T>(table: string, data: Record<string, any>): Promise<T> {
  try {
    const cleaned = cleanDataForInsert(data);
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(cleaned)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `insertOne(${table})`);
    }

    return inserted as T;
  } catch (error) {
    throw handleSupabaseError(error, `insertOne(${table})`);
  }
}

/**
 * Mettre à jour un enregistrement par ID
 * @param table - Nom de la table
 * @param id - ID de l'enregistrement
 * @param data - Données à mettre à jour
 * @returns L'enregistrement mis à jour
 */
export async function updateById<T>(
  table: string,
  id: string,
  data: Record<string, any>
): Promise<T> {
  try {
    const cleaned = cleanDataForInsert(data);
    const { data: updated, error } = await supabase
      .from(table)
      .update(cleaned)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('No rows')) {
        throw new NotFoundError(table);
      }
      throw handleSupabaseError(error, `updateById(${table}, ${id})`);
    }

    return updated as T;
  } catch (error) {
    throw handleSupabaseError(error, `updateById(${table}, ${id})`);
  }
}

/**
 * Supprimer un enregistrement par ID
 * @param table - Nom de la table
 * @param id - ID de l'enregistrement
 * @returns true si supprimé
 */
export async function deleteById(table: string, id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('No rows')) {
        return false;
      }
      throw handleSupabaseError(error, `deleteById(${table}, ${id})`);
    }

    return true;
  } catch (error) {
    throw handleSupabaseError(error, `deleteById(${table}, ${id})`);
  }
}
