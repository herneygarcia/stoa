import type { APIRoute } from 'astro';

// CA-005.1: instalable. Generado para respetar el `base` de GitHub Pages.
export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return new Response(JSON.stringify({
    name: 'Stoa · estoicismo para cada día',
    short_name: 'Stoa',
    description: 'Un caso real cada día, prácticas estoicas y un diario privado.',
    lang: 'es',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    background_color: '#E4E6DF',
    theme_color: '#E4E6DF',
    icons: [
      { src: `${base}/icono-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}/icono-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${base}/icono-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: `${base}/icono.svg`, sizes: 'any', type: 'image/svg+xml' },
    ],
  }, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
};
