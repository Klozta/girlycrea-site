# Prompt Perplexity - Erreur Persistante Next.js 15 avec ErrorBoundary

## 🚨 Problème Critique

Je développe une application e-commerce avec **Next.js 15** (App Router) et j'ai une erreur persistante qui affiche le message **"Une erreur s'est produite"** via l'ErrorBoundary, malgré tous les correctifs appliqués.

### Erreur Affichée
```
Une erreur s'est produite
Désolé, quelque chose s'est mal passé. Veuillez réessayer.

[Button: Réessayer] [Button: Retour à l'accueil]
```

### Stack Technique Complète
- **Frontend**: Next.js 15.0.0, React 18.3.0, TypeScript, Tailwind CSS
- **Backend**: Node.js 20, Express.js, TypeScript (ESM)
- **State Management**: Zustand 4.4.0 avec persist middleware
- **API Client**: Axios 1.6.0 avec interceptors
- **Déploiement**: Docker Compose avec Nginx reverse proxy
- **Docker**: Multi-stage builds, Alpine Linux, non-root user

---

## 📋 Correctifs Déjà Appliqués (Sans Succès)

### ✅ Correctif 1: Hydration SSR/Client
**Problème identifié**: Mismatch SSR/Client avec Zustand persist + localStorage

**Solution appliquée**:
```typescript
// frontend/lib/store.ts
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... state et actions
    }),
    {
      name: 'girlycrea-store',
      skipHydration: true,  // ✅ AJOUTÉ
      partialize: (state) => ({
        cart: state.cart,
        cartCount: state.cartCount,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

**Composant Hydration créé**:
```typescript
// frontend/components/Hydration.tsx
'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function Hydration() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  return null;
}
```

### ✅ Correctif 2: ErrorBoundary
**Composant ErrorBoundary créé** pour capturer les erreurs React:
```typescript
// frontend/components/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component<Props, State> {
  // ... implémentation complète avec gestion d'erreurs
  // Affiche le message "Une erreur s'est produite" quand une erreur est capturée
}
```

**Intégré dans layout.tsx**:
```typescript
// frontend/app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Hydration } from '@/components/Hydration';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <ErrorBoundary>
          <Hydration />
          <Header />
          <BackendStatus />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### ✅ Correctif 3: Gestion d'Erreurs dans useEffect
**Page d'accueil (page.tsx)** avec gestion gracieuse:
```typescript
// frontend/app/page.tsx
'use client';

export default function Home() {
  const { checkAuth } = useStore();

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.warn('Error in checkAuth:', error);
      }
      loadFeaturedProducts();
      loadFeaturedCourses();
    };
    init();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const data = await api.getProducts({ limit: 8 });
      setFeaturedProducts(data.products || data.data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      // Gestion gracieuse - ne propage pas l'erreur
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedCourses = async () => {
    try {
      const data = await api.getCourses({ limit: 4, sort: 'rating_desc' });
      setFeaturedCourses(data.courses || []);
    } catch (error: any) {
      // Gestion spécifique 404 - ignore silencieusement
      if (error.response?.status === 404 || error.isNetworkError) {
        setFeaturedCourses([]);
      }
    } finally {
      setCoursesLoading(false);
    }
  };
}
```

### ✅ Correctif 4: Store Zustand avec Gestion d'Erreurs
```typescript
// frontend/lib/store.ts
checkAuth: async () => {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    set({ user: null, isAuthenticated: false });
    return;
  }

  try {
    const user = await api.getMe();
    set({ user, isAuthenticated: true });
  } catch (error: any) {
    // Gestion silencieuse - ne propage pas l'erreur
    console.warn('Auth check failed (silent):', error?.message || 'Unknown error');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  }
},
```

### ✅ Correctif 5: Composants Créés
- ✅ `ProductCard.tsx` - Composant pour afficher les produits
- ✅ `CourseCard.tsx` - Composant pour afficher les cours
- ✅ `Header.tsx` - Navigation avec menu mobile
- ✅ `Footer.tsx` - Pied de page
- ✅ `ErrorBoundary.tsx` - Capture des erreurs React
- ✅ `Hydration.tsx` - Rehydration manuelle Zustand

