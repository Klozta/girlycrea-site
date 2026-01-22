'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  stock: number;
  images: string[];
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = ['Bijoux', 'Crochet', 'Beauté', 'Mode'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    compare_at_price: '',
    category: 'Bijoux',
    stock: 0,
    images: [] as string[],
    is_active: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    // TODO: Appel API réel
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          title: 'Bracelet Perles Dorées',
          description: 'Magnifique bracelet en perles dorées, fait main avec amour.',
          price: 24.90,
          compare_at_price: 34.90,
          category: 'Bijoux',
          stock: 15,
          images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200'],
          is_active: true,
          created_at: '2026-01-15',
        },
        {
          id: '2',
          title: 'Collier Bohème',
          description: 'Collier style bohème avec pendentif en pierre naturelle.',
          price: 39.90,
          compare_at_price: null,
          category: 'Bijoux',
          stock: 8,
          images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200'],
          is_active: true,
          created_at: '2026-01-12',
        },
        {
          id: '3',
          title: 'Amigurumi Lapin',
          description: 'Adorable lapin en crochet, parfait pour les enfants.',
          price: 29.00,
          compare_at_price: null,
          category: 'Crochet',
          stock: 5,
          images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'],
          is_active: true,
          created_at: '2026-01-10',
        },
        {
          id: '4',
          title: 'Rouge à lèvres Mat',
          description: 'Rouge à lèvres longue tenue, couleur intense.',
          price: 18.50,
          compare_at_price: 22.00,
          category: 'Beauté',
          stock: 0,
          images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200'],
          is_active: false,
          created_at: '2026-01-08',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return;
    }

    // TODO: Appel API pour créer/modifier
    toast.success(editingProduct ? 'Produit modifié !' : 'Produit créé !');
    setShowModal(false);
    resetForm();
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    // TODO: Appel API pour supprimer
    toast.success('Produit supprimé');
    loadProducts();
  };

  const handleToggleActive = async (product: Product) => {
    // TODO: Appel API pour activer/désactiver
    toast.success(product.is_active ? 'Produit désactivé' : 'Produit activé');
    loadProducts();
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      compare_at_price: product.compare_at_price?.toString() || '',
      category: product.category,
      stock: product.stock,
      images: product.images,
      is_active: product.is_active,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      compare_at_price: '',
      category: 'Bijoux',
      stock: 0,
      images: [],
      is_active: true,
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Gestion des produits</h1>
          <p className="text-gray-600 mt-1">{products.length} produits au total</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau produit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">Toutes les catégories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
                !product.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 relative">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {product.compare_at_price && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Promo
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Rupture
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-primary-600">{product.price.toFixed(2)} €</span>
                  {product.compare_at_price && (
                    <span className="text-sm text-gray-400 line-through">
                      {product.compare_at_price.toFixed(2)} €
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Stock: {product.stock}</span>
                  <span className={`flex items-center gap-1 ${product.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                    {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {product.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 btn btn-outline btn-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={product.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-display font-bold">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nom du produit"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du produit"
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prix (€) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prix barré (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    placeholder="Optionnel"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Glissez vos images ici ou cliquez pour sélectionner</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 5MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Produit visible sur le site
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingProduct ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
