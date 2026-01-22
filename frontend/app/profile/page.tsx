'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { User, Mail, Calendar, Package, Heart, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }
    loadOrders();
  }, [isAuthenticated, router]);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders({ limit: 5 });
      setOrders(data.orders || data.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Mon profil</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary-600" />
              </div>
              <h2 className="font-display text-xl font-semibold">
                {user?.name || 'Utilisateur'}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 text-primary-600 font-medium"
              >
                <User className="w-5 h-5" />
                Mon profil
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Package className="w-5 h-5" />
                Mes commandes
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Heart className="w-5 h-5" />
                Ma wishlist
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Settings className="w-5 h-5" />
                Paramètres
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold mb-6">Informations personnelles</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              {user?.name && (
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>
              )}
              {user?.createdAt && (
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Membre depuis</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-outline mt-6">Modifier mes informations</button>
          </div>

          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">Mes commandes récentes</h2>
              <Link href="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Voir tout
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Commande #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt || order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {order.total ? `${order.total.toFixed(2)} €` : 'N/A'}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            order.status === 'paid' || order.status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.status || 'En attente'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Aucune commande pour le moment</p>
                <Link href="/products" className="btn btn-primary">
                  Découvrir la boutique
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



