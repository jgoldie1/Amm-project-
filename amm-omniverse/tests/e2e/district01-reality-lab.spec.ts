import { test, expect } from '@playwright/test';

test.describe('StreetVerse District 01 Reality Lab', () => {
  test('opens, records a room, persists locally, and enters panic safe state', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      const openRealityLab = (window as typeof window & { __showRealityLab?: () => void }).__showRealityLab;
      if (!openRealityLab) throw new Error('Reality Lab launcher is not registered');
      openRealityLab();
    });

    const lab = page.getByRole('dialog', { name: 'StreetVerse District 01 Reality Lab' });
    await expect(lab).toBeVisible();
    await expect(lab.getByRole('heading', { name: 'TRYAMM Reality Lab' })).toBeVisible();
    await expect(lab.getByText('ROOM 1/7')).toBeVisible();

    await lab.getByRole('button', { name: /Complete \+25 Lab XP/ }).click();
    await expect(lab.getByText('LAB XP 25')).toBeVisible();
    await expect(lab.getByText('PROGRESS 14%')).toBeVisible();

    await page.reload();
    await page.evaluate(() => {
      const openRealityLab = (window as typeof window & { __showRealityLab?: () => void }).__showRealityLab;
      if (!openRealityLab) throw new Error('Reality Lab launcher is not registered after reload');
      openRealityLab();
    });

    const restored = page.getByRole('dialog', { name: 'StreetVerse District 01 Reality Lab' });
    await expect(restored.getByText('LAB XP 25')).toBeVisible();
    await expect(restored.getByText('PROGRESS 14%')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(restored.getByRole('alert')).toContainText('SAFE STATE ACTIVE');
    await expect(restored.getByRole('button', { name: /Complete/ }).first()).toBeDisabled();

    await restored.getByRole('button', { name: 'Resume' }).click();
    await expect(restored.getByRole('alert')).toBeHidden();
  });
});
