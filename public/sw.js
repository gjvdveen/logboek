/**
 * Service Worker – Boot Logboek
 * Strategie: network-first voor navigatie, cache-first voor assets.
 * Zorgt dat de app offline bruikbaar blijft.
 */

const CACHE = 'logboek-v2';
const APP_SHELL = ['/logboek/', '/logboek/index.html'];

// ── Install: pre-cache app shell ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: verwijder oude caches ──────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navigatie: probeer netwerk, val terug op app shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/logboek/index.html'))
    );
    return;
  }

  // Overige requests: cache-first, haal van netwerk als niet gecached
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => cached ?? new Response('Offline', { status: 503 }));
    })
  );
});
