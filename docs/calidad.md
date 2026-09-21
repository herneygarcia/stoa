# Calidad de código: antes y después

Medido el 2026-09-21 sobre el mismo repositorio, con las herramientas de la constitución VII. Reproducible con `npm run verify`.

| Métrica | Antes | Después | Umbral |
|---|---|---|---|
| Errores de lint (TS estricto + complejidad) | 33 | **0** | 0 |
| Funciones con complejidad > 10 | 2 (`reglasCaso` 15, `Termometro` 14) | **0** | 0 |
| Aserciones no nulas (`!`) | 17 | **0** | 0 |
| Código duplicado (jscpd) | 0,35 % | **0,00 %** | ≤ 3 % |
| Lógica repetida no detectada por jscpd | hora de Colombia ×3, geometría del reloj ×2, lector de contenido ×2, formato de errores ×4 | **1 lugar cada una** | — |
| Archivos / exportaciones sin uso (knip) | 11 archivos, 8 exportaciones | **0** | 0 |
| Cobertura de `src/lib` (líneas / ramas) | 91,4 % / 82,6 % | **100 % / 98,4 %** | ≥ 90 % / ≥ 85 % |
| **Puntaje de mutación** de `src/lib` | **60,7 %** | **97,2 %** | ≥ 80 % |
| Pruebas unitarias | 20 | **145** | — |
| Pruebas E2E (móvil + escritorio, con axe) | 49 | 49 | todas |
| Líneas de código de la app (sin pruebas) | ≈ 1.960 | ≈ 2.090 | — |

## Qué encontraron las herramientas
- **Pruebas que no probaban**: con 91 % de cobertura, las pruebas dejaban pasar 4 de cada 10 errores introducidos a propósito. `schemas.ts` (el contrato de contenido) tenía 24,7 % de mutación: ningún límite de palabras ni vocabulario estaba probado.
- **Una prueba que pasaba por la zona horaria del computador**: `fechaEnColombia` sin zona horaria seguía "funcionando" porque el equipo está en Colombia. Las pruebas ahora corren en UTC.
- **Un requisito implícito sin prueba**: "días consecutivos alternan ámbitos" solo estaba en un comentario.
- **Defectos de diseño típicos de código generado**: un componente definido dentro de otro (se re-montaba en cada cambio), la misma lógica copiada en 3 archivos, tipos forzados (`string & string[]`), un selector de tema en CSS que la interfaz nunca tuvo, y dos fuentes de verdad para los casos.
- **Una métrica engañosa**: el integrador oficial de Stryker con Vitest 5 reportaba 0 % sin ejecutar los mutantes. Se detectó porque vaciar una función entera "sobrevivía", algo imposible. Se cambió a un ejecutor verificable.

## Mutantes que sobreviven (y por qué se aceptan)
Son **equivalentes**: cambian el código pero no el comportamiento observable.
- `contarPalabras`: dividir por `/\s/` o `/\s+/` da el mismo conteo porque luego se descartan los vacíos.
- `paso` en `caso-del-dia.ts`: cualquier paso coprimo con el tamaño del banco cumple la spec.
- Mensajes de error y separadores internos que no llegan a la interfaz.

## El código creció un 6 %
Las nuevas líneas son módulos con nombre y responsabilidad única (`tiempo.ts`, `reloj.ts`, `diario-navegador.ts`, `scripts/contenido.ts`) y componentes pequeños. Ninguna función supera la complejidad 10. Menos líneas no es la meta: la meta es que cada línea tenga un solo motivo para cambiar y una prueba que falle si se rompe.
