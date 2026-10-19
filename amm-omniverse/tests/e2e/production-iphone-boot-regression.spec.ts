import { test,expect } from '@playwright/test'

/**
 * Critical public-production smoke: detect the exact customer-facing incident
 * where the bootstrap canary never disappears and the 12-second startup guard
 * replaces TRYAMM with Retry / Open lightweight city.
 *
 * Run ONLY against an authorized public Vercel production alias. No sign-in,
 * payments, gifts, media creation, cache clearing or backend mutation.
 * iPhone WebKit is a browser approximation, not a physical iPhone test.
 */
const FAIL_MESSAGE='TRYAMM is taking longer than expected to open.'
test.use({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true})

test('homepage boots before the recovery watchdog on iPhone-like browsers',async({page},testInfo)=>{
 test.setTimeout(60_000)
 const errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 page.on('requestfailed',request=>{
  if(/\/assets\/|\/src\/|\/tryamm-startup-guard/.test(request.url()))errors.push('Asset request '+request.url()+': '+request.failure()?.errorText)
 })
 const response=await page.goto('/',{waitUntil:'domcontentloaded',timeout:30_000})
 expect(response?.status(),'homepage must not return HTTP error').toBeLessThan(400)
 let passed=false
 try{
  await expect(page.getByRole('main',{name:'TRYAMM home'})).toBeVisible({timeout:18000})
  await expect(page.locator('#tryamm-bootstrap-canary')).toHaveCount(0,{timeout:2000})
  await expect(page.getByText(FAIL_MESSAGE)).toHaveCount(0)
  passed=true
 }finally{
  if(!passed){
   console.error('[tryamm-production-startup-diagnostic]',JSON.stringify({
    browser:testInfo.project.name,errors,body:(await page.locator('body').innerText().catch(()=>'' )).slice(0,700),
    path:await page.evaluate(()=>location.pathname).catch(()=>'?')
   }))
   await page.screenshot({path:testInfo.outputPath('production-boot-failure.png'),fullPage:true}).catch(()=>{})
  }
 }
})

test('lightweight city remains reachable independently',async({page})=>{
 test.setTimeout(60_000)
 const response=await page.goto('/streetverse-safe.html',{waitUntil:'domcontentloaded',timeout:30_000})
 expect(response?.status(),'StreetVerse safe mode must be accessible').toBeLessThan(400)
 await expect(page.getByText(/STREETVERSE\s*•\s*CHICAGO/i).first()).toBeVisible({timeout:18000})
 await expect(page.getByText(FAIL_MESSAGE)).toHaveCount(0)
})
