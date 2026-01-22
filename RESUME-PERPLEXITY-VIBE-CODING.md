# 🎀 GirlyCrea - Résumé Complet du Projet

**Document à fournir à Perplexity pour continuer le développement en mode "Vibe Coding"**

---

## 🎯 Présentation du Projet

**GirlyCrea** est une plateforme e-commerce complète spécialisée dans :
- 💎 **Bijoux** - Colliers, bracelets, boucles d'oreilles élégants
- 🧶 **Crochet** - Créations faites main et accessoires
- 💄 **Beauté** - Produits de beauté et cosmétiques
- 👗 **Mode** - Accessoires mode et tendances
- 🎓 **Cours de crochet** - Formation en ligne avec vidéos et progression

---

## 🛠️ Stack Technique

### Backend (Node.js/Express/TypeScript)
```
Port : 3001
Node.js : 20+
Framework : Express.js
Langage : TypeScript (ESM modules)
Base de données : PostgreSQL 15
Cache : Redis 7
```

### Frontend (Next.js/React)
```
Port : 3000
Next.js : 15
React : 18.3
UI : Tailwind CSS 3.4
State : Zustand
Icônes : Lucide React
```

### Infrastructure
```
Conteneurs : Docker + Docker Compose
PostgreSQL : localhost:5433 (port externe)
Redis : localhost:6380 (port externe)
Déploiement cible : Serveur physique chez un ami
```

---

## 📁 Structure du Projet

```
girlycrea-site/
├── backend/ (alias: src/)
│   ├── src/
│   │   ├── config/         # Configuration (secrets, Sentry, etc.)
│   │   ├── middleware/     # Middlewares (auth, rate-limit, CORS, etc.)
│   │   ├── routes/         # 50+ fichiers de routes API
│   │   ├── services/       # 40+ services métier
│   │   ├── utils/          # Utilitaires (logger, errors, etc.)
│   │   ├── validations/    # Schemas Zod
│   │   └── index.ts        # Point d'entrée Express
│   └── package.json
├── frontend/
│   ├── app/                # Pages Next.js (App Router)
│   │   ├── page.tsx        # Page d'accueil
│   │   ├── products/       # Catalogue produits
│   │   ├── courses/        # Cours de crochet
│   │   ├── cart/           # Panier
│   │   ├── checkout/       # Paiement
│   │   ├── orders/         # Historique commandes
│   │   ├── profile/        # Profil utilisateur
│   │   ├── login/          # Connexion
│   │   ├── register/       # Inscription
│   │   ├── contact/        # Contact
│   │   ├── faq/            # FAQ
│   │   └── wishlist/       # Liste de souhaits
│   ├── components/         # Composants React
│   ├── lib/
│   │   ├── api.ts          # Client API Axios
│   │   └── store.ts        # Store Zustand
│   └── package.json
├── migrations/             # Scripts SQL
├── scripts/                # Scripts utilitaires
├── nginx/                  # Config Nginx (production)
├── docker-compose.local.yml    # Docker local (PostgreSQL + Redis)
├── docker-compose.prod.yml     # Docker production (full stack)
└── docs/                   # Documentation
```

---

## 🔌 API Backend - Endpoints Principaux

### Authentification (`/api/auth`)
- `POST /register` - Inscription (+ email de bienvenue)
- `POST /login` - Connexion (JWT)
- `POST /refresh` - Refresh token
- `POST /logout` - Déconnexion
- `GET /me` - Utilisateur actuel

### Produits (`/api/products`)
- `GET /` - Liste paginée avec filtres
- `GET /:id` - Détail produit
- `GET /search` - Recherche
- `POST /` - Création (admin)
- `PUT /:id` - Modification (admin)
- `DELETE /:id` - Suppression (admin)

### Cours de Crochet (`/api/courses`)
- `GET /` - Liste des cours
- `GET /:id` - Détail cours
- `GET /:id/lessons` - Leçons du cours
- `GET /:id/reviews` - Avis du cours
- `POST /enrollments` - Inscription à un cours
- `GET /enrollments/me` - Mes cours

### Commandes (`/api/orders`)
- `GET /` - Liste des commandes (user)
- `GET /:id` - Détail commande
- `POST /` - Créer une commande
- `PATCH /:id/status` - Modifier le statut (admin)

### Paiements (`/api/payments`)
- `POST /stripe/create-intent` - Créer un PaymentIntent
- `POST /stripe/webhook` - Webhook Stripe (signatures)
- `GET /stripe/session/:id` - Session de paiement

