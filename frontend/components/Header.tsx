'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Search, Heart, ShoppingBag, Menu, X, User } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated, user, cartCount, logout } = useStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link className="flex items-center space-x-2" href="/">
            <span className="text-2xl font-display font-bold text-primary-600">
              GirlyCrea
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              className="text-sm font-medium transition-colors text-primary-600"
              href="/"
            >
              Accueil
            </Link>
            <Link
              className="text-sm font-medium transition-colors text-gray-700 hover:text-primary-600"
              href="/products"
            >
              Boutique
            </Link>
            <Link
              className="text-sm font-medium transition-colors text-gray-700 hover:text-primary-600"
              href="/courses"
            >
              Cours de Crochet
            </Link>
            <Link
              className="text-sm font-medium transition-colors text-gray-700 hover:text-primary-600"
              href="/products?category=Bijoux"
            >
              Bijoux
            </Link>
            <Link
              className="text-sm font-medium transition-colors text-gray-700 hover:text-primary-600"
              href="/products?category=Crochet"
            >
              Crochet
            </Link>
            <Link
              className="text-sm font-medium transition-colors text-gray-700 hover:text-primary-600"
              href="/products?category=Beauté"
            >
              Beauté
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Rechercher"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors relative"
              href="/wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors relative"
              href="/cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative group">
                <button className="p-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user.name || user.email}
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mon profil
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mes commandes
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <Link
                className="btn btn-primary text-sm"
                href="/login"
              >
                Connexion
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700"
              aria-label="Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                className="text-sm font-medium text-primary-600"
                href="/"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
                href="/products"
                onClick={() => setIsMenuOpen(false)}
              >
                Boutique
              </Link>
              <Link
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
                href="/courses"
                onClick={() => setIsMenuOpen(false)}
              >
                Cours de Crochet
              </Link>
              <Link
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
                href="/products?category=Bijoux"
                onClick={() => setIsMenuOpen(false)}
              >
                Bijoux
              </Link>
              <Link
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
                href="/products?category=Crochet"
                onClick={() => setIsMenuOpen(false)}
              >
                Crochet
              </Link>
              <Link
                className="text-sm font-medium text-gray-700 hover:text-primary-600"
                href="/products?category=Beauté"
                onClick={() => setIsMenuOpen(false)}
              >
                Beauté
              </Link>
            </nav>
          </div>
        )}

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="container mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="btn btn-primary">
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
