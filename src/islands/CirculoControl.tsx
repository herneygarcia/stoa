import { useRef, useState } from 'preact/hooks';
import { diarioNavegador } from '../lib/diario-navegador';

// CA-003.1: ubicar preocupaciones dentro/fuera del círculo con clic, arrastre o teclado.
type Zona = 'sin' | 'dentro' | 'fuera';
interface Item { id: number; texto: string; zona: Zona }
const NOMBRE_ZONA: Record<Zona, string> = { sin: 'sin ubicar', dentro: 'depende de ti', fuera: 'no depende de ti' };

// Arrastre con pointer events (ratón y dedo). Devuelve la zona bajo el punto donde se suelta, si la hay.
function arrastrar(ev: PointerEvent, alSoltar: (zona: Zona) => void) {
  const chip = ev.currentTarget as HTMLElement;
  if ((ev.target as HTMLElement).closest('button')) return;
  const x0 = ev.clientX, y0 = ev.clientY;
  let movido = false;
  chip.setPointerCapture(ev.pointerId);
  const mueve = (e: PointerEvent) => {
    const dx = e.clientX - x0, dy = e.clientY - y0;
    movido ||= Math.hypot(dx, dy) > 4;
    chip.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 40}deg)`;
    chip.classList.add('volando');
  };
  const suelta = (e: PointerEvent) => {
    chip.removeEventListener('pointermove', mueve);
    chip.style.transform = '';
    chip.classList.remove('volando');
    if (!movido) return;
    chip.style.visibility = 'hidden';
    const bajo = document.elementFromPoint(e.clientX, e.clientY);
    chip.style.visibility = '';
    const zona = bajo?.closest<HTMLElement>('[data-zona]')?.dataset.zona as Zona | undefined;
    if (zona) alSoltar(zona);
  };
  chip.addEventListener('pointermove', mueve);
  chip.addEventListener('pointerup', suelta, { once: true });
}

function Chip({ it, mover }: { it: Item; mover: (id: number, zona: Zona) => void }) {
  return (
    <li class={`chip ${it.zona}`} onPointerDown={(ev) => arrastrar(ev, (zona) => mover(it.id, zona))}>
      <span>{it.texto}</span>
      <span class="acciones">
        {it.zona !== 'dentro' && <button type="button" onClick={() => mover(it.id, 'dentro')} aria-label={`Mover "${it.texto}" a: depende de mí`}>Depende de mí</button>}
        {it.zona !== 'fuera' && <button type="button" onClick={() => mover(it.id, 'fuera')} aria-label={`Mover "${it.texto}" a: no depende de mí`}>No depende</button>}
      </span>
    </li>
  );
}

export default function CirculoControl() {
  const [items, setItems] = useState<Item[]>([]);
  const [texto, setTexto] = useState('');
  const [fase, setFase] = useState<'ubicar' | 'sintesis' | 'guardado'>('ubicar');
  const [paso, setPaso] = useState('');
  const [aviso, setAviso] = useState('');
  const siguiente = useRef(1);

  const añadir = (e: Event) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    setItems([...items, { id: siguiente.current++, texto: t, zona: 'sin' }]);
    setTexto('');
    setAviso(`Añadido: ${t}. Ahora ubícalo.`);
  };
  const mover = (id: number, zona: Zona) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, zona } : x)));
    const it = items.find((x) => x.id === id);
    if (it) setAviso(`${it.texto}: ${NOMBRE_ZONA[zona]}.`);
  };

  const dentro = items.filter((x) => x.zona === 'dentro');
  const fuera = items.filter((x) => x.zona === 'fuera');
  const sin = items.filter((x) => x.zona === 'sin');

  const guardar = async () => {
    const d = await diarioNavegador();
    await d.guardar({ tipo: 'circulo', titulo: 'Círculo del control', datos: { dentro: dentro.map((x) => x.texto), fuera: fuera.map((x) => x.texto), paso } });
    setFase('guardado');
  };

  if (fase !== 'ubicar') {
    return (
      <section class="circulo-sintesis" aria-live="polite">
        <p class="inscripcion">Síntesis</p>
        <p class="grande">Tu atención va aquí: <strong>{dentro.map((x) => x.texto).join(' · ') || 'nada todavía'}</strong>.</p>
        {fuera.length > 0 && <p>Esto no te corresponde; puedes soltarlo: {fuera.map((x) => x.texto).join(' · ')}.</p>}
        {fase === 'sintesis' ? (
          <>
            <label for="primer-paso">Elige una sola cosa de adentro. ¿Cuál es el primer paso concreto?</label>
            <textarea id="primer-paso" value={paso} onInput={(e) => setPaso((e.target as HTMLTextAreaElement).value)} />
            <p class="fila">
              <button class="boton" type="button" onClick={guardar}>Guardar en mi diario</button>
              <button class="boton sutil" type="button" onClick={() => setFase('ubicar')}>Volver al círculo</button>
            </p>
          </>
        ) : (
          <p role="status" class="asentada">Guardado. Una piedra más en su lugar.</p>
        )}
      </section>
    );
  }

  return (
    <div class="circulo-app">
      <form onSubmit={añadir} class="fila">
        <label for="preocupacion" class="visualmente-oculto">¿Qué te inquieta?</label>
        <input id="preocupacion" placeholder="¿Qué te inquieta hoy? p. ej. «la reunión del jueves»" value={texto} onInput={(e) => setTexto((e.target as HTMLInputElement).value)} maxLength={80} />
        <button class="boton" type="submit">Añadir</button>
      </form>

      {sin.length > 0 && (
        <div class="bandeja" data-zona="sin">
          <p class="inscripcion">Sin ubicar · arrástralas o usa los botones</p>
          <ul>{sin.map((it) => <Chip key={it.id} it={it} mover={mover} />)}</ul>
        </div>
      )}

      <div class="campo" data-zona="fuera" aria-label="Fuera del círculo: no depende de mí">
        <p class="rotulo fuera-r">No depende de mí</p>
        <ul class="lista-fuera">{fuera.map((it) => <Chip key={it.id} it={it} mover={mover} />)}</ul>
        <div class="anillo" data-zona="dentro" aria-label="Dentro del círculo: depende de mí">
          <p class="rotulo dentro-r">Depende de mí</p>
          <ul>{dentro.map((it) => <Chip key={it.id} it={it} mover={mover} />)}</ul>
        </div>
      </div>

      <p class="visualmente-oculto" aria-live="polite">{aviso}</p>
      <p class="fila">
        <button class="boton" type="button" disabled={dentro.length + fuera.length === 0} onClick={() => setFase('sintesis')}>Terminar</button>
        <span class="ayuda-texto">{items.length === 0 ? 'Empieza escribiendo una preocupación.' : `${dentro.length} dentro · ${fuera.length} fuera`}</span>
      </p>
    </div>
  );
}
