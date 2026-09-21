# 006 — Plan
- ESLint 10 + typescript-eslint (strict) + eslint-plugin-astro; reglas de complejidad en `eslint.config.js`.
- jscpd (`.jscpd.json`), knip (`knip.json`), cobertura v8 (`vitest.config.ts`), Stryker con *command runner* (`stryker.config.json`).
- Refactorización guiada por los hallazgos: `src/lib/tiempo.ts`, `src/lib/reloj.ts`, `src/lib/diario-navegador.ts`, `scripts/contenido.ts`; reglas como tabla de funciones; islas divididas en componentes.
- Nota: el runner oficial de Stryker para Vitest 5 reporta 0 % sin ejecutar los mutantes. Se usa el *command runner*, más lento pero verificable.
