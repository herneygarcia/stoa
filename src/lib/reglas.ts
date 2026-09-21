// Reglas deterministas del arnés. Las usan el validador de contenido y la rúbrica del caso diario.
import { casoSchema, contarPalabras, type Caso } from './schemas.ts';

export const TERMINOS_PROHIBIDOS = [
  'mindset', 'hackea', 'hack', 'mejor versión de ti', 'vibras', 'energía positiva', 'manifestar',
  'diagnóstico de', 'te diagnostico', 'medicación recomendada', 'deja tu tratamiento',
];

// Temas que exigen derivación a ayuda profesional (constitución II.2).
export const TEMAS_SENSIBLES = /suicid|quitarme la vida|autolesi|hacerse daño|hacerme daño|violencia (doméstica|intrafamiliar)|abuso sexual|maltrato|murió|muerte de|duelo|deprimid|depresión|infidelidad/i;
export const DERIVACION = /profesional|línea 106|línea 192|ayuda de inmediato/i;

const ATRIBUCION_TEXTUAL = /(Epicteto|Marco Aurelio|Séneca|Musonio|Zenón|Crisipo)[^.;]{0,30}:\s*[«"“]/;
const INGLES = /(?<!\p{L})(the|and|you|your|[a-z]+ing)(?!\p{L})/u;

export interface Contexto {
  citas: Set<string>;
  /** Títulos de casos anteriores (para evitar repeticiones). */
  titulosPrevios?: string[];
}

const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim();

export function reglasCaso(entrada: unknown, ctx: Contexto): string[] {
  const r = casoSchema.safeParse(entrada);
  if (!r.success) return r.error.issues.map((i) => `${i.path.join('.') || 'caso'}: ${i.message}`);
  const c: Caso = r.data;
  const errores: string[] = [];
  const texto = [c.titulo, c.situacion, c.respuesta, c.pregunta, ...c.depende, ...c.noDepende].join(' ');

  if (!ctx.citas.has(c.cita)) errores.push(`cita: "${c.cita}" no existe en el corpus`);

  const lower = texto.toLowerCase();
  for (const t of TERMINOS_PROHIBIDOS) if (lower.includes(t)) errores.push(`lenguaje: término prohibido "${t}"`);

  if ((c.ayuda || TEMAS_SENSIBLES.test(c.situacion)) && !DERIVACION.test(c.respuesta)) {
    errores.push('cuidado: tema sensible sin derivación a ayuda profesional en la mirada estoica');
  }
  if (TEMAS_SENSIBLES.test(c.situacion) && !c.ayuda) errores.push('cuidado: tema sensible sin marcar "ayuda: true"');

  // Una cita textual atribuida ("Séneca: «…»") solo puede venir del corpus, vía el campo "cita".
  if (ATRIBUCION_TEXTUAL.test(c.respuesta)) errores.push('fuentes: cita textual atribuida en la mirada estoica; parafrasea y usa el campo "cita"');

  if (INGLES.test(lower)) errores.push('idioma: parece haber texto en inglés');

  const t = normalizar(c.titulo);
  if (ctx.titulosPrevios?.some((p) => normalizar(p) === t)) errores.push('repetición: ya existe un caso con ese título');

  if (contarPalabras(c.situacion) + contarPalabras(c.respuesta) > 340) errores.push('longitud: el caso completo supera 340 palabras');
  return errores;
}
