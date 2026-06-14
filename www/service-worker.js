/* ═══════════════════════════════════════════════
   AllergyTrack – Service Worker (PWA offline)
   Cache-first stratégia statikus erőforrásokhoz
   ═══════════════════════════════════════════════ */

const CACHE = 'allergytrack-v1.9.1';

const STATIC = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './js/data.js',
  './js/db.js',
  './js/pdfParser.js',
  './js/patchNotes.js',
  './js/weatherService.js',
  './js/notifications.js',
  './js/geoLocation.js',
  './js/knowledge.js',
  './js/dashboard.js',
  './js/logEntry.js',
  './js/pollenData.js',
  './js/analytics.js',
  './js/pollenFetcher.js',
  './js/pollenMap.js',
  './js/profile.js',
  './js/settings.js',
  './js/sync.js',
  './js/uiFx.js',
  './js/supabase.js',
  './js/auth.js',
  './js/userProfile.js',
  './js/app.js',
  './libs/pdf.min.js',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap',
];

/* ── Install: előre betöltés ────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(STATIC))
      .catch(err => console.warn('[SW] Pre-cache hiba (nem fatális):', err))
  );
  self.skipWaiting();
});

/* ── Activate: régi cache-ek törlése ────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch stratégiák ───────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* API hívások: mindig hálózat (ne cache-eljük) */
  const NETWORK_ONLY_HOSTS = [
    'supabase.co',
    'api.open-meteo.com',
    'air-quality-api.open-meteo.com',
    'nominatim.openstreetmap.org',
  ];
  if (NETWORK_ONLY_HOSTS.some(h => url.host.includes(h))) return;

  /* CDN erőforrások: cache first, hálózat fallback */
  if (url.host.includes('cdn.jsdelivr.net') || url.host.includes('fonts.googleapis.com') || url.host.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached ?? fetch(request).then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return resp;
        })
      )
    );
    return;
  }

  /* HTML navigáció: network first – online mindig a friss app shell
     töltődik, így nem ragad be régi verzió; offline cache fallback */
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return resp;
        })
        .catch(() =>
          caches.match(request).then(cached =>
            cached ?? caches.match('./index.html').then(idx =>
              idx ?? new Response('Offline', { status: 503 }))
          )
        )
    );
    return;
  }

  /* App shell + statikus fájlok: cache first */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request)
          .then(resp => {
            if (resp.ok) {
              const clone = resp.clone();
              caches.open(CACHE).then(c => c.put(request, clone));
            }
            return resp;
          })
          .catch(() => cached ?? new Response('Offline', { status: 503 }));
        return cached ?? networkFetch;
      }).catch(() => new Response('Offline', { status: 503 }))
    );
  }
});
