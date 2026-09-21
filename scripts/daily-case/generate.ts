// Paso 1 del arnés diario: Claude redacta un caso candidato con salida estructurada.
import type Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { AMBITOS, PRINCIPIOS, VIRTUDES, LIMITES } from '../../src/lib/schemas.ts';
import type { Contexto } from './contexto.ts';

export const MODELO = process.env.STOA_MODELO ?? 'claude-opus-5';

// Esquema de salida: forma simple para la API; las reglas finas las aplica el arnés (src/lib/reglas.ts).
export const CasoCandidato = z.object({
  titulo: z.string(),
  ambito: z.enum(AMBITOS),
  principio: z.enum(PRINCIPIOS),
  virtud: z.enum(VIRTUDES),
  situacion: z.string(),
  depende: z.array(z.string()),
  noDepende: z.array(z.string()),
  respuesta: z.string(),
  pregunta: z.string(),
  cita: z.string(),
  ayuda: z.boolean(),
});
export type CasoCandidato = z.infer<typeof CasoCandidato>;

/** Parte estable del prompt (cacheable): criterios editoriales + corpus cerrado. */
export function sistema(ctx: Contexto): string {
  return `Eres editor de Stoa, un sitio que enseña filosofía estoica con casos de la vida cotidiana en Colombia y América Latina.

Escribes UN caso por día. Estructura obligatoria:
- titulo: 4 a 8 palabras, concreto, sin dos puntos.
- situacion: ${LIMITES.situacion.min}–${LIMITES.situacion.max} palabras, en segunda persona ("tú"), escena concreta con detalles reales (hora, lugar, lo que se dijo). Nada de moralejas aquí.
- depende / noDepende: 2 a 4 elementos cada uno, frases cortas y accionables.
- respuesta ("la mirada estoica"): ${LIMITES.respuesta.min}–${LIMITES.respuesta.max} palabras. Distingue hecho y juicio, aplica bien el principio elegido, termina en una acción concreta. Cálida, no sermoneadora.
- pregunta: una sola pregunta para el lector, que termine en "?".
- cita: el id de UNA cita del corpus de abajo que ilumine el caso. Nunca inventes citas. En la respuesta puedes parafrasear a un autor, pero no pongas entre comillas palabras atribuidas a un autor.
- ayuda: true si el caso toca duelo, depresión, autolesión, violencia, abuso o infidelidad. En ese caso la respuesta DEBE recomendar buscar apoyo profesional.

Criterios de la constitución de Stoa:
- Español neutro, tuteo, frases cortas. Prohibida la jerga de autoayuda ("mindset", "vibras", "tu mejor versión", "manifestar").
- El estoicismo no es reprimir emociones: se examinan los juicios.
- Nada de diagnósticos ni consejo médico o psicológico; en salud, remite al profesional.
- Evita temas partidistas y marcas comerciales.

Principios (usa el id):
${ctx.principios.map((p) => `- ${p.id}: ${p.titulo}. ${p.resumen}`).join('\n')}

Virtudes (usa el id):
${ctx.virtudes.map((v) => `- ${v.id}: ${v.titulo}. ${v.resumen}`).join('\n')}

Corpus de citas permitidas (usa solo estos ids):
${ctx.citas.map((c) => `- ${c.id} — ${c.autor}, ${c.obra} ${c.referencia}: «${c.texto}»`).join('\n')}`;
}

export interface Encargo {
  fecha: string;
  ambito: string;
  tema?: string;
  retroalimentacion?: string[];
}

export async function generarCaso(client: Anthropic, ctx: Contexto, e: Encargo): Promise<CasoCandidato> {
  const pedido = [
    `Fecha de publicación: ${e.fecha}. Ámbito de hoy: ${e.ambito}.`,
    e.tema ? `Tema específico: ${e.tema}.` : 'Elige una situación cotidiana y verosímil que no se parezca a los casos recientes.',
    ctx.recientes.length ? `Casos recientes (no los repitas):\n${ctx.recientes.map((t) => `- ${t}`).join('\n')}` : '',
    e.retroalimentacion?.length ? `Tu intento anterior fue rechazado por el revisor. Corrige esto:\n${e.retroalimentacion.map((r) => `- ${r}`).join('\n')}` : '',
  ].filter(Boolean).join('\n\n');

  const r = await client.beta.messages.parse({
    model: MODELO,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: betaZodOutputFormat(CasoCandidato) },
    system: [{ type: 'text', text: sistema(ctx), cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: pedido }],
  });
  if (r.stop_reason === 'refusal') throw new Error(`El modelo rechazó el encargo (${r.stop_details?.category ?? 'sin categoría'})`);
  if (!r.parsed_output) throw new Error(`Salida no parseable (stop_reason: ${r.stop_reason})`);
  return r.parsed_output;
}
