// Service Worker para PWA móvil
const CACHE_NAME = 'adivina-numero-mobile-v1';
const urlsToCache = [
    '/mobile.html',
    '/mobile-style.css',
    '/mobile-script.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devolver desde cache si está disponible
                if (response) {
                    return response;
                }
                
                // Si no está en cache, hacer fetch
                return fetch(event.request).then((response) => {
                    // Verificar si la respuesta es válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar la respuesta
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// Manejar notificaciones push (opcional)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '¡Nueva partida disponible!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Jugar',
                icon: '/icon-192.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icon-192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Adivina el Número', options)
    );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/mobile.html')
        );
    }
});
