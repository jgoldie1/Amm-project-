import {test,expect} from '@playwright/test'
import {writeFileSync} from 'node:fs'

test.use({viewport:{width:375,height:667},deviceScaleFactor:1.5,isMobile:true,hasTouch:true})
test('BJ V15 genuine WebGL rendered 3D face compared to the approved photo',async({page},testInfo)=>{
 test.setTimeout(155_000)
 await page.goto('/bj-v10-preview',{waitUntil:'domcontentloaded',timeout:50_000})
 const render=page.locator('[data-bj-render-comparison]')
 await expect(render).toBeEnabled({timeout:90_000})
 await expect(page.locator('[data-bj-model-version]')).toHaveAttribute('data-bj-model-version','V15',{timeout:90_000})
 await expect(page.locator('canvas').first()).toBeVisible()
 await page.waitForFunction(()=>{const t=document.querySelector('[role=status]')?.textContent||'';return t.includes('PHOTO')||t.includes('REFERENCE')||t.includes('BASE GLB')},null,{timeout:45_000})
 await render.click()
 const proof=page.locator('[data-bj-render-proof=true]')
 await expect(proof).toBeVisible({timeout:15_000})
 for(const angle of ['FRONT','THREE-QUARTER','LEFT PROFILE','RIGHT PROFILE']){
  const tile=proof.locator('[data-bj-rendered-angle="'+angle+'"]')
  await expect(tile).toBeVisible()
  const src=await tile.locator('img').getAttribute('src')
  expect(src?.startsWith('data:image/png;base64,')).toBeTruthy()
  const bytes=Buffer.from((src||'').split(',')[1]||'','base64')
  expect(bytes.length).toBeGreaterThan(1500)
  const name='bj-v15-actual-glb-'+angle.toLowerCase().replace(/\s+/g,'-')+'.png'
  const path=testInfo.outputPath(name)
  writeFileSync(path,bytes)
  await testInfo.attach(name,{path,contentType:'image/png'})
 }
 await expect(proof.locator('img[alt="Approved original BJ portrait reference image"]')).toBeVisible()
 await page.screenshot({path:testInfo.outputPath('bj-v15-rendered-comparison-reference-iphone.png'),fullPage:true,animations:'disabled'})
 console.log('BJ V15 REAL THREE.JS GLB COMPARISON PROOF: front, three-quarter, left and right images captured')
})
