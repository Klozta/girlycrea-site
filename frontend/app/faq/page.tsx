'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ShoppingBag, Truck, CreditCard, RotateCcw, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'commandes',
    question: 'Comment passer une commande ?',
    answer: 'Pour passer une commande, ajoutez les produits souhaités à votre panier, puis procédez au checkout. Vous devrez créer un compte ou vous connecter, renseigner vos informations de livraison et effectuer le paiement.',
  },
  {
    category: 'commandes',
    question: 'Puis-je modifier ma commande après validation ?',
    answer: 'Une fois la commande validée, il n\'est plus possible de la modifier. Si vous souhaitez ajouter ou retirer des articles, vous devrez passer une nouvelle commande. Pour annuler une commande, contactez-nous dans les 24 heures suivant la validation.',
  },
  {
    category: 'livraison',
    question: 'Quels sont les délais de livraison ?',
    answer: 'Les délais de livraison varient selon votre localisation : 2-3 jours ouvrables pour la France métropolitaine, 5-7 jours pour l\'Europe, et 10-15 jours pour le reste du monde. Vous recevrez un email de confirmation avec un numéro de suivi dès l\'expédition.',
  },
  {
    category: 'livraison',
    question: 'Quels sont les frais de livraison ?',
    answer: 'La livraison est gratuite à partir de 50€ d\'achat en France métropolitaine. En dessous de ce montant, les frais de livraison sont de 5,99€. Les frais varient pour les livraisons internationales.',
  },
  {
    category: 'paiement',
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, et les virements bancaires. Tous les paiements sont sécurisés via Stripe.',
  },
  {
    category: 'paiement',
    question: 'Mon paiement est-il sécurisé ?',
    answer: 'Oui, tous les paiements sont traités de manière sécurisée via Stripe, qui respecte les normes PCI-DSS les plus strictes. Nous ne stockons jamais vos informations de carte bancaire.',
  },
  {
    category: 'retours',
    question: 'Puis-je retourner un article ?',
    answer: 'Oui, vous disposez de 14 jours à compter de la réception pour retourner un article non porté, non personnalisé et dans son emballage d\'origine. Les frais de retour sont à votre charge sauf en cas d\'erreur de notre part.',
  },
  {
    category: 'retours',
    question: 'Comment procéder à un retour ?',
    answer: 'Contactez-nous via le formulaire de contact ou par email avec votre numéro de commande. Nous vous enverrons les instructions et une étiquette de retour si nécessaire. Une fois l\'article reçu et vérifié, le remboursement sera effectué sous 5-7 jours ouvrables.',
  },
  {
    category: 'produits',
    question: 'Les produits sont-ils authentiques ?',
    answer: 'Oui, tous nos produits sont authentiques et sélectionnés avec soin. Nous travaillons uniquement avec des fournisseurs vérifiés et garantissons la qualité de tous nos articles.',
  },
  {
    category: 'produits',
    question: 'Puis-je personnaliser un produit ?',
    answer: 'Certains produits peuvent être personnalisés. Vérifiez les options disponibles sur la page du produit. Les produits personnalisés ne peuvent généralement pas être retournés.',
  },
];

const categories = [
  { id: 'all', label: 'Toutes les questions', icon: HelpCircle },
  { id: 'commandes', label: 'Commandes', icon: ShoppingBag },
  { id: 'livraison', label: 'Livraison', icon: Truck },
  { id: 'paiement', label: 'Paiement', icon: CreditCard },
  { id: 'retours', label: 'Retours', icon: RotateCcw },
  { id: 'produits', label: 'Produits', icon: ShoppingBag },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-center mb-4">
          Questions Fréquentes
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Trouvez rapidement les réponses à vos questions
        </p>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setOpenIndex(0);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="card">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-lg pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center p-8 bg-primary-50 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Vous ne trouvez pas votre réponse ?</h2>
          <p className="text-gray-600 mb-6">
            Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons rapidement.
          </p>
          <a href="/contact" className="btn btn-primary inline-flex">
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}


