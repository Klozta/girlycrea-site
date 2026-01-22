'use client';

import { useState } from 'react';
import { Tag, X, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

interface CouponInputProps {
  orderTotal: number;
  productCategories?: string[];
  onCouponApplied: (coupon: { code: string; discount: number }) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: { code: string; discount: number } | null;
}

export default function CouponInput({
  orderTotal,
  productCategories,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) {
  const { isAuthenticated } = useStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer un code promo');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour utiliser un code promo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.validateCoupon(code.trim(), orderTotal, productCategories);

      if (result.valid && result.discount_amount) {
        onCouponApplied({
          code: result.coupon.code,
          discount: result.discount_amount,
        });
        setCode('');
        toast.success(`Code promo appliqué ! Réduction de ${result.discount_amount.toFixed(2)}€`);
      } else {
        setError(result.error || 'Code promo invalide');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la validation du code');
      toast.error('Erreur lors de la validation du code promo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setError(null);
    onCouponRemoved();
    toast.success('Code promo retiré');
  };

  return (
    <div className="space-y-2">
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-800">{appliedCoupon.code}</div>
              <div className="text-sm text-green-600">
                Réduction de {appliedCoupon.discount.toFixed(2)}€
              </div>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-green-100 rounded transition-colors"
            aria-label="Retirer le code promo"
          >
            <X className="w-5 h-5 text-green-600" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApply();
                }
              }}
              placeholder="Code promo"
              className="input pl-10 w-full"
              disabled={loading || !isAuthenticated}
            />
          </div>
          <button
            onClick={handleApply}
            disabled={loading || !code.trim() || !isAuthenticated}
            className="btn btn-outline disabled:opacity-50"
          >
            {loading ? '...' : 'Appliquer'}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-xs text-gray-500">
          Connectez-vous pour utiliser un code promo
        </p>
      )}
    </div>
  );
}





