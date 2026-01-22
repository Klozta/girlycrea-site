/**
 * Service de suivi des commandes
 * Gère les triggers d'emails automatiques lors des changements de statut
 */

import { pgPool } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from './emailService.js';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderWithUser {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  user_name: string;
  status: OrderStatus;
  total_amount: number;
  tracking_number?: string;
  created_at: string;
}

/**
 * Met à jour le statut d'une commande et envoie les emails appropriés
 */
export async function updateOrderStatusWithTracking(
  orderId: string,
  newStatus: OrderStatus,
  trackingNumber?: string
): Promise<{ success: boolean; emailSent: boolean; error?: string }> {
  if (!pgPool) {
    return { success: false, emailSent: false, error: 'Database not available' };
  }

  try {
    // Récupérer la commande actuelle avec les infos utilisateur
    const orderResult = await pgPool.query<OrderWithUser>(`
      SELECT 
        o.id,
        o.order_number,
        o.user_id,
        o.status,
        o.total_amount,
        o.tracking_number,
        o.created_at,
        u.email as user_email,
        u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return { success: false, emailSent: false, error: 'Order not found' };
    }

    const order = orderResult.rows[0];
    const previousStatus = order.status;

    // Mettre à jour le statut
    const updateFields: string[] = ['status = $2', 'updated_at = NOW()'];
    const updateParams: any[] = [orderId, newStatus];

    if (trackingNumber) {
      updateFields.push(`tracking_number = $${updateParams.length + 1}`);
      updateParams.push(trackingNumber);
    }

    await pgPool.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $1`,
      updateParams
    );

    // Logger le changement de statut
    await logStatusChange(orderId, previousStatus, newStatus, trackingNumber);

    // Envoyer les emails appropriés
    let emailSent = false;

    if (newStatus === 'shipped' && previousStatus !== 'shipped') {
      try {
        await sendOrderShippedEmail({
          userId: order.user_id,
          to: order.user_email,
          orderNumber: order.order_number,
        });
        emailSent = true;
        logger.info('Order shipped email sent', { orderId, email: order.user_email });
      } catch (emailError) {
        logger.error('Failed to send shipped email', emailError as Error, { orderId });
      }
    }

    if (newStatus === 'delivered' && previousStatus !== 'delivered') {
      try {
        await sendOrderDeliveredEmail({
          userId: order.user_id,
          to: order.user_email,
          orderNumber: order.order_number,
        });
        emailSent = true;
        logger.info('Order delivered email sent', { orderId, email: order.user_email });
      } catch (emailError) {
        logger.error('Failed to send delivered email', emailError as Error, { orderId });
      }
    }

    return { success: true, emailSent };

  } catch (error) {
    logger.error('Error updating order status', error as Error, { orderId, newStatus });
    return { success: false, emailSent: false, error: (error as Error).message };
  }
}

/**
 * Logger les changements de statut dans la table d'audit
 */
async function logStatusChange(
  orderId: string,
  previousStatus: string,
  newStatus: string,
  trackingNumber?: string
): Promise<void> {
  if (!pgPool) return;

  try {
    await pgPool.query(`
      INSERT INTO order_status_events (order_id, previous_status, new_status, tracking_number, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [orderId, previousStatus, newStatus, trackingNumber]);
  } catch (error) {
    // La table peut ne pas exister, ignorer l'erreur
    logger.debug('Could not log status change to order_status_events', { orderId });
  }
}

/**
 * Calcule la date de livraison estimée (3-5 jours ouvrables)
 */
function getEstimatedDeliveryDate(): string {
  const now = new Date();
  let businessDays = 0;
  const targetDays = 4; // Moyenne entre 3 et 5

  while (businessDays < targetDays) {
    now.setDate(now.getDate() + 1);
    const dayOfWeek = now.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }

  return now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Récupère l'historique de statut d'une commande
 */
export async function getOrderStatusHistory(orderId: string): Promise<any[]> {
  if (!pgPool) return [];

  try {
    const result = await pgPool.query(`
      SELECT * FROM order_status_events
      WHERE order_id = $1
      ORDER BY created_at DESC
    `, [orderId]);

    return result.rows;
  } catch (error) {
    return [];
  }
}

/**
 * Vérifie et met à jour les commandes en attente depuis longtemps
 */
export async function checkStalePendingOrders(): Promise<{ count: number; updated: string[] }> {
  if (!pgPool) return { count: 0, updated: [] };

  try {
    // Trouver les commandes pending depuis plus de 24h
    const result = await pgPool.query(`
      SELECT id, order_number, user_id, created_at
      FROM orders
      WHERE status = 'pending'
        AND created_at < NOW() - INTERVAL '24 hours'
    `);

    const updated: string[] = [];

    for (const order of result.rows) {
      // Optionnel: envoyer un rappel ou annuler automatiquement
      logger.warn('Stale pending order detected', { 
        orderId: order.id, 
        createdAt: order.created_at 
      });
      updated.push(order.order_number);
    }

    return { count: result.rows.length, updated };
  } catch (error) {
    logger.error('Error checking stale orders', error as Error);
    return { count: 0, updated: [] };
  }
}
