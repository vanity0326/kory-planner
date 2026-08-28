// Bump this version string on every deploy that changes cached files.
// A changed value makes browsers detect sw.js as "updated" and properly
// evict old caches — otherwise a service worker can silently keep serving
// stale files indefinitely, even after a fresh deploy.
const CACHE_NAME = 'kory-planner-v12';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/app.js',
  '/src/storage.js',
  '/src/avatar.js',
  '/src/stage-icons.js',
  '/src/seasonal-icons.js',
  '/src/tour.js',
  '/src/styles/base.css',
  '/src/styles/subjects.css',
  '/src/styles/seasonal.css',
  '/src/views/today.js',
  '/src/views/add-assignment.js',
  '/src/views/reports.js',
  '/src/views/village.js',
  '/src/views/settings.js',
  '/src/views/home-practice.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for everything. Function calls always go straight to the
// network (data must stay fresh, never served from cache). Shell files
// (JS/CSS/HTML) also try the network first now — previously they were
// cache-first, which meant a deploy could silently keep serving old code
// until the service worker happened to fully cycle. Network-first means
// any deploy takes effect the very next time the app is opened while
// online; the cache is only a fallback for offline use.
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/.netlify/functions/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
