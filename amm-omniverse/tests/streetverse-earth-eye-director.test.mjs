import assert from 'node:assert/strict'
import {test} from 'node:test'
import {build} from 'esbuild'
import fs from 'node:fs'
const source=new URL('../src/runtime/StreetVerseEarthEyeDirector.ts',import.meta.url)
const built=await build({entryPoints:[source.pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
const earth=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'))
test('Chicago Detroit Tampa Memphis Atlanta included with no fake gameplay',()=>{
 const ids=earth.EARTH_EYE_CITIES.map(x=>x.id)
 for(const id of ['chicago','detroit','tampa','memphis','atlanta'])assert.ok(ids.includes(id))
 assert.equal(new Set(ids).size,ids.length)
 for(const city of earth.EARTH_EYE_CITIES) {
  assert.ok(city.lat>=-90&&city.lat<=90)
  assert.ok(city.lon>=-180&&city.lon<=180)
  if(city.id!=='chicago')assert.equal(city.worldState,'preview-only')
 }
})
test('Earth Eye cannot grant travel authority or claim live feeds',()=>{
 for(const c of [{cityId:'detroit',action:'inspect'},{cityId:'chicago',action:'time-preview'},{cityId:'tampa',action:'tile-export-plan'}]){
  const receipt=earth.resolveEarthEyeCommand(c)
  assert.equal(receipt.ok,true)
  assert.equal(receipt.productionMutation,false)
  assert.equal(receipt.playableTravel,false)
  assert.equal(receipt.liveData,false)
 }
 assert.equal(earth.resolveEarthEyeCommand({cityId:'unknown',action:'inspect'}).ok,false)
 assert.equal(earth.resolveEarthEyeCommand({cityId:'chicago',action:'teleport'}).ok,false)
})
test('Installed bridge uses Cursor Construct and existing Time Machine without immediate mutations',()=>{
 const text=fs.readFileSync(source,'utf8')
 const geo=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
 assert.match(text,/tryamm:shared-world-context-query/)
 assert.match(text,/tryamm:time-machine-world-foundry-request/)
 assert.match(text,/autoPreview:false/)
 assert.match(geo,/installStreetVerseEarthEyeDirector/)
 assert.doesNotMatch(text,/navigator\.geolocation|watchPosition|fetch\(|payment|window\.location\.href/)
})
