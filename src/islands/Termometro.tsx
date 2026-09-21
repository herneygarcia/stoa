import { useState } from 'preact/hooks';
import { diarioNavegador } from '../lib/diario';

// CA-004.1 y CA-004.4: impresión → juicio → asentimiento, con líneas de ayuda si hace falta.
const EMOCIONES = ['Ira', 'Miedo', 'Ansiedad', 'Tristeza', 'Vergüenza', 'Envidia', 'Frustración', 'Culpa', 'Otra'];
const PASOS = ['Lo que sientes', 'Lo que pasó', 'Lo que te dices', 'Tu asentimiento'];

export default function Termometro() {
  const [paso, setPaso] = useState(0);
  const [emocion, setEmocion] = useState('');
  const [intensidad, setIntensidad] = useState(0);
  const [peligro, setPeligro] = useState(false);
  const [hecho, setHecho] = useState('');
  const [juicio, setJuicio] = useState('');
  const [cierto, setCierto] = useState('');
  const [depende, setDepende] = useState('');
  const [guardado, setGuardado] = useState(false);

  const alerta = peligro || intensidad === 5;
  const puede = [emocion && intensidad > 0, hecho.trim(), juicio.trim(), cierto][paso];
  const val = (f: (v: string) => void) => (e: Event) => f((e.target as HTMLInputElement).value);

  const guardar = async () => {
    const d = await diarioNavegador();
    await d.guardar({ tipo: 'termometro', titulo: `${emocion} · ${intensidad}/5`, datos: { emocion, intensidad, hecho, juicio, cierto, depende } });
    setGuardado(true);
  };

  return (
    <div class="termo">
      <ol class="pasos" aria-label="Pasos">
        {PASOS.map((p, i) => <li aria-current={i === paso ? 'step' : undefined} class={i < paso ? 'hecho' : ''}>{p}</li>)}
      </ol>

      {alerta && (
        <aside class="alerta" role="alert">
          <strong>No estás solo con esto.</strong> Si sientes que puedes hacerte daño o que no puedes más, habla hoy con alguien.
          En Colombia: <strong>Línea 192, opción 4</strong> (salud mental, todo el país).
        </aside>
      )}

      {paso === 0 && (
        <fieldset>
          <legend>¿Qué sientes ahora?</legend>
          <div class="opciones">
            {EMOCIONES.map((e) => (
              <label class={`opcion ${emocion === e ? 'activa' : ''}`}>
                <input type="radio" name="emocion" value={e} checked={emocion === e} onChange={val(setEmocion)} class="visualmente-oculto" />{e}
              </label>
            ))}
          </div>
          <p class="etiqueta" id="int-l">¿Con qué intensidad?</p>
          <div class="escala" role="radiogroup" aria-labelledby="int-l">
            {[1, 2, 3, 4, 5].map((n) => (
              <label class={`grado ${intensidad >= n ? 'lleno' : ''}`}>
                <input type="radio" name="intensidad" value={n} checked={intensidad === n} onChange={() => setIntensidad(n)} class="visualmente-oculto" />
                <span>{n}</span>
              </label>
            ))}
          </div>
          <label class="peligro"><input type="checkbox" checked={peligro} onChange={(e) => setPeligro((e.target as HTMLInputElement).checked)} /> Me siento en peligro o pienso en hacerme daño</label>
        </fieldset>
      )}
      {paso === 1 && (
        <div>
          <label for="hecho">¿Qué pasó? Descríbelo como lo grabaría una cámara, sin adjetivos.</label>
          <textarea id="hecho" value={hecho} onInput={val(setHecho)} placeholder="Mi jefe respondió mi correo con una sola línea." />
        </div>
      )}
      {paso === 2 && (
        <div>
          <label for="juicio">¿Qué te estás diciendo sobre eso?</label>
          <textarea id="juicio" value={juicio} onInput={val(setJuicio)} placeholder="Que está molesto conmigo y que hice todo mal." />
          <p class="nota">Séneca: el primer sobresalto no lo eliges; la pasión empieza cuando le das tu asentimiento a este juicio.</p>
        </div>
      )}
      {paso === 3 && !guardado && (
        <fieldset>
          <legend>Mira el juicio de frente: «{juicio}»</legend>
          <p class="etiqueta">¿Es cierto del todo?</p>
          <div class="opciones">
            {['Sí', 'No del todo', 'No lo sé'].map((o) => (
              <label class={`opcion ${cierto === o ? 'activa' : ''}`}><input type="radio" name="cierto" value={o} checked={cierto === o} onChange={val(setCierto)} class="visualmente-oculto" />{o}</label>
            ))}
          </div>
          <label for="depende">¿Qué depende de ti en esta situación?</label>
          <textarea id="depende" value={depende} onInput={val(setDepende)} />
        </fieldset>
      )}
      {guardado && (
        <div class="cierre" role="status">
          <p class="grande">Separaste el hecho del juicio. Eso ya es libertad.</p>
          <p>«No son las cosas las que nos perturban, sino los juicios sobre las cosas.» — Epicteto, <span class="inscripcion">Enquiridión 5</span></p>
        </div>
      )}

      {!guardado && (
        <p class="fila">
          {paso > 0 && <button type="button" class="boton sutil" onClick={() => setPaso(paso - 1)}>Atrás</button>}
          {paso < 3 && <button type="button" class="boton" disabled={!puede} onClick={() => setPaso(paso + 1)}>Siguiente</button>}
          {paso === 3 && <button type="button" class="boton" disabled={!puede} onClick={guardar}>Guardar en mi diario</button>}
        </p>
      )}
    </div>
  );
}
