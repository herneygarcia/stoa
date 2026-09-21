// Paso 2 del arnés diario: reglas deterministas + juez (Claude) con veredicto estructurado.
import type Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import { reglasCaso } from '../../src/lib/reglas.ts';
import type { Contexto } from './contexto.ts';
import { MODELO, type CasoCandidato } from './generate.ts';

const Veredicto = z.object({
  principioBienAplicado: z.boolean(),
  controlBienSeparado: z.boolean(),
  citaPertinente: z.boolean(),
  tonoCalidoYConcreto: z.boolean(),
  sinConsejoClinico: z.boolean(),
  verosimil: z.boolean(),
  problemas: z.array(z.string()),
});
export type Veredicto = z.infer<typeof Veredicto>;

export interface Resultado { aprobado: boolean; errores: string[]; veredicto?: Veredicto }

export async function evaluar(client: Anthropic | null, caso: CasoCandidato, ctx: Contexto): Promise<Resultado> {
  // Reglas deterministas primero: si fallan, no gastamos una llamada al juez.
  const errores = reglasCaso(caso, { citas: new Set(ctx.citas.map((c) => c.id)), titulosPrevios: ctx.titulos });
  if (errores.length || !client) return { aprobado: errores.length === 0, errores };

  const cita = ctx.citas.find((c) => c.id === caso.cita);
  const principio = ctx.principios.find((p) => p.id === caso.principio);
  if (!cita || !principio) return { aprobado: false, errores: ['contexto: cita o principio desconocido'] };
  const r = await client.beta.messages.parse({
    model: MODELO,
    max_tokens: 8000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: betaZodOutputFormat(Veredicto) },
    system: 'Eres un revisor exigente de contenido sobre filosofía estoica. Conoces a Epicteto, Séneca y Marco Aurelio en profundidad. Evalúas con honestidad: si algo es dudoso, márcalo como falso y explica el problema en español, en una frase accionable.',
    messages: [{
      role: 'user',
      content: `Evalúa este caso para publicarlo.

Principio declarado: ${principio.titulo} — ${principio.resumen}
Cita asociada: ${cita.autor}, ${cita.obra} ${cita.referencia}: «${cita.texto}»

Caso:
${JSON.stringify(caso, null, 2)}

Criterios:
- principioBienAplicado: la mirada estoica aplica ese principio de forma fiel a las fuentes (no autoayuda genérica, no resignación pasiva).
- controlBienSeparado: "depende" solo contiene cosas bajo control de la persona; "noDepende" solo cosas fuera de su control.
- citaPertinente: la cita ilumina el caso y cualquier paráfrasis de autores en la respuesta es fiel.
- tonoCalidoYConcreto: cálido, sin sermón, termina en algo que la persona puede hacer.
- sinConsejoClinico: no diagnostica ni aconseja tratamientos; si el tema es delicado, remite a apoyo profesional.
- verosimil: la situación es realista para alguien en Colombia o América Latina.
- problemas: lista de correcciones concretas (vacía si todo está bien).`,
    }],
  });
  if (r.stop_reason === 'refusal' || !r.parsed_output) return { aprobado: false, errores: ['juez: sin veredicto utilizable'] };
  const v = r.parsed_output;
  const fallos = (Object.entries(v) as [string, unknown][]).filter(([k, x]) => k !== 'problemas' && x === false).map(([k]) => `juez: ${k}`);
  return { aprobado: fallos.length === 0, errores: [...fallos, ...v.problemas.map((p) => `juez: ${p}`)], veredicto: v };
}
