import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createServer} from 'node:http'
import {chromium} from '@playwright/test'
import ts from 'typescript'

const modules=new Map()
for(const name of ['GreenvillePlayerCall','GreenvilleUnionRoute']){
  const code=await readFile(new URL('../src/runtime/'+name+'.ts',import.meta.url),'utf8')
  modules.set('/'+name,ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)
}
const server=createServer((req,res)=>{
  const code=modules.get(req.url)
  res.setHeader('Content-Type',code?'text/javascript':'text/html')
  res.end(code??'<title>Greenville player trip test</title>')
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
let browser
try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:[
    '--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
  ]})
  const pages=new Map()
  for(const name of ['Jacobie','Driver']){
    const context=await browser.newContext({permissions:['microphone']})
    const page=await context.newPage()
    pages.set(name,page)
    await page.goto('http://127.0.0.1:'+server.address().port)
    await page.exposeFunction('deliver',async(peer,id,kind,body)=>{
      const receiver=pages.get(peer)
      await receiver.evaluate(signal=>{void window.phone.receive(signal)},{sender:name,id,kind,body})
    })
    await page.evaluate(async()=>{
      const {createPlayerPhone}=await import('/GreenvillePlayerCall')
      window.phone=createPlayerPhone({send:window.deliver,iceServers:[],
        state:phase=>{window.phase=phase},
        audio:stream=>{
          if(!stream){window.meter?.close();return}
          const ctx=new AudioContext()
          const analyser=ctx.createAnalyser()
          ctx.createMediaStreamSource(stream).connect(analyser)
          window.meter=ctx
          window.hears=()=>{
            const data=new Uint8Array(analyser.fftSize)
            analyser.getByteTimeDomainData(data)
            return data.some(n=>Math.abs(n-128)>2)
          }
        },
        pin:()=>{window.leg=0}
      })
    })
  }
  const a=pages.get('Jacobie'),b=pages.get('Driver')
  for(const closer of [a,b]){
    await a.evaluate(()=>window.phone.dial('Driver'))
    await b.waitForFunction(()=>window.phase==='incoming')
    await b.evaluate(()=>window.phone.accept())
    for(const p of [a,b])await p.waitForFunction(()=>window.phase==='connected'&&window.hears?.(),{},{timeout:15000})
    await a.evaluate(()=>window.phone.share())
    assert.equal(await b.evaluate(()=>window.leg),0)
    await closer.evaluate(()=>window.phone.end())
    for(const p of [a,b])await p.waitForFunction(()=>window.phase==='idle')
    assert.equal(await b.evaluate(async()=>{
      const {nextUnionLeg,unionRoute}=await import('/GreenvilleUnionRoute')
      for(const {x,z} of unionRoute)window.leg=nextUnionLeg(x,z,window.leg).leg
      return nextUnionLeg(18,1,window.leg).text
    }),'Arrived at the Student Union entrance')
  }
  console.log('PASS: two browser contexts, two-way audio energy, shared pin, both hang-up directions and route progression using an in-process signaling relay.')
}finally{await browser?.close();server.close()}
