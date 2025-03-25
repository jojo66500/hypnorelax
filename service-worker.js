/**
 * Hypnorelax - Service Worker pour PWA
 * Gère la mise en cache et les fonctionnalités hors ligne
 */

// Configuration du cache
const CACHE_NAME = 'hypnorelax-v1.1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './mobile-optimization.css',
  './script.js',
  './mobile-optimization.js',
  './hypnorelax-bridge.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources');
        return cache.addAll(ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Erreur lors de la mise en cache:', error);
      })
  );
});

// Activation et nettoyage des caches obsolètes
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Revendication des clients');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('[Service Worker] Erreur lors de l\'activation:', error);
      })
  );
});

// Stratégie de récupération : Cache First avec fallback réseau
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET (comme POST ou OPTIONS)
  if (event.request.method !== 'GET') return;
  
  // Ignorer les requêtes d'API ou les requêtes cross-origin
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retourner la réponse du cache si elle existe
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Sinon, faire une requête réseau
        return fetch(event.request)
          .then((networkResponse) => {
            // Vérifier si la réponse est valide
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Mettre en cache la nouvelle ressource (copie de la réponse)
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('[Service Worker] Erreur de mise en cache dynamique:', error);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Erreur de récupération:', error);
            
            // Si la requête concerne une page HTML, retourner la page hors ligne
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // Impossible de récupérer la ressource et pas de fallback
            return new Response('Ressource non disponible hors ligne', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Écouter les messages de l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'OPTIMIZE_MOBILE') {
    console.log('[Service Worker] Optimisations mobiles demandées:', event.data.isMobile);
    // Ici, vous pourriez implémenter une logique spécifique pour les mobiles
  }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification de Hypnorelax',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || '/'
      },
      actions: [
        {
          action: 'open',
          title: 'Ouvrir l\'application'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('Hypnorelax', options)
    );
  } catch (error) {
    console.error('[Service Worker] Erreur de notification push:', error);
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({type: 'window'})
        .then((clientList) => {
          // Vérifier si une fenêtre existe déjà
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // Sinon ouvrir une nouvelle fenêtre
          return clients.openWindow(event.notification.data.url || '/');
        })
    );
  }
});
