import {test,expect} from '@playwright/test'

test.use({
 userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_16 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6.2 Mobile/15E148 Safari/604.1',
 viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,
 launchOptions:{args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']},
})

test('3D StreetVerse preserves native GLB people when Supabase storage is restricted',async({page})=>{
 test.setTimeout(100_000)
 const data:{slotId:string;sourceUrl:string;source:string}[]=[]
 await page.route('https://fxluchtdfpediivhoksl.supabase.co/storage/v1/object/public/streetverse-assets/characters/**',
  route=>route.fulfill({status:402,contentType:'application/json',body:JSON.stringify({code:'restricted-storage',message:'Simulated Supabase restriction'})}))
 await page.route('**/api/meshy/asset-manifest?**',
  route=>route.fulfill({status:503,contentType:'application/json',body:'{"assets":[]}'}))
 await page.addInitScript(()=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{configurable:true,get:()=>8})
  Object.defineProperty(navigator,'deviceMemory',{configurable:true,get:()=>8})
  ;(window as any).__tryammNativeReady=[]
  window.addEventListener('tryamm:native-character-ready',event=>(window as any).__tryammNativeReady.push((event as CustomEvent).detail||{}))
  ;(window as any).__tryammOriginUnavailable=[]
  window.addEventListener('tryamm:meshy-character-origin-unavailable',event=>(window as any).__tryammOriginUnavailable.push((event as CustomEvent).detail||{}))
 })
 await page.goto('/streetverse',{waitUntil:'domcontentloaded',timeout:45_000})
 await expect(page.locator('[data-streetverse-world-root="true"]')).toBeVisible({timeout:35_000})
 await expect(page.getByLabel('StreetVerse analog joystick')).toBeVisible({timeout:35_000})
 await page.waitForFunction(()=>((window as any).__tryammNativeReady||[]).some((e:any)=>e?.sourceUrl?.includes('/generated-assets/native/kit/resident-archetype-')),null,{timeout:65000})
 const proof=await page.evaluate(()=>({native:(window as any).__tryammNativeReady||[],restricted:(window as any).__tryammOriginUnavailable||[]}))
 expect(proof.native.some((e:any)=>e.source==='tryamm-native'&&e.sourceUrl.includes('/generated-assets/native/kit/resident-archetype-'))).toBeTruthy()
 expect(proof.restricted.some((e:any)=>e.unavailableUrl?.includes('supabase.co/storage/v1/object/public/streetverse-assets'))).toBeTruthy()
 await expect(page.getByText('HTML CITY MODE')).toHaveCount(0)
 console.log('[tryamm 402 native recovery]',JSON.stringify({nativeLoaded:proof.native.length,unavailableAssets:proof.restricted.length}))
})
