'use client';

import { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ReviewFormProps {
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({ productId, onClose, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    setLoading(true);
    try {
      await api.createProductReview(productId, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      });
      toast.success('Avis envoyé ! Il sera visible après modération.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const message = error.response?.data?.error || 'Erreur lors de l\'envoi de l\'avis';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-display font-bold">Laisser un avis</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Votre note <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {rating > 0 && (
                  <>
                    {rating === 1 && 'Très mauvais'}
                    {rating === 2 && 'Mauvais'}
                    {rating === 3 && 'Correct'}
                    {rating === 4 && 'Bien'}
                    {rating === 5 && 'Excellent !'}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Titre de l'avis <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Résumez votre avis en quelques mots"
              maxLength={100}
              className="input"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Votre commentaire <span className="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre expérience avec ce produit..."
              rows={4}
              maxLength={1000}
              className="input resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 caractères</p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg">
            <p>
              💡 Votre avis sera vérifié avant publication pour garantir la qualité des commentaires.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer mon avis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
