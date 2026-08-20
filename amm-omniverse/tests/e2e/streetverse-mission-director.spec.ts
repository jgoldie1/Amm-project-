import { test, expect } from '@playwright/test'

test.describe('StreetVerse scripted mission director', () => {
  test('opens a produced mission, advances a storyboard beat, and fails safe to local checkpoint without auth', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /ENTER GAMEVERSE/i }).click()
    const launcher=page.getByRole('button',{name:'Open StreetVerse mission director'})
    await expect(launcher).toBeVisible()
    await launcher.click()
    const dialog=page.getByRole('dialog',{name:'StreetVerse Mission Director'})
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading',{name:/Missions Are Scenes, Choices and Consequences/i})).toBeVisible()
    await expect(dialog.getByText('The Block Remembers',{exact:true}).first()).toBeVisible()
    await expect(dialog.getByText(/This city does not start with a mission marker/i)).toBeVisible()
    await dialog.getByRole('button',{name:'SAVE CHECKPOINT'}).click()
    await expect(dialog.getByText(/Mission checkpoint saved on this device|Mission state saved to World Memory persistence/i)).toBeVisible()
    await dialog.getByRole('button',{name:/NEXT STORY BEAT/i}).click()
    await expect(dialog.getByText('Court Echo',{exact:true})).toBeVisible()
  })
})
