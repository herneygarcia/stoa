// Compuerta de calidad de código (constitución VII). Umbrales = criterios de revisión académica/profesional.
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default defineConfig(
  { ignores: ['dist/', '.astro/', 'node_modules/', 'test-results/', 'reports/', '.stryker-tmp/'] },
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  {
    rules: {
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      'no-duplicate-imports': 'error',
      'no-nested-ternary': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['*.{js,mjs}', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    // Los componentes de UI y las pruebas E2E describen pantallas: se miden por complejidad, no por longitud.
    files: ['src/islands/**/*.tsx', 'tests/**/*.ts'],
    rules: { 'max-lines-per-function': ['error', { max: 120, skipBlankLines: true, skipComments: true }] },
  },
);
