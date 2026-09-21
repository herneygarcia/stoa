# 005 — PWA offline y publicación

## Criterios de aceptación
- **CA-005.1** El sitio es instalable (manifest válido, íconos 192/512, `display: standalone`).
- **CA-005.2** Tras una visita, las páginas visitadas y el shell funcionan sin conexión; sin conexión y sin caché se muestra `/offline`.
- **CA-005.3** Lighthouse: accesibilidad ≥ 95, rendimiento ≥ 90 en móvil.
- **CA-005.4** Cada push a `main` corre el arnés y publica en GitHub Pages; el cron diario también publica.
