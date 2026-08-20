import { test, expect } from '@playwright/test';

async function openRealityLab(page: Parameters<typeof test>[0]['page'] | any) {
  await page.evaluate(() => {
    const open = (window as typeof window & { __showRealityLab?: () => void }).__showRealityLab;
    if (!open) throw new Error('Reality Lab launcher is not registered');
    open();
  });
  return page.getByRole('dialog', { name: 'StreetVerse District 01 Reality Lab' });
}

test.describe('StreetVerse District 01 Reality Lab', () => {
  test('opens, records a room, persists locally, restores museum wing, and enters panic safe state', async ({ page }) => {
    await page.goto('/');
    const lab = await openRealityLab(page);
    await expect(lab).toBeVisible();
    await expect(lab.getByRole('heading', { name: 'TRYAMM Reality Lab' })).toBeVisible();
    await expect(lab.getByText('ROOM 1/7')).toBeVisible();
    await expect(lab.getByRole('region', { name: 'Chicago World Museum Immersive Wing' })).toBeVisible();
    await expect(lab.getByRole('button', { name: 'Reactive Holographic Hall' })).toBeVisible();

    await lab.getByRole('button', { name: /Complete \+25 Lab XP/ }).click();
    await expect(lab.getByText('LAB XP 25')).toBeVisible();
    await expect(lab.getByText('PROGRESS 14%')).toBeVisible();

    await page.reload();
    const restored = await openRealityLab(page);
    await expect(restored.getByText('LAB XP 25')).toBeVisible();
    await expect(restored.getByText('PROGRESS 14%')).toBeVisible();

    await restored.getByRole('button', { name: 'Next' }).click();
    await expect(restored.getByText('ROOM 2/7')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(restored.getByRole('alert')).toContainText('SAFE STATE ACTIVE');
    await expect(restored.getByRole('button', { name: /Complete \+25 Lab XP/ })).toBeDisabled();

    await restored.getByRole('button', { name: 'Resume' }).click();
    await expect(restored.getByRole('alert')).toBeHidden();
  });

  test('maps standard gamepad controls to navigation, interaction, panic, and resume', async ({ page }) => {
    await page.addInitScript(() => {
      const state = { buttons: Array.from({ length: 17 }, () => false), axis: 0 };
      Object.defineProperty(navigator, 'getGamepads', {
        configurable: true,
        value: () => [{
          id: 'TRYAMM CI Gamepad',
          index: 0,
          connected: true,
          mapping: 'standard',
          timestamp: performance.now(),
          axes: [state.axis, 0, 0, 0],
          buttons: state.buttons.map(pressed => ({ pressed, touched: pressed, value: pressed ? 1 : 0 })),
          vibrationActuator: null,
        }],
      });
      (window as any).__setGamepadButton = (index: number, pressed: boolean) => { state.buttons[index] = pressed; };
    });

    await page.goto('/');
    const lab = await openRealityLab(page);
    await expect(lab.getByText('GAMEPAD CONNECTED')).toBeVisible();
    await expect(lab.getByLabel('Connected gamepad')).toContainText('TRYAMM CI Gamepad');

    const press = async (index: number) => {
      await page.evaluate((i) => (window as any).__setGamepadButton(i, true), index);
      await page.waitForTimeout(120);
      await page.evaluate((i) => (window as any).__setGamepadButton(i, false), index);
      await page.waitForTimeout(120);
    };

    await press(15);
    await expect(lab.getByText('ROOM 2/7')).toBeVisible();

    await press(0);
    await expect(lab.getByText('LAB XP 25')).toBeVisible();

    await press(1);
    await expect(lab.getByRole('alert')).toContainText('SAFE STATE ACTIVE');

    await press(9);
    await expect(lab.getByRole('alert')).toBeHidden();
  });
});
