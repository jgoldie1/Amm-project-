import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'

test.use({viewport:{width:1092,height:492},userAgent:'Mozilla/5.0 (X11; CrOS x86_64) Chrome/150.0.0.0 Safari/537.36'})

test('Chromebook apartment trip survives claim, reload and export',async({page},info)=>{
 test.setTimeout(150_000)
 const errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.addInitScript(()=>{
  window.addEventListener('tryamm:streetverse-player-position',event=>{
   const detail=(event as CustomEvent).detail
   if(detail.district==='circle-park')document.documentElement.dataset.testPlayerZ=String(detail.z)
  })
 })
 await page.goto('/streetverse?safe=1&place=circle-park')
 await page.getByRole('button',{name:'Test apartment trip'}).click()
 const claim=page.getByRole('button',{name:'Claim personal Circle Park starter home'})
 await expect(claim).toHaveCount(0)
 const world=page.getByLabel('Playable StreetVerse Chicago Circle Park world')
 await world.focus()
 await page.keyboard.down('ArrowUp')
 try{await page.waitForFunction(()=>Number(document.documentElement.dataset.testPlayerZ)>=-6,null,{timeout:90000})}
 finally{await page.keyboard.up('ArrowUp')}
 await page.keyboard.down('ArrowLeft')
 try{await expect(claim).toBeVisible({timeout:15000})}
 finally{await page.keyboard.up('ArrowLeft')}
 await claim.click()
 await expect(page.getByRole('button',{name:'Export apartment report'})).toBeVisible()
 await expect(page.getByText('Apartment test passed.',{exact:false})).toBeVisible()
 const pending=page.waitForEvent('download')
 await page.getByRole('button',{name:'Export apartment report'}).click()
 const file=await (await pending).path()
 expect(file).toBeTruthy()
 const report=JSON.parse(await readFile(file!,'utf8'))
 expect(report.passed).toBe(true)
 expect(report.afterReload.xp-report.beforeXp).toBe(200)
 expect(report.afterReload.claimed).toBe(true)
 expect(errors).toEqual([])
 const screenshot=info.outputPath('Circle-Park-after-reload.png')
 await page.screenshot({path:screenshot})
 await info.attach('Circle Park after reload',{path:screenshot,contentType:'image/png'})
})
