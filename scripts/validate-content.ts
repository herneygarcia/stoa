// Arnés de contenido (CA-001.4, CA-002.3): valida todo src/content contra el contrato y las reglas.
import { basename } from 'node:path';
import { citaSchema, principioSchema, virtudSchema, practicaSchema, describirErrores } from '../src/lib/schemas.ts';
import { reglasCaso } from '../src/lib/reglas.ts';
import { archivosMd, frontmatter as leer, leerCitasCrudas } from './contenido.ts';

const errores: string[] = [];
const err = (archivo: string, msg: string) => errores.push(`✗ ${archivo}: ${msg}`);


// Citas
const crudo = leerCitasCrudas();
const citas = new Set<string>();
for (const c of crudo) {
  const r = citaSchema.safeParse(c);
  if (!r.success) { err('citas.json', describirErrores(r.error).join('; ')); continue; }
  if (citas.has(r.data.id)) err('citas.json', `id duplicado ${r.data.id}`);
  citas.add(r.data.id);
}
const exigeCita = (archivo: string, id: string) => { if (!citas.has(id)) err(archivo, `cita "${id}" no está en el corpus`); };

// Prácticas
const practicas = new Set<string>();
for (const p of archivosMd('practicas')) {
  const r = practicaSchema.safeParse(leer(p));
  if (!r.success) { err(p, describirErrores(r.error).join('; ')); continue; }
  practicas.add(basename(p, '.md'));
  exigeCita(p, r.data.cita);
}

// Principios y virtudes
const principios = archivosMd('principios');
if (principios.length !== 7) err('principios', `se esperaban 7 principios, hay ${principios.length}`);
for (const p of principios) {
  const r = principioSchema.safeParse(leer(p));
  if (!r.success) { err(p, describirErrores(r.error).join('; ')); continue; }
  r.data.citas.forEach((c) => exigeCita(p, c));
  r.data.practicas.forEach((s) => { if (!practicas.has(s)) err(p, `práctica "${s}" no existe`); });
}
const virtudes = archivosMd('virtudes');
if (virtudes.length !== 4) err('virtudes', `se esperaban 4 virtudes, hay ${virtudes.length}`);
for (const p of virtudes) {
  const r = virtudSchema.safeParse(leer(p));
  if (!r.success) { err(p, describirErrores(r.error).join('; ')); continue; }
  r.data.citas.forEach((c) => exigeCita(p, c));
}

// Casos (banco + diarios)
const titulos: string[] = [];
const casos = archivosMd('casos');
for (const p of casos) {
  const data = leer(p);
  reglasCaso(data, { citas, titulosPrevios: titulos }).forEach((e) => err(p, e));
  titulos.push(String(data.titulo));
  if (p.includes('/diarios/')) {
    const fecha = data.fecha instanceof Date ? data.fecha.toISOString().slice(0, 10) : String(data.fecha);
    if (basename(p, '.md') !== fecha) err(p, `el nombre del archivo debe ser la fecha (${fecha})`);
  }
}

if (errores.length) {
  console.error(errores.join('\n'));
  console.error(`\n${errores.length} problema(s) de contenido.`);
  process.exit(1);
}
console.log(`✓ Contenido válido: ${citas.size} citas, ${principios.length} principios, ${virtudes.length} virtudes, ${practicas.size} prácticas, ${casos.length} casos.`);
