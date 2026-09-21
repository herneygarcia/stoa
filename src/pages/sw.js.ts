import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// CA-005.2: service worker propio. La versión cambia en cada build, así que cada despliegue renueva la caché.
export const GET: APIRoute = async () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const version = new Date().toISOString();
  const rutas = [
    '/', '/offline', '/diario', '/principios', '/virtudes', '/practicas', '/casos', '/sobre',
    ...(await getCollection('principios')).map((p) => `/principios/${p.id}`),
    ...(await getCollection('virtudes')).map((v) => `/virtudes/${v.id}`),
    ...(await getCollection('practicas')).map((p) => `/practicas/${p.id}`),
  ].map((r) => `${base}${r}`);

  const sw = `// Stoa · generado en el build ${version}
const CACHE = 'stoa-${version}';
const PRECACHE = ${JSON.stringify(rutas)};
const OFFLINE = '${base}/offline';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  // HTML: primero la red (el caso del día cambia), luego la caché, luego /offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); return r; })
      .catch(async () => (await caches.match(req)) || (await caches.match(req.url.replace(/\\/$/, ''))) || caches.match(OFFLINE)));
    return;
  }
  // Estáticos con hash y fuentes: primero la caché.
  if (u.pathname.includes('/_astro/') || u.hostname.endsWith('gstatic.com') || u.hostname.endsWith('googleapis.com') || /\\.(svg|png|webmanifest)$/.test(u.pathname)) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); return res; })));
  }
});
`;
  return new Response(sw, { headers: { 'Content-Type': 'text/javascript' } });
};
