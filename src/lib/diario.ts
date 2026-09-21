// Diario privado (CA-004.2/3): todo vive en IndexedDB del dispositivo. Nada sale por red.
import { fechaEnBogota } from './caso-del-dia.ts';

export type Tipo = 'reflexion' | 'circulo' | 'termometro' | 'examen';
export interface Entrada {
  id: string;
  creada: string; // ISO
  tipo: Tipo;
  titulo: string;
  datos: Record<string, unknown>;
}
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
    async guardar(e: Omit<Entrada, 'id' | 'creada'>): Promise<Entrada> {
      const nueva: Entrada = { ...e, id: crypto.randomUUID(), creada: ahora().toISOString() };
      await escribir([nueva, ...(await listar())]);
      return nueva;
    },
    async actualizar(id: string, datos: Record<string, unknown>) {
      await escribir((await listar()).map((e) => (e.id === id ? { ...e, datos: { ...e.datos, ...datos } } : e)));
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

/** Días (AAAA-MM-DD, Bogotá) en que hubo al menos una práctica: son las hojas del olivo (CA-004.5). */
export function diasConPractica(entradas: Entrada[]): string[] {
  return [...new Set(entradas.map((e) => fechaEnBogota(new Date(e.creada))))].sort();
}

/** Diario del navegador, respaldado por idb-keyval. Import dinámico: no se carga en el servidor. */
export async function diarioNavegador() {
  const idb = await import('idb-keyval');
  return crearDiario({ get: idb.get, set: idb.set, del: idb.del });
}
