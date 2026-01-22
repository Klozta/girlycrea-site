'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ProductReviews from '@/components/ProductReviews';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isAuthenticated } = useStore();

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await api.getProduct(productId);
      setProduct(data.product || data);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    if (!product || product.stock === 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0],
      },
      quantity
    );
    toast.success('Produit ajouté au panier');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
        <Link href="/products" className="btn btn-primary">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const images = product.images || ['/placeholder-product.jpg'];
  const isOutOfStock = product.stock === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={images[selectedImage] || images[0]}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <Image 
                    src={img} 
                    alt={`${product.title} ${index + 1}`} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <p className="text-sm text-gray-500 uppercase mb-2">{product.category}</p>
          )}
          <h1 className="text-4xl font-display font-bold mb-4">{product.title}</h1>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < 4 ? 'fill-accent-400 text-accent-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">(12 avis)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-primary-600">{product.price.toFixed(2)} €</p>
            {product.stock !== undefined && (
              <p className={`text-sm mt-2 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                {isOutOfStock ? 'Rupture de stock' : `${product.stock} en stock`}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <label className="font-medium">Quantité:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                  disabled={quantity === 1}
                >
                  -
                </button>
                <span className="px-6 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                  disabled={quantity >= (product.stock || 10)}
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
            </button>
          </div>

          {/* Features */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium">Livraison gratuite</p>
                <p className="text-sm text-gray-600">À partir de 50€ d'achat</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium">Paiement sécurisé</p>
                <p className="text-sm text-gray-600">100% sécurisé avec Stripe</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium">Retours faciles</p>
                <p className="text-sm text-gray-600">14 jours pour changer d'avis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t pt-12">
        <ProductReviews productId={productId} />
      </div>
    </div>
  );
}

