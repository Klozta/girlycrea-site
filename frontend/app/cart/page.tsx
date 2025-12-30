'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const { cart, cartCount, updateCartQuantity, removeFromCart, clearCart, isAuthenticated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
    }
  }, [isAuthenticated, router]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (!isAuthenticated) {
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">Votre panier est vide</h1>
        <p className="text-gray-600 mb-8">Découvrez nos produits et remplissez votre panier !</p>
        <Link href="/products" className="btn btn-primary inline-flex items-center gap-2">
          Découvrir la boutique
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Mon panier</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.productId} className="card p-6">
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-primary-600 font-bold mb-4">
                    {item.price.toFixed(2)} €
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateCartQuantity(item.productId, item.quantity - 1);
                          } else {
                            removeFromCart(item.productId);
                          }
                        }}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeFromCart(item.productId);
                        toast.success('Produit retiré du panier');
                      }}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              clearCart();
              toast.success('Panier vidé');
            }}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Vider le panier
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold mb-6">Résumé de la commande</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="font-semibold">{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-green-600">Gratuite</span>
                  ) : (
                    `${shipping.toFixed(2)} €`
                  )}
                </span>
              </div>
              {subtotal < 50 && (
                <p className="text-sm text-gray-600">
                  Ajoutez {(50 - subtotal).toFixed(2)} € pour la livraison gratuite
                </p>
              )}
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">{total.toFixed(2)} €</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              Passer la commande
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/products"
              className="block text-center text-sm text-gray-600 hover:text-primary-600 mt-4"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


