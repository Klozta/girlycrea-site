'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, CheckCircle, XCircle, Clock, ArrowLeft, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { isAuthenticated } = useStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders/' + orderId);
      return;
    }
    loadOrder();
  }, [orderId, isAuthenticated, router]);

  const loadOrder = async () => {
    try {
      const data = await api.getOrder(orderId);
      setOrder(data.order || data);
    } catch (error: any) {
      console.error('Error loading order:', error);
      toast.error('Erreur lors du chargement de la commande');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-600" />;
      case 'paid':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="card p-6">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Commande non trouvée</h1>
        <Link href="/orders" className="btn btn-primary">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/orders" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          Retour aux commandes
        </Link>
        <button className="btn btn-outline flex items-center gap-2">
          <Download className="w-4 h-4" />
          Télécharger la facture
        </button>
      </div>

      <h1 className="text-3xl font-display font-bold mb-8">
        Commande #{order.id?.slice(0, 8) || order.orderNumber}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Statut de la commande</h2>
              <span className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <p className="font-medium">
                  {order.status === 'delivered'
                    ? 'Votre commande a été livrée'
                    : order.status === 'shipped'
                    ? 'Votre commande est en cours de livraison'
                    : order.status === 'paid'
                    ? 'Votre commande est confirmée'
                    : order.status === 'cancelled'
                    ? 'Votre commande a été annulée'
                    : 'Votre commande est en attente de traitement'}
                </p>
                {order.updatedAt && (
                  <p className="text-sm text-gray-600 mt-1">
                    Dernière mise à jour : {new Date(order.updatedAt || order.updated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6">Articles commandés</h2>
            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title || item.productId}</h3>
                    <p className="text-sm text-gray-600">Quantité : {item.quantity}</p>
                    <p className="text-sm text-gray-600">Prix unitaire : {item.price?.toFixed(2)} €</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {((item.price || 0) * (item.quantity || 1)).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Adresse de livraison</h2>
              <div className="text-gray-700">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                </p>
                {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Résumé</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{order.subtotal ? order.subtotal.toFixed(2) : '0.00'} €</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{order.shippingCost ? order.shippingCost.toFixed(2) : '0.00'} €</span>
              </div>
              {order.discount && (
                <div className="flex justify-between text-green-600">
                  <span>Remise</span>
                  <span>-{order.discount.toFixed(2)} €</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">{order.total?.toFixed(2) || '0.00'} €</span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900 mb-1">Date de commande</p>
                <p>
                  {new Date(order.createdAt || order.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="font-medium text-gray-900 mb-1">Numéro de suivi</p>
                  <p className="font-mono">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {order.status === 'pending' && (
              <button className="w-full btn btn-secondary mt-6">
                Annuler la commande
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


