/**
 * Service de gestion des avis produits
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { createError } from '../utils/errors.js';
import { retry } from '../utils/retry.js';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  photos: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    name: string;
    email: string;
  };
  product?: {
    title: string;
  };
  responses?: ReviewResponse[];
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  user_id: string;
  response: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
  };
}

export interface ReviewInput {
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  order_id?: string;
}

export interface ReviewFilters {
  product_id?: string;
  user_id?: string;
  rating?: number;
  is_approved?: boolean;
  is_featured?: boolean;
  is_verified_purchase?: boolean;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'rating_desc' | 'rating_asc' | 'helpful';
}

/**
 * Récupère les avis d'un produit avec pagination
 */
export async function getProductReviews(
  filters: ReviewFilters
): Promise<{ reviews: ProductReview[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  try {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 10));
    const offset = (page - 1) * limit;

    let query = supabase.from('product_reviews').select('*, user:users(name, email)', { count: 'exact' });

    // Filtres
    if (filters.product_id) {
      query = query.eq('product_id', filters.product_id);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.rating) {
      query = query.eq('rating', filters.rating);
    }
    if (filters.is_approved !== undefined) {
      query = query.eq('is_approved', filters.is_approved);
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters.is_verified_purchase !== undefined) {
      query = query.eq('is_verified_purchase', filters.is_verified_purchase);
    }

    // Tri
    switch (filters.sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'rating_desc':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_asc':
        query = query.order('rating', { ascending: true });
        break;
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await retry(() => query, { maxRetries: 3 }) as {
      data: ProductReview[] | null;
      error: any;
      count: number | null;
    };

    if (error) {
      throw error;
    }

    const reviews = (data || []) as ProductReview[];

    // Charger les réponses pour chaque avis
    if (reviews.length > 0) {
      const reviewIds = reviews.map((r) => r.id);
      const { data: responses } = await supabase
        .from('review_responses')
        .select('*, user:users(name)')
        .in('review_id', reviewIds)
        .order('created_at', { ascending: true });

      // Associer les réponses aux avis
      reviews.forEach((review) => {
        review.responses = (responses || []).filter((r: any) => r.review_id === review.id) as ReviewResponse[];
      });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    logger.error('Error fetching product reviews', error instanceof Error ? error : new Error(String(error)), {
      filters,
    });
    throw createError.database('Erreur lors de la récupération des avis');
  }
}

/**
 * Crée un nouvel avis produit
 */
export async function createProductReview(userId: string, input: ReviewInput): Promise<ProductReview> {
  try {
    // Vérifier que l'utilisateur n'a pas déjà laissé un avis pour ce produit
    const { data: existing } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', input.product_id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw createError.validation('Vous avez déjà laissé un avis pour ce produit');
    }

    // Vérifier que la commande existe et appartient à l'utilisateur (si order_id fourni)
    let isVerifiedPurchase = false;
    if (input.order_id) {
      const { data: order } = await supabase
        .from('orders')
        .select('id, user_id')
        .eq('id', input.order_id)
        .eq('user_id', userId)
        .single();

      if (order) {
        isVerifiedPurchase = true;
      }
    }

    // Vérifier que l'utilisateur a acheté le produit (via order_items)
    if (!isVerifiedPurchase && input.order_id) {
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', input.order_id)
        .eq('product_id', input.product_id)
        .single();

      if (orderItem) {
        isVerifiedPurchase = true;
      }
    }

    const { data: review, error } = await retry(
      () =>
        supabase
          .from('product_reviews')
          .insert({
            product_id: input.product_id,
            user_id: userId,
            order_id: input.order_id || null,
            rating: input.rating,
            title: input.title || null,
            comment: input.comment || null,
            photos: input.photos || [],
            is_verified_purchase: isVerifiedPurchase,
            is_approved: false, // Nécessite modération par défaut
          })
          .select('*, user:users(name, email)')
          .single(),
      { maxRetries: 3 }
    ) as { data: ProductReview | null; error: any };

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw createError.validation('Vous avez déjà laissé un avis pour ce produit');
      }
      throw error;
    }

    if (!review) {
      throw createError.database('Erreur lors de la création de l\'avis');
    }

    logger.info('Product review created', { reviewId: review.id, productId: input.product_id, userId });

    // Mettre à jour la note moyenne du produit (via trigger ou fonction)
    await updateProductRating(input.product_id);

    return review as ProductReview;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('déjà laissé') || error.message.includes('validation'))) {
      throw error;
    }
    logger.error('Error creating product review', error instanceof Error ? error : new Error(String(error)), {
      userId,
      input,
    });
    throw createError.database('Erreur lors de la création de l\'avis');
  }
}

/**
 * Met à jour un avis (utilisateur propriétaire uniquement)
 */
