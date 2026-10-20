/* Service worker sederhana: aplikasi bisa DIBUKA walau sinyal buruk (cangkang halaman saja).
   Data dan pengiriman foto tetap butuh internet. Jaringan didahulukan agar pembaruan langsung terpakai. */
const CACHE = 'hk-shell-v2';
const SHELL = ['index.html', 'config.js', 'api.js', 'shim.js', 'icon-192.png', 'icon-512.png', 'favicon.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;     // API Apps Script tidak disentuh
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
