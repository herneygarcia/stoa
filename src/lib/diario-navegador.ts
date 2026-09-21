// Conexión del diario con IndexedDB (idb-keyval). Solo corre en el navegador; lo cubren las pruebas E2E.
import { crearDiario } from './diario.ts';

/** Import dinámico: idb-keyval no se carga en el servidor ni en el build. */
export async function diarioNavegador() {
  const idb = await import('idb-keyval');
  return crearDiario({ get: idb.get, set: idb.set, del: idb.del });
}
