@AGENTS.md

## Notas para Claude Code

Los hooks están configurados en `.claude/settings.json`:
- `tras-editar.sh`: valida el contenido al editar `src/content/*`, `schemas.ts` o `reglas.ts`.
- `antes-de-terminar.sh`: corre `npm run verify` completo y bloquea si falla.

El memory del proyecto está en `.claude/projects/-Users-herneygarcia-Downloads-07-Projects-Code-stoicism/memory/`.
