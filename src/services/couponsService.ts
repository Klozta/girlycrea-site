/**
 * Service de gestion des coupons et codes promo
 */

import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { createError } from '../utils/errors.js';
import { retry } from '../utils/retry.js';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  user_usage_limit: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  applicable_to: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponInput {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  user_usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  applicable_to?: string[];
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discount_amount?: number;
  error?: string;
}

/**
 * Valide un coupon pour un utilisateur et un montant donné
 */
export async function validateCoupon(
  code: string,
  userId: string,
  orderTotal: number,
  productCategories?: string[]
): Promise<CouponValidationResult> {
  try {
    // Récupérer le coupon
    const { data: coupon, error: fetchError } = await retry(
      () =>
        supabase
          .from('coupons')
          .select('*')
          .eq('code', code.toUpperCase())
          .eq('is_active', true)
          .single(),
      { retryable: (err: any) => err?.code === 'PGRST116', maxRetries: 3 }
    ) as { data: Coupon | null; error: any };

    if (fetchError || !coupon) {
      return {
        valid: false,
        error: 'Code promo invalide ou introuvable',
      };
    }

    // Vérifier les dates de validité
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return {
        valid: false,
        error: 'Ce code promo n\'est pas encore valide',
      };
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return {
        valid: false,
        error: 'Ce code promo a expiré',
      };
    }

    // Vérifier le montant minimum
    if (coupon.min_purchase_amount > 0 && orderTotal < coupon.min_purchase_amount) {
      return {
        valid: false,
        error: `Montant minimum requis : ${coupon.min_purchase_amount.toFixed(2)}€`,
      };
    }

    // Vérifier les catégories applicables
    if (coupon.applicable_to && coupon.applicable_to.length > 0 && productCategories) {
      const hasApplicableCategory = productCategories.some((cat) =>
        coupon.applicable_to.includes(cat)
      );
      if (!hasApplicableCategory) {
        return {
          valid: false,
          error: 'Ce code promo ne s\'applique pas aux produits de votre panier',
        };
      }
    }

    // Vérifier la limite d'utilisation totale
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return {
        valid: false,
        error: 'Ce code promo a atteint sa limite d\'utilisation',
      };
    }

    // Vérifier l'utilisation par utilisateur
    const { count: userUsageCount } = await supabase
      .from('coupon_usage')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId);

    if (userUsageCount !== null && userUsageCount >= coupon.user_usage_limit) {
      return {
        valid: false,
        error: 'Vous avez déjà utilisé ce code promo le nombre maximum de fois',
      };
    }

    // Calculer le montant de réduction
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderTotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ne pas dépasser le montant de la commande
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    return {
      valid: true,
      coupon,
      discount_amount: Number(discountAmount.toFixed(2)),
    };
  } catch (error) {
    logger.error('Error validating coupon', error instanceof Error ? error : new Error(String(error)), {
      code,
      userId,
    });
    return {
      valid: false,
      error: 'Erreur lors de la validation du code promo',
    };
  }
}

/**
 * Applique un coupon à une commande
 */
export async function applyCouponToOrder(
  couponId: string,
  userId: string,
  orderId: string,
  discountAmount: number
): Promise<void> {
  try {
    // Enregistrer l'utilisation
    const { error: usageError } = await supabase.from('coupon_usage').insert({
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount,
    });

    if (usageError) {
      throw usageError;
    }

    // Incrémenter le compteur d'utilisation
    const { error: updateError } = await supabase.rpc('increment', {
      table_name: 'coupons',
      id_column: 'id',
      id_value: couponId,
      counter_column: 'usage_count',
    });

    // Si la fonction RPC n'existe pas, utiliser une requête UPDATE
    if (updateError && updateError.message.includes('function')) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('usage_count')
        .eq('id', couponId)
        .single();

      if (coupon) {
        await supabase
          .from('coupons')
          .update({ usage_count: coupon.usage_count + 1 })
          .eq('id', couponId);
      }
    }

    logger.info('Coupon applied to order', { couponId, userId, orderId, discountAmount });
  } catch (error) {
    logger.error('Error applying coupon to order', error instanceof Error ? error : new Error(String(error)), {
      couponId,
      userId,
      orderId,
    });
    throw createError.database('Erreur lors de l\'application du coupon');
  }
}

/**
 * Récupère tous les coupons actifs
 */
