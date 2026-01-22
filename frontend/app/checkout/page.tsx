'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { CreditCard, MapPin, User, CheckCircle, Tag } from 'lucide-react';
import CouponInput from '@/components/CouponInput';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isAuthenticated, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (cart.length === 0) {
      router.push('/cart');
      return;
    }
    // Load user data if available
    loadUserData();
  }, [isAuthenticated, cart.length, router]);

  const loadUserData = async () => {
    try {
      const user = await api.getMe();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'shipping') {
      // Validate shipping form
      if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.postalCode) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setStep('payment');
      return;
    }

    if (step === 'payment') {
      setLoading(true);
      try {
        // Create order
        const orderData = {
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
          },
          couponCode: appliedCoupon?.code,
        };

        const order = await api.createOrder(orderData);
        clearCart();
        setStep('confirmation');
        toast.success('Commande passée avec succès !');
      } catch (error: any) {
        console.error('Error creating order:', error);
        toast.error(error.response?.data?.error || 'Erreur lors de la création de la commande');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAuthenticated || cart.length === 0) {
    return null;
  }

  if (step === 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold mb-4">Commande confirmée !</h1>
          <p className="text-gray-600 mb-8">
            Merci pour votre commande. Vous recevrez un email de confirmation sous peu.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => router.push('/products')} className="btn btn-primary">
              Continuer mes achats
            </button>
            <button onClick={() => router.push('/orders')} className="btn btn-secondary">
              Voir mes commandes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Finaliser la commande</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Address */}
            {step === 'shipping' && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adresse de livraison
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Adresse *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ville *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Code postal *</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment */}
            {step === 'payment' && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Paiement
                </h2>
                <p className="text-gray-600 mb-4">
                  Le paiement sera traité de manière sécurisée via Stripe après confirmation de la commande.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Vous serez redirigé vers la page de paiement sécurisée après validation.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              {step === 'payment' && (
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="btn btn-secondary"
                >
                  Retour
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Traitement...' : step === 'shipping' ? 'Continuer vers le paiement' : 'Confirmer la commande'}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold mb-6">Résumé</h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    {item.title} x{item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}

              {/* Coupon */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Code promo
                </h3>
                <CouponInput
                  orderTotal={subtotal}
                  onCouponApplied={setAppliedCoupon}
                  onCouponRemoved={() => setAppliedCoupon(null)}
                  appliedCoupon={appliedCoupon}
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction ({appliedCoupon?.code})</span>
                    <span>-{discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



