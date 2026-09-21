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
    await d.guardar({ tipo: 'examen', titulo: 'B', datos: {} });
    expect((await d.listar()).map((e) => e.titulo)).toEqual(['B', 'A']);
    await d.actualizar(a.id, { respuesta: 'hecho' });
    expect((await d.listar())[1].datos.respuesta).toBe('hecho');
    await d.borrar(a.id);
    expect(await d.listar()).toHaveLength(1);
  });
  it('exporta JSON y borra todo', async () => {
    const d = crearDiario(memoria());
    await d.guardar({ tipo: 'circulo', titulo: 'C', datos: {} });
    const json = JSON.parse(await d.exportar());
    expect(json.app).toBe('stoa');
    expect(json.entradas).toHaveLength(1);
    await d.borrarTodo();
    expect(await d.listar()).toEqual([]);
  });
});

describe('CA-004.5 olivo', () => {
  it('cuenta días distintos en hora de Bogotá', () => {
    const e = (creada: string) => ({ id: creada, creada, tipo: 'examen' as const, titulo: '', datos: {} });
    expect(diasConPractica([e('2026-09-21T15:00:00Z'), e('2026-09-21T20:00:00Z'), e('2026-09-22T03:00:00Z'), e('2026-09-22T15:00:00Z')]))
      .toEqual(['2026-09-21', '2026-09-22']);
  });
});
