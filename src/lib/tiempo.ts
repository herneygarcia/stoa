// Hora civil de Colombia (zona America/Bogota, UTC−5 sin horario de verano). Única fuente de verdad.

export const ZONA = 'America/Bogota';

export type Momento = 'manana' | 'tarde' | 'noche';

/** Fecha civil (AAAA-MM-DD) en Colombia para un instante dado. */
export function fechaEnColombia(instante: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instante);
}

/** Hora decimal en Colombia (p. ej. 14.5 = 14:30). */
export function horaEnColombia(instante: Date = new Date()): number {
  const partes = new Intl.DateTimeFormat('en-GB', { timeZone: ZONA, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(instante);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value ?? 0);
  return valor('hour') + valor('minute') / 60;
}

/** Mañana 05–12 (preparación), tarde 12–18 (acción), noche 18–05 (examen). */
export function momentoDelDia(hora: number): Momento {
  if (hora >= 5 && hora < 12) return 'manana';
  if (hora >= 12 && hora < 18) return 'tarde';
  return 'noche';
}

/** "08:05" a partir de una hora decimal. */
export function formatoHora(hora: number): string {
  const total = Math.round(hora * 60);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${dos(Math.floor(total / 60) % 24)}:${dos(total % 60)}`;
}
