# Constitución de Stoa

> Principios no negociables. Toda spec, plan y línea de código se evalúa contra este documento.
> Cambiarlo requiere una nota en `docs/decisiones.md` con fecha y motivo.

## I. Fidelidad a las fuentes
1. Toda cita mostrada existe en el corpus `src/content/citas/citas.json`, con autor, obra y referencia exacta (libro, capítulo, parágrafo).
2. Las traducciones son propias, hechas a partir de ediciones de dominio público; se marcan como tales.
3. Si algo es interpretación moderna (p. ej. *amor fati* es un término de Nietzsche, no de los estoicos antiguos) se dice explícitamente.
4. Ningún contenido generado por IA puede introducir una cita que no esté en el corpus.

## II. Cuidado, no clínica
1. Stoa no diagnostica, no receta y no reemplaza la ayuda profesional.
2. Ante duelo reciente, violencia, autolesión o ideación suicida, el contenido deriva a ayuda profesional y muestra líneas de ayuda (Colombia: Línea 192, opción 4).
3. El estoicismo no es "reprimir emociones": se enseña como examen de los juicios, no como frialdad.

## III. Privacidad total
1. Sin cuentas, sin rastreadores, sin analítica de terceros.
2. Todo lo que escribe la persona (diario, ejercicios) vive solo en su dispositivo (IndexedDB) y se puede exportar o borrar.

## IV. Accesible y sereno
1. WCAG 2.2 AA: contraste, teclado, lectores de pantalla, `prefers-reduced-motion`.
2. Mobile-first; funciona sin conexión una vez visitado.
3. Diseño propio: sin librerías de componentes, sin plantillas, sin emojis como iconos.

## V. Idioma
Español neutro, tuteo, frases cortas. Nada de jerga de autoayuda ("mindset", "hackea tu vida").

## VI. Proceso (Spec-Driven Development)
1. Sin spec aprobada no hay código: `spec.md → plan.md → tasks.md → implementación → verificación`.
2. Cada criterio de aceptación (Given/When/Then) tiene al menos una prueba o chequeo automático que lo cubre, referenciado por su ID (p. ej. `CA-002.3`).
3. El arnés (`npm run verify` + E2E) debe estar en verde antes de dar una tarea por terminada.

## VII. Calidad de código medible
La calidad no se afirma, se mide. Estas compuertas son parte del arnés (`npm run verify`, CI y hook de cierre) y no se relajan sin una decisión registrada en `docs/decisiones.md`:
1. **Tipos**: TypeScript estricto, sin `!` (aserciones no nulas) ni conversiones forzadas de tipo.
2. **Complejidad**: complejidad ciclomática ≤ 10 por función, anidamiento ≤ 3, ≤ 4 parámetros, funciones ≤ 60 líneas (≤ 120 en componentes de UI y pruebas E2E).
3. **Duplicación**: ≤ 3 % (jscpd). Una lógica, un lugar: la hora de Colombia vive en `src/lib/tiempo.ts`, la geometría del reloj en `src/lib/reloj.ts`.
4. **Código muerto**: cero archivos, exportaciones o dependencias sin uso (knip).
5. **Pruebas**: cobertura de `src/lib` ≥ 90 % en líneas y **puntaje de mutación ≥ 80 %** (Stryker). La cobertura dice qué se ejecutó; la mutación dice si las pruebas detectan errores.
6. **Separación**: la lógica pura va en `src/lib` (probada con pruebas unitarias); el código que toca el navegador o la red es una capa delgada (probada con E2E).
7. **Revisión**: todo cambio pasa por una revisión (`/code-review`) antes de fusionarse; la IA propone, el arnés filtra, una persona decide.
