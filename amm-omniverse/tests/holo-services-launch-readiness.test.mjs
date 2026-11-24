import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const root=new URL('../',import.meta.url)
const read=p=>fs.readFileSync(new URL(p,root),'utf8')
const src=read('src/foundation/holoServiceLaunchGates.ts')
const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {HOLO_SERVICE_GATES,HOLO_SERVICE_LABELS,assessHoloService}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
const hub=read('src/components/HoloServicesHub.tsx')
const impl=read('src/services/holoServices.ts')
test('critical service types are registered, including ads and support',()=>{
 for(const name of ['advertising','rideshare','delivery','freight','drone','payments','support','identity','privacy','accessibility','safety','analytics']){
  assert.ok(HOLO_SERVICE_GATES[name]?.length,name)
  assert.ok(HOLO_SERVICE_LABELS[name],name)
 }
})
test('all production services fail closed with no trusted evidence',()=>{
 for(const name of Object.keys(HOLO_SERVICE_GATES)){
  const r=assessHoloService(name,[])
  assert.equal(r.ready,false,name)
  assert.equal(r.passed,0,name)
 }
})
test('strict evidence, expiry, conflicts, and verification are required',()=>{
 const at=new Date('2026-11-22T14:00:00Z')
 const all=HOLO_SERVICE_GATES.advertising.map((gate,i)=>({gate,verified:true,authority:'verified-provider-'+i,reference:'evidence-'+i,checkedAt:'2026-11-22T13:00:00Z',expiresAt:'2026-12-22T14:00:00Z'}))
 assert.equal(assessHoloService('advertising',all,at).ready,true)
 assert.equal(assessHoloService('advertising',all.slice(1),at).ready,false)
 assert.equal(assessHoloService('advertising',[...all,all[0]],at).ready,false)
 assert.equal(assessHoloService('advertising',all.map(x=>({...x,expiresAt:'2026-11-21T00:00:00Z'})),at).ready,false)
 assert.equal(assessHoloService('advertising',all.map(x=>({...x,verified:false})),at).ready,false)
})
test('Holo Advertise never defaults to a paid public campaign',()=>{
 assert.match(impl,/budget_cents:0,status:'draft',simulation:true/)
 assert.match(hub,/Draft-only: \$0 spending and no live ad delivery/)
 assert.match(hub,/consent-based targeting/)
 assert.match(hub,/HoloServices launch readiness/)
 assert.match(hub,/assessHoloService\(key,\[\]\)/)
})
