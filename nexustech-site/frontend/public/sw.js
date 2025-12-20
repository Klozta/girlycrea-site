// Service Worker PWA - Cache intelligent offline
// Version: 3.0
const CACHE_NAME = 'nexustech-v3.0';
const STATIC_CACHE = 'nexustech-static-v3.0';
const API_CACHE = 'nexustech-api-v3.0';
const IMAGE_CACHE = 'nexustech-images-v3.0';

// Assets critiques à mettre en cache immédiatement
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Install - Cache les assets critiques
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker installed');
        return self.skipWaiting(); // Activer immédiatement
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate - Nettoyer les anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer tous les anciens caches (girlycrea et anciennes versions nexustech)
            if (cacheName !== STATIC_CACHE &&
                cacheName !== API_CACHE &&
                cacheName !== IMAGE_CACHE &&
                (cacheName.startsWith('girlycrea-') ||
                 (cacheName.startsWith('nexustech-') && cacheName !== CACHE_NAME))) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim(); // Prendre le contrôle immédiatement
      })
  );
});

// Fetch - Stratégies de cache intelligentes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes cross-origin non-autorisées
  if (url.origin !== location.origin &&
      !url.href.includes('/api/') &&
      !url.href.includes('supabase.co') &&
      !url.href.includes('_next/static')) {
    return;
  }

  // API Routes - Network First avec cache de secours
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE, 300)); // Cache 5min
    return;
  }

  // Images - Cache First avec réseau de secours
  if (request.destination === 'image' ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE, 7 * 24 * 60 * 60)); // 7 jours
    return;
  }

  // Static assets (_next/static) - Cache First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE, 30 * 24 * 60 * 60)); // 30 jours
    return;
  }

  // Pages HTML - Network First avec cache de secours
  if (request.destination === 'document' ||
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE, 60)); // Cache 1min
    return;
  }

  // Autres assets statiques (CSS, JS, fonts) - Cache First
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE, 7 * 24 * 60 * 60)); // 7 jours
    return;
  }

  // Par défaut: Network First
  event.respondWith(networkFirstStrategy(request, STATIC_CACHE, 60));
});

// Stratégie: Network First (pour contenu dynamique)
async function networkFirstStrategy(request, cacheName, maxAgeSeconds = 300) {
  const cache = await caches.open(cacheName);

  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      // Mettre en cache pour usage futur
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone).catch(() => {});
      return networkResponse;
    }

    // Si réseau échoue, essayer le cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Vérifier l'âge du cache
      const cacheDate = cachedResponse.headers.get('sw-cache-date');
      if (cacheDate) {
        const age = (Date.now() - parseInt(cacheDate)) / 1000;
        if (age < maxAgeSeconds) {
          return cachedResponse;
        }
      } else {
        return cachedResponse; // Pas de date = ancien format, accepter quand même
      }
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si tout échoue, retourner une page offline pour les documents
    if (request.destination === 'document') {
      return new Response(
        '<!DOCTYPE html><html><head><title>Hors ligne</title></head><body><h1>Vous êtes hors ligne</h1><p>Cette page n\'est pas disponible hors ligne.</p></body></html>',
        {
          headers: { 'Content-Type': 'text/html' },
          status: 200,
        }
      );
    }

    throw error;
  }
}

// Stratégie: Cache First (pour assets statiques)
async function cacheFirstStrategy(request, cacheName, maxAgeSeconds = 7 * 24 * 60 * 60) {
  const cache = await caches.open(cacheName);

  // Vérifier le cache d'abord
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Vérifier l'âge du cache
    const cacheDate = cachedResponse.headers.get('sw-cache-date');
    if (cacheDate) {
      const age = (Date.now() - parseInt(cacheDate)) / 1000;
      if (age < maxAgeSeconds) {
        return cachedResponse;
      }
    } else {
      return cachedResponse; // Pas de date = accepter
    }
  }

  // Si pas en cache ou expiré, aller au réseau
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      // Ajouter la date de cache dans les headers
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-date', Date.now().toString());

      const responseWithDate = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });

      cache.put(request, responseWithDate).catch(() => {});
      return networkResponse;
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for cached resource:', request.url);
    // Retourner le cache même s'il est expiré si le réseau échoue
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Message handler pour communication avec l'app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_CLEAR') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
