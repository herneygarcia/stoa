// Reglas deterministas del arnés. Las usan el validador de contenido y la rúbrica del caso diario.
// Cada regla es una función pequeña: recibe el caso ya validado por el esquema y devuelve un error o nada.
import { casoSchema, contarPalabras, describirErrores, type Caso } from './schemas.ts';

const TERMINOS_PROHIBIDOS = [
  'mindset', 'hack', 'mejor versión de ti', 'vibras', 'energía positiva', 'manifestar',
  'diagnóstico de', 'te diagnostico', 'medicación recomendada', 'deja tu tratamiento',
];

// Temas que exigen derivación a ayuda profesional (constitución II.2).
const TEMAS_SENSIBLES = /suicid|quitarme la vida|autolesi|hacerse daño|hacerme daño|violencia (doméstica|intrafamiliar)|abuso sexual|maltrato|murió|muerte de|duelo|deprimid|depresión|infidelidad/i;
export const DERIVACION = /profesional|línea 192|ayuda de inmediato/i;

const ATRIBUCION_TEXTUAL = /(Epicteto|Marco Aurelio|Séneca|Musonio|Zenón|Crisipo)[^.;]{0,30}:\s*[«"“]/;
const INGLES = /(?<!\p{L})(the|and|you|your|[a-z]+ing)(?!\p{L})/u;
const MAX_PALABRAS_CASO = 340;

export interface Contexto {
  citas: Set<string>;
  /** Títulos de casos anteriores (para evitar repeticiones). */
  titulosPrevios?: string[];
}

/** Minúsculas, sin tildes ni signos: "¡El Trancón!" y "el trancon" son el mismo título. */
export const normalizar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9 ]/g, '').trim();

const textoCompleto = (c: Caso) => [c.titulo, c.situacion, c.respuesta, c.pregunta, ...c.depende, ...c.noDepende].join(' ').toLowerCase();
const esSensible = (c: Caso) => TEMAS_SENSIBLES.test(c.situacion);

type Regla = (c: Caso, ctx: Contexto) => string | string[] | null;

const REGLAS: Regla[] = [
  (c, ctx) => (ctx.citas.has(c.cita) ? null : `cita: "${c.cita}" no existe en el corpus`),
  (c) => TERMINOS_PROHIBIDOS.filter((t) => textoCompleto(c).includes(t)).map((t) => `lenguaje: término prohibido "${t}"`),
  (c) => ((c.ayuda || esSensible(c)) && !DERIVACION.test(c.respuesta)
    ? 'cuidado: tema sensible sin derivación a ayuda profesional en la mirada estoica' : null),
  (c) => (esSensible(c) && !c.ayuda ? 'cuidado: tema sensible sin marcar "ayuda: true"' : null),
  // Una cita textual atribuida ("Séneca: «…»") solo puede venir del corpus, vía el campo "cita".
  (c) => (ATRIBUCION_TEXTUAL.test(c.respuesta) ? 'fuentes: cita textual atribuida en la mirada estoica; parafrasea y usa el campo "cita"' : null),
  (c) => (INGLES.test(textoCompleto(c)) ? 'idioma: parece haber texto en inglés' : null),
  (c, ctx) => (ctx.titulosPrevios?.some((p) => normalizar(p) === normalizar(c.titulo)) ? 'repetición: ya existe un caso con ese título' : null),
  (c) => (contarPalabras(c.situacion) + contarPalabras(c.respuesta) > MAX_PALABRAS_CASO
    ? `longitud: el caso completo supera ${MAX_PALABRAS_CASO} palabras` : null),
];

export function reglasCaso(entrada: unknown, ctx: Contexto): string[] {
  const r = casoSchema.safeParse(entrada);
  if (!r.success) return describirErrores(r.error);
  return REGLAS.flatMap((regla) => regla(r.data, ctx) ?? []);
}