export async function getActiveCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await retry(
      () =>
        supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .gte('valid_until', new Date().toISOString())
          .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
          .order('created_at', { ascending: false }),
      { maxRetries: 3 }
    ) as { data: Coupon[] | null; error: any };

    if (error) {
      throw error;
    }

    return (data || []) as Coupon[];
  } catch (error) {
    logger.error('Error fetching active coupons', error instanceof Error ? error : new Error(String(error)));
    throw createError.database('Erreur lors de la récupération des coupons');
  }
}

/**
 * Crée un nouveau coupon (admin uniquement)
 */
export async function createCoupon(input: CouponInput, createdBy: string): Promise<Coupon> {
  try {
    // Vérifier que le code n'existe pas déjà
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', input.code.toUpperCase())
      .single();

    if (existing) {
      throw createError.validation('Un coupon avec ce code existe déjà');
    }

    const { data: coupon, error } = await retry(
      () =>
        supabase
          .from('coupons')
          .insert({
            code: input.code.toUpperCase(),
            description: input.description || null,
            discount_type: input.discount_type,
            discount_value: input.discount_value,
            min_purchase_amount: input.min_purchase_amount || 0,
            max_discount_amount: input.max_discount_amount || null,
            usage_limit: input.usage_limit || null,
            user_usage_limit: input.user_usage_limit || 1,
            valid_from: input.valid_from || new Date().toISOString(),
            valid_until: input.valid_until || null,
            applicable_to: input.applicable_to || [],
            created_by: createdBy,
          })
          .select()
          .single(),
      { maxRetries: 3 }
    ) as { data: Coupon | null; error: any };

    if (error) {
      throw error;
    }

    if (!coupon) {
      throw createError.database('Erreur lors de la création du coupon');
    }

    logger.info('Coupon created', { couponId: coupon.id, code: coupon.code });
    return coupon as Coupon;
  } catch (error) {
    if (error instanceof Error && error.message.includes('existe déjà')) {
      throw error;
    }
    logger.error('Error creating coupon', error instanceof Error ? error : new Error(String(error)), { input });
    throw createError.database('Erreur lors de la création du coupon');
  }
}

/**
 * Met à jour un coupon (admin uniquement)
 */
export async function updateCoupon(id: string, input: Partial<CouponInput>): Promise<Coupon> {
  try {
    const updateData: any = {};
    if (input.description !== undefined) updateData.description = input.description;
    if (input.discount_type !== undefined) updateData.discount_type = input.discount_type;
    if (input.discount_value !== undefined) updateData.discount_value = input.discount_value;
    if (input.min_purchase_amount !== undefined) updateData.min_purchase_amount = input.min_purchase_amount;
    if (input.max_discount_amount !== undefined) updateData.max_discount_amount = input.max_discount_amount;
    if (input.usage_limit !== undefined) updateData.usage_limit = input.usage_limit;
    if (input.user_usage_limit !== undefined) updateData.user_usage_limit = input.user_usage_limit;
    if (input.valid_from !== undefined) updateData.valid_from = input.valid_from;
    if (input.valid_until !== undefined) updateData.valid_until = input.valid_until;
    if (input.applicable_to !== undefined) updateData.applicable_to = input.applicable_to;

    const { data: coupon, error } = await retry(
      () =>
        supabase
          .from('coupons')
          .update(updateData)
          .eq('id', id)
          .select()
          .single(),
      { maxRetries: 3 }
    ) as { data: Coupon | null; error: any };

    if (error) {
      throw error;
    }

    if (!coupon) {
      throw createError.notFound('Coupon introuvable');
    }

    return coupon as Coupon;
  } catch (error) {
    logger.error('Error updating coupon', error instanceof Error ? error : new Error(String(error)), { id, input });
    if (error instanceof Error && error.message.includes('introuvable')) {
      throw error;
    }
    throw createError.database('Erreur lors de la mise à jour du coupon');
  }
}

/**
 * Supprime un coupon (soft delete)
 */
export async function deleteCoupon(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('coupons').update({ is_active: false }).eq('id', id);

    if (error) {
      throw error;
    }

    logger.info('Coupon deleted', { couponId: id });
  } catch (error) {
    logger.error('Error deleting coupon', error instanceof Error ? error : new Error(String(error)), { id });
    throw createError.database('Erreur lors de la suppression du coupon');
  }
}

/**
 * Récupère l'historique d'utilisation d'un coupon
 */
export async function getCouponUsageHistory(couponId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('coupon_usage')
      .select('*, user:users(name, email), order:orders(id, order_number, total)')
      .eq('coupon_id', couponId)
      .order('used_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as any[];
  } catch (error) {
    logger.error('Error fetching coupon usage', error instanceof Error ? error : new Error(String(error)), {
      couponId,
    });
    throw createError.database('Erreur lors de la récupération de l\'historique');
  }
}

