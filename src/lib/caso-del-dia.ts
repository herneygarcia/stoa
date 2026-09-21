// Selección determinista del caso del día (CA-002.1, CA-002.2). Lógica pura: sin Astro.

const ZONA = 'America/Bogota';

/** Fecha civil (AAAA-MM-DD) en Bogotá para un instante dado. */
export function fechaEnBogota(instante: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instante);
}

/** Días transcurridos desde 1970-01-01 para una fecha AAAA-MM-DD. */
export function diaNumero(fecha: string): number {
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

export interface ConId { id: string }
export interface ConFecha extends ConId { fecha?: Date }

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
