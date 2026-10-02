import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const registry=read('../src/data/universalMissionRegistry.ts')
const director=read('../src/components/UniversalMissionDirector.tsx')
const hero=read('../src/components/games/HeroRealms.tsx')
const mobile=read('../src/components/StreetVerseMobileWorld.tsx')
const events=read('../src/components/StreetVerseWorldEvents.tsx')
const family=read('../src/components/MeetTheStubbsWorldDistrict.tsx')

for(const id of [
 'streetverse-neighborhood-ripple',
 'streetverse-global-living-city',
 'waw-community-bridge',
 'starverse-live-showcase-v2',
 'hero-realms-rift-response',
 'omniverse-ripple-convergence',
]) assert.ok(registry.includes(id),`living mission registry missing ${id}`)

assert.ok(registry.includes('choices?:UniversalMissionChoice[]'),'living missions must support explicit player choices')
assert.ok(registry.includes('actionByChoice?:Record<string,UniversalMissionAction>'),'chosen route must be able to open a different real gameplay destination')
assert.ok(registry.includes('eventByChoice?:Record<string,UniversalMissionEvent>'),'chosen route must wait for different gameplay evidence')
assert.ok(registry.includes('impactTags:string[]'),'choices must carry consequence tags')
assert.ok(registry.includes('consequenceTags?:string[]'),'missions must carry persistent world consequences')
assert.ok(registry.includes('coOp?:boolean'),'mission model must expose co-op readiness')
assert.match(registry,/hero-encounter-complete/,'Hero Realms must have a dedicated real encounter signal')

assert.match(director,/tryamm:universal-mission.world-state.v2/,'living mission world state must persist')
assert.match(director,/tryamm:world-consequence-apply/,'mission completion must publish a world consequence')
assert.ok(director.includes('choiceTags(mission,current)'),'mission completion must include route-specific choice consequences')
assert.ok(director.includes('expectedEvent(step,progress)'),'director must derive the required gameplay signal from the active route')
assert.ok(director.includes('expectedAction(step,progress)'),'director must derive the gameplay destination from the active route')
assert.match(director,/AUTO-CHECK/,'non-manual objectives must visibly wait for real gameplay evidence')
assert.match(director,/tryamm:hero-realms-encounter-complete/,'director must consume Hero Realms encounter victories')
assert.match(director,/tryamm:streetverse-vehicle-controlled/,'director must consume real enter/exit vehicle state')
assert.match(director,/tryamm:streetverse-world-event-join/,'director must consume live world-event participation')
assert.match(director,/tryamm:stubbs-family-interaction/,'director must consume family and store interactions')
assert.match(director,/tryamm:media-studio-output-ready/,'director must consume finished creator output')

assert.match(hero,/tryamm:hero-realms-encounter-complete/,'Hero Realms must emit encounter completion after a real victory')
assert.ok(hero.includes("emitEncounterComplete('attack',newEnemies)"),'attack victory must advance living hero missions')
assert.ok(hero.includes("emitEncounterComplete('spell',newEnemies)"),'spell victory must advance living hero missions')
assert.ok(mobile.includes("tryamm:streetverse-vehicle-controlled")&&mobile.includes("entered:true"),'mobile StreetVerse must emit real vehicle entry')
assert.ok(mobile.includes("tryamm:streetverse-vehicle-controlled")&&mobile.includes("entered:false"),'mobile StreetVerse must emit real vehicle exit')
assert.match(mobile,/tryamm:streetverse-checkpoint/,'mobile StreetVerse must emit checkpoint evidence')
assert.match(events,/tryamm:streetverse-world-event-join/,'StreetVerse world events must emit participation evidence')
assert.match(family,/type:'store'/,'family district must emit store interaction evidence')

for(const source of [registry,director]){
 assert.doesNotMatch(source,/payableBalance|withdrawable|awardCash|stripe/i,'living mission client logic must not create financial authority')
}

console.log('Universal living missions v2 contract: PASS')
