/**
 * Route de santé - vérifie l'état de tous les services
 * Endpoints: GET /api/health et GET /api/health/detailed
 */
import { Router, Request, Response } from 'express';
import { pgPool } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

interface ServiceStatus {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    email?: ServiceStatus;
    stripe?: ServiceStatus;
  };
  version: string;
}

/**
 * Endpoint simple /api/health
 * Retourne un statut rapide (200 si OK, 503 si problème)
 */
router.get('/', async (req: Request, res: Response<HealthResponse>) => {
  try {
    const startTime = Date.now();
    let dbStatus: 'up' | 'down' = 'down';
    let cacheStatus: 'up' | 'down' = 'down';
    let dbTime = 0;
    let cacheTime = 0;

    // Test PostgreSQL
    try {
      const dbStart = Date.now();
      if (pgPool) {
        await pgPool.query('SELECT NOW()');
        dbStatus = 'up';
        dbTime = Date.now() - dbStart;
      } else {
        // Si pas de pgPool, essayer Supabase
        const { supabase } = await import('../config/supabase.js');
        const { error } = await supabase.from('products').select('id').limit(1);
        if (!error) {
          dbStatus = 'up';
          dbTime = Date.now() - dbStart;
        }
      }
    } catch (error: any) {
      logger.error('🔴 Database health check failed:', error);
      dbStatus = 'down';
    }

    // Test Redis (détecte automatiquement local vs Upstash)
    try {
      const redisStart = Date.now();
      
      // Vérifier si Redis local est configuré
      const redisHost = process.env.REDIS_HOST || process.env.REDIS_URL;
      const upstashUrl = process.env.UPSTASH_REDIS_URL;
      
      if (redisHost || upstashUrl) {
        // Essayer via cache utility (gère automatiquement ioredis local ou Upstash)
        const { getCache } = await import('../utils/cache.js');
        await getCache('health-check-test');
        cacheStatus = 'up';
        cacheTime = Date.now() - redisStart;
      } else {
        // Redis non configuré = pas d'erreur, juste non testé
        cacheStatus = 'down';
      }
    } catch (error: any) {
      logger.error('🔴 Redis health check failed:', error);
      cacheStatus = 'down';
    }

    // Déterminer le statut global
    const isHealthy = dbStatus === 'up' && cacheStatus === 'up';
    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 
      isHealthy ? 'healthy' : (dbStatus === 'up' ? 'degraded' : 'unhealthy');

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: { status: dbStatus, responseTime: dbTime },
        cache: { status: cacheStatus, responseTime: cacheTime },
      },
      version: '1.0.0',
    };

    // HTTP 200 si healthy, 503 si degraded/unhealthy
    const statusCode = isHealthy ? 200 : 503;
    
    res.status(statusCode).json(response);
  } catch (error: any) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: { status: 'down', error: 'Health check failed' },
        cache: { status: 'down', error: 'Health check failed' },
      },
      version: '1.0.0',
    });
  }
});

/**
 * Endpoint détaillé /api/health/detailed
 * Retourne des informations complètes sur tous les services
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Services tests
    const services: {
      database: ServiceStatus;
      cache: ServiceStatus;
      email?: ServiceStatus;
      stripe?: ServiceStatus;
    } = {
      database: { status: 'down' },
      cache: { status: 'down' },
    };

    // Test DB
    try {
      const dbStart = Date.now();
      if (pgPool) {
        await pgPool.query('SELECT NOW()');
        services.database = {
          status: 'up',
          responseTime: Date.now() - dbStart,
        };
      } else {
        const { supabase } = await import('../config/supabase.js');
        const { error } = await supabase.from('products').select('id').limit(1);
        if (error) {
          services.database = {
            status: 'down',
            error: error.message,
          };
        } else {
          services.database = {
            status: 'up',
            responseTime: Date.now() - dbStart,
          };
        }
      }
    } catch (e: any) {
      services.database = {
        status: 'down',
        error: e.message,
      };
    }

    // Test Redis
    try {
      const redisStart = Date.now();
      const redisHost = process.env.REDIS_HOST || process.env.REDIS_URL;
      const upstashUrl = process.env.UPSTASH_REDIS_URL;
      
      if (redisHost || upstashUrl) {
        // Utiliser cache utility (gère automatiquement ioredis local ou Upstash)
        const { getCache } = await import('../utils/cache.js');
        await getCache('health-check-test');
        services.cache = {
          status: 'up',
          responseTime: Date.now() - redisStart,
        };
      } else {
        services.cache = {
          status: 'down',
          error: 'Redis not configured',
        };
      }
    } catch (e: any) {
      services.cache = {
        status: 'down',
        error: e.message,
      };
    }

    // Vérifier la configuration des services externes
    if (!process.env.RESEND_API_KEY && !process.env.MAILGUN_API_KEY) {
      services.email = {
        status: 'down',
        error: 'Email provider not configured',
      };
    } else {
      services.email = {
        status: 'up',
      };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      services.stripe = {
        status: 'down',
        error: 'Stripe not configured',
      };
    } else {
      services.stripe = {
        status: 'up',
      };
    }

    // Déterminer le statut global
    const allCriticalUp = services.database.status === 'up';
    const overallStatus = allCriticalUp ? 'healthy' : 'unhealthy';

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      responseTime: Date.now() - startTime,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error: any) {
    logger.error('Detailed health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
