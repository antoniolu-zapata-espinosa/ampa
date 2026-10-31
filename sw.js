// Service worker: abre la app sin conexión.
//  - Archivos propios: siempre busca primero la versión más nueva; si no hay internet, usa la guardada.
//  - Librerías externas (Supabase, QR, fuentes): se guardan la primera vez para que la app arranque sin conexión.
// Los datos de Supabase (peticiones a *.supabase.co) nunca se guardan aquí.
const C = 'ampa-v4';
const CDN = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request, { cache: 'no-store' })
      .then(r => { const k = r.clone(); caches.open(C).then(c => c.put(e.request, k)); return r; })
      .catch(() => caches.match(e.request).then(m => m || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined))));
  } else if (CDN.includes(u.hostname)) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const k = r.clone(); caches.open(C).then(c => c.put(e.request, k)); return r; })));
  }
});
