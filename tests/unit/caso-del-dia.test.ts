import { describe, expect, it } from 'vitest';
import { elegirCaso, fechaEnBogota, indiceBanco, ambitoDelDia } from '../../src/lib/caso-del-dia';

const banco = Array.from({ length: 90 }, (_, i) => ({ id: `banco/c${String(i).padStart(2, '0')}` }));
const sumar = (f: string, d: number) => new Date(Date.parse(`${f}T00:00:00Z`) + d * 86_400_000).toISOString().slice(0, 10);

describe('CA-002.1 caso del día', () => {
  it('usa la zona horaria de Bogotá (UTC-5)', () => {
    expect(fechaEnBogota(new Date('2026-09-22T03:00:00Z'))).toBe('2026-09-21');
    expect(fechaEnBogota(new Date('2026-09-22T05:00:00Z'))).toBe('2026-09-22');
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
