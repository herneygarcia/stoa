/** Ruta con el `base` de Astro (GitHub Pages sirve el sitio bajo /<repo>/). */
export const url = (ruta = '/') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;

export const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const romano = (n: number) => ROMANOS[n - 1] ?? String(n);
