import { test, expect } from '@playwright/test';

// Exercise visible handoffs, not just the presence of handler names in source.
async function openMarketplace(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Holo Marketplace', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Holo Marketplace', exact: true })).toBeVisible();
}

test('marketplace delivery handoff opens its destination and closes its source', async ({ page }) => {
  await openMarketplace(page);
  await page.getByRole('button', { name: 'OPEN DELIVERY', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Holo Delivery Center', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Holo Marketplace', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close Holo Delivery', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Holo Delivery Center', exact: true })).toHaveCount(0);
});

test('marketplace copilot opens the HoloGPT interface', async ({ page }) => {
  await openMarketplace(page);
  await page.getByRole('button', { name: 'ASK JARVIS', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'HoloGPT', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Holo Marketplace', exact: true })).toHaveCount(0);
  // Opening the assistant is separate from provider readiness or answer quality.
});

for (const path of ['/aniyah-studio', '/64-track-studio']) {
  test(`${path} opens the studio on a fresh visit`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText('ANIYAH • MUSIC BUSINESS', { exact: true })).toBeVisible();
    await expect(page.getByText('AI Create Mode + full 64-track Engineer Mode + verified commerce', { exact: true })).toBeVisible();
  });
}
