'use client';

import { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  MessageSquare,
  Tag,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingReviews: number;
  activeCoupons: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingReviews: 0,
    activeCoupons: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalOrders: data.orders?.total || 0,
            totalRevenue: data.orders?.revenue || 0,
            totalUsers: data.users?.total || 0,
            totalProducts: data.products?.total || 0,
            pendingReviews: data.reviews?.pending || 0,
            activeCoupons: data.coupons?.active || 0,
            recentOrders: (data.recentOrders || []).map((order: any) => ({
              id: order.id,
              customer: order.customer,
              total: order.total,
              status: order.status,
              date: new Date(order.date).toLocaleDateString('fr-FR'),
            })),
          });
        } else {
          // Fallback: données de démonstration si API non disponible
          console.warn('API admin/stats non disponible, utilisation des données de démonstration');
          setStats({
            totalOrders: 0,
            totalRevenue: 0,
            totalUsers: 0,
            totalProducts: 0,
            pendingReviews: 0,
            activeCoupons: 0,
            recentOrders: [],
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        // Fallback silencieux
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0,
          totalProducts: 0,
          pendingReviews: 0,
          activeCoupons: 0,
          recentOrders: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Commandes',
      value: stats.totalOrders,
      change: '+12%',
      positive: true,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      href: '/admin/orders',
    },
    {
      label: 'Chiffre d\'affaires',
      value: `${stats.totalRevenue.toFixed(2)} €`,
      change: '+8%',
      positive: true,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/admin/orders',
    },
    {
      label: 'Utilisateurs',
      value: stats.totalUsers,
      change: '+5%',
      positive: true,
      icon: Users,
      color: 'bg-purple-500',
      href: '/admin/users',
    },
    {
      label: 'Produits',
      value: stats.totalProducts,
      change: '0',
      positive: true,
      icon: Package,
      color: 'bg-orange-500',
      href: '/admin/products',
    },
  ];

  const quickActions = [
    {
      label: 'Avis en attente',
      count: stats.pendingReviews,
      icon: MessageSquare,
      href: '/admin/reviews',
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: 'Coupons actifs',
      count: stats.activeCoupons,
      icon: Tag,
      href: '/admin/coupons',
      color: 'text-green-600 bg-green-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenue dans l'espace d'administration GirlyCrea</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.positive ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{stat.change} ce mois</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg">Actions rapides</h2>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </div>
                <span className="text-2xl font-bold">{action.count}</span>
              </Link>
            );
          })}

          {/* Quick Links */}
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <h3 className="font-medium text-gray-700">Liens rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/coupons" className="btn btn-outline btn-sm text-center">
                + Coupon
              </Link>
              <Link href="/admin/products" className="btn btn-outline btn-sm text-center">
                + Produit
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{order.customer}</td>
                    <td className="px-6 py-4">{order.total.toFixed(2)} €</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
