// Lectura del contenido del repo, compartida por el validador y el pipeline diario.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export const RAIZ = 'src/content';

/** Rutas de todos los .md bajo `src/content/<carpeta>`, recorriendo subcarpetas, en orden estable. */
export const archivosMd = (carpeta: string): string[] =>
  readdirSync(join(RAIZ, carpeta), { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => join(RAIZ, carpeta, f));

export const frontmatter = (ruta: string): Record<string, unknown> => matter(readFileSync(ruta, 'utf8')).data;

export const leerCitasCrudas = (): unknown[] => JSON.parse(readFileSync(join(RAIZ, 'citas/citas.json'), 'utf8'));
