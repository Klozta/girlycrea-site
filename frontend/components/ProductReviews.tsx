'use client';

import { useEffect, useState } from 'react';
import { Star, ThumbsUp, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  photos: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user?: {
    name: string;
  };
  responses?: Array<{
    id: string;
    response: string;
    created_at: string;
    user?: {
      name: string;
    };
  }>;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { isAuthenticated } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'newest' | 'rating_desc' | 'helpful'>('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [productId, sort]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getProductReviews(productId, {
        sort,
        limit: 10,
      });
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getProductReviewStats(productId);
      setStats(data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) return;
    try {
      await api.markReviewAsHelpful(reviewId);
      loadReviews(); // Recharger pour mettre à jour le compteur
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">{stats.averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stats.totalReviews} avis</div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {stats.ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trier par :</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="input text-sm"
          >
            <option value="newest">Plus récents</option>
            <option value="rating_desc">Mieux notés</option>
            <option value="helpful">Plus utiles</option>
          </select>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn btn-primary text-sm"
          >
            Laisser un avis
          </button>
        )}
      </div>

      {/* Liste des avis */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.user?.name || 'Anonyme'}</span>
                    {review.is_verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Achat vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
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

              {review.title && (
                <h4 className="font-semibold mb-2">{review.title}</h4>
              )}

              {review.comment && (
                <p className="text-gray-700 mb-3">{review.comment}</p>
              )}

              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center"
                    >
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-primary-600"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Utile ({review.helpful_count})
                </button>
              </div>

              {/* Réponses */}
              {review.responses && review.responses.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-primary-200 space-y-2">
                  {review.responses.map((response) => (
                    <div key={response.id}>
                      <div className="font-semibold text-sm text-primary-600">
                        {response.user?.name || 'Équipe GirlyCrea'}
                      </div>
                      <p className="text-sm text-gray-700">{response.response}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          <p>Aucun avis pour le moment. Soyez le premier à laisser un avis !</p>
        </div>
      )}

      {/* Modal Formulaire d'avis */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            loadReviews();
            loadStats();
          }}
        />
      )}
    </div>
  );
}





