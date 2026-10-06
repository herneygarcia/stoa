import { describe, expect, it } from 'vitest';
import { elegirCaso, indiceBanco, ambitoDelDia, sumarDias, calendarioCasos, fechaVisible } from '../../src/lib/caso-del-dia';
import { fechaEnColombia } from '../../src/lib/tiempo';

const banco = Array.from({ length: 90 }, (_, i) => ({ id: `banco/c${String(i).padStart(2, '0')}` }));
const sumar = sumarDias;

describe('CA-002.1 caso del día', () => {
  it('usa la hora civil de Colombia (UTC-5)', () => {
    expect(fechaEnColombia(new Date('2026-09-22T03:00:00Z'))).toBe('2026-09-21');
    expect(fechaEnColombia(new Date('2026-09-22T05:00:00Z'))).toBe('2026-09-22');
  });
  it('prefiere el caso diario con la fecha de hoy', () => {
    const diario = { id: 'diarios/2026-09-21', fecha: new Date('2026-09-21') };
    expect(elegirCaso('2026-09-21', [...banco, diario])).toBe(diario);
  });
  it('sin caso diario, elige del banco de forma determinista', () => {
    const a = elegirCaso('2026-09-21', banco);
    expect(elegirCaso('2026-09-21', [...banco].reverse())).toEqual(a);
    expect(a.id.startsWith('banco/')).toBe(true);
  });
});

describe('CA-002.2 sin repeticiones', () => {
  it('dos días consecutivos nunca repiten caso', () => {
    let f = '2026-01-01';
    for (let i = 0; i < 800; i++, f = sumar(f, 1)) expect(indiceBanco(f, 90)).not.toBe(indiceBanco(sumar(f, 1), 90));
  });
  it('recorre todo el banco en n días', () => {
    const vistos = new Set(Array.from({ length: 90 }, (_, i) => indiceBanco(sumar('2026-03-01', i), 90)));
    expect(vistos.size).toBe(90);
  });
  it('rota ámbitos para la generación diaria', () => {
    expect(ambitoDelDia('2026-09-21', ['a', 'b'])).not.toBe(ambitoDelDia('2026-09-22', ['a', 'b']));
  });
});

describe('caso del día: casos límite', () => {
  it('un banco vacío es un error explícito', () => expect(() => indiceBanco('2026-09-21', 0)).toThrow('Banco vacío'));
  it('un diario de otra fecha no se muestra ni cuenta como banco', () => {
    const otro = { id: 'diarios/2026-09-20', fecha: new Date('2026-09-20') };
    const elegido = elegirCaso('2026-09-21', [...banco, otro]);
    expect(elegido).toEqual(elegirCaso('2026-09-21', banco));
  });
  it.each([1, 2, 3, 7, 10, 50, 89, 91])('con %i casos recorre todo el banco sin repetir', (n) => {
    const vistos = new Set(Array.from({ length: n }, (_, i) => indiceBanco(sumar('2026-01-01', i), n)));
    expect(vistos.size).toBe(n);
  });
  it('días consecutivos no toman casos vecinos del banco (vecinos = mismo ámbito)', () => {
    let f = '2026-01-01';
    for (let i = 0; i < 365; i++, f = sumar(f, 1)) {
      const salto = Math.abs(indiceBanco(f, 90) - indiceBanco(sumar(f, 1), 90));
      expect(Math.min(salto, 90 - salto)).toBeGreaterThan(9);
    }
  });
  it('funciona con fechas anteriores a 1970', () => {
    const i = indiceBanco('1969-12-31', 90);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(90);
    expect(['a', 'b', 'c']).toContain(ambitoDelDia('1969-12-30', ['a', 'b', 'c']));
  });
  it('la rotación de ámbitos recorre todos en orden', () =>
    expect(Array.from({ length: 3 }, (_, i) => ambitoDelDia(sumar('2026-01-01', i), ['a', 'b', 'c'])).sort()).toEqual(['a', 'b', 'c']));
});

describe('CA-002.8 el día lo decide el dispositivo, no el build', () => {
  it('suma días cruzando meses, años y 1970', () => {
    expect(sumarDias('2026-10-05', 1)).toBe('2026-10-06');
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarDias('2028-02-28', 1)).toBe('2028-02-29');
    expect(sumarDias('1970-01-01', -1)).toBe('1969-12-31');
    expect(sumarDias('2026-10-05', 0)).toBe('2026-10-05');
  });
  it('el calendario cubre días seguidos con el caso de cada uno', () => {
    const diario = { id: 'diarios/2026-10-06', fecha: new Date('2026-10-06') };
    const cal = calendarioCasos('2026-10-05', 3, [...banco, diario]);
    expect(cal.map((d) => d.fecha)).toEqual(['2026-10-05', '2026-10-06', '2026-10-07']);
    expect(cal[0].caso).toEqual(elegirCaso('2026-10-05', banco));
    expect(cal[1].caso).toBe(diario);
    expect(cal[2].caso).not.toEqual(cal[0].caso);
  });
  const fechas = ['2026-10-07', '2026-10-05', '2026-10-06'];
  it.each([
    ['2026-10-05', '2026-10-05'],
    ['2026-10-06', '2026-10-06'],
    ['2026-10-07', '2026-10-07'],
    ['2026-10-09', '2026-10-07'],
    ['2026-10-04', '2026-10-05'],
  ])('hoy %s muestra %s', (hoy, esperado) => expect(fechaVisible(hoy, fechas)).toBe(esperado));
  it('sin días no hay nada que mostrar', () => expect(fechaVisible('2026-10-05', [])).toBeUndefined());
});
