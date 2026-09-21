# 006 — Calidad de código medible

## Por qué
El código generado con IA tiende a ser más largo, repetitivo y con errores que "parecen correctos". Para que Stoa sea aceptable con criterios académicos y profesionales, la calidad debe medirse con herramientas objetivas y reproducibles, no con impresiones.

## Criterios de aceptación
- **CA-006.1** `npm run lint` pasa sin errores con TypeScript estricto y los límites de la constitución VII.2.
- **CA-006.2** `npm run duplicacion` reporta ≤ 3 % de código duplicado.
- **CA-006.3** `npm run muerto` no encuentra archivos, exportaciones ni dependencias sin uso.
- **CA-006.4** `npm run test:cobertura` cumple ≥ 90 % de líneas y funciones y ≥ 85 % de ramas en `src/lib`.
- **CA-006.5** `npm run mutacion` obtiene un puntaje ≥ 80 % en `src/lib`.
- **CA-006.6** Las pruebas unitarias no dependen de la zona horaria del computador (corren en UTC).
- **CA-006.7** Las métricas antes y después quedan registradas en `docs/calidad.md`.
