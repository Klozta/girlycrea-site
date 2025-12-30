'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import { toast } from 'react-hot-toast';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, addToCart } = useStore();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/wishlist');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, router]);

  const loadWishlist = async () => {
    try {
      // TODO: Implémenter l'API wishlist dans le backend
      // Pour l'instant, utiliser localStorage
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const productIds = JSON.parse(stored);
        const products = await Promise.all(
          productIds.map((id: string) => api.getProduct(id).catch(() => null))
        );
        setWishlist(products.filter(Boolean));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      const productIds = JSON.parse(stored).filter((id: string) => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(productIds));
      setWishlist(wishlist.filter((p) => p.id !== productId));
      toast.success('Produit retiré de la wishlist');
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0],
      },
      1
    );
    toast.success('Produit ajouté au panier');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">Votre wishlist est vide</h1>
        <p className="text-gray-600 mb-8">
          Ajoutez des produits à votre wishlist pour les retrouver facilement plus tard
        </p>
        <Link href="/products" className="btn btn-primary inline-flex items-center gap-2">
          Découvrir la boutique
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Ma Wishlist</h1>
        <span className="text-gray-600">{wishlist.length} produit{wishlist.length > 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product.id} className="card group relative">
            <button
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Retirer de la wishlist"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
            <ProductCard product={product} />
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full mt-2 btn btn-primary flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Ajouter au panier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


