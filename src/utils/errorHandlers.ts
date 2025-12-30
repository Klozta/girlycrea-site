/**
 * Helpers pour gestion d'erreurs standardisée
 * Centralise la gestion des erreurs dans les services
 */
import { logger } from './logger.js';
import { AppError, createError, DatabaseError, ExternalServiceError } from './errors.js';

/**
 * Gère les erreurs dans les services de manière standardisée
 * @param error - L'erreur capturée
 * @param context - Le contexte où l'erreur s'est produite (ex: "ordersService.createOrder")
 * @param defaultMessage - Message par défaut si l'erreur n'est pas reconnue
 * @returns Une AppError standardisée
 */
export function handleServiceError(
  error: unknown,
  context: string,
  defaultMessage?: string
): AppError {
  // Si c'est déjà une AppError, la retourner telle quelle
  if (error instanceof AppError) {
    return error;
  }

  // Erreur de base de données
  if (error instanceof Error) {
    // Erreurs PostgreSQL/Supabase
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      logger.warn(`Duplicate key error in ${context}`, { error: error.message });
      return createError.conflict('Cette ressource existe déjà');
    }

    if (error.message.includes('foreign key constraint') || error.message.includes('violates foreign key')) {
      logger.warn(`Foreign key constraint error in ${context}`, { error: error.message });
      return createError.badRequest('Référence invalide');
    }

    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      logger.warn(`Not found error in ${context}`, { error: error.message });
      return createError.notFound();
    }

    // Erreurs réseau/externes
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      logger.error(`Connection error in ${context}`, { error: error.message });
      return createError.externalService('database', 'Connexion à la base de données échouée');
    }

    // Erreur générique avec logging
    logger.error(`Error in ${context}`, error);
    return createError.internal(defaultMessage || `Erreur dans ${context}`);
  }

  // Erreur inconnue
  logger.error(`Unknown error type in ${context}`, { error });
  return createError.internal(defaultMessage || `Erreur inconnue dans ${context}`);
}

/**
 * Wrapper pour async functions avec gestion d'erreurs automatique
 * @param fn - La fonction async à wrapper
 * @param context - Le contexte pour le logging
 * @returns La fonction wrappée qui retourne toujours AppError en cas d'erreur
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleServiceError(error, context);
    }
  }) as T;
}

/**
 * Gère les erreurs Supabase spécifiquement
 * @param error - L'erreur Supabase
 * @param context - Le contexte
 * @returns Une AppError appropriée
 */
export function handleSupabaseError(error: any, context: string): AppError {
  if (!error) {
    return createError.internal(`Erreur inconnue dans ${context}`);
  }

  // Erreur Supabase standard
  if (error.code) {
    switch (error.code) {
      case 'PGRST116': // Table not found
        return createError.notFound('Ressource non trouvée');
      case '23505': // Unique violation
        return createError.conflict('Cette ressource existe déjà');
      case '23503': // Foreign key violation
        return createError.badRequest('Référence invalide');
      case '23502': // Not null violation
        return createError.validation('Champ requis manquant');
      case '42P01': // Undefined table
        return createError.database('Table non trouvée');
      default:
        logger.error(`Supabase error in ${context}`, { code: error.code, message: error.message });
        return createError.database(error.message || 'Erreur base de données');
    }
  }

  return handleServiceError(error, context, 'Erreur base de données');
}

/**
 * Gère les erreurs d'external services (Stripe, Resend, etc.)
 * @param error - L'erreur externe
 * @param serviceName - Le nom du service (ex: "Stripe", "Resend")
 * @param context - Le contexte
 * @returns Une ExternalServiceError
 */
export function handleExternalServiceError(
  error: unknown,
  serviceName: string,
  context: string
): ExternalServiceError {
  if (error instanceof ExternalServiceError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  logger.error(`External service error in ${context}`, { service: serviceName, error: message });
  
  return createError.externalService(serviceName, message);
}

/**
 * Vérifie si une erreur est récupérable (peut être retentée)
 * @param error - L'erreur à vérifier
 * @returns true si l'erreur est récupérable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    // Les erreurs 5xx sont généralement récupérables (sauf certaines)
    if (error.statusCode >= 500 && error.statusCode < 600) {
      // Mais pas les erreurs de validation de données
      return error.code !== 'VALIDATION_ERROR';
    }
    // Les erreurs de rate limit sont récupérables après un délai
    if (error.statusCode === 429) {
      return true;
    }
    return false;
  }

  if (error instanceof Error) {
    // Erreurs réseau sont récupérables
    return (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND')
    );
  }

  return false;
}
