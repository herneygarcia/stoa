# 001 — Plan

- Colecciones Astro `principios`, `virtudes` (Markdown + frontmatter) y `citas` (JSON, `file()` loader).
- Esquemas en `src/lib/schemas.ts`; `src/content.config.ts` los importa. Referencias a citas por `id`.
- Páginas: `/principios`, `/principios/[slug]`, `/virtudes`, `/virtudes/[slug]`.
- Componente `Cita.astro` (texto + atribución + "traducción propia").
- Diagrama SVG propio de las 4 virtudes como sistema (Sabiduría ve, Coraje actúa, Justicia orienta, Templanza sostiene).
