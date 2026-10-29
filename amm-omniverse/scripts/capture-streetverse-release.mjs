import {mkdirSync,readFileSync,statSync} from 'node:fs'
import path from 'node:path'
import {chromium} from 'playwright'

const base=String(process.env.TRYAMM_BASE_URL||'https://tryamm.online').replace(/\/$/,'')
const url=base+'/streetverse'
const out=path.resolve(process.argv[2]||'release-evidence/visual-qa')
mkdirSync(out,{recursive:true})

const validatePng=(file)=>{
  const data=readFileSync(file)
  if(data.length<1000 || !data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || data.subarray(-8,-4).toString('ascii')!=='IEND') throw Error('Invalid or incomplete screenshot: '+file)
}
const shots=[
  {name:'streetverse-mobile-390x844.png',width:390,height:844,isMobile:true,hasTouch:true},
  {name:'streetverse-desktop-1440x900.png',width:1440,height:900,isMobile:false,hasTouch:false},
]
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']})
try{
  for(const shot of shots){
    const context=await browser.newContext({viewport:{width:shot.width,height:shot.height},isMobile:shot.isMobile,hasTouch:shot.hasTouch})
    try{
      const page=await context.newPage()
      page.setDefaultTimeout(15000)
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000})
      if(!response || !response.ok())throw Error('StreetVerse preview route returned HTTP '+(response?.status()||'unknown'))
      await page.waitForTimeout(3500)
      const filename=path.join(out,shot.name)
      await page.screenshot({path:filename,animations:'disabled',timeout:15000})
      validatePng(filename)
      console.log('Saved screenshot:',shot.name,'bytes:',statSync(filename).size)
    }finally{
      await context.close()
    }
  }
}finally{
  await browser.close()
}
console.log(JSON.stringify({ok:true,url,output:out,shots:shots.map(s=>s.name)},null,2))
