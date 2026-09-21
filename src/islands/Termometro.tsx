import { useState } from 'preact/hooks';
import { diarioNavegador } from '../lib/diario-navegador';

// CA-004.1 y CA-004.4: impresión → juicio → asentimiento, con líneas de ayuda si hace falta.
const EMOCIONES = ['Ira', 'Miedo', 'Ansiedad', 'Tristeza', 'Vergüenza', 'Envidia', 'Frustración', 'Culpa', 'Otra'];
const PASOS = ['Lo que sientes', 'Lo que pasó', 'Lo que te dices', 'Tu asentimiento'];
const CERTEZA = ['Sí', 'No del todo', 'No lo sé'];

interface Registro { emocion: string; intensidad: number; peligro: boolean; hecho: string; juicio: string; cierto: string; depende: string }
type Cambiar = <K extends keyof Registro>(campo: K, valor: Registro[K]) => void;

const valor = (e: Event) => (e.target as HTMLInputElement).value;

/** Qué hace falta para avanzar desde cada paso. */
const PASO_COMPLETO: ((r: Registro) => boolean)[] = [
  (r) => r.emocion !== '' && r.intensidad > 0,
  (r) => r.hecho.trim() !== '',
  (r) => r.juicio.trim() !== '',
  (r) => r.cierto !== '',
];

function Opciones({ nombre, opciones, actual, elegir }: { nombre: string; opciones: string[]; actual: string; elegir: (v: string) => void }) {
  return (
    <div class="opciones">
      {opciones.map((o) => (
        <label class={`opcion ${actual === o ? 'activa' : ''}`}>
          <input type="radio" name={nombre} value={o} checked={actual === o} onChange={() => elegir(o)} class="visualmente-oculto" />{o}
        </label>
      ))}
    </div>
  );
}

function Alerta() {
  return (
    <aside class="alerta" role="alert">
      <strong>No estás solo con esto.</strong> Si sientes que puedes hacerte daño o que no puedes más, habla hoy con alguien.
      En Colombia: <strong>Línea 192, opción 4</strong> (salud mental, todo el país).
    </aside>
  );
}

function PasoSentir({ r, cambiar }: { r: Registro; cambiar: Cambiar }) {
  return (
    <fieldset>
      <legend>¿Qué sientes ahora?</legend>
      <Opciones nombre="emocion" opciones={EMOCIONES} actual={r.emocion} elegir={(v) => cambiar('emocion', v)} />
      <p class="etiqueta" id="int-l">¿Con qué intensidad?</p>
      <div class="escala" role="radiogroup" aria-labelledby="int-l">
        {[1, 2, 3, 4, 5].map((n) => (
          <label class={`grado ${r.intensidad >= n ? 'lleno' : ''}`}>
            <input type="radio" name="intensidad" value={n} checked={r.intensidad === n} onChange={() => cambiar('intensidad', n)} class="visualmente-oculto" />
            <span>{n}</span>
          </label>
        ))}
      </div>
      <label class="peligro">
        <input type="checkbox" checked={r.peligro} onChange={(e) => cambiar('peligro', (e.target as HTMLInputElement).checked)} /> Me siento en peligro o pienso en hacerme daño
      </label>
    </fieldset>
  );
}

function PasoTexto({ id, pregunta, ejemplo, texto, escribir, nota }: { id: string; pregunta: string; ejemplo: string; texto: string; escribir: (v: string) => void; nota?: string }) {
  return (
    <div>
      <label for={id}>{pregunta}</label>
      <textarea id={id} value={texto} onInput={(e) => escribir(valor(e))} placeholder={ejemplo} />
      {nota && <p class="nota">{nota}</p>}
    </div>
  );
}

function PasoAsentir({ r, cambiar }: { r: Registro; cambiar: Cambiar }) {
  return (
    <fieldset>
      <legend>Mira el juicio de frente: «{r.juicio}»</legend>
      <p class="etiqueta">¿Es cierto del todo?</p>
      <Opciones nombre="cierto" opciones={CERTEZA} actual={r.cierto} elegir={(v) => cambiar('cierto', v)} />
      <label for="depende">¿Qué depende de ti en esta situación?</label>
      <textarea id="depende" value={r.depende} onInput={(e) => cambiar('depende', valor(e))} />
    </fieldset>
  );
}

function Cierre() {
  return (
    <div class="cierre" role="status">
      <p class="grande">Separaste el hecho del juicio. Eso ya es libertad.</p>
      <p>«No son las cosas las que nos perturban, sino los juicios sobre las cosas.» — Epicteto, <span class="inscripcion">Enquiridión 5</span></p>
    </div>
  );
}

export default function Termometro() {
  const [paso, setPaso] = useState(0);
  const [guardado, setGuardado] = useState(false);
  const [r, setR] = useState<Registro>({ emocion: '', intensidad: 0, peligro: false, hecho: '', juicio: '', cierto: '', depende: '' });
  const cambiar: Cambiar = (campo, v) => setR((prev) => ({ ...prev, [campo]: v }));
  const puede = PASO_COMPLETO[paso](r);

  const guardar = async () => {
    const { emocion, intensidad, hecho, juicio, cierto, depende } = r;
    const d = await diarioNavegador();
    await d.guardar({ tipo: 'termometro', titulo: `${emocion} · ${intensidad}/5`, datos: { emocion, intensidad, hecho, juicio, cierto, depende } });
    setGuardado(true);
  };

  const pantallas = [
    <PasoSentir r={r} cambiar={cambiar} />,
    <PasoTexto id="hecho" pregunta="¿Qué pasó? Descríbelo como lo grabaría una cámara, sin adjetivos." ejemplo="Mi jefe respondió mi correo con una sola línea." texto={r.hecho} escribir={(v) => cambiar('hecho', v)} />,
    <PasoTexto id="juicio" pregunta="¿Qué te estás diciendo sobre eso?" ejemplo="Que está molesto conmigo y que hice todo mal." texto={r.juicio} escribir={(v) => cambiar('juicio', v)}
      nota="Séneca: el primer sobresalto no lo eliges; la pasión empieza cuando le das tu asentimiento a este juicio." />,
    <PasoAsentir r={r} cambiar={cambiar} />,
  ];

  return (
    <div class="termo">
      <ol class="pasos" aria-label="Pasos">
        {PASOS.map((p, i) => <li aria-current={i === paso ? 'step' : undefined} class={i < paso ? 'hecho' : ''}>{p}</li>)}
      </ol>
      {(r.peligro || r.intensidad === 5) && <Alerta />}
      {guardado ? <Cierre /> : (
        <>
          {pantallas[paso]}
          <p class="fila">
            {paso > 0 && <button type="button" class="boton sutil" onClick={() => setPaso(paso - 1)}>Atrás</button>}
            {paso < 3
              ? <button type="button" class="boton" disabled={!puede} onClick={() => setPaso(paso + 1)}>Siguiente</button>
              : <button type="button" class="boton" disabled={!puede} onClick={guardar}>Guardar en mi diario</button>}
          </p>
        </>
      )}
    </div>
  );
}
