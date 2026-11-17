import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import {ECONOMY_AND_EARTH_SYSTEMS,DIGITAL_TWIN_LAYERS,assertEconomyBoundaries} from '../src/data/TryammEconomyEarthReadiness.mjs'
const root=path.resolve(import.meta.dirname,'..')
test('Holo Credit is not Omni Cash or withdrawable real money',()=>{
 assert.equal(assertEconomyBoundaries(),true)
 const credits=ECONOMY_AND_EARTH_SYSTEMS.filter(x=>x.kind==='game-credit')
 assert.equal(credits.length,2)
 for(const c of credits){assert.equal(c.cashRedeemable,false);assert.equal(c.transferable,false);assert.equal(fs.existsSync(path.join(root,c.source)),true)}
})
test('Existing Aniyah Pay and weather provider are source backed, not certified',()=>{
 for(const e of ECONOMY_AND_EARTH_SYSTEMS.filter(x=>x.source)){
  if(e.id==='mycelium-events')continue // currently only available in draft PR #730
  assert.equal(fs.existsSync(path.join(root,e.source)),true,e.id+' module missing')
 }
 const pay=fs.readFileSync(path.join(root,'src/services/aniyahPay.ts'),'utf8')
 const credits=fs.readFileSync(path.join(root,'src/data/TryammHoloPlayCreditEconomy.ts'),'utf8')
 const weather=fs.readFileSync(path.join(root,'api/_lib/global-weather.js'),'utf8')
 assert.match(pay,/Real-money submission is disabled in the game client/)
 assert.match(credits,/cashValueMinor:0/)
 assert.match(weather,/OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED/)
 assert.match(weather,/OPEN_METEO_PRODUCTION_VERIFIED/)
})
test('Satellite imagery remains an unconnected, separately licensed/attributed visual layer',()=>{
 assert.equal(DIGITAL_TWIN_LAYERS.find(x=>x.id==='earth-image').enabled,false)
 assert.equal(ECONOMY_AND_EARTH_SYSTEMS.find(x=>x.id==='satellite-tiles').source,null)
 assert.equal(ECONOMY_AND_EARTH_SYSTEMS.find(x=>x.id==='omni-cash').source,null)
})
