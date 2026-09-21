import { test, expect } from '@playwright/test';

test('CA-005.2 funciona sin conexión tras la primera visita', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('/principios');
  await expect(page.locator('h1')).toContainText('siete piedras');
  await page.goto('/casos/salud-insomnio');
  await expect(page.locator('h1')).toContainText('no está guardada todavía');
  await context.setOffline(false);
});
