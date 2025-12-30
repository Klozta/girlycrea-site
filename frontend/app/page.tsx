'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart, Star } from 'lucide-react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/lib/store';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const data = await api.getProducts({ limit: 8 });
      setFeaturedProducts(data.products || data.data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      if (error.isNetworkError) {
        console.warn('Backend non accessible:', error.backendUrl);
        // Afficher un message à l'utilisateur si besoin
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      name: 'Bijoux',
      href: '/products?category=Bijoux',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      description: 'Colliers, bracelets, boucles d\'oreilles élégants',
    },
    {
      name: 'Crochet',
      href: '/products?category=Crochet',
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
      description: 'Créations faites main et accessoires',
    },
    {
      name: 'Beauté',
      href: '/products?category=Beauté',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      description: 'Produits de beauté et cosmétiques',
    },
    {
      name: 'Mode',
      href: '/products?category=Mode',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      description: 'Accessoires mode et tendances',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Bienvenue chez GirlyCrea
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Découvrez notre sélection de bijoux, accessoires mode, produits de beauté
              et créations crochet. Des produits élégants et tendance pour toutes les occasions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Découvrir la boutique
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/products?category=Bijoux" className="btn btn-outline border-white text-white hover:bg-white/10">
                Voir les bijoux
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Produits sélectionnés</h3>
              <p className="text-gray-600">Une curation de produits élégants et tendance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fait avec amour</h3>
              <p className="text-gray-600">Des créations artisanales et faites main</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Qualité premium</h3>
              <p className="text-gray-600">Des produits de qualité pour vous satisfaire</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Explorez nos catégories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="card group hover:shadow-xl transition-all"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-display text-xl font-semibold mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-white/90">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-bold">
              Produits en vedette
            </h2>
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
              Voir tout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
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
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun produit disponible pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Rejoignez la communauté GirlyCrea
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Inscrivez-vous pour recevoir nos offres exclusives et nouveautés
          </p>
          <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 inline-flex">
            Créer un compte
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
