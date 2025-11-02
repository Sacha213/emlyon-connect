/* eslint-disable no-undef */
// Service Worker pour emlyon Connect PWA avec Workbox

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Précache des assets (injecté par Vite PWA)
precacheAndRoute(self.__WB_MANIFEST);

// Cache des tuiles OpenStreetMap
registerRoute(
    /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
    new CacheFirst({
        cacheName: 'osm-tiles',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200]
            })
        ]
    })
);

// Cache Supabase API
registerRoute(
    /^https:\/\/.*\.supabase\.co\/.*/i,
    new NetworkFirst({
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 10,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
            })
        ]
    })
);

// Activation immédiate
self.addEventListener('install', (event) => {
    console.log('[SW] Installation...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activation...');
    event.waitUntil(self.clients.claim());
});

// Écouter les notifications push
self.addEventListener('push', (event) => {
    console.log('[SW] 🔔 Push notification reçue!', event);
    console.log('[SW] 🔔 Event data:', event.data);
    console.log('[SW] 🔔 Has data:', !!event.data);

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
            console.log('[SW] 🔔 Parsing JSON...');
            const payload = event.data.json();
            console.log('[SW] 🔔 Payload parsé:', payload);
            notificationData = {
                ...notificationData,
                ...payload
            };
        } catch (e) {
            console.error('[SW] ❌ Erreur parsing notification:', e);
            try {
                const text = event.data.text();
                console.log('[SW] 🔔 Payload text:', text);
                notificationData.body = text;
            } catch (e2) {
                console.error('[SW] ❌ Erreur text():', e2);
            }
        }
    } else {
        console.log('[SW] ⚠️ Pas de data dans le push event');
    }

    console.log('[SW] 🔔 Affichage notification:', notificationData);

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
