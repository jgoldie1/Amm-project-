import { test, expect } from '@playwright/test'

test.describe('StreetVerse regional economy', () => {
  test('opens Illinois and national launch regions with jobs stories business and revenue', async ({ page }) => {
    await page.goto('/')

    const launcher = page.getByRole('button', { name: 'Open StreetVerse regional economy' })
    await expect(launcher).toBeVisible()
    await launcher.click()

    const dialog = page.getByRole('dialog', { name: 'StreetVerse Regional Economy' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: /Chicago.*Michigan.*California.*Global/ })).toBeVisible()

    await dialog.getByRole('button', { name: 'Greenville + University District' }).click()
    await expect(dialog.getByText(/college-town and surrounding-area world/i)).toBeVisible()

    await dialog.getByRole('button', { name: 'jobs' }).click()
    await expect(dialog.getByRole('heading', { name: /Greenville.*job board/i })).toBeVisible()
    await expect(dialog.getByText('Student worker')).toBeVisible()

    await dialog.getByRole('button', { name: 'stories' }).click()
    await expect(dialog.getByRole('heading', { name: 'First Semester' })).toBeVisible()

    await dialog.getByRole('button', { name: 'business' }).click()
    await expect(dialog.getByText('Search public registry record')).toBeVisible()

    await dialog.getByRole('button', { name: 'death care' }).click()
    await expect(dialog.getByText('Bond County Coroner')).toBeVisible()

    await dialog.getByRole('button', { name: 'NATIONAL STARTER' }).click()
    await dialog.getByRole('button', { name: 'Detroit + Southeast Michigan' }).click()
    await dialog.getByRole('button', { name: 'region' }).click()
    await expect(dialog.getByText(/Motor-city, music, manufacturing/i)).toBeVisible()

    await dialog.getByRole('button', { name: 'Hollywood' }).click()
    await dialog.getByRole('button', { name: 'stories' }).click()
    await expect(dialog.getByRole('heading', { name: 'Call Time' })).toBeVisible()

    await dialog.getByRole('button', { name: 'New York City' }).click()
    await dialog.getByRole('button', { name: 'jobs' }).click()
    await expect(dialog.getByText('Transit worker')).toBeVisible()

    await dialog.getByRole('button', { name: 'revenue' }).click()
    await expect(dialog.getByRole('heading', { name: 'Marketplace cash-cow model' })).toBeVisible()
    await expect(dialog.getByText('Multi-location tools')).toBeVisible()
  })
})
