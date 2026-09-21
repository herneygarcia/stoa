import { describe, expect, it } from 'vitest';
import { SUELO, HORAS, aPantalla, esDeDia, largoSombra, puntoHorario, puntosSVG, sol, sombra } from '../../src/lib/reloj';

const cerca = (a: number, b: number) => expect(a).toBeCloseTo(b, 6);

describe('reloj de sol', () => {
  it('trece líneas horarias, de VI a XVIII', () => expect([HORAS[0], HORAS.at(-1), HORAS.length]).toEqual([6, 18, 13]));
  it('el plano del suelo se proyecta sobre la elipse', () => {
    expect(aPantalla(0, 0)).toEqual({ x: SUELO.cx, y: SUELO.cy });
    expect(aPantalla(1, 1)).toEqual({ x: SUELO.cx + SUELO.rx, y: SUELO.cy - SUELO.ry });
  });
  it('las 6, 12 y 18 caen a la derecha, al fondo y a la izquierda', () => {
    const [seis, doce, dieciocho] = [6, 12, 18].map((h) => puntoHorario(h));
    cerca(seis.x, SUELO.cx + SUELO.rx); cerca(seis.y, SUELO.cy);
    cerca(doce.x, SUELO.cx); cerca(doce.y, SUELO.cy - SUELO.ry);
    cerca(dieciocho.x, SUELO.cx - SUELO.rx); cerca(dieciocho.y, SUELO.cy);
    cerca(puntoHorario(12, 0.5).y, SUELO.cy - SUELO.ry / 2);
  });
  it('la sombra es larga al amanecer y al atardecer, corta al mediodía', () => {
    cerca(largoSombra(6), 1);
    cerca(largoSombra(18), 1);
    cerca(largoSombra(12), 0.28);
    expect(largoSombra(9)).toBeGreaterThan(largoSombra(11));
  });
  it('la sombra es un trapecio que apunta lejos del sol', () => {
    const [b1, p1, p2, b2] = sombra(7);
    expect(sombra(7)).toHaveLength(4);
    expect((p1.x + p2.x) / 2).toBeGreaterThan(SUELO.cx + 100); // por la mañana apunta al oeste (derecha)
    expect(Math.hypot(p1.x - p2.x, p1.y - p2.y)).toBeLessThan(Math.hypot(b1.x - b2.x, b1.y - b2.y));
    expect((sombra(17)[1].x + sombra(17)[2].x) / 2).toBeLessThan(SUELO.cx - 100);
  });
  it('geometría exacta del trapecio al amanecer y al mediodía', () => {
    const esperado = (uv: [number, number][]) => uv.map(([u, v]) => aPantalla(u, v));
    const comparar = (a: { x: number; y: number }[], b: { x: number; y: number }[]) => a.forEach((p, i) => { cerca(p.x, b[i].x); cerca(p.y, b[i].y); });
    comparar(sombra(6), esperado([[0, 0.075], [1, 0.0525], [1, -0.0525], [0, -0.075]]));
    comparar(sombra(12), esperado([[-0.075, 0], [-0.0525, 0.28], [0.0525, 0.28], [0.075, 0]]));
    comparar(sombra(12, 0.1), esperado([[-0.1, 0], [-0.07, 0.28], [0.07, 0.28], [0.1, 0]]));
  });
  it('el sol sale por la izquierda, sube al mediodía y se pone por la derecha', () => {
    cerca(sol(6).x, SUELO.cx - 170); cerca(sol(6).y, 150);
    cerca(sol(12).x, SUELO.cx); cerca(sol(12).y, 25);
    cerca(sol(18).x, SUELO.cx + 170);
  });
  it.each([[5.99, false], [6, true], [17.99, true], [18, false]])('%s h es de día: %s', (h, d) => expect(esDeDia(h)).toBe(d));
  it('formatea los puntos para el atributo SVG', () => expect(puntosSVG([{ x: 1, y: 2.25 }, { x: 3.04, y: 4 }])).toBe('1.0,2.3 3.0,4.0'));
});
