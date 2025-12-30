/**
 * Exports centralisés des utils
 * Facilite l'importation des helpers
 */

// Error handlers
export {
  handleServiceError,
  handleSupabaseError,
  handleExternalServiceError,
  isRetryableError,
  withErrorHandling,
} from './errorHandlers.js';

// Database helpers
export {
  tableExists,
  countRecords,
  recordExists,
  cleanDataForInsert,
  findById,
  findByUserId,
  paginateQuery,
  insertOne,
  updateById,
  deleteById,
} from './databaseHelpers.js';

// Query helpers
export {
  parsePagination,
  parsePriceRange,
  parseDateRange,
  parseArray,
  parseBoolean,
  parseInteger,
  parseAndValidate,
  paginationSchema,
  priceRangeSchema,
  dateRangeSchema,
  getAllQueryParams,
} from './queryHelpers.js';

// Metrics helpers
export {
  escapeCsvValue,
  calculateDateRange,
  calculateTrend,
  calculateZScore,
  calculateMADScore,
  dateFilterSchema,
} from './metricsHelpers.js';

// Autres utils existants
export { logger } from './logger.js';
export { createError, AppError } from './errors.js';
