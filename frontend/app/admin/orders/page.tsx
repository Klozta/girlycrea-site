'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Mail,
  X,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OrderItem {
  id: string;
  product_title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  coupon_code: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    // TODO: Appel API réel
    setTimeout(() => {
      setOrders([
        {
          id: '1',
          order_number: 'GC-2026-0001',
          status: 'pending',
          total: 89.90,
          subtotal: 84.90,
          shipping_cost: 5.00,
          discount: 0,
          coupon_code: null,
          customer: { name: 'Marie Dupont', email: 'marie@example.com', phone: '06 12 34 56 78' },
          shipping_address: { address: '12 Rue de la Paix', city: 'Paris', postal_code: '75001', country: 'France' },
          items: [
            { id: '1', product_title: 'Bracelet Perles Dorées', quantity: 2, price: 24.90 },
            { id: '2', product_title: 'Collier Bohème', quantity: 1, price: 35.10 },
          ],
          created_at: '2026-01-22T10:30:00Z',
          updated_at: '2026-01-22T10:30:00Z',
        },
        {
          id: '2',
          order_number: 'GC-2026-0002',
          status: 'shipped',
          total: 45.00,
          subtotal: 45.00,
          shipping_cost: 0,
          discount: 5.00,
          coupon_code: 'BIENVENUE10',
          customer: { name: 'Sophie Martin', email: 'sophie@example.com', phone: '06 98 76 54 32' },
          shipping_address: { address: '5 Avenue des Champs', city: 'Lyon', postal_code: '69001', country: 'France' },
          items: [
            { id: '3', product_title: 'Amigurumi Lapin', quantity: 1, price: 29.00 },
            { id: '4', product_title: 'Boucles d\'oreilles Cristal', quantity: 1, price: 21.00 },
          ],
          created_at: '2026-01-21T15:45:00Z',
          updated_at: '2026-01-22T09:00:00Z',
        },
        {
          id: '3',
          order_number: 'GC-2026-0003',
          status: 'delivered',
          total: 129.00,
          subtotal: 129.00,
          shipping_cost: 0,
          discount: 0,
          coupon_code: null,
          customer: { name: 'Emma Leroy', email: 'emma@example.com', phone: '06 11 22 33 44' },
          shipping_address: { address: '8 Rue du Commerce', city: 'Marseille', postal_code: '13001', country: 'France' },
          items: [
            { id: '5', product_title: 'Coffret Bijoux Complet', quantity: 1, price: 129.00 },
          ],
          created_at: '2026-01-20T14:20:00Z',
          updated_at: '2026-01-22T16:00:00Z',
        },
        {
          id: '4',
          order_number: 'GC-2026-0004',
          status: 'processing',
          total: 67.80,
          subtotal: 72.80,
          shipping_cost: 0,
          discount: 5.00,
          coupon_code: 'LIVRAISON',
          customer: { name: 'Julie Bernard', email: 'julie@example.com', phone: '06 55 66 77 88' },
          shipping_address: { address: '15 Boulevard Haussmann', city: 'Paris', postal_code: '75009', country: 'France' },
          items: [
            { id: '6', product_title: 'Rouge à lèvres Mat', quantity: 2, price: 18.50 },
            { id: '7', product_title: 'Bracelet Fin Argent', quantity: 1, price: 35.80 },
          ],
          created_at: '2026-01-22T08:15:00Z',
          updated_at: '2026-01-22T11:30:00Z',
        },
        {
          id: '5',
          order_number: 'GC-2026-0005',
          status: 'cancelled',
          total: 54.90,
          subtotal: 54.90,
          shipping_cost: 0,
          discount: 0,
          coupon_code: null,
          customer: { name: 'Claire Petit', email: 'claire@example.com', phone: '06 99 88 77 66' },
          shipping_address: { address: '3 Place de la République', city: 'Bordeaux', postal_code: '33000', country: 'France' },
          items: [
            { id: '8', product_title: 'Écharpe Tricotée', quantity: 1, price: 54.90 },
          ],
          created_at: '2026-01-19T12:00:00Z',
          updated_at: '2026-01-20T10:00:00Z',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    // TODO: Appel API pour modifier le statut
    toast.success(`Statut mis à jour: ${STATUS_CONFIG[newStatus].label}`);
    loadOrders();
    setSelectedOrder(null);
  };

  const handleSendEmail = async (orderId: string, type: 'shipped' | 'delivered') => {
    // TODO: Appel API pour envoyer l'email
    toast.success(`Email de ${type === 'shipped' ? 'expédition' : 'livraison'} envoyé`);
  };

  const handleExportOrders = () => {
    // TODO: Export CSV
    toast.success('Export en cours...');
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Gestion des commandes</h1>
          <p className="text-gray-600 mt-1">
            {orders.length} commandes • CA: {totalRevenue.toFixed(2)} €
          </p>
        </div>
        <button
          onClick={handleExportOrders}
          className="btn btn-outline flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exporter CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`p-4 rounded-xl border-2 transition-colors ${
                statusFilter === status
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-transparent bg-white hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-gray-500">{config.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par n°, client, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commande</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-primary-600">
                          {order.order_number}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.items.length} article(s)
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold">{order.total.toFixed(2)} €</span>
                        {order.coupon_code && (
                          <p className="text-xs text-green-600">-{order.discount.toFixed(2)} € ({order.coupon_code})</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-display font-bold">
                  Commande {selectedOrder.order_number}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Statut de la commande</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const Icon = config.icon;
                    const isActive = selectedOrder.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedOrder.id, status as Order['status'])}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                          isActive
                            ? `${config.color} border-current`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Client</h3>
                <p className="font-semibold">{selectedOrder.customer.name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customer.phone}</p>
              </div>

              {/* Shipping */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Adresse de livraison</h3>
                <p>{selectedOrder.shipping_address.address}</p>
                <p>{selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}</p>
                <p>{selectedOrder.shipping_address.country}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium mb-3">Articles</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_title}</p>
                        <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{selectedOrder.subtotal.toFixed(2)} €</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction ({selectedOrder.coupon_code})</span>
                    <span>-{selectedOrder.discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{selectedOrder.shipping_cost === 0 ? 'Gratuite' : `${selectedOrder.shipping_cost.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">{selectedOrder.total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleSendEmail(selectedOrder.id, 'shipped')}
                  className="btn btn-outline flex-1 flex items-center justify-center gap-2"
                  disabled={selectedOrder.status !== 'shipped'}
                >
                  <Mail className="w-4 h-4" />
                  Email expédition
                </button>
                <button
                  onClick={() => handleSendEmail(selectedOrder.id, 'delivered')}
                  className="btn btn-outline flex-1 flex items-center justify-center gap-2"
                  disabled={selectedOrder.status !== 'delivered'}
                >
                  <Mail className="w-4 h-4" />
                  Email livraison
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
