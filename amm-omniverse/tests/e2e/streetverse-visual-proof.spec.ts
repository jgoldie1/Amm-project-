import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

test.describe('StreetVerse phone visual proof', () => {
  test('Circle Park mobile controls are visible and vehicle entry is reachable', async ({ page }, testInfo) => {
    await page.goto('/streetverse', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await expect(page.locator('#root')).toBeAttached();
    await page.waitForTimeout(5000);

    const shell = page.locator('[data-streetverse-mobile-shell="v5"]');
    await expect(shell).toBeVisible();

    const joystick = page.getByLabel('StreetVerse always visible joystick');
    await expect(joystick).toBeVisible();

    const drive = page.getByRole('button', { name: 'Drive nearest StreetVerse vehicle' });
    await expect(drive).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('streetverse-circle-park-phone-before-drive.png'),
      fullPage: true,
    });

    await drive.click();
    await expect(page.getByRole('button', { name: 'Driving active' })).toBeVisible({ timeout: 10_000 });

    await page.screenshot({
      path: testInfo.outputPath('streetverse-circle-park-phone-driving.png'),
      fullPage: true,
    });

    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBeGreaterThan(0);
    await expect(page.locator('body')).not.toHaveText('Application error');
  });
});
