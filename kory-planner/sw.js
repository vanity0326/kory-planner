const CACHE_NAME = 'kory-planner-v1';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/app.js',
  '/src/storage.js',
  '/src/avatar.js',
  '/src/styles/base.css',
  '/src/styles/subjects.css',
  '/src/styles/seasonal.css',
  '/src/views/today.js',
  '/src/views/add-assignment.js',
  '/src/views/reports.js',
  '/src/views/village.js',
  '/src/views/settings.js',
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
