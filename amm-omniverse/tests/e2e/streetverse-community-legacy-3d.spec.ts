import {test,expect} from '@playwright/test'

declare global {
  interface Window {
    __communityLegacyVisualProof?:Array<{visible:string[];sceneMounted:boolean;fictional:boolean}>
  }
}

test('Community Legacy creates a real 3D neighborhood upgrade that survives reload',async({page},testInfo)=>{
  test.setTimeout(150_000)
  await page.addInitScript(()=>{
    window.__communityLegacyVisualProof=[]
    window.addEventListener('tryamm:streetverse-community-legacy-visual-proof',(event)=>{
      window.__communityLegacyVisualProof?.push((event as CustomEvent).detail||{})
    })
    // Only clear this isolated game's legacy progress on the very first load.
    // A reload must preserve the completed upgrade and its spent points.
    try {
      if(!sessionStorage.getItem('streetverse-legacy-e2e-initialized')){
        localStorage.removeItem('tryamm.streetverse.community-legacy.v1')
        sessionStorage.setItem('streetverse-legacy-e2e-initialized','1')
      }
      localStorage.setItem('tryamm:streetverse-control-mode','one-hand')
    }catch{}
  })

  await page.goto('/streetverse?bj=offline',{waitUntil:'domcontentloaded',timeout:45_000})
  await expect(page.locator('canvas').first()).toBeVisible({timeout:40_000})

  const launcher=page.getByRole('button',{name:'Open Community Legacy improvements'})
  await expect(launcher).toBeVisible({timeout:40_000})
  await launcher.click()
  await expect(page.getByText('Circle Park Accessible Ramp')).toBeVisible()

  // The real player action starts with one fictional point, not a checkout.
  await page.getByRole('button',{name:'BUILD FOR 1 GAME POINT'}).first().click()
  await expect(page.getByRole('button',{name:'BUILT ✓'}).first()).toBeDisabled()
  await page.waitForFunction(()=>window.__communityLegacyVisualProof?.some(
    proof=>proof.sceneMounted&&proof.visible.includes('access-ramp')
  ),null,{timeout:20_000})

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tryamm.streetverse.community-legacy.v1')||'null'))
  expect(saved.points).toBe(0)
  expect(saved.built).toEqual(['access-ramp'])
  await page.screenshot({path:testInfo.outputPath('streetverse-community-legacy-ramp-visible.png'),fullPage:false})

  await page.reload({waitUntil:'domcontentloaded',timeout:45_000})
  await expect(page.locator('canvas').first()).toBeVisible({timeout:40_000})
  await expect(page.getByRole('button',{name:'Open Community Legacy improvements'})).toBeVisible({timeout:30_000})
  await page.getByRole('button',{name:'Open Community Legacy improvements'}).click()
  await expect(page.getByRole('button',{name:'BUILT ✓'}).first()).toBeDisabled()
  await page.waitForFunction(()=>window.__communityLegacyVisualProof?.some(
    proof=>proof.sceneMounted&&proof.visible.includes('access-ramp')
  ),null,{timeout:20_000})
  const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('tryamm.streetverse.community-legacy.v1')||'null'))
  expect(restored).toEqual(saved)
  console.log('[streetverse-community-legacy-3d-proof]',JSON.stringify({built:restored.built,points:restored.points,sceneMounted:true}))
})
