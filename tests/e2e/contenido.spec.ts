import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('CA-001.1 siete principios con numeral romano y resumen', async ({ page }) => {
  await page.goto('/principios');
  const items = page.locator('ol.lista > li');
  await expect(items).toHaveCount(7);
  await expect(items.first().locator('.num')).toHaveText('I');
});

test('CA-001.2 cada principio muestra cita con referencia y ejemplo', async ({ page }) => {
  await page.goto('/principios/dicotomia-del-control');
  await expect(page.locator('figure.cita').first()).toContainText('Enquiridión');
  await expect(page.getByText('En la vida real')).toBeVisible();
});

test('CA-001.3 cuatro virtudes con término griego y vicio opuesto', async ({ page }) => {
  await page.goto('/virtudes');
  await expect(page.locator('a.v')).toHaveCount(4);
  await expect(page.locator('a.v').first()).toContainText('Su opuesto');
});

for (const ruta of ['/', '/principios', '/principios/apatheia', '/virtudes', '/practicas', '/practicas/circulo-del-control', '/practicas/termometro', '/practicas/examen-nocturno', '/casos', '/casos/trabajo-correo-del-jefe', '/diario', '/sobre']) {
  test(`CA-001.5 accesibilidad y un único h1 en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toHaveCount(1);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
  });
}

test('CA-002.1 la portada muestra exactamente un caso del día', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#caso article.caso')).toHaveCount(1);
  await expect(page.locator('#caso')).toContainText('Depende de ti');
  await expect(page.locator('#caso')).toContainText('No depende de ti');
});

test('CA-002.6 /casos lista el banco por ámbito', async ({ page }) => {
  await page.goto('/casos');
  for (const a of ['trabajo', 'familia', 'salud', 'redes']) await expect(page.locator(`#${a} li`).first()).toBeVisible();
});

test('CA-005.1 manifest instalable', async ({ request }) => {
  const m = await (await request.get('/manifest.webmanifest')).json();
  expect(m.display).toBe('standalone');
  expect(m.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect((await request.get('/icono-512.png')).ok()).toBe(true);
});
