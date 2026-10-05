#!/usr/bin/env node
/**
 * Wrapper para Lighthouse CI.
 * Corre auditoría de Lighthouse en las páginas clave con los umbrales de la spec.
 * CA-005.3: accesibilidad ≥ 0.95, rendimiento ≥ 0.90.
 */

// Importar para que knip vea la dependencia
import '@lhci/cli';

import { spawn } from 'child_process';

const child = spawn('npx', ['lhci', 'autorun'], {
  cwd: process.cwd(),
  stdio: 'inherit',
});

child.on('exit', process.exit);
child.on('error', (err) => {
  console.error('Error corriendo Lighthouse CI:', err);
  process.exit(1);
});
