import { describe, expect, it } from 'vitest';
import { crearDiario, diasConPractica, type Almacen } from '../../src/lib/diario';

function memoria(): Almacen {
  const m = new Map<string, unknown>();
  return { get: async (k) => m.get(k) as never, set: async (k, v) => void m.set(k, v), del: async (k) => void m.delete(k) };
}

describe('CA-004.2 / CA-004.3 diario local', () => {
  it('guarda, lista (reciente primero), actualiza y borra', async () => {
    let t = Date.parse('2026-09-21T12:00:00Z');
    const d = crearDiario(memoria(), () => new Date((t += 1000)));
    const a = await d.guardar({ tipo: 'reflexion', titulo: 'A', datos: { pregunta: '¿?', respuesta: '' } });
    await d.guardar({ tipo: 'examen', titulo: 'B', datos: { bien: 'a', fallo: 'b', manana: 'c' } });
    expect((await d.listar()).map((e) => e.titulo)).toEqual(['B', 'A']);
    await d.responder(a.id, 'hecho');
    expect((await d.listar())[1].datos).toEqual({ pregunta: '¿?', respuesta: 'hecho' });
    await d.borrar(a.id);
    expect(await d.listar()).toHaveLength(1);
  });
  it('exporta JSON y borra todo', async () => {
    const d = crearDiario(memoria());
    await d.guardar({ tipo: 'circulo', titulo: 'C', datos: { dentro: [], fuera: [], paso: '' } });
    const json = JSON.parse(await d.exportar());
    expect(json.app).toBe('stoa');
    expect(json.entradas).toHaveLength(1);
    await d.borrarTodo();
    expect(await d.listar()).toEqual([]);
  });
});

describe('CA-004.5 olivo', () => {
  it('cuenta días distintos en hora de Colombia', () => {
    const e = (creada: string) => ({ id: creada, creada, tipo: 'examen' as const, titulo: '', datos: { bien: '', fallo: '', manana: '' } });
    expect(diasConPractica([e('2026-09-21T15:00:00Z'), e('2026-09-21T20:00:00Z'), e('2026-09-22T03:00:00Z'), e('2026-09-22T15:00:00Z')]))
      .toEqual(['2026-09-21', '2026-09-22']);
  });
});

describe('diario: contrato de almacenamiento', () => {
  it('usa la clave stoa:entradas (compatibilidad con diarios ya guardados)', async () => {
    const claves: string[] = [];
    const m = memoria();
    const d = crearDiario({ ...m, set: async (k, v) => { claves.push(k); await m.set(k, v); } });
    await d.guardar({ tipo: 'circulo', titulo: 'C', datos: { dentro: [], fuera: [], paso: '' } });
    expect(claves).toEqual(['stoa:entradas']);
  });
  it('borrar solo elimina la entrada indicada', async () => {
    const d = crearDiario(memoria());
    const a = await d.guardar({ tipo: 'circulo', titulo: 'A', datos: { dentro: [], fuera: [], paso: '' } });
    await d.guardar({ tipo: 'circulo', titulo: 'B', datos: { dentro: [], fuera: [], paso: '' } });
    await d.borrar(a.id);
    expect((await d.listar()).map((e) => e.titulo)).toEqual(['B']);
  });
  it('responder solo completa la reflexión indicada', async () => {
    const d = crearDiario(memoria());
    const a = await d.guardar({ tipo: 'reflexion', titulo: 'A', datos: { pregunta: '¿a?', respuesta: '' } });
    await d.guardar({ tipo: 'reflexion', titulo: 'B', datos: { pregunta: '¿b?', respuesta: '' } });
    await d.responder(a.id, 'hecho');
    expect(Object.fromEntries((await d.listar()).map((e) => [e.titulo, e.datos]))).toEqual({
      A: { pregunta: '¿a?', respuesta: 'hecho' }, B: { pregunta: '¿b?', respuesta: '' },
    });
  });
  it('responder solo modifica reflexiones', async () => {
    const d = crearDiario(memoria());
    const ex = await d.guardar({ tipo: 'examen', titulo: 'E', datos: { bien: 'a', fallo: 'b', manana: 'c' } });
    await d.responder(ex.id, 'no aplica');
    expect((await d.listar())[0].datos).toEqual({ bien: 'a', fallo: 'b', manana: 'c' });
  });
  it('listar no altera el orden guardado en el almacén', async () => {
    const m = memoria();
    let t = 0;
    const d = crearDiario(m, () => new Date(Date.UTC(2026, 0, 1, 0, 0, t++)));
    await d.guardar({ tipo: 'circulo', titulo: 'viejo', datos: { dentro: [], fuera: [], paso: '' } });
    await d.guardar({ tipo: 'circulo', titulo: 'nuevo', datos: { dentro: [], fuera: [], paso: '' } });
    const antes = JSON.stringify(await m.get('stoa:entradas'));
    await d.listar();
    expect(JSON.stringify(await m.get('stoa:entradas'))).toBe(antes);
  });
  it('ordena de la más reciente a la más antigua sin modificar lo guardado', async () => {
    const m = memoria();
    const e = (titulo: string, creada: string) => ({ id: titulo, creada, tipo: 'circulo' as const, titulo, datos: { dentro: [], fuera: [], paso: '' } });
    const guardado = [e('medio', '2026-09-02T00:00:00Z'), e('viejo', '2026-09-01T00:00:00Z'), e('nuevo', '2026-09-03T00:00:00Z')];
    await m.set('stoa:entradas', guardado);
    expect((await crearDiario(m).listar()).map((x) => x.titulo)).toEqual(['nuevo', 'medio', 'viejo']);
    expect(guardado.map((x) => x.titulo)).toEqual(['medio', 'viejo', 'nuevo']);
  });
  it('un diario sin datos lista vacío', async () => expect(await crearDiario(memoria()).listar()).toEqual([]));
  it('la exportación incluye versión y fecha', async () => {
    const d = crearDiario(memoria(), () => new Date('2026-09-21T12:00:00Z'));
    expect(JSON.parse(await d.exportar())).toMatchObject({ app: 'stoa', version: 1, exportado: '2026-09-21T12:00:00.000Z', entradas: [] });
  });
  it('los días del olivo salen ordenados', () => {
    const e = (creada: string) => ({ id: creada, creada, tipo: 'examen' as const, titulo: '', datos: { bien: '', fallo: '', manana: '' } });
    expect(diasConPractica([e('2026-09-23T15:00:00Z'), e('2026-09-21T15:00:00Z')])).toEqual(['2026-09-21', '2026-09-23']);
  });
});
