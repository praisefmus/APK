const CACHE_NAME = 'praisefm-v1';
const urlsToCache = [
  '/APK/',
  '/APK/index.html',
  '/APK/manifest.json',
  '/APK/assets/logo.png',
  '/APK/assets/icon192.png',
  '/APK/assets/icon512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('https://stream.zeno.fm')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/APK/index.html');
        }
      })
  );
});
