import { useState } from 'preact/hooks';
import { diarioNavegador } from '../lib/diario-navegador';

// CA-003.2: las tres preguntas del examen de Séneca (Sobre la ira III.36).
const PREGUNTAS = [
  { id: 'bien', texto: '¿Qué hiciste bien hoy?', ayuda: 'Reconócelo sin falsa modestia. Algo pequeño cuenta.' },
  { id: 'fallo', texto: '¿En qué fallaste?', ayuda: 'Nómbralo sin justificarte y sin castigarte. Séneca: «no me oculto nada».' },
  { id: 'manana', texto: '¿Qué harás distinto mañana?', ayuda: 'Una sola cosa, concreta.' },
];

export default function ExamenNocturno() {
  const [i, setI] = useState(0);
  const [resp, setResp] = useState<Record<string, string>>({});
  const [fin, setFin] = useState(false);
  const p = PREGUNTAS[i];

  const guardar = async () => {
    const d = await diarioNavegador();
    await d.guardar({ tipo: 'examen', titulo: 'Examen nocturno', datos: { bien: resp.bien ?? '', fallo: resp.fallo ?? '', manana: resp.manana ?? '' } });
    setFin(true);
  };

  if (fin) {
    return (
      <div class="examen-fin" role="status">
        <svg viewBox="0 0 120 60" width="120" height="60" aria-hidden="true" class="piedra">
          <ellipse cx="60" cy="54" rx="50" ry="4" fill="var(--sombra)" />
          <path d="M22 50c2-14 16-24 36-24s38 8 40 22c-8 4-68 6-76 2z" fill="var(--cal-2)" stroke="var(--piedra)" stroke-width="1.4" />
        </svg>
        <p class="grande">El día queda en su lugar.</p>
        <p>Descansa. Mañana es otro día de práctica, no de examen.</p>
      </div>
    );
  }

  return (
    <div class="examen">
      <p class="inscripcion">Pregunta {i + 1} de 3</p>
      <label for={`ex-${p.id}`} class="pregunta-ex">{p.texto}</label>
      <p class="nota">{p.ayuda}</p>
      <textarea id={`ex-${p.id}`} value={resp[p.id] ?? ''} onInput={(e) => setResp({ ...resp, [p.id]: (e.target as HTMLTextAreaElement).value })} />
      <p class="fila">
        {i > 0 && <button class="boton sutil" type="button" onClick={() => setI(i - 1)}>Atrás</button>}
        {i < 2
          ? <button class="boton" type="button" disabled={!resp[p.id]?.trim()} onClick={() => setI(i + 1)}>Siguiente</button>
          : <button class="boton" type="button" disabled={!resp[p.id]?.trim()} onClick={guardar}>Cerrar el día</button>}
      </p>
    </div>
  );
}
