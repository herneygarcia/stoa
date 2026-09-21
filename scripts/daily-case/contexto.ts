// Contexto del pipeline diario: todo lo que el modelo puede usar sale del contenido del repo.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { Cita } from '../../src/lib/schemas.ts';

const RAIZ = 'src/content';
const md = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? md(p) : p.endsWith('.md') ? [p] : [];
  });

export interface Contexto {
  citas: Cita[];
  principios: { id: string; titulo: string; resumen: string }[];
  virtudes: { id: string; titulo: string; resumen: string }[];
  titulos: string[];
  recientes: string[];
}

export function cargarContexto(): Contexto {
  const citas = JSON.parse(readFileSync(join(RAIZ, 'citas/citas.json'), 'utf8')) as Cita[];
  const leer = (dir: string) =>
    md(join(RAIZ, dir)).map((p) => {
      const d = matter(readFileSync(p, 'utf8')).data;
      return { id: p.split('/').pop()!.replace(/\.md$/, ''), titulo: String(d.titulo), resumen: String(d.resumen) };
    });
  const casos = md(join(RAIZ, 'casos')).map((p) => ({ p, d: matter(readFileSync(p, 'utf8')).data }));
  const diarios = casos.filter((c) => c.p.includes('/diarios/')).sort((a, b) => b.p.localeCompare(a.p));
  return {
    citas,
    principios: leer('principios'),
    virtudes: leer('virtudes'),
    titulos: casos.map((c) => String(c.d.titulo)),
    recientes: diarios.slice(0, 14).map((c) => String(c.d.titulo)),
  };
}
