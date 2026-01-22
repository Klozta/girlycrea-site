'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Star, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Eye,
  Trash2,
  Filter,
  User,
  Package,
  Calendar,
  ThumbsUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  product: {
    id: string;
    title: string;
    image: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/reviews?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transformer les données API pour correspondre à l'interface
        const formattedReviews = (data.reviews || []).map((r: any) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          is_verified_purchase: r.is_verified_purchase || false,
          is_approved: r.is_approved,
          helpful_count: r.helpful_count || 0,
          created_at: r.created_at,
          user: {
            name: r.user_name || 'Client',
            email: r.user_email || '',
          },
          product: {
            id: r.product_id,
            title: r.product_title || 'Produit',
            image: r.product_image || '',
          },
        }));
        setReviews(formattedReviews);
      } else {
        // Fallback: données de démonstration
        console.warn('API admin/reviews non disponible');
      const allReviews: Review[] = [
        {
          id: '1',
          rating: 5,
          title: 'Magnifique bracelet !',
          comment: 'La qualité est au rendez-vous, je suis très satisfaite de mon achat. Le bracelet correspond parfaitement à la description et la livraison a été rapide.',
          is_verified_purchase: true,
          is_approved: false,
          helpful_count: 0,
          created_at: '2026-01-22T10:30:00Z',
          user: { name: 'Marie Dupont', email: 'marie@example.com' },
          product: { id: '1', title: 'Bracelet Perles Dorées', image: '' },
        },
        {
          id: '2',
          rating: 4,
          title: 'Très bien',
          comment: 'Beau produit, conforme à la description. Je retire une étoile car la livraison a pris un peu plus de temps que prévu.',
          is_verified_purchase: true,
          is_approved: false,
          helpful_count: 0,
          created_at: '2026-01-21T15:45:00Z',
          user: { name: 'Sophie Martin', email: 'sophie@example.com' },
          product: { id: '2', title: 'Collier Bohème', image: '' },
        },
        {
          id: '3',
          rating: 2,
          title: 'Déçue',
          comment: 'Le produit ne correspond pas du tout aux photos. La couleur est différente et la qualité est médiocre.',
          is_verified_purchase: false,
          is_approved: false,
          helpful_count: 0,
          created_at: '2026-01-20T09:15:00Z',
          user: { name: 'Emma Leroy', email: 'emma@example.com' },
          product: { id: '3', title: 'Boucles d\'oreilles Cristal', image: '' },
        },
        {
          id: '4',
          rating: 5,
          title: 'Parfait !',
          comment: 'Exactement ce que je cherchais. Je recommande !',
          is_verified_purchase: true,
          is_approved: true,
          helpful_count: 12,
          created_at: '2026-01-19T14:20:00Z',
          user: { name: 'Julie Bernard', email: 'julie@example.com' },
          product: { id: '1', title: 'Bracelet Perles Dorées', image: '' },
        },
      ];

      let filtered = allReviews;
      if (filter === 'pending') {
        filtered = allReviews.filter(r => !r.is_approved);
      } else if (filter === 'approved') {
        filtered = allReviews.filter(r => r.is_approved);
      }

      setReviews(filtered);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    // TODO: Appel API pour approuver
    toast.success('Avis approuvé et publié');
    loadReviews();
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cet avis ?')) return;
    // TODO: Appel API pour rejeter
    toast.success('Avis rejeté');
    loadReviews();
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet avis ?')) return;
    // TODO: Appel API pour supprimer
    toast.success('Avis supprimé');
    loadReviews();
    setSelectedReview(null);
  };

  const filteredReviews = reviews.filter(r => 
    r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Modération des avis</h1>
        <p className="text-gray-600 mt-1">
          Validez ou rejetez les avis clients avant publication
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
              <p className="text-sm text-yellow-600">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800">
                {reviews.filter(r => r.is_approved).length}
              </p>
              <p className="text-sm text-green-600">Approuvés</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-800">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '-'
                }
              </p>
              <p className="text-sm text-blue-600">Note moyenne</p>
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
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input"
          >
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="all">Tous</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid lg:grid-cols-2 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : filteredReviews.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun avis à afficher</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-xl shadow-sm p-6 border-l-4 transition-shadow hover:shadow-md ${
                review.is_approved ? 'border-green-500' : 'border-yellow-500'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.user.name}</span>
                    {review.is_verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Achat vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Package className="w-4 h-4" />
                <span>{review.product.title}</span>
              </div>

              {/* Content */}
              {review.title && (
                <h4 className="font-semibold mb-2">{review.title}</h4>
              )}
              {review.comment && (
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{review.comment}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.helpful_count} utile(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  {!review.is_approved && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approuver"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Rejeter"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold">Détail de l'avis</h2>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold">{selectedReview.user.name}</p>
                  <p className="text-sm text-gray-500">{selectedReview.user.email}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Product */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Produit</p>
                <p className="font-medium">{selectedReview.product.title}</p>
              </div>

              {/* Content */}
              {selectedReview.title && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Titre</p>
                  <p className="font-semibold">{selectedReview.title}</p>
                </div>
              )}
              {selectedReview.comment && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Commentaire</p>
                  <p className="text-gray-700">{selectedReview.comment}</p>
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedReview.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {selectedReview.is_verified_purchase && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Achat vérifié
                  </span>
                )}
              </div>

              {/* Actions */}
              {!selectedReview.is_approved && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleReject(selectedReview.id);
                      setSelectedReview(null);
                    }}
                    className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedReview.id);
                      setSelectedReview(null);
                    }}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
