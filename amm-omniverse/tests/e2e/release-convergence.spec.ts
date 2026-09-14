import { test, expect } from '@playwright/test';

const uiBase = process.env.TRYAMM_BASE_URL || 'https://tryamm.online';
const apiBase = process.env.TRYAMM_API_BASE_URL || uiBase;
const apiUrl = (path: string) => `${apiBase.replace(/\/$/, '')}${path}`;

async function expectJsonOk(page: any, path: string, allowDegraded = false) {
  const response = await page.request.get(apiUrl(path), { timeout: 45_000 });
  expect(response.status(), `${path} status`).toBeLessThan(400);
  expect(response.headers()['content-type'] || '', `${path} content type`).toMatch(/application\/json/i);
  const data = await response.json();
  expect(data.ok, `${path} ok`).toBeTruthy();
  if (!allowDegraded) expect(data.degraded, `${path} degraded`).not.toBe(true);
  return data;
}

test.describe('TRYAMM release convergence', () => {
  test('core public surfaces render', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type: any, ...args: any[]) {
        if (String(type).startsWith('webgl')) return null;
        return (original as any).call(this, type, ...args);
      } as any;
    });

    for (const path of ['/', '/streetverse', '/financial-truth']) {
      const response = await page.goto(`${uiBase.replace(/\/$/, '')}${path}`, {
        waitUntil: 'commit',
        timeout: 45_000,
      });
      expect(response?.status(), `${path} status`).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible({ timeout: 45_000 });
      await expect(page.locator('body')).not.toHaveText('Application error');
    }
  });

  test('HoloGPT shell and real-response smoke are distinguishable', async ({ page }) => {
    const health = await expectJsonOk(page, '/api/ai/health', true);
    expect(health.service).toBeTruthy();

    const smoke = await page.request.get(apiUrl('/api/ai/smoke'), { timeout: 45_000 });
    expect(smoke.headers()['content-type'] || '', '/api/ai/smoke content type').toMatch(/application\/json/i);
    const data = await smoke.json();
    expect([200, 503]).toContain(smoke.status());
    expect(data.service).toMatch(/HoloGPT/i);
    if (smoke.status() === 200) {
      expect(data.ok).toBe(true);
      expect(data.degraded).not.toBe(true);
    }
  });

  test('Creator Media readiness is explicit', async ({ page }) => {
    const response = await page.request.get(apiUrl('/api/media/health'), { timeout: 45_000 });
    expect(response.status()).toBeLessThan(500);
    expect(response.headers()['content-type'] || '', '/api/media/health content type').toMatch(/application\/json/i);
    const data = await response.json();
    expect(typeof data.ok).toBe('boolean');
    expect(data.service || data.error).toBeTruthy();
  });

  test('critical UI has no obvious horizontal overflow', async ({ page }) => {
    await page.goto(uiBase, { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth + 8);
  });
});
