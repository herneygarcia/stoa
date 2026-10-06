// Selección determinista del caso del día (CA-002.1, CA-002.2). Lógica pura: sin Astro.

/** Días transcurridos desde 1970-01-01 para una fecha AAAA-MM-DD. */
function diaNumero(fecha: string): number {
  return Math.floor(Date.parse(`${fecha}T00:00:00Z`) / 86_400_000);
}

/** Paso coprimo con n para recorrer el banco sin repetir y alternando ámbitos. */
function paso(n: number): number {
  let p = Math.max(1, Math.floor(n * 0.618));
  const mcd = (a: number, b: number): number => (b ? mcd(b, a % b) : a);
  while (mcd(p, n) !== 1) p++;
  return p;
}

/** Índice del banco para una fecha: recorre los n casos en n días consecutivos sin repetir. */
export function indiceBanco(fecha: string, n: number): number {
  if (n <= 0) throw new Error('Banco vacío');
  const d = diaNumero(fecha);
  return (((d * paso(n)) % n) + n) % n;
}

export interface ConFecha { id: string; fecha?: Date }

export function elegirCaso<T extends ConFecha>(fecha: string, casos: T[]): T {
  const diario = casos.find((c) => c.fecha && c.fecha.toISOString().slice(0, 10) === fecha);
  if (diario) return diario;
  const banco = casos.filter((c) => !c.fecha).sort((a, b) => a.id.localeCompare(b.id));
  return banco[indiceBanco(fecha, banco.length)];
}

/** Ámbito sugerido para el caso generado de un día (rotación simple). */
export function ambitoDelDia<T extends string>(fecha: string, ambitos: readonly T[]): T {
  return ambitos[((diaNumero(fecha) % ambitos.length) + ambitos.length) % ambitos.length];
}

/** Fecha AAAA-MM-DD desplazada n días. */
export function sumarDias(fecha: string, n: number): string {
  return new Date((diaNumero(fecha) + n) * 86_400_000).toISOString().slice(0, 10);
}

/** Casos de `dias` días seguidos desde `desde` (CA-002.8: el build cubre los días siguientes). */
export function calendarioCasos<T extends ConFecha>(desde: string, dias: number, casos: T[]): { fecha: string; caso: T }[] {
  return Array.from({ length: dias }, (_, i) => {
    const fecha = sumarDias(desde, i);
    return { fecha, caso: elegirCaso(fecha, casos) };
  });
}

/** Día del calendario que se muestra hoy: el último ≤ hoy; si hoy es anterior a todos, el primero. */
export function fechaVisible(hoy: string, fechas: string[]): string | undefined {
  const ordenadas = [...fechas].sort();
  return ordenadas.filter((f) => f <= hoy).at(-1) ?? ordenadas[0];
}
