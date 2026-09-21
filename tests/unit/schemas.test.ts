import { describe, expect, it } from 'vitest';
import {
  AMBITOS, PRINCIPIOS, VIRTUDES, casoSchema, citaSchema, contarPalabras, describirErrores,
  practicaSchema, principioSchema, virtudSchema,
} from '../../src/lib/schemas';

const palabras = (n: number) => Array.from({ length: n }, () => 'camino').join(' ');
const caso = {
  titulo: 'Un caso de prueba', ambito: 'trabajo', principio: 'amor-fati', virtud: 'coraje',
  situacion: palabras(60), depende: ['a', 'b'], noDepende: ['c', 'd'], respuesta: palabras(120),
  pregunta: '¿Qué depende de ti?', cita: 'enq-1',
};
const valido = (s: { safeParse: (x: unknown) => { success: boolean } }, x: unknown) => s.safeParse(x).success;

describe('contarPalabras', () => {
  it('cuenta palabras separadas por cualquier espacio', () => expect(contarPalabras('  hola \n mundo\tbello  ')).toBe(3));
  it('un texto vacío tiene cero palabras', () => expect(contarPalabras('   ')).toBe(0));
});

describe('CA-002.3 contrato del caso', () => {
  it('acepta el caso base y aplica valores por defecto', () => {
    const r = casoSchema.parse(caso);
    expect(r.origen).toBe('curado');
    expect(r.ayuda).toBe(false);
  });
  it.each([[39, false], [40, true], [140, true], [141, false]])('situación de %i palabras → válida: %s', (n, ok) =>
    expect(valido(casoSchema, { ...caso, situacion: palabras(n) })).toBe(ok));
  it.each([[79, false], [80, true], [220, true], [221, false]])('mirada estoica de %i palabras → válida: %s', (n, ok) =>
    expect(valido(casoSchema, { ...caso, respuesta: palabras(n) })).toBe(ok));
  it.each([[1, false], [2, true], [5, true], [6, false]])('%i elementos en cada lado → válido: %s', (n, ok) => {
    const lista = Array.from({ length: n }, (_, i) => `x${i}`);
    expect(valido(casoSchema, { ...caso, depende: lista })).toBe(ok);
    expect(valido(casoSchema, { ...caso, noDepende: lista })).toBe(ok);
  });
  it.each([['abc', false], ['abcd', true], ['x'.repeat(80), true], ['x'.repeat(81), false]])('título "%s…" → válido: %s', (t, ok) =>
    expect(valido(casoSchema, { ...caso, titulo: t })).toBe(ok));
  it('la pregunta termina en signo de interrogación', () => expect(valido(casoSchema, { ...caso, pregunta: 'Piensa en esto.' })).toBe(false));
  it('convierte la fecha a Date', () => expect(casoSchema.parse({ ...caso, fecha: '2026-09-21' }).fecha).toBeInstanceOf(Date));
  it('solo acepta orígenes conocidos', () => {
    expect(casoSchema.parse({ ...caso, origen: 'ia' }).origen).toBe('ia');
    expect(valido(casoSchema, { ...caso, origen: 'otro' })).toBe(false);
  });
});

describe('vocabulario cerrado (specs 001 y 002)', () => {
  it('nueve ámbitos de la vida', () => expect([...AMBITOS]).toEqual(['trabajo', 'familia', 'pareja', 'amistad', 'dinero', 'salud', 'estudio', 'redes', 'ciudad']));
  it('siete principios', () => expect([...PRINCIPIOS]).toEqual(['dicotomia-del-control', 'vivir-segun-la-naturaleza', 'amor-fati', 'apatheia', 'cosmopolitismo', 'premeditatio-malorum', 'los-indiferentes']));
  it('cuatro virtudes', () => expect([...VIRTUDES]).toEqual(['sabiduria', 'coraje', 'justicia', 'templanza']));
  it('rechaza valores fuera del vocabulario', () => {
    expect(valido(casoSchema, { ...caso, ambito: 'deporte' })).toBe(false);
    expect(valido(casoSchema, { ...caso, principio: 'estoicismo' })).toBe(false);
    expect(valido(casoSchema, { ...caso, virtud: 'paciencia' })).toBe(false);
  });
});

