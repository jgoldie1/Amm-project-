import { test, expect } from '@playwright/test';

test.use({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_16 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6.2 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  launchOptions: {
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  },
});

test.describe('StreetVerse iPhone visual evidence', () => {
  test('Circle Park controls and driving are visibly rendered in the 3D iPhone path', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, get: () => 8 });
        Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 });
      } catch {}
    });

    await page.goto('/streetverse', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await expect(page.locator('#root')).toBeAttached();
    await expect(page.locator('#root')).not.toBeEmpty();

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 25_000 });

    const joystick = page.getByLabel('StreetVerse always visible joystick');
    await expect(joystick).toBeVisible({ timeout: 20_000 });

    const drive = page.getByRole('button', { name: 'Drive nearest StreetVerse vehicle' });
    await expect(drive).toBeVisible({ timeout: 20_000 });

    const canvasBox = await canvas.boundingBox();
    expect(canvasBox?.width || 0).toBeGreaterThan(250);
    expect(canvasBox?.height || 0).toBeGreaterThan(250);

    await page.waitForTimeout(2500);
    await page.screenshot({
      path: testInfo.outputPath('streetverse-circle-park-iphone-on-foot.png'),
      fullPage: true,
    });

    await joystick.screenshot({
      path: testInfo.outputPath('streetverse-visible-joystick.png'),
    });

    await drive.click();
    const driving = page.getByRole('button', { name: 'Driving active' });
    await expect(driving).toBeVisible({ timeout: 8_000 });

    await page.waitForTimeout(1200);
    await page.screenshot({
      path: testInfo.outputPath('streetverse-circle-park-iphone-driving.png'),
      fullPage: true,
    });

    await canvas.screenshot({
      path: testInfo.outputPath('streetverse-world-canvas-driving.png'),
    });
  });
});
