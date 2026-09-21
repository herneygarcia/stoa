# 005 — Plan
- Service worker propio `public/sw.js` (sin plugin: `@vite-pwa/astro` aún no soporta Astro 7): precache del shell, *network-first* para HTML, *cache-first* para estáticos, versión por build.
- `ci.yml` (verify + E2E), `deploy.yml` (Pages), `daily.yml` (cron).
