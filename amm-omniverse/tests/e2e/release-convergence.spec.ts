import { test, expect } from '@playwright/test';

async function expectJsonOk(page: any, path: string, allowDegraded = false) {
  const response = await page.request.get(path, { timeout: 45_000 });
  expect(response.status(), `${path} status`).toBeLessThan(400);
  const data = await response.json();
  expect(data.ok, `${path} ok`).toBeTruthy();
  if (!allowDegraded) expect(data.degraded, `${path} degraded`).not.toBe(true);
  return data;
}

test.describe('TRYAMM release convergence', () => {
  test('core public surfaces render', async ({ page }) => {
    for (const path of ['/', '/streetverse', '/financial-truth']) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${path} status`).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toHaveText('Application error');
    }
  });

  test('HoloGPT shell and real-response smoke are distinguishable', async ({ page }) => {
    const health = await expectJsonOk(page, '/api/ai/health', true);
    expect(health.service).toBeTruthy();

    const smoke = await page.request.get('/api/ai/smoke', { timeout: 45_000 });
    const data = await smoke.json();
    expect([200, 503]).toContain(smoke.status());
    expect(data.service).toMatch(/HoloGPT/i);
    if (smoke.status() === 200) {
      expect(data.ok).toBe(true);
      expect(data.degraded).not.toBe(true);
    }
  });

  test('Creator Media readiness is explicit', async ({ page }) => {
    const response = await page.request.get('/api/media/health', { timeout: 45_000 });
    expect(response.status()).toBeLessThan(500);
    const data = await response.json();
    expect(typeof data.ok).toBe('boolean');
    expect(data.service || data.error).toBeTruthy();
  });

  test('critical UI has no obvious horizontal overflow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth + 8);
  });
});
