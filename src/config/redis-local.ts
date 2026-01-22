/**
 * Configuration Redis locale (remplacement Upstash)
 * Utilise ioredis pour se connecter à Redis local
 */
import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379');
    const password = process.env.REDIS_PASSWORD;

    redis = new Redis({
      host,
      port,
      password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false,
    });

    redis.on('error', (error) => {
      logger.error('Redis connection error', error);
    });

    redis.on('connect', () => {
      logger.info('Redis connected', { host, port });
    });
  }

  return redis;
}

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    if (value === null || value === undefined) return null;

    // Parser JSON si nécessaire
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    }

    return value as T;
  } catch (error) {
    logger.warn('Redis GET failed, continuing without cache', {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Set cached value
 */
export async function setCache<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  try {
    const client = getRedisClient();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch (error) {
    logger.warn('Redis SET failed, continuing without cache', {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.warn('Redis DEL failed', {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Clear all cache (use with caution)
 */
export async function clearAllCache(): Promise<void> {
  try {
    const client = getRedisClient();
    await client.flushdb();
  } catch (error) {
    logger.error('Redis FLUSHDB failed', error);
    throw error;
  }
}

export default getRedisClient();



