// Diario privado (CA-004.2/3): todo vive en IndexedDB del dispositivo. Nada sale por red.
import { fechaEnColombia } from './tiempo.ts';

/** Datos que guarda cada práctica. El tipo de la entrada determina la forma de sus datos. */
interface DatosPorTipo {
  reflexion: { pregunta: string; respuesta: string };
  circulo: { dentro: string[]; fuera: string[]; paso: string };
  termometro: { emocion: string; intensidad: number; hecho: string; juicio: string; cierto: string; depende: string };
  examen: { bien: string; fallo: string; manana: string };
}
type Tipo = keyof DatosPorTipo;

/** Unión discriminada por `tipo`: TypeScript sabe qué datos tiene cada entrada sin conversiones forzadas. */
export type NuevaEntrada = { [K in Tipo]: { tipo: K; titulo: string; datos: DatosPorTipo[K] } }[Tipo];
export type Entrada = NuevaEntrada & { id: string; creada: string /* ISO */ };
export interface Almacen {
  get<T>(clave: string): Promise<T | undefined>;
  set(clave: string, valor: unknown): Promise<void>;
  del(clave: string): Promise<void>;
}

const CLAVE = 'stoa:entradas';

export function crearDiario(almacen: Almacen, ahora: () => Date = () => new Date()) {
  const listar = async () => ((await almacen.get<Entrada[]>(CLAVE)) ?? []).slice().sort((a, b) => b.creada.localeCompare(a.creada));
  const escribir = (e: Entrada[]) => almacen.set(CLAVE, e);

  return {
    listar,
    async guardar(e: NuevaEntrada): Promise<Entrada> {
      const nueva: Entrada = { ...e, id: crypto.randomUUID(), creada: ahora().toISOString() };
      await escribir([nueva, ...(await listar())]);
      return nueva;
    },
    /** Guarda la respuesta a una reflexión (la única entrada que se completa después de creada). */
    async responder(id: string, respuesta: string) {
      await escribir((await listar()).map((e) => (e.id === id && e.tipo === 'reflexion' ? { ...e, datos: { ...e.datos, respuesta } } : e)));
    },
    async borrar(id: string) {
      await escribir((await listar()).filter((e) => e.id !== id));
    },
    borrarTodo: () => almacen.del(CLAVE),
    async exportar() {
      return JSON.stringify({ app: 'stoa', version: 1, exportado: ahora().toISOString(), entradas: await listar() }, null, 2);
    },
  };
}

/** Días (AAAA-MM-DD, Colombia) en que hubo al menos una práctica: son las hojas del olivo (CA-004.5). */
export function diasConPractica(entradas: Entrada[]): string[] {
  return [...new Set(entradas.map((e) => fechaEnColombia(new Date(e.creada))))].sort();
}
