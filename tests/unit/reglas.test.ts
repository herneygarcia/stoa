import { describe, expect, it } from 'vitest';
import { reglasCaso, normalizar, DERIVACION } from '../../src/lib/reglas';

const palabras = (n: number) => Array.from({ length: n }, (_, i) => (i % 7 === 0 ? 'hoy' : 'camino')).join(' ');
const base = {
  titulo: 'Un caso de prueba', ambito: 'trabajo', principio: 'dicotomia-del-control', virtud: 'sabiduria',
  situacion: palabras(60), depende: ['a', 'b'], noDepende: ['c', 'd'], respuesta: palabras(120),
  pregunta: '¿Qué depende de ti?', cita: 'enq-1',
};
const ctx = { citas: new Set(['enq-1']) };

describe('CA-002.3 / CA-001.4 reglas deterministas', () => {
  it('acepta un caso válido', () => expect(reglasCaso(base, ctx)).toEqual([]));
  it('rechaza citas fuera del corpus', () => expect(reglasCaso({ ...base, cita: 'inventada' }, ctx).join()).toMatch(/corpus/));
  it('rechaza longitudes fuera de rango', () => expect(reglasCaso({ ...base, situacion: 'muy corta' }, ctx).join()).toMatch(/situacion/));
  it('exige al menos dos elementos por lado', () => expect(reglasCaso({ ...base, depende: ['solo uno'] }, ctx).length).toBeGreaterThan(0));
  it('rechaza jerga de autoayuda', () => expect(reglasCaso({ ...base, respuesta: `${palabras(100)} cambia tu mindset` }, ctx).join()).toMatch(/mindset/));
  it('rechaza texto en inglés', () => expect(reglasCaso({ ...base, respuesta: `${palabras(100)} and the thing` }, ctx).join()).toMatch(/inglés/));
  it('no confunde palabras con tilde con inglés', () => expect(reglasCaso({ ...base, respuesta: `${palabras(100)} ningún camino` }, ctx)).toEqual([]));
  it('rechaza citas textuales atribuidas fuera del campo cita', () =>
    expect(reglasCaso({ ...base, respuesta: `${palabras(100)} Séneca escribió: «algo inventado»` }, ctx).join()).toMatch(/fuentes/));
  it('rechaza títulos repetidos', () => expect(reglasCaso(base, { ...ctx, titulosPrevios: ['Un caso de prueba'] }).join()).toMatch(/repetición/));
});

describe('CA-002.5 temas sensibles', () => {
  const sensible = { ...base, situacion: `${palabras(50)} desde que murió su madre no duerme` };
  it('exige marcar ayuda y derivar a un profesional', () => {
    const e = reglasCaso(sensible, ctx).join();
    expect(e).toMatch(/ayuda: true/);
    expect(e).toMatch(/derivación/);
  });
  it('acepta el caso sensible con derivación', () => {
    expect(reglasCaso({ ...sensible, ayuda: true, respuesta: `${palabras(100)} busca apoyo profesional` }, ctx)).toEqual([]);
  });
});

describe('reglas: casos límite', () => {
  it('normaliza títulos sin tildes, signos ni mayúsculas', () => expect(normalizar('¡El Trancón, otra vez!')).toBe('el trancon otra vez'));
  it('detecta repetición aunque cambien tildes o mayúsculas', () =>
    expect(reglasCaso(base, { ...ctx, titulosPrevios: ['UN CASO DE PRUEBA!'] }).join()).toMatch(/repetición/));
  it('detecta repetición entre varios títulos previos', () =>
    expect(reglasCaso(base, { ...ctx, titulosPrevios: ['Otro caso', 'Un caso de prueba'] }).join()).toMatch(/repetición/));
  it('detecta la cita atribuida sin espacio antes de las comillas', () =>
    expect(reglasCaso({ ...base, respuesta: `${palabras(100)} Séneca:«algo inventado»` }, ctx).join()).toMatch(/fuentes/));
  it('no marca repetición si el título es distinto', () => expect(reglasCaso(base, { ...ctx, titulosPrevios: ['Otro caso'] })).toEqual([]));
  it('340 palabras en total es el máximo permitido', () => {
    expect(reglasCaso({ ...base, situacion: palabras(140), respuesta: palabras(200) }, ctx)).toEqual([]);
    expect(reglasCaso({ ...base, situacion: palabras(140), respuesta: palabras(201) }, ctx).join()).toMatch(/340/);
  });
  it('lista cada término prohibido encontrado', () =>
    expect(reglasCaso({ ...base, respuesta: `${palabras(100)} vibras y hackear` }, ctx).filter((e) => e.startsWith('lenguaje'))).toHaveLength(2));
  it('marcar ayuda obliga a derivar, aunque el tema no parezca sensible', () =>
    expect(reglasCaso({ ...base, ayuda: true }, ctx).join()).toMatch(/derivación/));
  it('no confunde nombres propios con inglés', () => expect(reglasCaso({ ...base, respuesta: `${palabras(100)} Fernando y Rolando` }, ctx)).toEqual([]));
  it('detecta palabras en inglés terminadas en -ing', () => expect(reglasCaso({ ...base, respuesta: `${palabras(100)} running` }, ctx).join()).toMatch(/inglés/));
  it('permite parafrasear a un autor sin comillas', () =>
    expect(reglasCaso({ ...base, respuesta: `${palabras(100)} Séneca escribió que la demora cura la ira.` }, ctx)).toEqual([]));
  it('detecta la cita atribuida también con comillas rectas', () =>
    expect(reglasCaso({ ...base, respuesta: `${palabras(100)} Marco Aurelio: "algo inventado"` }, ctx).join()).toMatch(/fuentes/));
  it('la derivación reconoce la Línea 192 y el apoyo profesional', () => {
    expect(DERIVACION.test('llama a la Línea 192')).toBe(true);
    expect(DERIVACION.test('busca apoyo profesional')).toBe(true);
    expect(DERIVACION.test('habla con un amigo')).toBe(false);
  });
});
