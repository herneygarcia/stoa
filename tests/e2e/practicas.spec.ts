import { test, expect, type Locator } from '@playwright/test';

/** Centro de un elemento visible (falla la prueba si el elemento no tiene caja). */
async function centro(l: Locator) {
  const caja = await l.boundingBox();
  expect(caja).not.toBeNull();
  const { x, y, width, height } = caja ?? { x: 0, y: 0, width: 0, height: 0 };
  return { x: x + width / 2, y: y + height / 2 };
}

test('CA-002.7 llevar la pregunta del caso al diario', async ({ page }) => {
  await page.goto('/casos/ciudad-trancon');
  await page.getByRole('button', { name: 'Llevar a mi diario' }).click();
  await expect(page.getByRole('status')).toContainText('Guardada en tu diario');
  await page.getByRole('link', { name: 'Escribir mi respuesta' }).click();
  await expect(page.locator('.entrada.reflexion')).toContainText('Atrapado en el trancón');
  await page.getByLabel('Tu respuesta').fill('Leer en el bus.');
  await page.getByRole('button', { name: 'Guardar respuesta' }).click();
  await expect(page.locator('.entrada.reflexion')).toContainText('Leer en el bus.');
});

test('CA-003.1 círculo del control solo con teclado', async ({ page }) => {
  await page.goto('/practicas/circulo-del-control');
  const campo = page.getByPlaceholder(/Qué te inquieta/);
  await campo.fill('La reunión del jueves');
  await campo.press('Enter');
  await campo.fill('Lo que opine mi jefe');
  await campo.press('Enter');
  await page.getByRole('button', { name: 'Mover "La reunión del jueves" a: depende de mí' }).press('Enter');
  await page.getByRole('button', { name: 'Mover "Lo que opine mi jefe" a: no depende de mí' }).press('Enter');
  await page.getByRole('button', { name: 'Terminar' }).click();
  await expect(page.getByText('Tu atención va aquí')).toContainText('La reunión del jueves');
  await page.getByLabel(/primer paso/).fill('Preparar tres puntos');
  await page.getByRole('button', { name: 'Guardar en mi diario' }).click();
  await expect(page.getByRole('status')).toContainText('Guardado');
});

test('CA-003.1 círculo del control con arrastre', async ({ page, isMobile }) => {
  test.skip(isMobile, 'el arrastre táctil se cubre con los botones');
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.goto('/practicas/circulo-del-control');
  await page.getByPlaceholder(/Qué te inquieta/).fill('Dormir bien');
  await page.getByRole('button', { name: 'Añadir' }).click();
  const origen = await centro(page.locator('.bandeja .chip span').first());
  const destino = await centro(page.locator('.anillo'));
  await page.mouse.move(origen.x, origen.y);
  await page.mouse.down();
  await page.mouse.move(destino.x, destino.y, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.anillo .chip')).toContainText('Dormir bien');
});

test('CA-003.2 examen nocturno guarda en el diario', async ({ page }) => {
  await page.goto('/practicas/examen-nocturno');
  await page.getByLabel('¿Qué hiciste bien hoy?').fill('Escuché a mi hermana');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('¿En qué fallaste?').fill('Respondí con ironía');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('¿Qué harás distinto mañana?').fill('Esperar antes de responder');
  await page.getByRole('button', { name: 'Cerrar el día' }).click();
  await expect(page.getByRole('status')).toContainText('El día queda en su lugar');
  await page.goto('/diario');
  await expect(page.locator('.entrada.examen')).toContainText('Escuché a mi hermana');
  await expect(page.locator('.olivo figcaption')).toContainText('1 día de práctica');
});

test('CA-004.1 / CA-004.4 termómetro en cuatro pasos y alerta de ayuda', async ({ page }) => {
  await page.goto('/practicas/termometro');
  await page.getByText('Ansiedad', { exact: true }).click();
  await page.locator('.grado').nth(2).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.locator('.grado').nth(4).click();
  await expect(page.getByRole('alert')).toContainText('Línea 192');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel(/Qué pasó/).fill('No me respondieron el mensaje.');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel(/Qué te estás diciendo/).fill('Que no les importo.');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByText('No del todo').click();
  await page.getByRole('button', { name: 'Guardar en mi diario' }).click();
  await expect(page.getByText('Separaste el hecho del juicio')).toBeVisible();
});

test('CA-004.2 / CA-004.3 el diario no usa la red, exporta y borra', async ({ page }) => {
  const peticiones: string[] = [];
  await page.goto('/practicas/examen-nocturno');
  page.on('request', (r) => { if (r.method() !== 'GET') peticiones.push(r.url()); });
  for (const [l, t] of [['¿Qué hiciste bien hoy?', 'a'], ['¿En qué fallaste?', 'b'], ['¿Qué harás distinto mañana?', 'c']]) {
    await page.getByLabel(l).fill(t);
    await page.getByRole('button', { name: /Siguiente|Cerrar el día/ }).click();
  }
  await expect(page.getByRole('status')).toContainText('El día queda');
  await page.goto('/diario');
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: /Exportar/ }).click();
  expect((await descarga).suggestedFilename()).toMatch(/^stoa-diario-.*\.json$/);
  await page.getByRole('button', { name: 'Borrar todo' }).click();
  await page.getByRole('button', { name: 'Sí, borrar todo' }).click();
  await expect(page.getByText('Tu diario está vacío')).toBeVisible();
  expect(peticiones).toEqual([]);
});
