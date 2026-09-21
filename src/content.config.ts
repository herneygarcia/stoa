import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { citaSchema, principioSchema, virtudSchema, practicaSchema, casoSchema } from './lib/schemas';

export const collections = {
  citas: defineCollection({ loader: file('src/content/citas/citas.json'), schema: citaSchema }),
  principios: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/principios' }), schema: principioSchema }),
  virtudes: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/virtudes' }), schema: virtudSchema }),
  practicas: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/practicas' }), schema: practicaSchema }),
  casos: defineCollection({ loader: glob({ pattern: '**/*.md', base: 'src/content/casos' }), schema: casoSchema }),
};
