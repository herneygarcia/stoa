// CA-004.5: la constancia como un olivo que crece. Una hoja por día con práctica; nunca se caen.
const W = 320, H = 150;

/** Punto y tangente sobre la rama (curva cuadrática suave de izquierda a derecha). */
function rama(t: number) {
  const p0 = { x: 12, y: 120 }, p1 = { x: 150, y: 20 }, p2 = { x: 308, y: 70 };
  const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  return { x, y, ang: (Math.atan2(dy, dx) * 180) / Math.PI };
}

export default function Olivo({ dias }: { dias: string[] }) {
  const n = dias.length;
  const visibles = Math.min(n, 60);
  const hojas = Array.from({ length: visibles }, (_, i) => {
    const t = 0.06 + (0.9 * (i + 1)) / Math.max(visibles, 12);
    const p = rama(Math.min(t, 0.97));
    const lado = i % 2 ? 1 : -1;
    return { ...p, rot: p.ang + lado * (38 + ((i * 17) % 18)), ultima: i === visibles - 1 };
  });
  const aceitunas = Math.floor(n / 7);

  return (
    <figure class="olivo">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Olivo con ${n} hojas: ${n} días de práctica`}>
        <path d="M12 120 Q150 20 308 70" fill="none" stroke="var(--piedra-2)" stroke-width="2.2" stroke-linecap="round" />
        {hojas.map((h, i) => (
          <ellipse key={i} cx={h.x} cy={h.y} rx="11" ry="3.4" transform={`rotate(${h.rot} ${h.x} ${h.y}) translate(9 0)`}
            fill={h.ultima ? 'var(--ocre)' : 'var(--malaquita)'} opacity={h.ultima ? 1 : 0.55 + (i % 3) * 0.15} class={h.ultima ? 'hoja-nueva' : ''} />
        ))}
        {Array.from({ length: Math.min(aceitunas, 8) }, (_, i) => {
          const p = rama(0.2 + i * 0.1);
          return <circle key={`a${i}`} cx={p.x + 4} cy={p.y + 9} r="4" fill="var(--azul)" opacity=".8" />;
        })}
      </svg>
      <figcaption>
        {n === 0
          ? 'Tu olivo espera su primera hoja. Cada día que practiques, crece una.'
          : `${n} ${n === 1 ? 'día' : 'días'} de práctica${aceitunas ? ` · ${aceitunas} ${aceitunas === 1 ? 'aceituna' : 'aceitunas'} (una por cada siete días)` : ''}. Las hojas no se caen si faltas un día.`}
      </figcaption>
    </figure>
  );
}
