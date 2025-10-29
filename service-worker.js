// service-worker.js
const CACHE_NAME = 'praisefm-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo.png',
  '/assets/icon192.png',
  '/assets/icon512.png'
];

// Instalação: pré-carrega os arquivos essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Ativação: remove caches antigas
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

// Busca: tenta usar cache, senão vai à rede
self.addEventListener('fetch', event => {
  // Não cacheamos o stream de áudio (URL externa)
  if (event.request.url.startsWith('https://stream.zeno.fm')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Opcional: página offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});