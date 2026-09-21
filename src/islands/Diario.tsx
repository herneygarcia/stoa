import { useEffect, useState } from 'preact/hooks';
import { diasConPractica, type Entrada } from '../lib/diario';
import { diarioNavegador } from '../lib/diario-navegador';
import Olivo from './Olivo';

type D = Awaited<ReturnType<typeof diarioNavegador>>;
const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const NOMBRE: Record<Entrada['tipo'], string> = { reflexion: 'Reflexión', circulo: 'Círculo del control', termometro: 'Termómetro', examen: 'Examen nocturno' };

function Reflexion({ e, d, recargar }: { e: Extract<Entrada, { tipo: 'reflexion' }>; d: D; recargar: () => void }) {
  const [borrador, setBorrador] = useState('');
  const guardar = async (ev: Event) => {
    ev.preventDefault();
    await d.responder(e.id, borrador);
    recargar();
  };
  return (
    <>
      <p class="preg">{e.datos.pregunta}</p>
      {e.datos.respuesta ? <p>{e.datos.respuesta}</p> : (
        <form onSubmit={guardar}>
          <label for={`r-${e.id}`} class="visualmente-oculto">Tu respuesta</label>
          <textarea id={`r-${e.id}`} value={borrador} onInput={(ev) => setBorrador((ev.target as HTMLTextAreaElement).value)} placeholder="Escribe tu respuesta…" />
          <button class="boton" type="submit" disabled={!borrador.trim()}>Guardar respuesta</button>
        </form>
      )}
    </>
  );
}

function Cuerpo({ e, d, recargar }: { e: Entrada; d: D; recargar: () => void }) {
  switch (e.tipo) {
    case 'reflexion':
      return <Reflexion e={e} d={d} recargar={recargar} />;
    case 'circulo':
      return <><p><strong>Depende de mí:</strong> {e.datos.dentro.join(' · ')}</p><p><strong>No depende:</strong> {e.datos.fuera.join(' · ')}</p>{e.datos.paso && <p><strong>Primer paso:</strong> {e.datos.paso}</p>}</>;
    case 'termometro':
      return <><p><strong>Hecho:</strong> {e.datos.hecho}</p><p><strong>Juicio:</strong> {e.datos.juicio} <em>({e.datos.cierto})</em></p>{e.datos.depende && <p><strong>Depende de mí:</strong> {e.datos.depende}</p>}</>;
    case 'examen':
      return <><p><strong>Bien:</strong> {e.datos.bien}</p><p><strong>Falla:</strong> {e.datos.fallo}</p><p><strong>Mañana:</strong> {e.datos.manana}</p></>;
  }
}

export default function Diario({ base }: { base: string }) {
  const [d, setD] = useState<D | null>(null);
  const [entradas, setEntradas] = useState<Entrada[] | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const recargar = async (dd = d) => { if (dd) setEntradas(await dd.listar()); };
  useEffect(() => { diarioNavegador().then((dd) => { setD(dd); recargar(dd); }); }, []);

  const exportar = async () => {
    if (!d) return;
    const blob = new Blob([await d.exportar()], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `stoa-diario-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!entradas || !d) return <p class="nota">Abriendo tu diario…</p>;

  return (
    <div class="diario">
      <Olivo dias={diasConPractica(entradas)} />
      {entradas.length === 0 ? (
        <p class="vacio">Tu diario está vacío. Empieza por el <a href={`${base.replace(/\/$/, '')}/practicas/circulo-del-control`}>círculo del control</a> o lleva aquí la pregunta del caso de hoy.</p>
      ) : (
        <ol class="entradas">
          {entradas.map((e) => (
            <li class={`entrada ${e.tipo}`} key={e.id}>
              <p class="inscripcion">{NOMBRE[e.tipo]} · {fecha(e.creada)}</p>
              <h3>{e.titulo}</h3>
              <Cuerpo e={e} d={d} recargar={() => recargar()} />
              <button class="borrar" type="button" onClick={async () => { await d.borrar(e.id); recargar(); }} aria-label={`Borrar entrada: ${e.titulo}`}>Borrar</button>
            </li>
          ))}
        </ol>
      )}
      <div class="fila herramientas">
        <button class="boton sutil" type="button" onClick={exportar} disabled={!entradas.length}>Exportar mi diario (JSON)</button>
        {!confirmar
          ? <button class="boton sutil" type="button" onClick={() => setConfirmar(true)} disabled={!entradas.length}>Borrar todo</button>
          : <span class="fila"><span>¿Borrar las {entradas.length} entradas? No se puede deshacer.</span>
              <button class="boton" type="button" onClick={async () => { await d.borrarTodo(); setConfirmar(false); recargar(); }}>Sí, borrar todo</button>
              <button class="boton sutil" type="button" onClick={() => setConfirmar(false)}>Cancelar</button></span>}
      </div>
    </div>
  );
}
