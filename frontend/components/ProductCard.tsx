'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  category?: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isAuthenticated } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const imageUrl = product.images?.[0] || '/placeholder-product.jpg';
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    if (isOutOfStock) {
      toast.error('Produit en rupture de stock');
      return;
    }

    setIsAdding(true);
    try {
      addToCart(
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: imageUrl,
        },
        1
      );
      toast.success('Produit ajouté au panier');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter à la wishlist');
      return;
    }

    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Retiré de la wishlist' : 'Ajouté à la wishlist');
  };

  return (
    <div className="card group hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-900">
                Rupture de stock
              </span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            aria-label="Ajouter à la wishlist"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? 'fill-primary-600 text-primary-600' : 'text-gray-700'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-gray-500 uppercase mb-1">{product.category}</p>
          )}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-2xl font-bold text-primary-600 mb-4">
            {product.price.toFixed(2)} €
          </p>

          {/* Actions */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdding ? 'Ajout...' : isOutOfStock ? 'Rupture' : 'Ajouter au panier'}
          </button>
        </div>
      </Link>
    </div>
  );
}


