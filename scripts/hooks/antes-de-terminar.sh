#!/usr/bin/env bash
# Hook Stop: no se da una tarea por terminada con el arnés en rojo (constitución VI.3).
entrada=$(cat)
# Evita bucles: si ya se bloqueó una vez en este turno, deja terminar.
printf '%s' "$entrada" | grep -q '"stop_hook_active":true' && exit 0
salida=$(npm run --silent verify 2>&1) || { echo "El arnés está en rojo. Corrige antes de terminar:" >&2; echo "$salida" | tail -25 >&2; exit 2; }
exit 0