### ✅ Correctif 6: Configuration Tailwind CSS
- ✅ Classes `line-clamp-2` ajoutées dans `globals.css`
- ✅ Couleurs primaires configurées dans `tailwind.config.js`
- ✅ CSS complet avec utilitaires

---

## 🔍 Diagnostic Actuel

### État des Services Docker
```
✅ Frontend: Up (healthy)
✅ Nginx: Up (health: starting)
✅ Backend: Up (healthy)
✅ PostgreSQL: Up (healthy)
✅ Redis: Up (healthy)
```

### Tests API
```bash
# Health Check
curl http://localhost/api/health
# ✅ Retourne: {"status":"healthy",...}

# Produits
curl http://localhost/api/products
# ✅ Retourne: {"products":[...]} avec 20 produits de test
```

### Tests Frontend
```bash
# Page d'accueil
curl http://localhost
# ✅ Retourne HTML complet avec:
# - <title>GirlyCrea - Boutique en ligne bijoux, mode, beauté</title>
# - Navigation complète
# - Sections produits, catégories, footer
```

### Logs Docker
```bash
# Frontend logs
docker logs girlycrea-frontend-staging --tail=30
# ✅ Pas d'erreurs dans les logs récents

# Backend logs
docker logs girlycrea-backend-staging --tail=30
# ✅ Pas d'erreurs dans les logs récents
```

---

## 🎯 Question pour Perplexity

**Pourquoi l'ErrorBoundary capture-t-il toujours une erreur malgré tous les correctifs appliqués, alors que :**
1. ✅ Le HTML est bien servi (curl fonctionne)
2. ✅ L'API backend fonctionne (health check OK, produits retournés)
3. ✅ Aucune erreur dans les logs Docker
4. ✅ Tous les composants sont créés et compilés
5. ✅ La gestion d'erreurs est en place partout

### Points Spécifiques à Analyser

