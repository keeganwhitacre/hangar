// sw.js
const CACHE_NAME = 'fit-cache-v2';

// Force immediate activation when a new script is detected
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intercept requests and fallback gracefully, keeping live code freshest
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network succeeds, duplicate it to cache for offline capabilities
        if (response.status === 200 && event.request.method === 'GET') {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        }
        return response;
      })
      .catch(() => {
        // If completely offline, fall back directly on the system storage cache
        return caches.match(event.request);
      })
  );
});
