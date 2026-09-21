// Orquestador del caso diario (CA-002.4): generar → evaluar → reintentar (máx. 3) → publicar o caer al banco.
// Uso: npm run daily [-- --dry-run] [-- --fecha AAAA-MM-DD]
import Anthropic from '@anthropic-ai/sdk';
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import matter from 'gray-matter';
import { AMBITOS } from '../../src/lib/schemas.ts';
import { ambitoDelDia } from '../../src/lib/caso-del-dia.ts';
import { fechaEnColombia } from '../../src/lib/tiempo.ts';
import { cargarContexto } from './contexto.ts';
import { generarCaso, MODELO, type CasoCandidato } from './generate.ts';
import { evaluar } from './rubric.ts';

const args = process.argv.slice(2);
const seco = args.includes('--dry-run');
const fecha = args.includes('--fecha') ? args[args.indexOf('--fecha') + 1] : fechaEnColombia();
const destino = `src/content/casos/diarios/${fecha}.md`;
const INTENTOS = 3;

function registrar(linea: string) {
  console.log(linea);
  if (!seco) appendFileSync('docs/registro-diario.md', `- ${new Date().toISOString()} · ${linea}\n`);
}

if (existsSync(destino) && !seco) {
  console.log(`Ya existe ${destino}; nada que hacer.`);
  process.exit(0);
}

if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN && !process.env.ANTHROPIC_PROFILE) {
  registrar(`${fecha}: sin credenciales de Anthropic; se muestra el caso del banco (fallback)`);
  process.exit(0);
}

const client = new Anthropic();
const ctx = cargarContexto();
const ambito = ambitoDelDia(fecha, AMBITOS);
type Resultado = 'publicado' | 'rechazado' | 'sin-credenciales';

function publicar(caso: CasoCandidato, i: number) {
  const archivo = matter.stringify('', { ...caso, fecha, origen: 'ia' });
  if (seco) console.log(archivo);
  else {
    mkdirSync('src/content/casos/diarios', { recursive: true });
    writeFileSync(destino, archivo);
  }
  registrar(`${fecha}: publicado "${caso.titulo}" (${ambito}, intento ${i}, ${MODELO})`);
}

/** Un intento completo: generar, evaluar y publicar si aprueba. Actualiza `retro` con los motivos del rechazo. */
async function intentar(i: number, retro: string[]): Promise<Resultado> {
  try {
    const caso = await generarCaso(client, ctx, { fecha, ambito, retroalimentacion: retro });
    const r = await evaluar(client, caso, ctx);
    if (r.aprobado) {
      publicar(caso, i);
      return 'publicado';
    }
    retro.splice(0, retro.length, ...r.errores);
    console.warn(`Intento ${i} rechazado:\n  ${r.errores.join('\n  ')}`);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return 'sin-credenciales';
    const detalle = err instanceof Anthropic.APIError ? `error de la API ${err.status}: ${err.message}` : (err as Error).message;
    console.warn(`Intento ${i}: ${detalle}`);
    retro.length = 0;
  }
  return 'rechazado';
}

const retro: string[] = [];
for (let i = 1; i <= INTENTOS; i++) {
  const resultado = await intentar(i, retro);
  if (resultado === 'publicado') process.exit(0);
  if (resultado === 'sin-credenciales') {
    console.error('Sin credenciales válidas para la API de Anthropic (ANTHROPIC_API_KEY).');
    break;
  }
}
// Fallback: sin archivo diario, el sitio muestra el caso del banco para esta fecha (elegirCaso).
registrar(`${fecha}: sin caso de IA aprobado; se muestra el caso del banco (fallback)`);
