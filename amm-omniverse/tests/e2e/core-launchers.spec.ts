import { test, expect } from '@playwright/test';

test.describe('TRYAMM global commerce launchers', () => {
  test('loads the app and exposes Holo Delivery and Holo Marketplace', async ({ page }) => {
    await page.goto('/');

    const delivery = page.getByRole('button', { name: 'Open Holo Delivery' });
    const market = page.getByRole('button', { name: 'Open Holo Marketplace' });

    await expect(delivery).toBeVisible();
    await expect(market).toBeVisible();

    await delivery.click();
    const deliveryDialog = page.getByRole('dialog', { name: /Holo Delivery Center/i });
    await expect(deliveryDialog).toBeVisible();
    await deliveryDialog.getByRole('button', { name: 'Close Holo Delivery' }).click();
    await expect(deliveryDialog).toBeHidden();

    await market.click();
    await expect(page.getByText(/Holo Marketplace/i).first()).toBeVisible();
  });
});