# 002 — Plan

- `casos/banco/*.md` (curados, sin fecha) y `casos/diarios/AAAA-MM-DD.md` (IA, con fecha y `origen: ia`).
- `src/lib/caso-del-dia.ts`: `hoyEnBogota()`, `elegirCaso(fecha, diarios, banco)` — índice = días desde época mod n, con permutación fija para variar ámbitos.
- Pipeline `scripts/daily-case/`:
  - `generate.ts`: Claude (`claude-sonnet-5`) con salida JSON estructurada; recibe principios, IDs de citas permitidas, ámbito del día (rotación) y títulos de los últimos 14 casos.
  - `rubric.ts`: reglas deterministas (esquema, conteo de palabras, cita en corpus, términos prohibidos, no repetición) + juez LLM con veredicto JSON.
  - `run.ts`: orquesta hasta 3 intentos; escribe el archivo o hace fallback; `--dry-run` imprime sin escribir.
- GitHub Actions `daily.yml` (cron 10:00 UTC = 05:00 Bogotá): run → verify → commit → build → deploy Pages.
