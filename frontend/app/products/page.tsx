'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Grid, List } from 'lucide-react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  const [searchParams, setSearchParamsState] = useState<URLSearchParams | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    q: '',
  });

  // Charger searchParams côté client uniquement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParamsState(params);
      setFilters({
        category: params.get('category') || '',
        minPrice: '',
        maxPrice: '',
        q: params.get('q') || '',
      });
    }
  }, []);

  useEffect(() => {
    if (searchParams !== null) {
      loadProducts();
    }
  }, [page, filters, searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 12,
      };

      if (filters.q) {
        const data = await api.searchProducts(filters.q, params);
        setProducts(data.products || data.data || []);
        setTotalPages(data.totalPages || 1);
      } else {
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
        if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);

        const data = await api.getProducts(params);
        setProducts(data.products || data.data || []);
        setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 12));
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      if (error.isNetworkError) {
        console.warn('Backend non accessible:', error.backendUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Bijoux', 'Crochet', 'Beauté', 'Mode', 'Décoration', 'Accessoires'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Recherche</label>
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Rechercher..."
                className="input"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => {
                  setFilters({ ...filters, category: e.target.value });
                  setPage(1);
                }}
                className="input"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Prix</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="Min"
                  className="input"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="Max"
                  className="input"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setFilters({ category: '', minPrice: '', maxPrice: '', q: '' });
                setPage(1);
              }}
              className="w-full btn btn-secondary text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">
                {filters.category || filters.q || 'Tous les produits'}
              </h1>
              <p className="text-gray-600">
                {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2">Page {page} sur {totalPages}</span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Aucun produit trouvé</p>
              <p className="text-gray-500">Essayez de modifier vos filtres</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
