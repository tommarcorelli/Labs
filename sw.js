/* ============================================================
   TP & LABS IT — sw.js
   Service Worker PWA — network-first pour le code/données
   (mises à jour visibles dès qu'on est en ligne),
   cache-first pour les assets statiques (fonts, icônes).
   Incrémenter CACHE_NAME à chaque mise à jour du site.
   ============================================================ */

const CACHE_NAME = 'tp-labs-v5';
const CACHE_ASSETS = [
  './',
  './index.html',
  './labs.html',
  './style.css',
  './script.js',
  './manifest.json',
  './data-index.js',
  './data-automatisation.js',
  './data-projets.js',
  './data-reseau.js',
  './data-sauvegardes.js',
  './data-securite.js',
  './data-slam.js',
  './data-supervision.js',
  './data-systemes.js',
  './data-virtualisation.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install — pré-cache tous les fichiers du site (offline complet)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate — nettoyer les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  // Network-first pour les fichiers du site (HTML, JS, CSS, données) :
  // les mises à jour et nouveaux TPs apparaissent dès qu'on est en ligne.
  const isLocal = url.origin === self.location.origin;
  if (isLocal && (/\.(html|js|css|json)$/.test(url.pathname) || url.pathname.endsWith('/'))) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first pour le reste (fonts, icônes, images)
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      });
    })
  );
});
