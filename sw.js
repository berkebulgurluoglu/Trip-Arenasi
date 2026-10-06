// Trip Arenası service worker: uygulamanın kabuğunu önbelleğe alır, her açılışta önce sunucudaki en yeni sürümü dener.
const CACHE = 'trip-arenasi-v12';
const CORE = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request.mode === 'navigate'
      ? new Request(e.request.url, {cache: 'no-cache', credentials: 'same-origin'})
      : new Request(e.request, {cache: 'no-cache'})).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
