/**
 * Routes API pour la gestion des avis produits
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAdminAuth } from '../middleware/adminAuth.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getProductReviews,
  createProductReview,
  updateProductReview,
  approveReview,
  markReviewAsHelpful,
  addReviewResponse,
  getProductReviewStats,
} from '../services/productReviewsService.js';

const router = Router();

// Schema de validation
const reviewInputSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
  order_id: z.string().uuid().optional(),
});

const reviewUpdateSchema = reviewInputSchema.partial().pick({
  rating: true,
  title: true,
  comment: true,
  photos: true,
});

const reviewResponseSchema = z.object({
  response: z.string().min(1).max(1000),
});

/**
 * GET /api/products/:productId/reviews
 * Récupère les avis d'un produit
 */
router.get(
  '/products/:productId/reviews',
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const {
      page = '1',
      limit = '10',
      rating,
      sort = 'newest',
      is_verified,
      is_featured,
    } = req.query;

    const filters = {
      product_id: productId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      rating: rating ? parseInt(rating as string) : undefined,
      is_verified_purchase: is_verified === 'true' ? true : undefined,
      is_featured: is_featured === 'true' ? true : undefined,
      sort: sort as 'newest' | 'oldest' | 'rating_desc' | 'rating_asc' | 'helpful',
      is_approved: true, // Seulement les avis approuvés pour les utilisateurs
    };

    const result = await getProductReviews(filters);
    return res.json(result);
  })
);

/**
 * GET /api/products/:productId/reviews/stats
 * Récupère les statistiques d'avis d'un produit
 */
router.get(
  '/products/:productId/reviews/stats',
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const stats = await getProductReviewStats(productId);
    return res.json(stats);
  })
);

/**
 * POST /api/products/:productId/reviews
 * Crée un nouvel avis produit (utilisateur authentifié)
 */
router.post(
  '/products/:productId/reviews',
  authMiddleware,
  validate(reviewInputSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user!.id;

    // Vérifier que le productId correspond
    if (req.body.product_id !== productId) {
      return res.status(400).json({ error: 'product_id mismatch' });
    }

    const review = await createProductReview(userId, req.body);
    return res.status(201).json({ review });
  })
);

/**
 * PUT /api/reviews/:id
 * Met à jour un avis (utilisateur propriétaire uniquement)
 */
router.put(
  '/:id',
  authMiddleware,
  validate(reviewUpdateSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const review = await updateProductReview(id, userId, req.body);
    return res.json({ review });
  })
);

/**
 * POST /api/reviews/:id/helpful
 * Marque un avis comme "utile"
 */
router.post(
  '/:id/helpful',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await markReviewAsHelpful(id, userId);
    return res.json({ message: 'Vote enregistré' });
  })
);

/**
 * POST /api/reviews/:id/approve
 * Approuve un avis (admin uniquement)
 */
router.post(
  '/:id/approve',
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approved = true } = req.body;

    const review = await approveReview(id, approved);
    return res.json({ review });
  })
);

/**
 * POST /api/reviews/:id/responses
 * Ajoute une réponse à un avis (admin uniquement)
 */
router.post(
  '/:id/responses',
  requireAdminAuth,
  validate(reviewResponseSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const response = await addReviewResponse(id, userId, req.body.response);
    return res.status(201).json({ response });
  })
);

export default router;





