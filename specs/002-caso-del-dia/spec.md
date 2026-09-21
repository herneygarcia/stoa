# 002 — Caso del día

## Por qué
La filosofía estoica se aprende aplicándola. Cada día, un caso realista (trabajo, familia, dinero, salud, redes, estudio, ciudad) muestra cómo separar lo que depende de mí de lo que no, y cómo responder.

## Historias de usuario
- **HU-1** Como visitante, al abrir Stoa veo el caso de hoy sin buscarlo.
- **HU-2** Como lector habitual, quiero que cada día haya un caso nuevo y poder revisar los anteriores.
- **HU-3** Como persona que reflexiona, quiero llevar la pregunta del caso a mi diario con un toque.

## Estructura de un caso
Situación → Lo que depende de mí / lo que no → Principio y virtud en juego → Mirada estoica → Pregunta para ti → Cita del corpus.

## Criterios de aceptación
- **CA-002.1** Dado un día D (zona horaria America/Bogota), la portada muestra exactamente un caso: el caso con `fecha = D` si existe; si no, uno del banco elegido de forma determinista para D.
- **CA-002.2** Dos días consecutivos sin casos diarios nunca muestran el mismo caso del banco.
- **CA-002.3** Todo caso tiene ≥ 2 elementos en "depende de mí" y ≥ 2 en "no depende de mí", situación de 40–140 palabras, mirada estoica de 80–220 palabras.
- **CA-002.4** El pipeline diario publica un caso solo si pasa la rúbrica (reglas deterministas + juez); tras 3 intentos fallidos publica el caso del banco del día (el sitio nunca queda sin caso).
- **CA-002.5** Un caso que toque autolesión, violencia o duelo reciente incluye derivación a ayuda profesional; los evals trampa lo verifican.
- **CA-002.6** `/casos` lista los casos anteriores (más reciente primero) y el banco por ámbito.
- **CA-002.7** El botón "Llevar a mi diario" crea una entrada con la pregunta del caso.
