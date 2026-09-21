# Registro de decisiones

- **2026-09-21** Stack: Astro 7 estático + islas Preact. Hosting: GitHub Pages + Actions. Sin cuentas: datos en IndexedDB.
- **2026-09-21** PWA con service worker propio: `@vite-pwa/astro` exige Astro ≤ 5.
- **2026-09-21** Caso diario: banco curado + generación con Claude validada por rúbrica; fallback al banco.
- **2026-09-21** Citas: traducción propia desde ediciones de dominio público; corpus local cerrado (la IA no puede citar fuera de él).
- **2026-09-21** Calidad medible (constitución VII, spec 006): ESLint estricto con límites de complejidad, jscpd, knip, cobertura ≥ 90 % y mutación ≥ 80 % en `src/lib`.
- **2026-09-21** Stryker usa el *command runner* (`vitest run` por mutante): el runner de Vitest 5 reportaba 0 % sin ejecutar mutantes.
- **2026-09-21** Los casos del banco viven solo en `src/content/casos/banco/*.md` (se retiró `scripts/seed/`, que duplicaba la fuente de verdad).
- **2026-09-21** Se retiró el selector de tema `data-theme` del CSS: la interfaz sigue la preferencia del sistema y nunca tuvo un botón para cambiarlo.
