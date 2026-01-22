/**
 * Service d'envoi d'emails avec Nodemailer (remplacement Resend)
 * Configuration pour SMTP local ou externe
 */
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { canSendEmail } from './emailPreferencesService.js';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: EmailAttachment[];
}

// Créer le transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
  },
});

/**
 * Vérifier la connexion SMTP
 */
export async function verifySMTPConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    logger.info('SMTP connection verified');
    return true;
  } catch (error) {
    logger.error('SMTP connection failed', error);
    return false;
  }
}

/**
 * Envoyer un email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Note: canSendEmail nécessite un userId, pas un email
    // Si vous avez besoin de vérifier les préférences, passez userId dans EmailOptions
    // Pour l'instant, on envoie l'email sans vérification de préférences

    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || 'noreply@girlycrea.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to send email', error instanceof Error ? error : new Error(errorMessage), {
      to: options.to,
      subject: options.subject,
    });
    throw error;
  }
}

/**
 * Envoyer un email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  total: number;
  createdAt?: string;
  shippingName?: string;
  shippingAddressLine?: string;
  items?: Array<{ title: string; quantity: number; unitPrice: number }>;
}): Promise<void> {
  const html = generateOrderConfirmationEmailHTML(params);

  await sendEmail({
    to: params.to,
    subject: `Confirmation de commande #${params.orderNumber}`,
    html,
  });
}

/**
 * Générer le HTML de confirmation de commande
 */
function generateOrderConfirmationEmailHTML(params: {
  orderNumber: string;
  total: number;
  createdAt?: string;
  shippingName?: string;
  shippingAddressLine?: string;
  items?: Array<{ title: string; quantity: number; unitPrice: number }>;
}): string {
  const createdAt = params.createdAt ? new Date(params.createdAt).toLocaleString('fr-FR') : undefined;
  const items = Array.isArray(params.items) ? params.items : [];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px;">
    <h1 style="margin: 0 0 12px; color: #db2777;">Commande confirmée ✅</h1>
    <p style="margin: 0 0 16px; color: #374151;">
      Merci pour votre achat${params.shippingName ? `, ${params.shippingName}` : ''} !
    </p>

    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Numéro de commande</p>
      <p style="margin: 4px 0 0; font-size: 22px; font-weight: 700; color: #059669;">${params.orderNumber}</p>
    </div>

    ${items.length > 0 ? `
    <div style="margin: 24px 0;">
      <h2 style="font-size: 18px; margin: 0 0 12px; color: #111827;">Articles commandés</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${items.map(item => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">x${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.unitPrice.toFixed(2)} €</td>
        </tr>
        `).join('')}
      </table>
    </div>
    ` : ''}

    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 16px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #6b7280;">Total</span>
        <span style="font-weight: 700; font-size: 20px; color: #111827;">${params.total.toFixed(2)} €</span>
      </div>
    </div>

    ${params.shippingAddressLine ? `
    <div style="margin: 24px 0;">
      <h2 style="font-size: 18px; margin: 0 0 12px; color: #111827;">Adresse de livraison</h2>
      <p style="margin: 0; color: #374151;">${params.shippingAddressLine}</p>
    </div>
    ` : ''}

    ${createdAt ? `
    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px;">
      Commande passée le ${createdAt}
    </p>
    ` : ''}

    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Vous recevrez un email de suivi lorsque votre commande sera expédiée.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Vérifier la connexion au démarrage
if (process.env.NODE_ENV !== 'test') {
  verifySMTPConnection().catch(() => {
    logger.warn('SMTP connection verification failed - emails may not work');
  });
}



