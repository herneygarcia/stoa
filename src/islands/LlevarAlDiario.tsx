import { useEffect, useState } from 'preact/hooks';
import { diarioNavegador } from '../lib/diario';

// CA-002.7: la pregunta del caso se convierte en una entrada del diario.
export default function LlevarAlDiario({ pregunta, titulo, base }: { pregunta: string; titulo: string; base: string }) {
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'guardando' | 'guardado'>('cargando');
  useEffect(() => setEstado('listo'), []);
  const llevar = async () => {
    setEstado('guardando');
    const d = await diarioNavegador();
    await d.guardar({ tipo: 'reflexion', titulo, datos: { pregunta, respuesta: '' } });
    setEstado('guardado');
  };
  if (estado === 'guardado') {
    return (
      <p role="status">
        Guardada en tu diario. <a href={`${base.replace(/\/$/, '')}/diario`}>Escribir mi respuesta</a>
      </p>
    );
  }
  return (
    <button class="boton" type="button" onClick={llevar} disabled={estado !== 'listo'}>
      Llevar a mi diario
    </button>
  );
}
