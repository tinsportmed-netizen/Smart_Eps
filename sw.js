// Smart EPS Service Worker - Network First + Update Notification
const CACHE = 'smart-eps-v58';
const APP_VERSION = '2.1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  // Notify all open clients of update
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({type:'UPDATE_AVAILABLE',version:APP_VERSION}));
  });
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, clone));
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
