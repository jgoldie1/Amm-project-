import {test,expect} from '@playwright/test'

test.use({
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_16 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6.2 Mobile/15E148 Safari/604.1',
  viewport:{width:375,height:667},
  deviceScaleFactor:2,
  isMobile:true,
  hasTouch:true,
})

test('Circle Park loads an actual October 5 durable GLB on an iPhone-sized viewport',async({page},testInfo)=>{
  test.setTimeout(120_000)
  await page.addInitScript(()=>{
    const events:Array<Record<string,unknown>>=[]
    Object.defineProperty(window,'__streetverseDurableProof',{value:events,configurable:true})
    window.addEventListener('tryamm:circle-park-meshy-resident-live',event=>{
      events.push({...((event as CustomEvent).detail||{}),timestamp:Date.now()})
    })
  })
  const failedResponses:string[]=[]
  page.on('response',response=>{
    if(response.url().includes('streetverse-assets/characters/')&&!response.ok())failedResponses.push(response.status()+' '+response.url())
  })
  await page.goto('/streetverse',{waitUntil:'domcontentloaded',timeout:45_000})
  await expect(page.locator('canvas').first()).toBeVisible({timeout:30_000})
  await page.waitForFunction(()=>{
    const events=(window as unknown as {__streetverseDurableProof:Array<{sourceUrl:string}>}).__streetverseDurableProof||[]
    return events.some(event=>event.sourceUrl?.includes('/streetverse-assets/characters/static-wave'))
  },null,{timeout:85_000})
  const events=await page.evaluate(()=>((window as unknown as {__streetverseDurableProof:Array<{sourceUrl:string;slotId:string;filename:string}>}).__streetverseDurableProof||[]))
  const real=events.filter(e=>e.sourceUrl?.includes('/streetverse-assets/characters/static-wave'))
  expect(real.length).toBeGreaterThanOrEqual(1)
  expect(real[0].filename).toMatch(/\.glb$/)
  expect(failedResponses).toEqual([])
  await page.screenshot({path:testInfo.outputPath('streetverse-verified-real-resident-iphone.png'),fullPage:false})
  console.log('DURABLE RESIDENT PROOF',JSON.stringify(real.map(e=>({slotId:e.slotId,filename:e.filename,sourceUrl:e.sourceUrl}))))
})
