import {test,expect} from '@playwright/test'

test.use({
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_16 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6.2 Mobile/15E148 Safari/604.1',
  viewport:{width:375,height:667},
  deviceScaleFactor:2,
  isMobile:true,
  hasTouch:true,
})

test('owned BJ V12, V7 or V6 GLB mounts on iPhone without remote CDN',async({page},testInfo)=>{
  test.setTimeout(120_000)
  await page.addInitScript(()=>{
    const ready:Array<{url?:string;assetId?:string}>=[]
    Object.defineProperty(window,'__bjOwnedAssetProof',{value:ready,configurable:true})
    const mounted:Array<Record<string,unknown>>=[]
    Object.defineProperty(window,'__bjMountedProof',{value:mounted,configurable:true})
    window.addEventListener('tryamm:streetverse-bj-hero-mounted',event=>{
      mounted.push((event as CustomEvent).detail||{})
    })
    window.addEventListener('tryamm:bj-meshy-v6-ready',(event)=>{
      ready.push((event as CustomEvent).detail||{})
    })
  })
  await page.goto('/streetverse?bj=offline',{waitUntil:'domcontentloaded',timeout:45_000})
  await expect(page.locator('canvas').first()).toBeVisible({timeout:30_000})
  await page.waitForFunction(()=>{
    const proof=(window as unknown as {__bjOwnedAssetProof:Array<{url:string}>}).__bjOwnedAssetProof||[]
    return proof.some(event=>/SV_HERO_BJ_STUBBS_V(?:12|7|6)\.glb/.test(event.url||''))
  },null,{timeout:80_000})
  const results=await page.evaluate(()=>((window as unknown as {__bjOwnedAssetProof:Array<{url:string}>}).__bjOwnedAssetProof||[]))
  const owned=results.filter(event=>/\/tryamm-assets\/meshy\/characters\/SV_HERO_BJ_STUBBS_V(?:12|7|6)\.glb/.test(event.url||''))
  expect(owned.length).toBeGreaterThan(0)
  await page.waitForFunction(()=>((window as unknown as {__bjMountedProof:Array<unknown>}).__bjMountedProof||[]).length>0,null,{timeout:15_000})
  const mounts=await page.evaluate(()=>((window as unknown as {__bjMountedProof:Array<Record<string,unknown>>}).__bjMountedProof||[]))
  expect(mounts.length).toBeGreaterThan(0)
  expect(new URL(owned[0].url,page.url()).origin).toBe(new URL(page.url()).origin)
  console.log('BJ OWNED GLB LIVE PROOF',JSON.stringify(results))
  await page.screenshot({path:testInfo.outputPath('streetverse-bj-owned-glb-active-iphone.png'),fullPage:false})
})
