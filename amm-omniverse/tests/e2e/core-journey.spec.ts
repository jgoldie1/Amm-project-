import { expect, test } from '@playwright/test'

test('secure core journey is mounted and authentication-gated', async ({ page }) => {
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Open secure core journey' })
  await expect(launcher).toBeVisible()
  await launcher.click()
  await expect(page.getByRole('dialog', { name: 'TRYAMM secure core journey' })).toBeVisible()
  await expect(page.getByText(/Production authentication required|Authenticated as/)).toBeVisible()
})

test('core journey exposes the full ordered integration path', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open secure core journey' }).click()
  for (const label of ['Authenticated Passport save/reload','Authenticated Business creation','Marketplace order','JARVIS approval firewall','Payment sandbox','Holo Delivery tracking','Audit evidence','Reload evidence']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible()
  }
})
