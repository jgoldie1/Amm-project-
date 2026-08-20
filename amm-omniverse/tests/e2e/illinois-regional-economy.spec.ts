import { test, expect } from '@playwright/test'

test.describe('StreetVerse Illinois regional economy', () => {
  test('opens regions, jobs, stories, business claims, death care and revenue panels', async ({ page }) => {
    await page.goto('/')

    const launcher = page.getByRole('button', { name: 'Open Illinois StreetVerse regional economy' })
    await expect(launcher).toBeVisible()
    await launcher.click()

    const dialog = page.getByRole('dialog', { name: 'Illinois StreetVerse Regional Economy' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: /Chicago.*Downstate.*Global/ })).toBeVisible()

    await dialog.getByRole('button', { name: 'Greenville + University District' }).click()
    await expect(dialog.getByText(/college-town and surrounding-area world/i)).toBeVisible()

    await dialog.getByRole('button', { name: 'jobs' }).click()
    await expect(dialog.getByRole('heading', { name: /Greenville.*job board/i })).toBeVisible()
    await expect(dialog.getByText('Student worker')).toBeVisible()

    await dialog.getByRole('button', { name: 'stories' }).click()
    await expect(dialog.getByRole('heading', { name: 'First Semester' })).toBeVisible()
    await expect(dialog.getByText(/new student arrives with limited money/i)).toBeVisible()

    await dialog.getByRole('button', { name: 'business' }).click()
    await expect(dialog.getByText('Search public registry record')).toBeVisible()
    await expect(dialog.getByText('Claim this business', { exact: false })).toBeVisible()

    await dialog.getByRole('button', { name: 'death care' }).click()
    await expect(dialog.getByText('Bond County Coroner')).toBeVisible()
    await expect(dialog.getByText('Funeral services', { exact: false }).first()).toBeVisible()

    await dialog.getByRole('button', { name: 'revenue' }).click()
    await expect(dialog.getByRole('heading', { name: 'Marketplace cash-cow model' })).toBeVisible()
    await expect(dialog.getByText('Business Pro subscription')).toBeVisible()
  })
})
