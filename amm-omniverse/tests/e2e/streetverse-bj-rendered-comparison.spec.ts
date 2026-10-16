import {test,expect} from '@playwright/test'
import {writeFileSync} from 'node:fs'

test.use({viewport:{width:375,height:667},deviceScaleFactor:1.5,isMobile:true,hasTouch:true})
test('BJ V15 actual GLB renders nonblank front and profiles beside the approved photo',async({page},testInfo)=>{
 test.setTimeout(160_000)
 await page.goto('/bj-v10-preview',{waitUntil:'domcontentloaded',timeout:50_000})
 const render=page.locator('[data-bj-render-comparison]')
 await expect(render).toBeEnabled({timeout:90_000})
 await expect(page.locator('[data-bj-model-version]')).toHaveAttribute('data-bj-model-version','V15',{timeout:90_000})
 await expect(page.locator('canvas').first()).toBeVisible()
 await page.waitForFunction(()=>{
  const t=document.querySelector('[role=status]')?.textContent||''
  return t.includes('PHOTO')||t.includes('REFERENCE')||t.includes('BASE GLB')
 },null,{timeout:45_000})
 await render.click()
 const proof=page.locator('[data-bj-render-proof=true]')
 await expect(proof).toBeVisible({timeout:15_000})
 await expect(proof.locator('[data-bj-proof-close="true"]')).toBeVisible()
 const floatingUiOccludesProof=await page.evaluate(()=>{
  const dialog=document.querySelector('[data-bj-render-proof="true"]')
  if(!dialog)return true
  const top=document.elementFromPoint(25,45)
  return !top||!dialog.contains(top)
 })
 expect(floatingUiOccludesProof,'StreetVerse shell must not cover the face comparison dialog').toBe(false)
 const evidence:{angle:string;imageBytes:number;width:number;height:number;colorBins:number;nonBackgroundFraction:number;meanLuminance:number}[]=[]
 for(const angle of ['FRONT','THREE-QUARTER','LEFT PROFILE','RIGHT PROFILE']){
  const tile=proof.locator('[data-bj-rendered-angle="'+angle+'"]')
  await expect(tile).toBeVisible()
  const src=await tile.locator('img').getAttribute('src')
  expect(src?.startsWith('data:image/png;base64,')).toBeTruthy()
  const bytes=Buffer.from((src||'').split(',')[1]||'','base64')
  expect(bytes.length).toBeGreaterThan(2000)
  // A PNG may exist even when WebGL has rendered only a black background.
  // Decode actual pixels rather than accepting an image tag or base64 string.
  const pixels=await page.evaluate(async(imageSrc:string)=>{
   const image=new Image();image.src=imageSrc;await image.decode()
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight
   const context=canvas.getContext('2d',{willReadFrequently:true})
   if(!context)throw new Error('No 2D context for proof pixel inspection')
   context.drawImage(image,0,0)
   const rgba=context.getImageData(0,0,canvas.width,canvas.height).data
   const colors=new Set<number>()
   let active=0,samples=0,brightness=0
   for(let y=0;y<canvas.height;y+=8)for(let x=0;x<canvas.width;x+=8){
    const i=(y*canvas.width+x)*4,r=rgba[i],g=rgba[i+1],b=rgba[i+2],a=rgba[i+3]
    samples++;brightness+=(r*0.2126+g*0.7152+b*0.0722)/255
    colors.add(((r>>4)<<8)|((g>>4)<<4)|(b>>4))
    if(a>200&&(Math.abs(r-5)+Math.abs(g-7)+Math.abs(b-11))>35)active++
   }
   return{width:canvas.width,height:canvas.height,colorBins:colors.size,nonBackgroundFraction:active/Math.max(1,samples),meanLuminance:brightness/Math.max(1,samples)}
  },src!)
  expect(pixels.width).toBeGreaterThan(100)
  expect(pixels.height).toBeGreaterThan(100)
  expect(pixels.colorBins,'Real 3D surfaces must contain more than flat background pixels').toBeGreaterThan(16)
  expect(pixels.nonBackgroundFraction,'BJ GLB must occupy a visible part of each camera angle').toBeGreaterThan(.012)
  evidence.push({angle,imageBytes:bytes.length,...pixels})
  const name='bj-v15-actual-glb-'+angle.toLowerCase().replace(/\s+/g,'-')+'.png'
  const path=testInfo.outputPath(name)
  writeFileSync(path,bytes)
  await testInfo.attach(name,{path,contentType:'image/png'})
 }
 const approved=proof.locator('img[alt="Approved original BJ portrait reference image"]')
 await expect(approved).toBeVisible()
 const sourcePixels=await approved.evaluate((el:HTMLImageElement)=>({width:el.naturalWidth,height:el.naturalHeight,complete:el.complete}))
 expect(sourcePixels.complete).toBe(true)
 expect(sourcePixels.width).toBeGreaterThan(50)
 expect(sourcePixels.height).toBeGreaterThan(50)
 const comparisonPath=testInfo.outputPath('bj-v15-rendered-comparison-reference-iphone.png')
 await page.screenshot({path:comparisonPath,fullPage:true,animations:'disabled'})
 await testInfo.attach('bj-v15-approved-photo-and-four-glb-angles.png',{path:comparisonPath,contentType:'image/png'})
 const report={
  model:'BJ V15',renderer:'Three.js/WebGL',captureMode:'actual-3d-render',
  referenceImage:{...sourcePixels,certifiedPhotographicLikeness:false},
  measuredFrames:evidence,
  certification:'Pixel visibility only. Human front/profile photo likeness review still required.',
  screenshot:'bj-v15-rendered-comparison-reference-iphone.png'
 }
 const reportPath=testInfo.outputPath('bj-v15-render-evidence.json')
 writeFileSync(reportPath,JSON.stringify(report,null,2))
 await testInfo.attach('bj-v15-render-evidence.json',{path:reportPath,contentType:'application/json'})
 console.log('BJ V15 REAL RENDER EVIDENCE',JSON.stringify(report))
})
