# Prompt Perplexity - Erreur Client-Side Next.js

## Contexte du Problème

Je développe une application e-commerce avec Next.js 15 (React 18.3) et j'ai une erreur client-side qui se produit au chargement de la page d'accueil.

### Erreur
```
Application error: a client-side exception has occurred while loading localhost (see the browser console for more information).
```

### Stack Technique
- **Frontend**: Next.js 15, React 18.3, TypeScript, Tailwind CSS
- **Backend**: Node.js 20, Express.js, TypeScript (ESM)
- **Déploiement**: Docker Compose avec Nginx reverse proxy
- **State Management**: Zustand avec persist middleware
- **API Client**: Axios avec interceptors

### Code de la Page d'Accueil (`frontend/app/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart, Star, GraduationCap } from 'lucide-react';
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
    // Wrapper pour éviter les exceptions non gérées
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
      console.error('Error loading courses:', error);
      // Si l'endpoint n'existe pas (404), on ignore silencieusement
      if (error.response?.status === 404 || error.isNetworkError) {
        console.warn('Endpoint /api/courses non disponible, masquage de la section cours');
        setFeaturedCourses([]);
      }
    } finally {
      setCoursesLoading(false);
    }
  };

  // ... reste du composant (JSX)
}
```

### Code du Store Zustand (`frontend/lib/store.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ...
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
          // Token invalide ou expiré - gérer gracieusement sans propager l'erreur
          console.warn('Auth check failed (silent):', error?.message || 'Unknown error');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
          // Ne pas propager l'erreur pour éviter les exceptions non gérées
        }
      },
      // ...
    }),
    {
      name: 'girlycrea-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cart: state.cart,
      }),
    }
  )
);
```

### Code de l'API Client (`frontend/lib/api.ts`)

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Intercepteur pour ajouter le token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          const networkError = new Error(
            `Impossible de se connecter au backend. Vérifiez que le serveur backend est lancé sur ${API_URL}`
          ) as any;
          networkError.isNetworkError = true;
          networkError.backendUrl = API_URL;
          return Promise.reject(networkError);
        }

        if (error.response?.status === 401 && typeof window !== 'undefined') {
          // Token expiré, essayer de refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post(
                `${API_URL}/api/auth/refresh`,
                {},
                { withCredentials: true }
              );
              const { accessToken } = response.data as { accessToken: string };
              localStorage.setItem('accessToken', accessToken);
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${accessToken}`;
                return this.client.request(error.config);
              }
            } catch (refreshError) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getProducts(filters: any) {
    const response = await this.client.get('/api/products', { params: filters });
    return response.data;
  }

  async getCourses(filters: any) {
    const response = await this.client.get('/api/courses', { params: filters });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }
}

export const api = new ApiClient();
```

### Observations

1. **L'erreur se produit au chargement initial** de la page d'accueil
2. **Le HTML est bien servi** (le serveur Next.js fonctionne)
3. **L'erreur est côté client** (JavaScript dans le navigateur)
4. **Les correctifs ont été appliqués** :
   - Wrapper async pour `checkAuth()` dans `useEffect`
   - Gestion d'erreur gracieuse pour `/api/courses` (404)
   - Gestion d'erreur silencieuse dans `checkAuth()`
5. **L'image Docker a été reconstruite** avec les correctifs
6. **Le cache du navigateur a été vidé** (Ctrl+Shift+R)

### Configuration Next.js (`next.config.js`)

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
```

### Variables d'Environnement

```
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_SITE_NAME=GirlyCrea
NODE_ENV=production
```

## Question pour Perplexity

**Quelles sont les causes les plus courantes de l'erreur "Application error: a client-side exception has occurred" dans Next.js 15, et comment les diagnostiquer et les résoudre ?**

### Points Spécifiques à Analyser

1. **Problèmes avec `useEffect` et les hooks** dans Next.js 15
2. **Erreurs avec Zustand persist middleware** et SSR/hydration
3. **Problèmes avec les interceptors Axios** et les erreurs non gérées
4. **Erreurs de hydration** entre serveur et client
5. **Problèmes avec `localStorage`** dans `useEffect` ou lors du SSR
6. **Erreurs avec les dépendances manquantes** dans `useEffect`
7. **Problèmes avec les erreurs asynchrones** non catchées dans les composants React

### Solutions à Proposer

1. **Comment ajouter un Error Boundary** pour capturer les erreurs React
2. **Comment déboguer** les erreurs client-side dans Next.js 15
3. **Comment vérifier** si c'est un problème d'hydratation
4. **Comment wrapper** correctement les appels async dans `useEffect`
5. **Comment gérer** les erreurs avec Zustand persist et SSR

### Informations Supplémentaires

- Le backend fonctionne (health check OK)
- L'API `/api/products` retourne des données
- L'API `/api/courses` n'existe pas encore (404) mais est gérée
- Le frontend est en mode standalone (Docker)
- Next.js 15 avec App Router

**Merci de fournir des solutions concrètes et testables pour résoudre cette erreur client-side.**
