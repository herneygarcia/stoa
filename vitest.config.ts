import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // Las pruebas corren en UTC: así no pasan solo porque el computador esté en Colombia.
    env: { TZ: 'UTC' },
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      exclude: ['src/lib/diario-navegador.ts'],
      reporter: ['text-summary', 'text'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
