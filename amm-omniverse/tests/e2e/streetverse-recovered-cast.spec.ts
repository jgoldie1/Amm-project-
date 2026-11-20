import {test,expect} from '@playwright/test'

test.use({viewport:{width:390,height:844},deviceScaleFactor:2})
test('recovered Jacobie and LaTeasia GLBs render with the BJ V15 hero in Chicago',async({page})=>{
 test.setTimeout(125_000)
 await page.addInitScript(()=>{
  ;(window as Window&{__recoveredCastStates?:Record<string,unknown>}).__recoveredCastStates={}
  window.addEventListener('tryamm:streetverse-recovered-character-status',(e:Event)=>{
   const d=(e as CustomEvent).detail
   ;(window as Window&{__recoveredCastStates?:Record<string,unknown>}).__recoveredCastStates![d.role]=d
  })
 })
 await page.goto('/streetverse',{waitUntil:'domcontentloaded',timeout:45_000})
 await expect(page.locator('canvas').first()).toBeVisible({timeout:35_000})
 for(const role of ['jacobie','lateasia']){
  await expect.poll(async()=>page.evaluate((key)=>{
   const d=(window as Window&{__recoveredCastStates?:Record<string,{state:string}>}).__recoveredCastStates?.[key]
   return d?.state||'pending'
  },role),{timeout:65_000,message:role+' must load the actual recovered GLB'}).toBe('ready')
 }
 await expect(page.locator('[data-streetverse-world-root]')).toHaveAttribute('data-bj-active-version','V15',{timeout:45_000})
 await page.screenshot({path:'test-results/recovered-three-character-cast.png',fullPage:false})
})
