/**
 * Routes API pour la gestion des coupons
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAdminAuth } from '../middleware/adminAuth.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getActiveCoupons,
  getCouponUsageHistory,
  applyCouponToOrder,
} from '../services/couponsService.js';

const router = Router();

// Schema de validation
const couponInputSchema = z.object({
  code: z.string().min(3).max(50),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  min_purchase_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().positive().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  user_usage_limit: z.number().int().positive().default(1).optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  applicable_to: z.array(z.string()).optional(),
});

const validateCouponSchema = z.object({
  code: z.string().min(1),
  order_total: z.number().min(0),
  product_categories: z.array(z.string()).optional(),
});

/**
 * POST /api/coupons/validate
 * Valide un coupon pour un utilisateur
 */
router.post(
  '/validate',
  authMiddleware,
  validate(validateCouponSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { code, order_total, product_categories } = req.body;
    const userId = req.user!.id;

    const result = await validateCoupon(code, userId, order_total, product_categories);

    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        error: result.error,
      });
    }

    return res.json({
      valid: true,
      coupon: {
        id: result.coupon!.id,
        code: result.coupon!.code,
        description: result.coupon!.description,
        discount_type: result.coupon!.discount_type,
        discount_value: result.coupon!.discount_value,
      },
      discount_amount: result.discount_amount,
    });
  })
);

/**
 * GET /api/coupons
 * Liste tous les coupons actifs (public)
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const coupons = await getActiveCoupons();
    return res.json({ coupons });
  })
);

/**
 * POST /api/coupons
 * Crée un nouveau coupon (admin uniquement)
 */
router.post(
  '/',
  requireAdminAuth,
  validate(couponInputSchema, 'body'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const coupon = await createCoupon(req.body, userId);
    return res.status(201).json({ coupon });
  })
);

/**
 * PUT /api/coupons/:id
 * Met à jour un coupon (admin uniquement)
 */
router.put(
  '/:id',
  requireAdminAuth,
  validate(couponInputSchema.partial(), 'body'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coupon = await updateCoupon(id, req.body);
    return res.json({ coupon });
  })
);

/**
 * DELETE /api/coupons/:id
 * Supprime un coupon (admin uniquement)
 */
router.delete(
  '/:id',
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await deleteCoupon(id);
    return res.json({ message: 'Coupon supprimé avec succès' });
  })
);

/**
 * GET /api/coupons/:id/usage
 * Récupère l'historique d'utilisation d'un coupon (admin uniquement)
 */
router.get(
  '/:id/usage',
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const usage = await getCouponUsageHistory(id);
    return res.json({ usage });
  })
);

export default router;





