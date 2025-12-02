// service-worker.js - Place in client/public/
const CACHE_NAME = 'debtms-v1';
const API_CACHE_NAME = 'debtms-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => {
              console.log('🗑️ Service Worker: Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before caching
          const responseClone = response.clone();
          
          // Only cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            caches.open(API_CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - Cache First strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone response before caching
            const responseClone = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));

            return response;
          });
      })
  );
});

// Handle background sync for offline payments
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');
  
  if (event.tag === 'sync-payments') {
    event.waitUntil(syncPendingPayments());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'DebtMS Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Sync pending payments (offline support)
async function syncPendingPayments() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();
    
    const pendingPayments = requests.filter(req => 
      req.url.includes('/api/payments') && req.method === 'POST'
    );

    for (const request of pendingPayments) {
      try {
        await fetch(request.clone());
        await cache.delete(request);
        console.log('✅ Synced payment:', request.url);
      } catch (error) {
        console.error('❌ Failed to sync payment:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error syncing payments:', error);
  }
}