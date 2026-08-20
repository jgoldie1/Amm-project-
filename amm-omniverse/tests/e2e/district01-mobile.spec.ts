import { test, expect } from '@playwright/test';

test.describe('District 01 mobile benchmark', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('keeps the Reality Lab usable at phone viewport with bounded interaction startup', async ({ page }) => {
    await page.goto('/');
    const started = Date.now();
    await page.evaluate(() => {
      const open = (window as typeof window & { __showRealityLab?: () => void }).__showRealityLab;
      if (!open) throw new Error('Reality Lab launcher is not registered');
      open();
    });

    const lab = page.getByRole('dialog', { name: 'StreetVerse District 01 Reality Lab' });
    await expect(lab).toBeVisible();
    await expect(lab.getByRole('heading', { name: 'TRYAMM Reality Lab' })).toBeVisible();
    const startupMs = Date.now() - started;
    expect(startupMs).toBeLessThan(5000);

    const box = await lab.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(390);

    await lab.getByRole('button', { name: 'Next' }).click();
    await expect(lab.getByText('ROOM 2/7')).toBeVisible();
    await lab.getByRole('button', { name: 'Music-Reactive Room' }).click();
    await expect(lab.getByRole('article')).toContainText('Music-Reactive Room');
    await lab.getByLabel('One-handed mode').check();
    await expect(lab.getByLabel('One-handed mode')).toBeChecked();
  });
});
