/* eslint-disable no-undef */
// Service Worker pour emlyon Connect PWA

const CACHE_NAME = 'emlyon-connect-v1';
const RUNTIME_CACHE = 'emlyon-runtime';

// Écouter l'événement d'installation
self.addEventListener('install', (event) => {
    console.log('[SW] Installation...');
    self.skipWaiting(); // Active immédiatement le nouveau SW
});

// Écouter l'événement d'activation
self.addEventListener('activate', (event) => {
    console.log('[SW] Activation...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[SW] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Prend le contrôle immédiatement
});

// Écouter les notifications push
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification reçue:', event);

    let notificationData = {
        title: 'emlyon Connect',
        body: 'Nouvelle notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'default',
        requireInteraction: false,
        data: {}
    };

    // Parser les données si disponibles
    if (event.data) {
        try {
            const payload = event.data.json();
            notificationData = {
                ...notificationData,
                ...payload
            };
        } catch (e) {
            console.error('[SW] Erreur parsing notification:', e);
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: notificationData.data,
            vibrate: [200, 100, 200],
            actions: notificationData.actions || []
        })
    );
});

// Écouter les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Click sur notification:', event.notification);

    event.notification.close();

    // Gérer les actions
    if (event.action) {
        console.log('[SW] Action:', event.action);
    }

    // Ouvrir ou focus l'app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Chercher une fenêtre déjà ouverte
            for (let client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Sinon, ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
                const url = event.notification.data?.url || '/';
                return clients.openWindow(url);
            }
        })
    );
});

// Stratégie de cache pour les requêtes réseau
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') return;

    // Ignorer les requêtes vers Supabase (toujours réseau)
    if (event.request.url.includes('supabase.co')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Cache-first pour les assets statiques
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return caches.open(RUNTIME_CACHE).then((cache) => {
                return fetch(event.request).then((response) => {
                    // Ne pas cacher les erreurs
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    // Cloner pour mettre en cache
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});

// Message handler pour communication entre SW et page
self.addEventListener('message', (event) => {
    console.log('[SW] Message reçu:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
