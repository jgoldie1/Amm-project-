import { test, expect } from '@playwright/test'

test.describe('StreetVerse biography and World Memory proof shell', () => {
  test('mounts the life proof and preserves the authenticated persistence boundary', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /ENTER GAMEVERSE/i }).click()

    const launcher = page.getByRole('button', { name: 'Open StreetVerse biography proof' })
    await expect(launcher).toBeVisible()
    await launcher.click()

    const dialog = page.getByRole('dialog', { name: 'StreetVerse World Memory Proof' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Your Save File Becomes Your Biography' })).toBeVisible()
    await expect(dialog.getByText('WORLD CONTINUES', { exact: true })).toBeVisible()
    await expect(dialog.getByText('WORLD REMEMBERS', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'RUN FULL AUTHENTICATED PROOF' })).toBeVisible()

    // CI browser runs do not receive a real player's Supabase session. The full proof
    // must fail closed rather than silently writing unauthenticated biography state.
    await dialog.getByRole('button', { name: 'RUN FULL AUTHENTICATED PROOF' }).click()
    await expect(dialog.getByText(/STATUS: FAILED|STATUS: RUNNING/)).toBeVisible()
    await expect(dialog.getByText(/Authentication required|VITE_API_URL is not configured|FULL PROOF STOPPED/i).first()).toBeVisible()
  })
})
