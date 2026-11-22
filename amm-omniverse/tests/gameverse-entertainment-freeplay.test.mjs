import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import {ENTERTAINMENT_DISTRICT_KEY,ENTERTAINMENT_VENUES,ENTERTAINMENT_MONEY_RULES,safeDistrictState,visitEntertainmentVenue} from '../src/runtime/GameVerseEntertainmentDistrict.mjs'
test('Casino lounge, nightclub, hotel, theater exist with free roleplay concierge',()=>{
 assert.deepEqual(ENTERTAINMENT_VENUES.map(x=>x.id),['casino-lounge','nightclub','hotel','theater'])
 assert.ok(ENTERTAINMENT_VENUES.every(x=>x.dialogue&&x.mission))
 assert.equal(ENTERTAINMENT_DISTRICT_KEY,'tryamm.gameverse.entertainment-district.v1')
})
test('Free-play cannot wager, buy casino chips, cash out or award prizes',()=>{
 for(const [name,val] of Object.entries(ENTERTAINMENT_MONEY_RULES))if(name!=='mode')assert.equal(val,false,name+' must stay disabled')
 assert.equal(ENTERTAINMENT_MONEY_RULES.mode,'free-play-social-only')
})
test('Visits are idempotent, sanitized and cannot create financial value',()=>{
 const start=safeDistrictState(null)
 const v=visitEntertainmentVenue(start,'hotel')
 assert.equal(v.ok,true)
 assert.equal(v.duplicate,false)
 const twice=visitEntertainmentVenue(v.state,'hotel')
 assert.equal(twice.duplicate,true)
 assert.deepEqual(twice.state.visited,['hotel'])
 assert.equal(visitEntertainmentVenue(twice.state,'not-real').ok,false)
 assert.deepEqual(safeDistrictState({visited:['hotel','hotel','invalid','casino-lounge']}).visited,['hotel','casino-lounge'])
})
test('GameVerse launcher uses separate free-play component with no casino payment API',()=>{
 const hub=fs.readFileSync(new URL('../src/components/GameVerseHub.tsx',import.meta.url),'utf8')
 const ui=fs.readFileSync(new URL('../src/components/GameVerseEntertainmentDistrict.tsx',import.meta.url),'utf8')
 assert.match(hub,/GameVerseEntertainmentDistrict/)
 assert.match(hub,/OPEN FREE-PLAY DISTRICT/)
 assert.match(ui,/FREE PLAY ONLY/)
 assert.match(ui,/tryamm:gameverse-entertainment-visit/)
 assert.match(ui,/currencyAwarded:0,transactionCreated:false/)
 assert.doesNotMatch(ui,/\/api\/commerce\/checkout|\/api\/credits\/spend|\/api\/payments\/route/)
})

test('GameVerse evidence recorder is explicit opt-in and exports only local WebM',()=>{
 const hub=fs.readFileSync(new URL('../src/components/GameVerseHub.tsx',import.meta.url),'utf8')
 const recorder=fs.readFileSync(new URL('../src/components/GameVerseEvidenceRecorder.tsx',import.meta.url),'utf8')
 assert.match(hub,/RECORD GAMEVERSE TEST \+ EXPORT/)
 for(const fragment of ['getDisplayMedia','MediaRecorder','DOWNLOAD VIDEO','video\/webm','45000','URL.createObjectURL','aria-live'])assert.ok(recorder.includes(fragment),fragment)
 assert.doesNotMatch(recorder,/\/api\/payments|\/api\/credits|fetch\(|localStorage\.setItem/)
})
