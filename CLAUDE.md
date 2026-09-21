# Stoa — guía para agentes (arnés)

PWA estática (Astro 7 + islas Preact) que introduce el estoicismo con un **caso de la vida real cada día**.
Se construye con **Spec-Driven Development** y un **arnés** de validaciones automáticas.

## Antes de tocar nada
1. Lee `.specify/memory/constitution.md` (reglas no negociables).
2. Busca la spec en `specs/NNN-*/`. Si el cambio no está especificado, primero escribe/actualiza `spec.md`, luego `plan.md` y `tasks.md`.
3. Marca las tareas en `tasks.md` a medida que las completas.

## Mapa
- `src/lib/schemas.ts` — **contrato de contenido** (Zod). Lo usan Astro, el validador y el pipeline de IA.
- `src/content/` — principios, virtudes, prácticas, casos (`casos/banco/` curados, `casos/diarios/` IA con fecha), `citas/citas.json` (corpus).
- `src/lib/` — lógica pura y testeable (selección del caso del día, fechas en Bogotá, conteo de palabras).
- `src/islands/` — interactividad (Círculo del control, Termómetro, Examen nocturno, Diario).
- `src/styles/tokens.css` — tokens de diseño. No uses colores fuera de los tokens.
- `scripts/validate-content.ts` — arnés de contenido.
- `scripts/daily-case/` — generación diaria con Claude: `generate` → `rubric` (reglas + juez) → reintento → fallback.
- `evals/` — casos dorados y trampa del pipeline diario.
- `public/sw.js`, `public/manifest.webmanifest` — PWA sin dependencias.

## Comandos
| Qué | Comando |
|---|---|
| Desarrollo | `npm run dev` |
| Arnés rápido (tipos + contenido + unit) | `npm run verify` |
| E2E + accesibilidad | `npm run build && npm run test:e2e` |
| Caso diario (sin publicar) | `npm run daily -- --dry-run` (requiere `ANTHROPIC_API_KEY`) |
| Evals del pipeline | `npm run evals` |

## Definición de terminado
- `npm run verify` en verde y E2E en verde.
- Cada criterio de aceptación nuevo tiene prueba con su ID en el nombre del test.
- Sin citas fuera del corpus; sin textos en inglés visibles; sin colores fuera de tokens.
