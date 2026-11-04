/**
 * Zero-dependency live HTTP smoke test against the freshly compiled Vite site.
 * Certifies static route delivery / asset availability, NOT browser hydration,
 * a deployed URL, Supabase lead submission, or real payment execution.
 */
import assert from 'node:assert/strict'
import {readFileSync,readdirSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {preview} from 'vite'

const dist=resolve('dist')
const manifest=JSON.parse(readFileSync(join(dist,'.vite','manifest.json'),'utf8'))
const routeModule=Object.entries(manifest).find(([key])=>key==='src/components/TryammConnectedGrowthLanding.tsx')
assert.ok(routeModule,'/discover must have a separately loadable customer-journey module in the compiled manifest')
const chunk=routeModule[1]
assert.ok(typeof chunk.file==='string'&&chunk.file.endsWith('.js'),'customer-journey asset must be emitted')
const output=readFileSync(join(dist,chunk.file),'utf8')
for(const phrase of ['Your business deserves a place in the digital world.','SEND SERVICE INQUIRY','REQUEST A PRODUCT PLACEMENT']){
 assert.ok(output.includes(phrase),'compiled customer website missing '+phrase)
}
const builtFiles=readdirSync(join(dist,'assets'))
assert.ok(builtFiles.some(name=>name.endsWith('.js')),'Vite must emit javascript assets')

let server
try {
 server=await preview({preview:{host:'127.0.0.1',port:4177,strictPort:true}})
 const addr=server.httpServer.address()
 assert.ok(addr&&typeof addr!=='string','Vite preview must bind a localhost port')
 const base='http://127.0.0.1:'+addr.port
 for(const pathname of ['/','/discover','/streetverse','/free-tv','/omni-box']){
  const response=await fetch(base+pathname,{redirect:'manual'})
  const html=await response.text()
  assert.equal(response.status,200,pathname+' must return an HTTP 200 document')
  assert.ok(response.headers.get('content-type')?.includes('text/html'),pathname+' must return HTML')
  assert.ok(html.includes('id="root"'),pathname+' must have a React mount target')
 }
 const response=await fetch(base+'/'+chunk.file,{redirect:'manual'})
 assert.equal(response.status,200,'compiled /discover JavaScript must be served')
 assert.ok(response.headers.get('content-type')?.includes('javascript'),'compiled lazy chunk must be JS')
 assert.ok((await response.text()).includes('SEND SERVICE INQUIRY'),'downloaded lazy chunk must include the inquiry UI')
 console.log('TRYAMM built customer journey HTTP smoke: PASS (five routes and live compiled asset; not browser or backend E2E)')
}finally{
 if(server)await new Promise((resolveClose,reject)=>server.httpServer.close(err=>err?reject(err):resolveClose()))
}