export async function updateProductReview(
  reviewId: string,
  userId: string,
  updates: Partial<Pick<ReviewInput, 'rating' | 'title' | 'comment' | 'photos'>>
): Promise<ProductReview> {
  try {
    // Vérifier que l'avis appartient à l'utilisateur
    const { data: existing } = await supabase
      .from('product_reviews')
      .select('product_id, user_id')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      throw createError.notFound('Avis introuvable ou vous n\'avez pas la permission de le modifier');
    }

    const updateData: any = {};
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.comment !== undefined) updateData.comment = updates.comment;
    if (updates.photos !== undefined) updateData.photos = updates.photos;
    updateData.is_approved = false; // Re-modération après modification

    const { data: review, error } = await retry(
      () =>
        supabase
          .from('product_reviews')
          .update(updateData)
          .eq('id', reviewId)
          .select('*, user:users(name, email)')
          .single(),
      { maxRetries: 3 }
    ) as { data: ProductReview | null; error: any };

    if (error) {
      throw error;
    }

    if (!review) {
      throw createError.notFound('Avis introuvable');
    }

    // Mettre à jour la note moyenne du produit
    await updateProductRating(existing.product_id);

    return review as ProductReview;
  } catch (error) {
    logger.error('Error updating product review', error instanceof Error ? error : new Error(String(error)), {
      reviewId,
      userId,
    });
    if (error instanceof Error && error.message.includes('introuvable')) {
      throw error;
    }
    throw createError.database('Erreur lors de la mise à jour de l\'avis');
  }
}

/**
 * Approuve un avis (admin uniquement)
 */
export async function approveReview(reviewId: string, isApproved: boolean): Promise<ProductReview> {
  try {
    const { data: review, error } = await retry(
      () =>
        supabase
          .from('product_reviews')
          .update({ is_approved: isApproved })
          .eq('id', reviewId)
          .select('*, user:users(name, email)')
          .single(),
      { maxRetries: 3 }
    ) as { data: ProductReview | null; error: any };

    if (error) {
      throw error;
    }

    if (!review) {
      throw createError.notFound('Avis introuvable');
    }

    // Mettre à jour la note moyenne du produit
    await updateProductRating(review.product_id);

    return review as ProductReview;
  } catch (error) {
    logger.error('Error approving review', error instanceof Error ? error : new Error(String(error)), { reviewId });
    throw createError.database('Erreur lors de l\'approbation de l\'avis');
  }
}

/**
 * Marque un avis comme "utile"
 */
export async function markReviewAsHelpful(reviewId: string, userId: string): Promise<void> {
  try {
    // Vérifier si l'utilisateur a déjà voté
    const { data: existing } = await supabase
      .from('review_helpful_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Retirer le vote
      await supabase.from('review_helpful_votes').delete().eq('id', existing.id);
    } else {
      // Ajouter le vote
      await supabase.from('review_helpful_votes').insert({
        review_id: reviewId,
        user_id: userId,
      });
    }
  } catch (error) {
    logger.error('Error marking review as helpful', error instanceof Error ? error : new Error(String(error)), {
      reviewId,
      userId,
    });
    throw createError.database('Erreur lors du vote');
  }
}

/**
 * Ajoute une réponse à un avis (admin/vendeur)
 */
export async function addReviewResponse(
  reviewId: string,
  userId: string,
  response: string
): Promise<ReviewResponse> {
  try {
    const { data: reviewResponse, error } = await retry(
      () =>
        supabase
          .from('review_responses')
          .insert({
            review_id: reviewId,
            user_id: userId,
            response,
          })
          .select('*, user:users(name)')
          .single(),
      { maxRetries: 3 }
    ) as { data: ReviewResponse | null; error: any };

    if (error) {
      throw error;
    }

    if (!reviewResponse) {
      throw createError.database('Erreur lors de l\'ajout de la réponse');
    }

    return reviewResponse as ReviewResponse;
  } catch (error) {
    logger.error('Error adding review response', error instanceof Error ? error : new Error(String(error)), {
      reviewId,
      userId,
    });
    throw createError.database('Erreur lors de l\'ajout de la réponse');
  }
}

/**
 * Met à jour la note moyenne d'un produit
 */
async function updateProductRating(productId: string): Promise<void> {
  try {
    // Utiliser la fonction SQL si elle existe, sinon calculer manuellement
    const { data: ratingResult } = await supabase.rpc('calculate_product_rating', {
      p_product_id: productId,
    });

    if (ratingResult !== null && ratingResult !== undefined) {
      await supabase
        .from('products')
        .update({ rating: ratingResult })
        .eq('id', productId);
    } else {
      // Fallback: calculer manuellement
      const { data: reviews } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

      if (reviews && reviews.length > 0) {
        const avgRating =
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from('products')
          .update({ rating: Number(avgRating.toFixed(1)) })
          .eq('id', productId);
      }
    }
  } catch (error) {
    logger.warn('Error updating product rating (non-blocking)', {
      productId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Ne pas bloquer si la mise à jour de la note échoue
  }
}

/**
 * Récupère les statistiques d'avis d'un produit
 */
export async function getProductReviewStats(productId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}> {
  try {
    const { data: reviews } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      ratingDistribution,
    };
  } catch (error) {
    logger.error('Error fetching review stats', error instanceof Error ? error : new Error(String(error)), {
      productId,
    });
    throw createError.database('Erreur lors de la récupération des statistiques');
  }
}

