// backend/src/utils/cache.ts
import { logger } from './logger.js';

// Support pour Redis local (ioredis) et Upstash Redis
let redis: any = null;
let redisType: 'upstash' | 'local' | null = null;

async function getRedisClient(): Promise<any> {
  if (!redis) {
    // Vérifier si on utilise Redis local (ioredis) ou Upstash
    const redisHost = process.env.REDIS_HOST || process.env.REDIS_URL;
    const upstashUrl = process.env.UPSTASH_REDIS_URL;
    
    if (redisHost && !upstashUrl) {
      // Utiliser Redis local avec ioredis
      try {
        const Redis = (await import('ioredis')).default;
        redisType = 'local';
        redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          retryStrategy: (times: number) => Math.min(times * 50, 2000),
          maxRetriesPerRequest: 3,
        });
        logger.info('Using local Redis (ioredis)');
      } catch (error) {
        logger.error('Failed to initialize local Redis, install ioredis: npm install ioredis', error);
        throw error;
      }
    } else if (upstashUrl) {
      // Utiliser Upstash Redis
      try {
        const { Redis } = await import('@upstash/redis');
        const token = process.env.UPSTASH_REDIS_TOKEN;
        if (!token) {
          throw new Error('UPSTASH_REDIS_TOKEN must be set when using Upstash');
        }
        redisType = 'upstash';
        redis = new Redis({ url: upstashUrl, token });
        logger.info('Using Upstash Redis');
      } catch (error) {
        logger.error('Failed to initialize Upstash Redis', error);
        throw error;
      }
    } else {
      throw new Error('Either REDIS_HOST/REDIS_URL or UPSTASH_REDIS_URL must be set in .env');
    }
  }
  return redis;
}

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    let value: any;
    
    if (redisType === 'local') {
      // ioredis retourne directement la valeur
      value = await client.get(key);
    } else {
      // Upstash Redis
      value = await client.get(key);
    }
    
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
 * Set cached value with TTL (seconds)
 * Optimisation: Utilise JSON.stringify une seule fois
 */
export async function setCache<T = unknown>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
  try {
    const client = await getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (redisType === 'local') {
      // ioredis utilise setex pour TTL
      await client.setex(key, ttlSeconds, serialized);
    } else {
      // Upstash Redis
      await client.set(key, serialized, { ex: ttlSeconds });
    }
  } catch (error) {
    logger.warn('Redis SET failed', {
      key,
      ttl: ttlSeconds,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Set multiple cache keys at once (batch operation)
 * Optimisation pour invalidation en masse
 */
export async function setCacheBatch<T = unknown>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
  try {
    const client = await getRedisClient();
    // Utiliser pipeline pour batch operations
    const pipeline = [];
    for (const { key, value, ttl = 300 } of entries) {
      const serialized = JSON.stringify(value);
      pipeline.push(['set', key, serialized, 'ex', ttl]);
    }
    // Note: Upstash Redis ne supporte pas pipeline natif, donc on fait séquentiel
    // Mais on peut optimiser avec Promise.all
    await Promise.all(
      entries.map(({ key, value, ttl = 300 }) => {
        const serialized = JSON.stringify(value);
        return client.set(key, serialized, { ex: ttl });
      })
    );
  } catch (error) {
    logger.warn('Redis batch SET failed', {
      count: entries.length,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Delete single cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.warn('Redis DEL failed', {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Delete all keys matching pattern (e.g. "products:*")
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    
    if (redisType === 'local') {
      // ioredis scan avec stream
      const stream = client.scanStream({ match: pattern });
      const keys: string[] = [];
      
      stream.on('data', (resultKeys: string[]) => {
        keys.push(...resultKeys);
      });
      
      await new Promise<void>((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', reject);
      });
      
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      // Upstash Redis
      let cursor = 0;
      do {
        const result = await client.scan(cursor, { match: pattern }) as unknown as { cursor: number; keys: string[] };
        cursor = result.cursor;
        if (result.keys && result.keys.length > 0) {
          await client.del(...result.keys);
        }
      } while (cursor !== 0);
    }
  } catch (error) {
    logger.warn('Redis pattern delete failed', {
      pattern,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
