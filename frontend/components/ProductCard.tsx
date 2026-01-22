'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/lib/store';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    original_price?: number;
    description?: string;
    images?: string[];
    category?: string;
    stock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0],
    });
  };

  return (
    <Link href={`/products/${product.id}`} className="card group hover:shadow-xl transition-all">
      <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-t-lg">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {product.stock !== undefined && product.stock <= 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            Rupture de stock
          </div>
        )}

        {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            Stock limité
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary-600">
              {Number(product.price).toFixed(2)} €
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="text-sm text-gray-500 line-through">
                {Number(product.original_price).toFixed(2)} €
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Ajouter ${product.title} au panier`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {product.category && (
          <div className="mt-2">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
