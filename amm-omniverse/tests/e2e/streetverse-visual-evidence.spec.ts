import { test, expect } from '@playwright/test';

test.describe('StreetVerse visual evidence', () => {
  test('mobile Circle Park controls and driving are visibly rendered', async ({ page }, testInfo) => {
    await page.goto('/streetverse', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await expect(page.locator('#root')).toBeAttached();
    await expect(page.locator('#root')).not.toBeEmpty();

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 20_000 });

    const joystick = page.getByLabel('StreetVerse always visible joystick');
    await expect(joystick).toBeVisible({ timeout: 20_000 });

    const drive = page.getByRole('button', { name: 'Drive nearest StreetVerse vehicle' });
    await expect(drive).toBeVisible({ timeout: 20_000 });

    const canvasBox = await canvas.boundingBox();
    expect(canvasBox?.width || 0).toBeGreaterThan(250);
    expect(canvasBox?.height || 0).toBeGreaterThan(250);

    await page.waitForTimeout(2500);
    await page.screenshot({
      path: testInfo.outputPath('streetverse-circle-park-mobile-on-foot.png'),
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
      path: testInfo.outputPath('streetverse-circle-park-mobile-driving.png'),
      fullPage: true,
    });

    await canvas.screenshot({
      path: testInfo.outputPath('streetverse-world-canvas-driving.png'),
    });
  });
});