### Coupons (`/api/coupons`) ✨ NOUVEAU
- `POST /validate` - Valider un code promo
- `GET /` - Liste des coupons actifs
- `POST /` - Créer un coupon (admin)
- `PUT /:id` - Modifier un coupon (admin)
- `DELETE /:id` - Supprimer un coupon (admin)

### Avis Produits (`/api/products/:id/reviews`) ✨ NOUVEAU
- `GET /` - Liste des avis
- `GET /stats` - Statistiques (moyenne, distribution)
- `POST /` - Créer un avis
- `PUT /:reviewId` - Modifier un avis
- `POST /:reviewId/helpful` - Voter "utile"
- `POST /:reviewId/approve` - Approuver (admin)

### Autres Routes
- `/api/notifications` - Notifications push
- `/api/gamification` - Badges, points, challenges
- `/api/loyalty` - Programme fidélité
- `/api/recommendations` - Recommandations produits
- `/api/wishlists` - Listes de souhaits partagées
- `/api/chatbot` - Support IA
- `/api/analytics` - Business Intelligence
- `/api/monitoring` - Métriques système
- `/metrics` - Prometheus metrics

---

## 🎨 Pages Frontend

| Page | Route | Description |
|------|-------|-------------|
| Accueil | `/` | Hero, catégories, produits vedettes, cours |
| Produits | `/products` | Catalogue avec filtres |
| Détail produit | `/products/[id]` | Photos, description, avis, panier |
| Cours | `/courses` | Liste des cours de crochet |
| Détail cours | `/courses/[id]` | Programme, leçons, inscription |
| Panier | `/cart` | Articles, quantités, total |
| Checkout | `/checkout` | Adresse, paiement Stripe |
| Commandes | `/orders` | Historique |
| Profil | `/profile` | Infos personnelles |
| Login | `/login` | Connexion |
| Register | `/register` | Inscription |
| Contact | `/contact` | Formulaire de contact |
| FAQ | `/faq` | Questions fréquentes |
| Wishlist | `/wishlist` | Liste de souhaits |

---

## ✅ Fonctionnalités Implémentées

### E-commerce Core
- ✅ Catalogue produits avec filtres et pagination
- ✅ Panier (localStorage, persistant)
- ✅ Checkout avec Stripe
- ✅ Gestion commandes
- ✅ Historique utilisateur

### Authentification & Sécurité
- ✅ JWT + Refresh Token
- ✅ Rate limiting (global + auth)
- ✅ Helmet (CSP, HSTS)
- ✅ CORS configuré
- ✅ Protection CSRF
- ✅ Validation Zod
- ✅ Sanitization XSS

### Emails Transactionnels ✨
- ✅ Email de bienvenue (avec code promo optionnel)
- ✅ Confirmation de commande (avec PDF facture)
- ✅ Récupération mot de passe
- ✅ Templates HTML professionnels

### Système de Coupons ✨
- ✅ Codes promo (% ou montant fixe)
- ✅ Dates d'expiration
- ✅ Limite utilisation
- ✅ Restriction par catégorie
- ✅ Suivi des utilisations

### Avis Produits ✨
- ✅ Notes 1-5 étoiles
- ✅ Commentaires avec photos
- ✅ Modération admin
- ✅ Votes "utile"
- ✅ Réponses vendeur
- ✅ Avis vérifiés (achat confirmé)

### Cours de Crochet
- ✅ Catalogue cours
- ✅ Système de leçons
- ✅ Progression utilisateur
- ✅ Avis cours

### Features Avancées
- ✅ Programme fidélité
- ✅ Gamification (badges, points)
- ✅ Recommandations produits
- ✅ Wishlist partagée
- ✅ Chatbot IA
- ✅ Notifications push (config)
- ✅ Analytics backend

---

## ✅ Fonctionnalités Récemment Ajoutées (Janvier 2026)

### Interface Admin Complète
- ✅ `/admin` - Dashboard avec stats (commandes, CA, utilisateurs)
- ✅ `/admin/coupons` - Gestion complète des coupons (CRUD, activation)
- ✅ `/admin/reviews` - Modération des avis (approuver, rejeter, supprimer)

### Formulaire d'Avis
- ✅ Modal de création d'avis avec notation 1-5 étoiles
- ✅ Titre et commentaire optionnels
- ✅ Feedback visuel (hover, validation)

