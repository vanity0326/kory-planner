// Bump this version string on every deploy that changes cached files.
// A changed value makes browsers detect sw.js as "updated" and properly
// evict old caches — otherwise a service worker can silently keep serving
// stale files indefinitely, even after a fresh deploy.
const CACHE_NAME = 'kory-planner-v10';
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

// Network-first for function calls (data must stay fresh), cache-first for shell files.
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/.netlify/functions/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
