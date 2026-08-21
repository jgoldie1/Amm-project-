import { test, expect } from '@playwright/test'

async function enterTryAMM(page:any){
  const enter=page.getByRole('button',{name:'ENTER TRYAMM'})
  if(await enter.isVisible({timeout:5000}).catch(()=>false)) await enter.click()
  await expect(page.getByRole('dialog',{name:'TRYAMM Lion of Judah opening screen'})).toBeHidden({timeout:6000})
}

test.describe('StreetVerse biography and World Memory proof shell', () => {
  test('mounts the life proof and preserves the authenticated persistence boundary', async ({ page }) => {
    await page.goto('/')
    await enterTryAMM(page)
    await page.getByRole('button', { name: /ENTER GAMEVERSE/i }).click()
    const gameverse=page.getByRole('dialog',{name:'TRYAMM GameVerse'}).first()
    const launcher = gameverse.getByRole('button', { name: 'Open StreetVerse biography proof' })
    await expect(launcher).toBeVisible({timeout:10000})
    await launcher.click()
    const dialog = gameverse.getByRole('dialog', { name: 'StreetVerse World Memory Proof' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Your Save File Becomes Your Biography' })).toBeVisible()
    await expect(dialog.getByText('WORLD CONTINUES', { exact: true })).toBeVisible()
    await expect(dialog.getByText('WORLD REMEMBERS', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'RUN FULL AUTHENTICATED PROOF' })).toBeVisible()
    await dialog.getByRole('button', { name: 'RUN FULL AUTHENTICATED PROOF' }).click()
    await expect(dialog.getByText(/STATUS: FAILED|STATUS: RUNNING/)).toBeVisible()
    await expect(dialog.getByText(/Authentication required|StreetVerse life API request failed|FULL PROOF STOPPED/i).first()).toBeVisible()
  })
})
