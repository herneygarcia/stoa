# Stoa · estoicismo para cada día

PWA en español que introduce la filosofía estoica con **un caso de la vida real cada día**, prácticas interactivas y un diario privado. Construida con **Spec-Driven Development** y un **arnés** de validaciones automáticas.

## Qué hay dentro
- **Hoy**: el pórtico como reloj de sol (la sombra sigue la hora de Bogotá), el caso del día y la práctica del momento (mañana: preparación · tarde: acción · noche: examen).
- **Principios** (7) y **virtudes** (4), basados en `Principios Básicos del Estoicismo.docx`, corregidos y con fuentes exactas.
- **Prácticas**: círculo del control, termómetro de emociones y examen nocturno (interactivos), más premeditación, visión desde arriba, reserva mental, incomodidad voluntaria, memento mori y las dos asas.
- **Casos**: 90 casos curados en 9 ámbitos + un caso nuevo cada mañana generado con Claude y aprobado por el arnés.
- **Diario**: vive solo en el dispositivo (IndexedDB); se exporta o se borra. La constancia se ve como un olivo que crece.

## Cómo se trabaja (SDD + arnés)
1. `.specify/memory/constitution.md`: reglas no negociables.
2. `specs/NNN-*/`: `spec.md` → `plan.md` → `tasks.md`. Cada criterio `CA-NNN.k` tiene su prueba.
3. El arnés:
   - `npm run verify`: tipos, lint estricto con límites de complejidad, duplicación, código muerto, validación de contenido (esquemas Zod + corpus de citas cerrado + reglas de cuidado), cobertura, evals offline y **pruebas de mutación**. Métricas en [`docs/calidad.md`](docs/calidad.md).
   - `npm run test:e2e`: Playwright en móvil y escritorio, con axe (WCAG 2.2 AA) y prueba offline.
   - Hooks de Claude Code (`.claude/settings.json`): valida contenido al editarlo y bloquea el cierre de una tarea con el arnés en rojo.
   - Pipeline diario (`scripts/daily-case/`): generar → reglas + juez → hasta 3 intentos → publicar o fallback al banco.

## Comandos
```bash
npm install
npm run dev              # http://localhost:4321
npm run verify           # arnés rápido
npm run build && npm run test:e2e
npm run daily -- --dry-run   # caso diario sin escribir (requiere ANTHROPIC_API_KEY)
npm run evals:llm        # evals con el modelo (requiere ANTHROPIC_API_KEY)
```

## Publicar en GitHub Pages
1. Crea el repositorio y sube el código a `main`.
2. *Settings → Pages → Source: GitHub Actions*.
3. *Settings → Secrets and variables → Actions*: secreto `ANTHROPIC_API_KEY` (y opcionalmente la variable `STOA_MODELO`; por defecto `claude-opus-5`).
4. `deploy.yml` publica en cada push; `daily.yml` corre a las 05:00 de Bogotá y también se puede lanzar a mano.

Sin la clave, el sitio funciona igual: cada día muestra un caso del banco curado.

## Aviso
Stoa no es terapia ni consejo médico. Líneas de ayuda en Colombia: 106 (Bogotá), 192 opción 4, emergencias 123.
