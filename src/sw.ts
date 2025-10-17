/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();
precacheAndRoute(self.__WB_MANIFEST || []);

const CACHE_APP_SHELL = 'app-shell-v1';
const CACHE_IMAGES = 'images-v1';
const CACHE_API = 'api-v1';
const OFFLINE_URL = '/offline.html';

async function trimCache(cacheName: string, maxItems: number): Promise<void> {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_APP_SHELL);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        const cached = await caches.match(request);
        return cached || (await caches.match(OFFLINE_URL)) as Response;
      }
    })());
    return;
  }

  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_IMAGES);
      const cached = await cache.match(request);
      const networkFetch = fetch(request).then(async (networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
          trimCache(CACHE_IMAGES, 60);
        }
        return networkResponse;
      }).catch(() => null);

      return cached || (await networkFetch) || (await caches.match(OFFLINE_URL));
    })());
    return;
  }

  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.pathname.startsWith('/mensajes')
  ) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_API);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
          trimCache(CACHE_API, 100);
        }
        return networkResponse;
      } catch {
        const cached = await caches.match(request);
        return cached || new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })());
    return;
  }

  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    /\.(?:js|css|woff2?|ttf)$/.test(url.pathname)
  ) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_APP_SHELL);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        return (await caches.match(OFFLINE_URL)) as Response;
      }
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      return await fetch(request);
    } catch {
      const cached = await caches.match(request);
      return cached || (await caches.match(OFFLINE_URL));
    }
  })());
});