### Coupons dans Checkout
- ✅ Composant CouponInput intégré dans le résumé de commande
- ✅ Validation en temps réel
- ✅ Affichage de la réduction appliquée

---

## ⏳ Fonctionnalités À Compléter

### Priorité Haute
- ⏳ Emails de suivi de commande (expédiée, livrée)
- ⏳ Connexion API admin (actuellement données simulées)

### Priorité Moyenne
- ⏳ Notifications push (activation)
- ⏳ Recherche avancée
- ⏳ PWA (Progressive Web App)

### Priorité Basse
- ⏳ Blog/Actualités
- ⏳ Système de parrainage complet
- ⏳ Chat support client
- ⏳ Internationalisation (i18n)

---

## 🗄️ Base de Données PostgreSQL

### Tables Principales
- `users` - Utilisateurs
- `products` - Produits
- `orders` - Commandes
- `order_items` - Lignes de commande
- `reviews` - Avis génériques
- `courses` - Cours de crochet
- `lessons` - Leçons
- `enrollments` - Inscriptions cours

### Tables Récentes ✨
- `coupons` - Codes promo
- `coupon_usage` - Utilisation des coupons
- `product_reviews` - Avis produits
- `review_helpful_votes` - Votes "utile"
- `review_responses` - Réponses aux avis

---

## 🔧 Commandes de Développement

### Démarrage local
```bash
# 1. Démarrer Docker (PostgreSQL + Redis)
docker-compose -f docker-compose.local.yml up -d

# 2. Démarrer le backend
npm run dev
# → http://localhost:3001

# 3. Démarrer le frontend (dans un autre terminal)
cd frontend && npm run dev
# → http://localhost:3000
```

### Scripts utiles
```bash
# Backend
npm run dev          # Développement avec hot-reload
npm run build        # Build production
npm run test         # Tests Jest
npm run lint         # ESLint

# Frontend
cd frontend
npm run dev          # Développement Next.js
npm run build        # Build production
```

---

## 🌐 Variables d'Environnement Clés

### Backend (.env)
```env
# Serveur
PORT=3001
NODE_ENV=development

# Base de données
DATABASE_URL=postgresql://girlycrea_user:local_dev_password@localhost:5433/girlycrea
REDIS_URL=redis://localhost:6380

# Auth
JWT_SECRET=<secret 64 chars>
JWT_REFRESH_SECRET=<secret 64 chars>

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Emails (optionnel)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@girlycrea.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📋 Roadmap 2026

### Q1 2026 - Fondations
- ✅ Déploiement serveur physique
- ✅ Cours de crochet intégrés
- ✅ Emails transactionnels
- ✅ Système de coupons
- ✅ Avis produits
- ⏳ Dashboard admin

### Q2 2026 - Croissance
- ⏳ Notifications push
- ⏳ Recherche avancée
- ⏳ PWA
- ⏳ Blog/Actualités
- ⏳ Monitoring complet (Grafana)

---

## 🎯 Objectifs Business

- 🎯 100 commandes/mois (Q1 2026)
- 🎯 500 utilisateurs inscrits (Q1 2026)
- 🎯 50 cours vendus (Q1 2026)

---

## 🚀 Points Forts du Projet

1. **Architecture solide** - Backend Express bien structuré, 50+ routes, 40+ services
2. **Sécurité** - JWT, rate limiting, CSRF, helmet, validation Zod
3. **E-commerce complet** - Panier, checkout Stripe, commandes
4. **Cours intégrés** - Plateforme de formation crochet
5. **Scalable** - Docker, Redis cache, architecture modulaire
6. **Production-ready** - Logging, monitoring Prometheus, error handling

---

## 💡 Instructions pour Perplexity

### Pour continuer le développement :

1. **Contexte** : Site e-commerce français pour bijoux, crochet, beauté, mode + cours en ligne

2. **Stack** : Node.js 20 / Express / TypeScript / PostgreSQL / Redis / Next.js 15 / React 18 / Tailwind

3. **Style de code** :
   - ESM modules (`import`/`export`)
   - TypeScript strict
   - Async/await
   - Zod pour validation
   - Composants fonctionnels React
   - Tailwind CSS

4. **Priorités actuelles** :
   - Compléter les formulaires frontend (avis, coupons dans checkout)
   - Interface admin (dashboard, gestion)
   - Améliorer l'UX/UI

5. **Déploiement** : Serveur physique chez un ami (pas de cloud/VPS)

---

**Dernière mise à jour** : Janvier 2026

