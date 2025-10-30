const CACHE_NAME = 'praisefm-v2'; // ⬅️ aumente a versão para forçar atualização
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
  const requestUrl = event.request.url;

  // Não fazer cache de streams de áudio ou outros recursos externos
  if (
    requestUrl.startsWith('https://stream.zeno.fm/') ||
    requestUrl.startsWith('https://api.zeno.fm/') ||
    !requestUrl.startsWith(self.location.origin)
  ) {
    return; // Deixa o navegador lidar diretamente
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // Fallback para index.html em rotas desconhecidas (útil se usar SPA)
      if (event.request.destination === 'document') {
        return caches.match('/APK/index.html');
      }
    })
  );
});
