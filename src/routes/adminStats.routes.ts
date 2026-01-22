/**
 * Routes API Admin - Stats et Données Réelles
 * GirlyCrea - Production Sprint
 */

import { Router, Request, Response, NextFunction } from 'express';
import { pgPool } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Middleware simple pour vérifier l'authentification (à améliorer avec roles)
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implémenter la vérification du rôle admin
  // Pour l'instant, on laisse passer si le header Authorization est présent
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * GET /api/admin/stats
 * Retourne les statistiques du dashboard admin
 */
router.get('/stats', requireAuth, async (_req: Request, res: Response) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Stats des commandes (30 derniers jours)
    const ordersResult = await pgPool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders
      FROM orders 
      WHERE created_at > NOW() - INTERVAL '30 days'
    `);

    // Stats des utilisateurs
    const usersResult = await pgPool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users
      FROM users
    `);

    // Stats des produits
    const productsResult = await pgPool.query(`
      SELECT COUNT(*) as total_products
      FROM products
    `);

    // Stats des avis en attente
    const reviewsResult = await pgPool.query(`
      SELECT COUNT(*) as pending_reviews
      FROM product_reviews
      WHERE is_approved = false
    `);

    // Stats des coupons actifs
    const couponsResult = await pgPool.query(`
      SELECT COUNT(*) as active_coupons
      FROM coupons
      WHERE is_active = true 
        AND (valid_until IS NULL OR valid_until > NOW())
    `);

    // Commandes récentes
    const recentOrdersResult = await pgPool.query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    const stats = {
      orders: {
        total: parseInt(ordersResult.rows[0]?.total_orders || '0'),
        revenue: parseFloat(ordersResult.rows[0]?.total_revenue || '0'),
        pending: parseInt(ordersResult.rows[0]?.pending_orders || '0'),
        shipped: parseInt(ordersResult.rows[0]?.shipped_orders || '0'),
        delivered: parseInt(ordersResult.rows[0]?.delivered_orders || '0'),
      },
      users: {
        total: parseInt(usersResult.rows[0]?.total_users || '0'),
        newThisMonth: parseInt(usersResult.rows[0]?.new_users || '0'),
      },
      products: {
        total: parseInt(productsResult.rows[0]?.total_products || '0'),
      },
      reviews: {
        pending: parseInt(reviewsResult.rows[0]?.pending_reviews || '0'),
      },
      coupons: {
        active: parseInt(couponsResult.rows[0]?.active_coupons || '0'),
      },
      recentOrders: recentOrdersResult.rows.map(order => ({
        id: order.id,
        customer: order.customer_name || order.customer_email || 'Client',
        total: parseFloat(order.total || '0'),
        status: order.status,
        date: order.created_at,
      })),
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching admin stats', error as Error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/admin/orders
 * Retourne la liste des commandes
 */
router.get('/orders', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { status, page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.id as customer_id
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;
    
    const params: any[] = [];
    
    if (status && status !== 'all') {
      query += ` WHERE o.status = $1`;
      params.push(status);
    }
    
    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string), offset);

    const result = await pgPool.query(query, params);

    // Compter le total
    let countQuery = 'SELECT COUNT(*) FROM orders';
    const countParams: any[] = [];
    if (status && status !== 'all') {
      countQuery += ' WHERE status = $1';
      countParams.push(status);
    }
    const countResult = await pgPool.query(countQuery, countParams);

    res.json({
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    logger.error('Error fetching admin orders', error as Error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/admin/users
 * Retourne la liste des utilisateurs
 */
router.get('/users', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { page = '1', limit = '20', role } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT o.id) as orders_count,
        COALESCE(SUM(o.total), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
    `;
    
    const params: any[] = [];
    
    if (role && role !== 'all') {
      query += ` WHERE u.role = $1`;
      params.push(role);
    }
    
    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string), offset);

    const result = await pgPool.query(query, params);

    res.json({
      users: result.rows.map(user => ({
        ...user,
        orders_count: parseInt(user.orders_count),
        total_spent: parseFloat(user.total_spent),
      })),
    });
  } catch (error) {
    logger.error('Error fetching admin users', error as Error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/products
 * Retourne la liste des produits
 */
router.get('/products', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { page = '1', limit = '20', category } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `SELECT * FROM products`;
    const params: any[] = [];
    
    if (category && category !== 'all') {
      query += ` WHERE category = $1`;
      params.push(category);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string), offset);

    const result = await pgPool.query(query, params);

    res.json({ products: result.rows });
  } catch (error) {
    logger.error('Error fetching admin products', error as Error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/admin/reviews
 * Retourne la liste des avis (avec option pending)
 */
router.get('/reviews', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { status = 'pending' } = req.query;

    let query = `
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        p.title as product_title
      FROM product_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
    `;
    
    const params: any[] = [];
    
    if (status === 'pending') {
      query += ` WHERE r.is_approved = false`;
    } else if (status === 'approved') {
      query += ` WHERE r.is_approved = true`;
    }
    
    query += ` ORDER BY r.created_at DESC`;

    const result = await pgPool.query(query, params);

    res.json({ reviews: result.rows });
  } catch (error) {
    logger.error('Error fetching admin reviews', error as Error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * GET /api/admin/coupons
 * Retourne la liste des coupons
 */
router.get('/coupons', requireAuth, async (_req: Request, res: Response) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await pgPool.query(`
      SELECT 
        c.*,
        COUNT(cu.id) as usage_count
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      coupons: result.rows.map(coupon => ({
        ...coupon,
        usage_count: parseInt(coupon.usage_count),
      })),
    });
  } catch (error) {
    logger.error('Error fetching admin coupons', error as Error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

export default router;
