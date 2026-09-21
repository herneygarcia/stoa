#!/usr/bin/env bash
# Hook PostToolUse (Edit|Write): si se tocó contenido o el contrato, valida al instante.
entrada=$(cat)
archivo=$(printf '%s' "$entrada" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch{console.log("")}})')
case "$archivo" in
  *src/content/*|*src/lib/schemas.ts|*src/lib/reglas.ts)
    salida=$(npm run --silent validate:content 2>&1) || { echo "$salida" | tail -20 >&2; exit 2; } ;;
esac
exit 0
