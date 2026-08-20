import { expect, test } from '@playwright/test'

test('secure core journey is mounted and blocks persistence without real auth', async ({ page }) => {
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Open secure core journey' })
  await expect(launcher).toBeVisible()
  await launcher.click()
  await expect(page.getByRole('dialog', { name: 'TRYAMM secure core journey' })).toBeVisible()
  await expect(page.getByText(/Production authentication required|Authenticated as/)).toBeVisible()

  const passportStep = page.getByRole('button', { name: /Authenticated Passport save\/reload/ })
  if (await page.getByText('Production authentication required').isVisible().catch(() => false)) {
    await expect(passportStep).toBeDisabled()
  }
})

test('core journey exposes the complete ordered integration path', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open secure core journey' }).click()
  for (const label of [
    'Authenticated Passport save/reload',
    'Authenticated Business creation',
    'Marketplace order',
    'JARVIS approval firewall',
    'Server-authoritative sandbox Money Engine',
    'Realtime Holo Delivery → delivered',
    'Business dashboard aggregation',
    'Persisted audit evidence',
    'Reload persistent evidence',
  ]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible()
  }
  await expect(page.getByText(/Completed steps this session: 0\/9/)).toBeVisible()
})
