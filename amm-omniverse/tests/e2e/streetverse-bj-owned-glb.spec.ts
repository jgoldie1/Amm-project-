import {test,expect} from '@playwright/test'

test.use({
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_16 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6.2 Mobile/15E148 Safari/604.1',
  viewport:{width:375,height:667},
  deviceScaleFactor:2,
  isMobile:true,
  hasTouch:true,
})

test('owned BJ V12 or V7 GLB replaces the basic hero on iPhone-sized Circle Park',async({page},testInfo)=>{
  test.setTimeout(120_000)
  await page.addInitScript(()=>{
    const ready:Array<{url?:string;assetId?:string}>=[]
    Object.defineProperty(window,'__bjOwnedAssetProof',{value:ready,configurable:true})
    window.addEventListener('tryamm:bj-meshy-v6-ready',(event)=>{
      ready.push((event as CustomEvent).detail||{})
    })
  })
  await page.goto('/streetverse',{waitUntil:'domcontentloaded',timeout:45_000})
  await expect(page.locator('canvas').first()).toBeVisible({timeout:30_000})
  await page.waitForFunction(()=>{
    const proof=(window as unknown as {__bjOwnedAssetProof:Array<{url:string}>}).__bjOwnedAssetProof||[]
    return proof.some(event=>/SV_HERO_BJ_STUBBS_V(?:12|7|6)\.glb/.test(event.url||''))
  },null,{timeout:80_000})
  const results=await page.evaluate(()=>((window as unknown as {__bjOwnedAssetProof:Array<{url:string}>}).__bjOwnedAssetProof||[]))
  expect(results.length).toBeGreaterThan(0)
  console.log('BJ OWNED GLB LIVE PROOF',JSON.stringify(results))
  await page.screenshot({path:testInfo.outputPath('streetverse-bj-owned-glb-active-iphone.png'),fullPage:false})
})
