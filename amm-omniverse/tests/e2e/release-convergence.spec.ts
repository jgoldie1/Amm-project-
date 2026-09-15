import { test, expect } from '@playwright/test';

const baseUrl=process.env.TRYAMM_BASE_URL||'';
const localCandidate=/127\.0\.0\.1|localhost/.test(baseUrl);

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
      const probe = await page.request.get(path, { timeout:45_000 });
      expect(probe.status(), `${path} status`).toBeLessThan(400);
      await page.goto(path, { waitUntil:'commit', timeout:45_000 });
      await page.waitForFunction(() => {
        const root=document.getElementById('root');
        return !!root && root.childElementCount>0 && root.textContent?.trim().length;
      }, null, { timeout:30_000 });
      await expect(page.locator('html')).not.toHaveText('Application error');
    }
  });

  test('HoloGPT shell and real-response smoke are distinguishable', async ({ page }) => {
    test.skip(localCandidate, 'Vite preview does not host Vercel serverless API routes; deployed API health is certified after merge/deploy.');
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
    test.skip(localCandidate, 'Vite preview does not host Vercel serverless API routes; deployed API health is certified after merge/deploy.');
    const response = await page.request.get('/api/media/health', { timeout: 45_000 });
    expect([200, 503]).toContain(response.status());
    const data = await response.json();
    expect(typeof data.ok).toBe('boolean');
    expect(data.service || data.error).toBeTruthy();
    if (response.status() === 503) {
      expect(data.ok).toBe(false);
      expect(data.reason || data.error).toBeTruthy();
    }
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
