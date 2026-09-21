// Geometría del reloj de sol (Reloj.astro). Pura y probada: la usan el servidor (líneas horarias) y el navegador (sombra y sol).

/** Centro y radios de la elipse del suelo, en coordenadas del SVG. */
export const SUELO = { cx: 200, cy: 226, rx: 184, ry: 36 } as const;
export const HORAS = Array.from({ length: 13 }, (_, i) => i + 6); // VI … XVIII

export interface Punto { x: number; y: number }

/** Ángulo del sol sobre el plano del suelo: 0 al amanecer (06:00), π al atardecer (18:00). */
const angulo = (hora: number) => (Math.PI * (hora - 6)) / 12;

export const esDeDia = (hora: number) => hora >= 6 && hora < 18;

/** Pasa de coordenadas del plano del suelo (u, v ∈ [-1, 1]) a coordenadas del SVG. */
export function aPantalla(u: number, v: number): Punto {
  return { x: SUELO.cx + SUELO.rx * u, y: SUELO.cy - SUELO.ry * v };
}

/** Punto sobre la línea horaria de `hora`, a una fracción `k` del borde. */
export function puntoHorario(hora: number, k = 1): Punto {
  const phi = angulo(hora);
  return aPantalla(k * Math.cos(phi), k * Math.sin(phi));
}

/** Largo relativo de la sombra: larga al amanecer y al atardecer, corta al mediodía (Colombia está casi en el ecuador). */
export function largoSombra(hora: number): number {
  return 0.28 + 0.72 * Math.abs(Math.cos(angulo(hora)));
}

/** Trapecio de la sombra: ancho de la columna en la base, un poco más angosto en la punta. */
export function sombra(hora: number, ancho = 0.075): Punto[] {
  const phi = angulo(hora);
  const [du, dv] = [Math.cos(phi), Math.sin(phi)];
  const [pu, pv] = [-dv, du];
  const k = largoSombra(hora);
  return [
    aPantalla(ancho * pu, ancho * pv),
    aPantalla(k * du + ancho * 0.7 * pu, k * dv + ancho * 0.7 * pv),
    aPantalla(k * du - ancho * 0.7 * pu, k * dv - ancho * 0.7 * pv),
    aPantalla(-ancho * pu, -ancho * pv),
  ];
}

/** Posición del sol en el cielo: opuesta a la sombra, alta al mediodía. */
export function sol(hora: number): Punto {
  const phi = angulo(hora);
  return { x: SUELO.cx - Math.cos(phi) * 170, y: 150 - Math.sin(phi) * 125 };
}

export const puntosSVG = (ps: Punto[]) => ps.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
