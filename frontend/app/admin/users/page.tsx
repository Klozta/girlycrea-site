'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Users,
  Mail,
  Calendar,
  ShoppingBag,
  Shield,
  ShieldCheck,
  MoreVertical,
  Ban,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  orders_count: number;
  total_spent: number;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    // TODO: Appel API réel
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'Admin GirlyCrea',
          email: 'admin@girlycrea.local',
          role: 'admin',
          orders_count: 0,
          total_spent: 0,
          created_at: '2026-01-01T00:00:00Z',
          last_login: '2026-01-22T10:00:00Z',
          is_active: true,
        },
        {
          id: '2',
          name: 'Marie Dupont',
          email: 'marie@example.com',
          role: 'user',
          orders_count: 5,
          total_spent: 245.80,
          created_at: '2026-01-10T14:30:00Z',
          last_login: '2026-01-22T09:15:00Z',
          is_active: true,
        },
        {
          id: '3',
          name: 'Sophie Martin',
          email: 'sophie@example.com',
          role: 'user',
          orders_count: 3,
          total_spent: 156.50,
          created_at: '2026-01-12T10:00:00Z',
          last_login: '2026-01-21T18:30:00Z',
          is_active: true,
        },
        {
          id: '4',
          name: 'Emma Leroy',
          email: 'emma@example.com',
          role: 'user',
          orders_count: 1,
          total_spent: 129.00,
          created_at: '2026-01-15T16:45:00Z',
          last_login: '2026-01-20T14:00:00Z',
          is_active: true,
        },
        {
          id: '5',
          name: 'Julie Bernard',
          email: 'julie@example.com',
          role: 'user',
          orders_count: 2,
          total_spent: 89.90,
          created_at: '2026-01-18T09:30:00Z',
          last_login: '2026-01-22T08:00:00Z',
          is_active: true,
        },
        {
          id: '6',
          name: 'Claire Petit',
          email: 'claire@example.com',
          role: 'user',
          orders_count: 0,
          total_spent: 0,
          created_at: '2026-01-20T11:00:00Z',
          last_login: null,
          is_active: false,
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleToggleRole = async (user: User) => {
    if (user.email === 'admin@girlycrea.local') {
      toast.error('Impossible de modifier le rôle de l\'admin principal');
      return;
    }
    // TODO: Appel API
    toast.success(user.role === 'admin' ? 'Droits admin retirés' : 'Droits admin accordés');
    loadUsers();
  };

  const handleToggleActive = async (user: User) => {
    if (user.email === 'admin@girlycrea.local') {
      toast.error('Impossible de désactiver l\'admin principal');
      return;
    }
    // TODO: Appel API
    toast.success(user.is_active ? 'Utilisateur désactivé' : 'Utilisateur réactivé');
    loadUsers();
  };

  const handleDelete = async (user: User) => {
    if (user.email === 'admin@girlycrea.local') {
      toast.error('Impossible de supprimer l\'admin principal');
      return;
    }
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) return;
    // TODO: Appel API
    toast.success('Utilisateur supprimé');
    loadUsers();
  };

  const handleSendEmail = async (user: User) => {
    // TODO: Ouvrir modal ou mailto
    window.location.href = `mailto:${user.email}`;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.is_active).length,
    totalRevenue: users.reduce((sum, u) => sum + u.total_spent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600 mt-1">
          {stats.total} utilisateurs • {stats.active} actifs • {stats.admins} admin(s)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-gray-500">Actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(0)}€</p>
              <p className="text-xs text-gray-500">CA Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Tous les rôles</option>
          <option value="admin">Admins</option>
          <option value="user">Utilisateurs</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Commandes</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total dépensé</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Inscription</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${!user.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{user.orders_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">{user.total_spent.toFixed(2)} €</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {user.last_login && (
                        <p className="text-xs text-gray-400 mt-1">
                          Dernière connexion: {new Date(user.last_login).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSendEmail(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Envoyer un email"
                        >
                          <Mail className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={user.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
                        >
                          <Shield className={`w-4 h-4 ${user.role === 'admin' ? 'text-purple-600' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={user.is_active ? 'Désactiver' : 'Activer'}
                        >
                          <Ban className={`w-4 h-4 ${user.is_active ? 'text-gray-400' : 'text-red-600'}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
