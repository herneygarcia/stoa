// Contexto del pipeline diario: todo lo que el modelo puede usar sale del contenido del repo.
import { basename } from 'node:path';
import type { Cita } from '../../src/lib/schemas.ts';
import { archivosMd, frontmatter, leerCitasCrudas } from '../contenido.ts';

export interface Contexto {
  citas: Cita[];
  principios: { id: string; titulo: string; resumen: string }[];
  virtudes: { id: string; titulo: string; resumen: string }[];
  titulos: string[];
  recientes: string[];
}

export function cargarContexto(): Contexto {
  const citas = leerCitasCrudas() as Cita[];
  const leer = (carpeta: string) =>
    archivosMd(carpeta).map((p) => {
      const d = frontmatter(p);
      return { id: basename(p, '.md'), titulo: String(d.titulo), resumen: String(d.resumen) };
    });
  const casos = archivosMd('casos').map((p) => ({ p, d: frontmatter(p) }));
  const diarios = casos.filter((c) => c.p.includes('/diarios/')).sort((a, b) => b.p.localeCompare(a.p));
  return {
    citas,
    principios: leer('principios'),
    virtudes: leer('virtudes'),
    titulos: casos.map((c) => String(c.d.titulo)),
    recientes: diarios.slice(0, 14).map((c) => String(c.d.titulo)),
  };
}
