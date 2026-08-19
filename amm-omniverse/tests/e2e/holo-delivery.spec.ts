import { test, expect } from '@playwright/test';

test('Holo Delivery launcher opens food package tracking and help flows', async ({ page }) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: /open holo delivery/i });
  await expect(launcher).toBeVisible();
  await launcher.click();

  const dialog = page.getByRole('dialog', { name: /holo delivery center/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/food • packages • coupons • live arrival tracking/i)).toBeVisible();

  await dialog.getByRole('button', { name: '📦 PACKAGE', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: /send a package/i })).toBeVisible();
  await expect(dialog.getByLabel(/pickup address/i)).toBeVisible();

  await dialog.getByRole('button', { name: '📍 TRACK', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: /track delivery arrival/i })).toBeVisible();
  await expect(dialog.getByText(/live map adapter/i)).toBeVisible();

  await dialog.getByRole('button', { name: '🛟 HELP', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: /delivery help/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /request refund\/review/i })).toBeVisible();
});