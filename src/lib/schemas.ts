// Contrato de contenido (SDD). Lo comparten Astro, el validador y el pipeline de IA.
import { z } from 'zod';

export const AMBITOS = ['trabajo', 'familia', 'pareja', 'amistad', 'dinero', 'salud', 'estudio', 'redes', 'ciudad'] as const;
export const PRINCIPIOS = [
  'dicotomia-del-control', 'vivir-segun-la-naturaleza', 'amor-fati', 'apatheia',
  'cosmopolitismo', 'premeditatio-malorum', 'los-indiferentes',
] as const;
export const VIRTUDES = ['sabiduria', 'coraje', 'justicia', 'templanza'] as const;

export const LIMITES = {
  situacion: { min: 40, max: 140 },
  respuesta: { min: 80, max: 220 },
} as const;

export const contarPalabras = (texto: string) => texto.trim().split(/\s+/).filter(Boolean).length;

const rango = (campo: keyof typeof LIMITES) => (t: string) => {
  const n = contarPalabras(t);
  return n >= LIMITES[campo].min && n <= LIMITES[campo].max;
};

export const citaSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  autor: z.enum(['Epicteto', 'Marco Aurelio', 'Séneca', 'Musonio Rufo', 'Diógenes Laercio', 'Crisipo']),
  obra: z.string(),
  referencia: z.string(),
  texto: z.string().min(10),
  tipo: z.enum(['cita', 'paráfrasis']).default('cita'),
});

export const principioSchema = z.object({
  titulo: z.string(),
  termino: z.string(),
  orden: z.number().int().min(1),
  resumen: z.string().refine((t) => contarPalabras(t) <= 30, 'El resumen debe tener ≤ 30 palabras'),
  ejemplo: z.string(),
  citas: z.array(z.string()).min(1),
  practicas: z.array(z.string()).default([]),
});

export const virtudSchema = z.object({
  titulo: z.string(),
  termino: z.string(),
  orden: z.number().int().min(1).max(4),
  resumen: z.string(),
  vicio: z.string(),
  ejemplo: z.string(),
  papel: z.string(),
  citas: z.array(z.string()).min(1),
});

export const practicaSchema = z.object({
  titulo: z.string(),
  momento: z.enum(['mañana', 'noche', 'cualquiera']),
  duracionMin: z.number().int().min(1).max(30),
  resumen: z.string(),
  pasos: z.array(z.string()).min(2),
  cita: z.string(),
  interactiva: z.enum(['circulo', 'termometro', 'examen']).optional(),
  orden: z.number().int(),
});

// Un caso es igual venga del banco o de la IA: así el arnés es el mismo para ambos.
export const casoSchema = z.object({
  titulo: z.string().min(4).max(80),
  fecha: z.coerce.date().optional(),
  ambito: z.enum(AMBITOS),
  principio: z.enum(PRINCIPIOS),
  virtud: z.enum(VIRTUDES),
  situacion: z.string().refine(rango('situacion'), `La situación debe tener ${LIMITES.situacion.min}–${LIMITES.situacion.max} palabras`),
  depende: z.array(z.string()).min(2).max(5),
  noDepende: z.array(z.string()).min(2).max(5),
  respuesta: z.string().refine(rango('respuesta'), `La mirada estoica debe tener ${LIMITES.respuesta.min}–${LIMITES.respuesta.max} palabras`),
  pregunta: z.string().endsWith('?'),
  cita: z.string(),
  ayuda: z.boolean().default(false),
  origen: z.enum(['curado', 'ia']).default('curado'),
});

export type Cita = z.infer<typeof citaSchema>;
export type Caso = z.infer<typeof casoSchema>;
