/**
 * Hypnorelax - Service Worker avancé
 * Gère le cache, les mises à jour et l'expérience hors ligne
 * Version: 1.2.0
 */

// Configuration
const APP_VERSION = 'hypnorelax-v1.2.0';
const STATIC_CACHE = `${APP_VERSION}-static`;
const DYNAMIC_CACHE = `${APP_VERSION}-dynamic`;
const IMMUTABLE_CACHE = `${APP_VERSION}-immutable`;

// Ressources à mettre en cache immédiatement
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './mobile-optimization.css',
  './marketing-styles.css',
  './script.js',
  './mobile-optimization.js',
  './hypnorelax-bridge.js',
  './manifest.json',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
  './offline.html'
];

// Ressources immuables (CDN, bibliothèques externes)
const IMMUTABLE_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Page pour état hors ligne
const OFFLINE_PAGE = './offline.html';

// Installation: mise en cache des ressources essentielles
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation');
  
  event.waitUntil(
    Promise.all([
      // Cache statique (ressources de l'application)
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources principales');
        return cache.addAll(CORE_ASSETS);
      }),
      
      // Cache immuable (ressources externes qui ne changent pas)
      caches.open(IMMUTABLE_CACHE).then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources immuables');
        return cache.addAll(IMMUTABLE_ASSETS);
      })
    ])
    .then(() => {
      console.log('[Service Worker] Installation terminée');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('[Service Worker] Erreur lors de l\'installation:', error);
    })
  );
});

// Activation: nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMMUTABLE_CACHE
            ) {
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

// Stratégie de récupération: Stale-While-Revalidate avec fallback
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Traitement différent selon le type d'URL
  
  // 1. Requêtes pour les API ou analytics - Network Only
  if (url.pathname.startsWith('/api/') || url.hostname.includes('analytics')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[Service Worker] Échec de requête API/analytics');
          return new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }
  
  // 2. Ressources immuables (CDN, libs) - Cache First
  if (
    IMMUTABLE_ASSETS.some(asset => event.request.url.includes(asset)) ||
    event.request.url.includes('fonts.googleapis.com') ||
    event.request.url.includes('cdnjs.cloudflare.com')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              // Mettre en cache pour la prochaine fois
              return caches.open(IMMUTABLE_CACHE)
                .then(cache => {
                  cache.put(event.request, response.clone());
                  return response;
                });
            })
            .catch(err => {
              console.error('[Service Worker] Erreur lors de la récupération de ressource immuable:', err);
              return caches.match(OFFLINE_PAGE);
            });
        })
    );
    return;
  }
  
  // 3. Pour les requêtes de pages HTML - Network First
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mettre en cache la dernière version
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(event.request, clonedResponse));
          
          return response;
        })
        .catch(() => {
          // Utiliser la version en cache si disponible
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Sinon, afficher la page hors ligne
              return caches.match(OFFLINE_PAGE);
            });
        })
    );
    return;
  }
  
  // 4. Pour toutes les autres ressources - Stale While Revalidate
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Utiliser la version en cache immédiatement si disponible
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Mettre à jour le cache
            if (networkResponse && networkResponse.status === 200) {
              const clonedResponse = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(event.request, clonedResponse));
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('[Service Worker] Ressource non disponible et non mise en cache:', error);
            // Ne rien retourner ici, pour utiliser le cachedResponse
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  // Essayer de traiter la notification comme JSON
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification de Hypnorelax',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || './'
      },
      actions: [
        {
          action: 'open',
          title: 'Ouvrir l\'application'
        },
        {
          action: 'close',
          title: 'Fermer'
        }
      ],
      silent: data.silent || false
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Hypnorelax', options)
    );
  } catch (error) {
    // Si ce n'est pas du JSON, utiliser le texte brut
    console.log('[Service Worker] Notification non-JSON reçue');
    
    event.waitUntil(
      self.registration.showNotification('Hypnorelax', {
        body: event.data.text(),
        icon: './icon-192.png'
      })
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then((clientList) => {
        // Vérifier si une fenêtre existe déjà
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Si une URL spécifique est fournie, naviguer vers elle
            if (event.notification.data && event.notification.data.url) {
              return client.navigate(event.notification.data.url).then(() => client.focus());
            }
            return client.focus();
          }
        }
        
        // Sinon ouvrir une nouvelle fenêtre
        const url = (event.notification.data && event.notification.data.url) ? 
                    event.notification.data.url : 
                    './';
                    
        return clients.openWindow(url);
      })
  );
});

// Periodicidad sync pour mettre à jour le contenu en arrière-plan
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

// Fonction pour mettre à jour le contenu en arrière-plan
async function updateContent() {
  try {
    // Rafraîchir le cache des ressources principales
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(CORE_ASSETS);
    
    // Notifier l'utilisateur
    const clients = await self.clients.matchAll({type: 'window'});
    for (const client of clients) {
      client.postMessage({
        type: 'CONTENT_UPDATED',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('[Service Worker] Contenu mis à jour en arrière-plan');
    return true;
  } catch (error) {
    console.error('[Service Worker] Erreur lors de la mise à jour en arrière-plan:', error);
    return false;
  }
}

// Écouter les messages de l'application
self.addEventListener('message', (event) => {
  if (event.data) {
    console.log('[Service Worker] Message reçu:', event.data.type);
    
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CLEAR_CACHE':
        clearCaches();
        break;
        
      case 'OPTIMIZE_MOBILE':
        // Implémenter des optimisations spécifiques pour mobile
        if (event.data.isMobile) {
          console.log('[Service Worker] Optimisations mobiles activées');
          // Prioriser certaines ressources, ajuster la stratégie de cache
        }
        break;
        
      case 'PRECACHE_ROUTE':
        if (event.data.route) {
          precacheRoute(event.data.route);
        }
        break;
    }
  }
});

// Fonction pour vider les caches
async function clearCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[Service Worker] Tous les caches ont été effacés');
    
    // Recréer les caches essentiels
    const staticCache = await caches.open(STATIC_CACHE);
    await staticCache.addAll(CORE_ASSETS);
    
    return true;
  } catch (error) {
    console.error('[Service Worker] Erreur lors du nettoyage des caches:', error);
    return false;
  }
}

// Fonction pour précharger une route spécifique
async function precacheRoute(route) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await fetch(route);
    
    if (response.status === 200) {
      await cache.put(route, response);
      console.log(`[Service Worker] Route préchargée: ${route}`);
      return true;
    } else {
      console.warn(`[Service Worker] Impossible de précacher la route: ${route}, statut: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`[Service Worker] Erreur lors du préchargement de la route ${route}:`, error);
    return false;
  }
}
