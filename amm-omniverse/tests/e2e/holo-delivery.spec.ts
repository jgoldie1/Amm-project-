import { test, expect } from '@playwright/test';

test('Holo Delivery launcher opens food package tracking and help flows', async ({ page }) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: /open holo delivery/i });
  await expect(launcher).toBeVisible();
  await launcher.click();

  await expect(page.getByRole('dialog', { name: /holo delivery center/i })).toBeVisible();
  await expect(page.getByText(/food • packages • coupons • live arrival tracking/i)).toBeVisible();

  await page.getByRole('button', { name: /package/i }).click();
  await expect(page.getByRole('heading', { name: /send a package/i })).toBeVisible();
  await expect(page.getByLabel(/pickup address/i)).toBeVisible();

  await page.getByRole('button', { name: /track/i }).click();
  await expect(page.getByRole('heading', { name: /track delivery arrival/i })).toBeVisible();
  await expect(page.getByText(/live map adapter/i)).toBeVisible();

  await page.getByRole('button', { name: /help/i }).click();
  await expect(page.getByRole('heading', { name: /delivery help/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /request refund\/review/i })).toBeVisible();
});
