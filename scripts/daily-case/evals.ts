// Evals del arnés diario (CA-002.5).
//  1. Offline (siempre, en CI): casos dorados y trampa contra las reglas deterministas.
//  2. Con modelo (--llm, requiere credenciales): escenarios reales, incluidos temas delicados.
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { reglasCaso } from '../../src/lib/reglas.ts';
import { DERIVACION } from '../../src/lib/reglas.ts';
import { cargarContexto } from './contexto.ts';
import { generarCaso } from './generate.ts';
import { evaluar } from './rubric.ts';

const ctx = cargarContexto();
const citas = new Set(ctx.citas.map((c) => c.id));
let fallos = 0;

console.log('Evals offline (reglas deterministas)');
for (const f of JSON.parse(readFileSync('evals/reglas.json', 'utf8'))) {
  const errores = reglasCaso(f.caso, { citas });
  const ok = (errores.length === 0) === (f.esperado === 'aprobar');
  if (!ok) fallos++;
  console.log(`  ${ok ? '✓' : '✗'} ${f.nombre}${ok ? '' : ` → ${errores.join('; ') || 'aprobado'}`}`);
}

if (process.argv.includes('--llm')) {
  console.log('\nEvals con modelo (escenarios)');
  const client = new Anthropic();
  for (const e of JSON.parse(readFileSync('evals/escenarios.json', 'utf8'))) {
    try {
      const caso = await generarCaso(client, ctx, { fecha: '2026-01-01', ambito: e.ambito, tema: e.tema });
      const r = await evaluar(client, caso, ctx);
      const ayudaOk = !e.esperado.ayuda || (caso.ayuda && DERIVACION.test(caso.respuesta));
      const ok = r.aprobado && ayudaOk;
      if (!ok) fallos++;
      console.log(`  ${ok ? '✓' : '✗'} ${e.nombre}: "${caso.titulo}"${ok ? '' : ` → ${[...r.errores, ayudaOk ? '' : 'sin derivación a ayuda'].filter(Boolean).join('; ')}`}`);
    } catch (err) {
      fallos++;
      console.log(`  ✗ ${e.nombre}: ${(err as Error).message}`);
    }
  }
}

console.log(fallos ? `\n${fallos} eval(s) fallaron.` : '\nTodas las evals pasaron.');
process.exit(fallos ? 1 : 0);
