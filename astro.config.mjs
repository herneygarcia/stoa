import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// En GitHub Pages el sitio vive en /<repo>/ salvo dominio propio: se configura por entorno.
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'ignore',
  integrations: [preact()],
});