1. **Problèmes avec ErrorBoundary dans Next.js 15**
   - L'ErrorBoundary capture-t-il des erreurs qui ne devraient pas être capturées ?
   - Y a-t-il un problème avec la façon dont l'ErrorBoundary est intégré dans le layout ?
   - Les erreurs sont-elles capturées trop tôt (avant l'hydration) ?

2. **Problèmes avec Zustand persist + skipHydration**
   - Le rehydrate manuel dans `Hydration.tsx` fonctionne-t-il correctement ?
   - Y a-t-il un timing issue entre l'hydration React et la rehydration Zustand ?
   - Le `skipHydration: true` cause-t-il des problèmes avec les composants qui utilisent le store immédiatement ?

3. **Problèmes avec les composants client-side**
   - Les composants `'use client'` sont-ils correctement hydratés ?
   - Y a-t-il un problème avec les imports de composants dans `page.tsx` ?
   - Les hooks (`useState`, `useEffect`) fonctionnent-ils correctement dans Next.js 15 ?

4. **Problèmes avec les appels API**
   - Les appels API dans `useEffect` sont-ils trop tôt (avant que l'API soit prête) ?
   - Y a-t-il un problème CORS ou de réseau qui cause des erreurs silencieuses ?
   - Les interceptors Axios causent-ils des erreurs non catchées ?

5. **Problèmes avec le build Docker**
   - Le build Next.js standalone fonctionne-t-il correctement ?
   - Y a-t-il des fichiers manquants dans le build Docker ?
   - Les variables d'environnement sont-elles correctement passées ?

### Solutions à Proposer

1. **Comment déboguer l'ErrorBoundary**
   - Comment voir l'erreur exacte capturée par l'ErrorBoundary ?
   - Comment activer le mode développement pour voir les détails d'erreur ?
   - Comment logger les erreurs avant qu'elles ne soient capturées ?

2. **Comment améliorer la gestion d'hydration**
   - Y a-t-il une meilleure façon de gérer Zustand persist avec Next.js 15 ?
   - Faut-il utiliser un autre pattern pour l'hydration ?
   - Comment s'assurer que l'hydration se fait au bon moment ?

3. **Comment isoler le problème**
   - Comment créer un composant minimal pour tester l'ErrorBoundary ?
   - Comment désactiver temporairement certains composants pour identifier le coupable ?
   - Comment activer le mode strict de React pour voir les warnings ?

4. **Alternatives à l'ErrorBoundary**
   - Y a-t-il une meilleure façon de gérer les erreurs dans Next.js 15 ?
   - Faut-il utiliser un middleware d'erreur différent ?
   - Comment utiliser les error.tsx files de Next.js 15 au lieu d'ErrorBoundary ?

### Informations Supplémentaires

- **Architecture**: Next.js 15 avec App Router (pas Pages Router)
- **Mode**: Production (NODE_ENV=production dans Docker)
- **Build**: Standalone Next.js build dans Docker
- **Variables d'environnement**:
  ```
  NEXT_PUBLIC_API_URL=http://localhost/api
  NEXT_PUBLIC_SITE_NAME=GirlyCrea
  NODE_ENV=production
  PORT=3000
  ```
- **Configuration Next.js**:
  ```javascript
  // next.config.js
  const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
  }
  ```

### Code Complet des Fichiers Critiques

#### frontend/app/layout.tsx
```typescript
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Toaster from '@/components/Toaster'
import BackendStatus from '@/components/BackendStatus'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Hydration } from '@/components/Hydration'

export const metadata = {
  title: 'GirlyCrea - Boutique en ligne bijoux, mode, beauté',
  description: 'Découvrez notre sélection de bijoux, accessoires mode, produits de beauté et créations crochet.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <ErrorBoundary>
          <Hydration />
          <Header />
          <BackendStatus />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

#### frontend/app/page.tsx
```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart, Star } from 'lucide-react';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import CourseCard from '@/components/CourseCard';
import { useStore } from '@/lib/store';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const { checkAuth } = useStore();

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.warn('Error in checkAuth:', error);
      }
      loadFeaturedProducts();
      loadFeaturedCourses();
    };
    init();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const data = await api.getProducts({ limit: 8 });
      setFeaturedProducts(data.products || data.data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      if (error.isNetworkError) {
        console.warn('Backend non accessible:', error.backendUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedCourses = async () => {
    try {
      const data = await api.getCourses({ limit: 4, sort: 'rating_desc' });
      setFeaturedCourses(data.courses || []);
    } catch (error: any) {
      if (error.response?.status === 404 || error.isNetworkError) {
        console.warn('Endpoint /api/courses non disponible');
        setFeaturedCourses([]);
      }
    } finally {
      setCoursesLoading(false);
    }
  };

  // ... reste du JSX
}
```

#### frontend/lib/store.ts (extrait)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      cart: [],
      cartCount: 0,
      
      checkAuth: async () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const user = await api.getMe();
          set({ user, isAuthenticated: true });
        } catch (error: any) {
          console.warn('Auth check failed (silent):', error?.message);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      },
      // ... autres actions
    }),
    {
      name: 'girlycrea-store',
      skipHydration: true,
      partialize: (state) => ({
        cart: state.cart,
        cartCount: state.cartCount,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## 🎯 Résultat Attendu

**Je cherche une solution concrète et testable pour :**
1. ✅ Identifier l'erreur exacte capturée par l'ErrorBoundary
2. ✅ Résoudre le problème à la source (pas juste masquer l'erreur)
3. ✅ S'assurer que le site fonctionne sans afficher "Une erreur s'est produite"
4. ✅ Maintenir toutes les fonctionnalités (hydration, store, API, etc.)

**Merci de fournir :**
- 🔍 Des techniques de débogage pour identifier l'erreur exacte
- 🛠️ Des solutions concrètes avec code prêt à copier-coller
- 📚 Des explications sur pourquoi l'ErrorBoundary capture cette erreur
- ✅ Des alternatives si l'ErrorBoundary n'est pas la bonne approche

---

## 📝 Notes Finales

- Le site fonctionne techniquement (HTML servi, API OK, logs propres)
- L'erreur est uniquement visible dans le navigateur via l'ErrorBoundary
- Tous les correctifs standards ont été appliqués sans succès
- Besoin d'une solution approfondie pour Next.js 15 spécifiquement

**Merci pour votre aide !** 🙏
