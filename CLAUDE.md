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
- `src/lib/` — lógica pura y probada: `tiempo.ts` (hora de Colombia), `reloj.ts` (geometría del reloj), `caso-del-dia.ts`, `diario.ts`, `reglas.ts`, `schemas.ts`. `diario-navegador.ts` es la única pieza que toca IndexedDB.
- `scripts/contenido.ts` — lectura del contenido compartida por el validador y el pipeline diario.
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
| Arnés completo (tipos, lint, duplicación, código muerto, contenido, cobertura, evals, mutación) | `npm run verify` |
| Solo calidad de código | `npm run lint`, `npm run duplicacion`, `npm run muerto`, `npm run test:cobertura`, `npm run mutacion` |
| E2E + accesibilidad | `npm run build && npm run test:e2e` |
| Caso diario (sin publicar) | `npm run daily -- --dry-run` (requiere `ANTHROPIC_API_KEY`) |
| Evals del pipeline | `npm run evals` |

## Calidad (constitución VII)
- Complejidad ≤ 10, sin `!`, sin lógica duplicada, sin código muerto, mutación ≥ 80 % en `src/lib`.
- Si un mutante sobrevive, escribe la prueba que lo mata o documenta por qué es equivalente en `docs/calidad.md`.
- Lógica nueva: primero en `src/lib` como función pura con pruebas; los componentes solo la usan.

## Definición de terminado
- `npm run verify` en verde y E2E en verde.
- Cada criterio de aceptación nuevo tiene prueba con su ID en el nombre del test.
- Sin citas fuera del corpus; sin textos en inglés visibles; sin colores fuera de tokens.
