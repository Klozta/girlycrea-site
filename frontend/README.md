# 🎨 GirlyCrea Frontend

> **Stack** : Next.js 15 | React 18 | TypeScript | Tailwind CSS | Zustand

Frontend moderne et élégant pour la boutique en ligne GirlyCrea, spécialisée dans les produits pour femmes (bijoux, mode, beauté, décoration, crochet).

---

## 🚀 Démarrage Rapide

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Configuration

Créez un fichier `.env.local` :

```bash
cp .env.example .env.local
```

Éditez `.env.local` et configurez :
- `NEXT_PUBLIC_API_URL` : URL du backend (défaut: http://localhost:3001)

### 3. Lancer

```bash
npm run dev
```

Le site démarre sur `http://localhost:3002`

---

## 📁 Structure

```
frontend/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil
│   ├── products/          # Pages produits
│   ├── cart/              # Panier
│   ├── checkout/          # Checkout
│   ├── login/             # Connexion
│   ├── register/          # Inscription
│   ├── profile/           # Profil utilisateur
│   └── orders/            # Commandes
├── components/            # Composants réutilisables
│   ├── Header.tsx        # Header avec navigation
│   ├── Footer.tsx        # Footer
│   ├── ProductCard.tsx   # Carte produit
│   └── Toaster.tsx        # Notifications toast
├── lib/                   # Utilitaires
│   ├── api.ts            # Client API
│   └── store.ts          # Store Zustand (état global)
└── app/globals.css       # Styles globaux
```

---

## 🎨 Design System

### Couleurs

- **Primary** : Rose (#ec4899) - Couleur principale de la marque
- **Accent** : Doré (#f59e0b) - Accents et highlights
- **Gray** : Palette grise pour textes et backgrounds

### Typographie

- **Display** : Playfair Display (titres)
- **Sans** : Inter (corps de texte)

---

## 🔑 Fonctionnalités

### ✅ Implémenté

- ✅ **Page d'accueil** avec hero, catégories, produits en vedette
- ✅ **Catalogue produits** avec filtres (catégorie, prix, recherche)
- ✅ **Page détail produit** avec images, description, avis
- ✅ **Panier** avec gestion quantité, suppression
- ✅ **Checkout** en 2 étapes (livraison → paiement)
- ✅ **Authentification** (login, register)
- ✅ **Profil utilisateur** avec commandes récentes
- ✅ **Page commandes** avec historique
- ✅ **Header** avec navigation, recherche, panier, compte
- ✅ **Footer** avec liens et réseaux sociaux
- ✅ **Design responsive** (mobile, tablette, desktop)
- ✅ **Gestion d'état** avec Zustand
- ✅ **Client API** avec intercepteurs (auth, refresh token)
- ✅ **Notifications toast** pour feedback utilisateur

---

## 📦 Dépendances

### Principales

- `next` : Framework React
- `react` / `react-dom` : Bibliothèque React
- `typescript` : Typage statique
- `tailwindcss` : Framework CSS
- `zustand` : Gestion d'état
- `axios` : Client HTTP
- `react-hot-toast` : Notifications
- `lucide-react` : Icônes

---

## 🔌 Intégration API

Le client API (`lib/api.ts`) gère automatiquement :

- ✅ Ajout du token d'authentification
- ✅ Refresh automatique du token expiré
- ✅ Redirection vers login si non authentifié
- ✅ Gestion des erreurs

### Endpoints utilisés

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur
- `GET /api/products` - Liste produits
- `GET /api/products/:id` - Détail produit
- `GET /api/products/search` - Recherche
- `GET /api/orders` - Liste commandes
- `POST /api/orders` - Créer commande

---

## 🛠️ Scripts

```bash
npm run dev        # Développement (port 3002)
npm run build      # Build production
npm run start      # Production
npm run lint       # Linter
```

---

## 🎯 Prochaines Étapes

### À implémenter

- [ ] Page détail commande
- [ ] Wishlist complète
- [ ] Avis produits (création)
- [ ] Recherche avancée avec autocomplete
- [ ] Filtres produits avancés
- [ ] Comparaison produits
- [ ] Page contact
- [ ] FAQ
- [ ] Optimisation images (WebP, lazy loading)
- [ ] PWA (Progressive Web App)
- [ ] Tests (Jest, React Testing Library)

---

## 📱 Responsive Design

Le site est entièrement responsive :

- **Mobile** : < 768px
- **Tablette** : 768px - 1024px
- **Desktop** : > 1024px

---

## 🔒 Sécurité

- ✅ Tokens JWT stockés dans localStorage
- ✅ Refresh token automatique
- ✅ Protection CSRF (via backend)
- ✅ Validation des formulaires
- ✅ Sanitization des inputs

---

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `tailwind.config.js` :

```js
colors: {
  primary: {
    // Vos couleurs personnalisées
  }
}
```

### Modifier les polices

Éditez `app/globals.css` :

```css
@import url('votre-police');
```

---

**Frontend prêt à l'emploi ! 🚀**


