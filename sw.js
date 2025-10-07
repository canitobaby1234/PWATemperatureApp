const CACHE_NAME = 'temperature-converter-v2';
const RUNTIME_CACHE = 'temperature-converter-runtime';

// Recursos esenciales para cachear durante la instalación
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/converter.js',
  '/converter.css',
  '/manifest.json',
  'https://c.s-microsoft.com/favicon.ico?v2'
];

// Instalación: pre-cachear recursos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: estrategia Cache First con Network Fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear peticiones GET
  if (request.method !== 'GET') {
    return;
  }

  // Estrategia Cache First para recursos de la app
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    // Estrategia Network First para recursos externos
    event.respondWith(networkFirst(request));
  }
});

// Cache First: buscar en caché primero, luego red
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    // Podrías retornar una página offline aquí
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First: intentar red primero, caché como fallback
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-conversions') {
    event.waitUntil(syncConversions());
  }
});

async function syncConversions() {
  console.log('[SW] Syncing data...');
  // Aquí podrías sincronizar datos guardados mientras estaba offline
}

// Notificaciones push (opcional)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva actualización disponible',
    icon: 'https://c.s-microsoft.com/favicon.ico?v2',
    badge: 'https://c.s-microsoft.com/favicon.ico?v2',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Temperature Converter', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Mensajes desde la app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(names => {
        return Promise.all(names.map(name => caches.delete(name)));
      })
    );
  }
});