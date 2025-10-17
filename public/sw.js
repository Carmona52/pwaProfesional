const CACHE_APP_SHELL = 'app-shell-v1';
const CACHE_IMAGES = 'images-v1';
const CACHE_API = 'api-v1';
const OFFLINE_URL = '/offline.html';

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_APP_SHELL).then(cache => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_APP_SHELL);
        cache.put(request, response.clone());
        return response;
      } catch {
        return await caches.match(request) || await caches.match(OFFLINE_URL);
      }
    })());
    return;
  }

  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_IMAGES);
      const cached = await cache.match(request);
      const networkFetch = fetch(request).then(async res => {
        if (res && res.status === 200) {
          cache.put(request, res.clone());
          trimCache(CACHE_IMAGES, 60);
        }
        return res;
      }).catch(() => null);
      return cached || (await networkFetch) || (await caches.match(OFFLINE_URL));
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      return await fetch(request);
    } catch {
      return await caches.match(request) || await caches.match(OFFLINE_URL);
    }
  })());
});