describe('CA-001.4 corpus de citas', () => {
  const cita = { id: 'enq-1', autor: 'Epicteto', obra: 'Enquiridión', referencia: '1.1', texto: 'Un texto suficientemente largo.' };
  it('acepta una cita y marca "cita" por defecto', () => expect(citaSchema.parse(cita).tipo).toBe('cita'));
  it.each(['Enq-1', 'enq 1', 'enq_1', ''])('rechaza el id "%s"', (id) => expect(valido(citaSchema, { ...cita, id })).toBe(false));
  it.each(['Epicteto', 'Marco Aurelio', 'Séneca', 'Musonio Rufo', 'Diógenes Laercio', 'Crisipo'])('acepta al autor %s', (autor) =>
    expect(valido(citaSchema, { ...cita, autor })).toBe(true));
  it('rechaza autores que no son estoicos del corpus', () => expect(valido(citaSchema, { ...cita, autor: 'Platón' })).toBe(false));
  it('rechaza textos de menos de 10 caracteres', () => expect(valido(citaSchema, { ...cita, texto: 'Breve.' })).toBe(false));
  it('distingue cita de paráfrasis', () => {
    expect(citaSchema.parse({ ...cita, tipo: 'paráfrasis' }).tipo).toBe('paráfrasis');
    expect(valido(citaSchema, { ...cita, tipo: 'resumen' })).toBe(false);
  });
});

describe('CA-001.1 / CA-001.3 principios, virtudes y prácticas', () => {
  const principio = { titulo: 't', termino: 't', orden: 1, resumen: palabras(30), ejemplo: 'e', citas: ['enq-1'] };
  it('resumen de hasta 30 palabras', () => {
    expect(principioSchema.parse(principio).practicas).toEqual([]);
    expect(valido(principioSchema, { ...principio, resumen: palabras(31) })).toBe(false);
  });
  it('cada principio cita al menos una fuente y tiene orden ≥ 1', () => {
    expect(valido(principioSchema, { ...principio, citas: [] })).toBe(false);
    expect(valido(principioSchema, { ...principio, orden: 0 })).toBe(false);
  });
  const virtud = { titulo: 't', termino: 't', orden: 1, resumen: 'r', vicio: 'v', ejemplo: 'e', papel: 'p', citas: ['enq-1'] };
  it.each([[0, false], [1, true], [4, true], [5, false]])('virtud en orden %i → válida: %s', (orden, ok) =>
    expect(valido(virtudSchema, { ...virtud, orden })).toBe(ok));
  it('virtud sin citas no es válida', () => expect(valido(virtudSchema, { ...virtud, citas: [] })).toBe(false));
  const practica = { titulo: 't', momento: 'noche', duracionMin: 5, resumen: 'r', pasos: ['a', 'b'], cita: 'enq-1', orden: 1 };
  it.each([[0, false], [1, true], [30, true], [31, false]])('práctica de %i min → válida: %s', (duracionMin, ok) =>
    expect(valido(practicaSchema, { ...practica, duracionMin })).toBe(ok));
  it('práctica con al menos dos pasos y momento conocido', () => {
    expect(valido(practicaSchema, { ...practica, pasos: ['uno'] })).toBe(false);
    expect(valido(practicaSchema, { ...practica, momento: 'madrugada' })).toBe(false);
    expect(['mañana', 'noche', 'cualquiera'].every((momento) => valido(practicaSchema, { ...practica, momento }))).toBe(true);
  });
  it('solo tres prácticas interactivas conocidas', () => {
    expect(['circulo', 'termometro', 'examen'].every((interactiva) => valido(practicaSchema, { ...practica, interactiva }))).toBe(true);
    expect(valido(practicaSchema, { ...practica, interactiva: 'juego' })).toBe(false);
  });
});

describe('mensajes de error legibles para quien escribe contenido', () => {
  const mensajes = (x: unknown) => { const r = casoSchema.safeParse(x); return r.success ? [] : describirErrores(r.error); };
  it('situación y mirada estoica dicen el rango permitido', () => {
    expect(mensajes({ ...caso, situacion: 'corta' })).toContain('situacion: La situación debe tener 40–140 palabras');
    expect(mensajes({ ...caso, respuesta: 'corta' })).toContain('respuesta: La mirada estoica debe tener 80–220 palabras');
  });
  it('el resumen del principio dice su límite', () => {
    const r = principioSchema.safeParse({ titulo: 't', termino: 't', orden: 1, resumen: palabras(31), ejemplo: 'e', citas: ['x'] });
    if (!r.success) expect(describirErrores(r.error)).toContain('resumen: El resumen debe tener ≤ 30 palabras');
    expect(r.success).toBe(false);
  });
});

describe('describirErrores', () => {
  it('nombra el campo, o "caso" si el problema es del objeto entero', () => {
    const r = casoSchema.safeParse({ ...caso, pregunta: 'sin signo' });
    expect(r.success).toBe(false);
    if (!r.success) expect(describirErrores(r.error)[0]).toMatch(/^pregunta: /);
    const vacio = casoSchema.safeParse(null);
    if (!vacio.success) expect(describirErrores(vacio.error)[0]).toMatch(/^caso: /);
  });
});
