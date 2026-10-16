import {test,expect} from '@playwright/test'

/**
 * Regression introduced after the previous emergency rollback:
 * a healthy homepage or 2D /streetverse-safe.html is NOT evidence that the
 * actual BJ/joystick 3D game works. Test the exact public route directly.
 * No Vercel deployment, no backend mutations and no paid media jobs.
 */
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2})
test('real StreetVerse route boots 3D with visible joystick instead of silently downgrading to HTML city',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='iphone-webkit','3D is mandatory for the iPhone WebKit release gate; lower-resource Chromium may intentionally choose a labeled 2D fallback.')
 test.setTimeout(105_000)
 const errors:string[]=[]
 page.on('pageerror',e=>errors.push(e.message))
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,190))})
 const response=await page.goto('/streetverse?streetverse_regression=3d',{waitUntil:'domcontentloaded',timeout:30_000})
 expect(response?.status()).toBeLessThan(400)
 let success=false
 try{
  await expect(page.locator('[data-streetverse-world-root="true"]')).toBeVisible({timeout:70_000})
  await expect(page.locator('[data-streetverse-html-city="true"]')).toHaveCount(0)
  await expect(page.getByLabel('StreetVerse analog joystick')).toBeVisible({timeout:25_000})
  const canvas=page.locator('[data-streetverse-world-root="true"] canvas').first()
  await expect(canvas).toBeVisible({timeout:12_000})
  const b=await canvas.boundingBox()
  expect(b?.width||0).toBeGreaterThan(220)
  expect(b?.height||0).toBeGreaterThan(220)
  await expect(page.getByText(/HTML CITY MODE/)).toHaveCount(0)
  success=true
 }finally{
  if(!success){
   console.error('[SV 3D REGRESSION DIAGNOSTICS]',JSON.stringify({
    browser:testInfo.project.name,
    location:await page.evaluate(()=>location.href).catch(()=>'unknown'),
    htmlCity:await page.locator('[data-streetverse-html-city]').count().catch(()=>-1),
    worldRoot:await page.locator('[data-streetverse-world-root]').count().catch(()=>-1),
    fallback:await page.locator('[data-streetverse-render-mode]').allTextContents().catch(()=>[]),
    errors:errors.slice(-12),
    body:(await page.locator('body').innerText().catch(()=>'' )).slice(0,950),
  }))
  await page.screenshot({path:testInfo.outputPath('streetverse-3d-regression.png'),fullPage:false}).catch(()=>{})
  }
 }
})
