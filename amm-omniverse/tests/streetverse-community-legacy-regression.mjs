import assert from 'node:assert/strict'
import fs from 'node:fs'
import {test} from 'node:test'
import {build} from 'esbuild'

const bundled=await build({
 entryPoints:[new URL('../src/runtime/StreetVerseCommunityLegacyRuntime.ts',import.meta.url).pathname],
 bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent',
})
const runtime=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const {
 STREETVERSE_LEGACY_PROJECTS,initialStreetVerseCommunityLegacy,
 readStreetVerseCommunityLegacy,serializeStreetVerseCommunityLegacy,
 buildStreetVerseLegacyProject,awardStreetVerseLegacyMission,
}=runtime
const source=(path)=>fs.readFileSync(new URL('../src/'+path,import.meta.url),'utf8')

test('community legacy starts with one fictional build point and exactly three distinctive projects',()=>{
 const initial=initialStreetVerseCommunityLegacy()
 assert.equal(initial.points,1)
 assert.deepEqual(initial.built,[])
 assert.equal(STREETVERSE_LEGACY_PROJECTS.length,3)
 assert.deepEqual(STREETVERSE_LEGACY_PROJECTS.map(x=>x.id),['access-ramp','community-garden','solar-wayfinding'])
})

test('visible improvement persists, costs one fictional point and cannot be purchased twice',()=>{
 const first=buildStreetVerseLegacyProject(initialStreetVerseCommunityLegacy(),'access-ramp')
 assert.equal(first.ok,true)
 assert.equal(first.state.points,0)
 assert.deepEqual(first.state.built,['access-ramp'])
 const duplicate=buildStreetVerseLegacyProject(first.state,'access-ramp')
 assert.equal(duplicate.ok,false)
 assert.strictEqual(duplicate.state,first.state)
 const restored=readStreetVerseCommunityLegacy(serializeStreetVerseCommunityLegacy(first.state))
 assert.deepEqual(restored,first.state)
 const denied=buildStreetVerseLegacyProject(first.state,'community-garden')
 assert.equal(denied.ok,false)
 assert.strictEqual(denied.state,first.state)
})

test('the same completed Chicago delivery only awards one point, even when replayed',()=>{
 const initial=initialStreetVerseCommunityLegacy()
 const first=awardStreetVerseLegacyMission(initial,'delivery:HOLO-STORE-001')
 assert.equal(first.ok,true)
 assert.equal(first.state.points,2)
 const replay=awardStreetVerseLegacyMission(first.state,'delivery:HOLO-STORE-001')
 assert.equal(replay.ok,false)
 assert.strictEqual(replay.state,first.state)
 const uic=awardStreetVerseLegacyMission(replay.state,'uic-delivery')
 assert.equal(uic.ok,true)
 const garden=buildStreetVerseLegacyProject(uic.state,'community-garden')
 assert.equal(garden.ok,true)
 assert.deepEqual(garden.state.built,['community-garden'])
 assert.equal(garden.state.rewardedMissionIds.length,2)
})

test('invalid mission IDs and corrupt storage cannot mint points or add arbitrary projects',()=>{
 const initial=initialStreetVerseCommunityLegacy()
 for(const id of ['', '../secret', 'x'.repeat(100), 'name?with=token']){
  const result=awardStreetVerseLegacyMission(initial,id)
  assert.equal(result.ok,false)
  assert.strictEqual(result.state,initial)
 }
 for(const raw of ['not json','{"version":1,"points":999,"built":[],"rewardedMissionIds":[]}','{"version":1,"points":4,"built":["unknown"],"rewardedMissionIds":[]}','{"version":1,"points":4,"built":["access-ramp","access-ramp"],"rewardedMissionIds":[]}']){
  assert.deepEqual(readStreetVerseCommunityLegacy(raw),initial)
 }
})

test('gameplay includes a single one-hand HUD and visual mesh implementation on desktop and mobile',()=>{
 const playable=source('components/StreetVersePlayableWorld.tsx')
 const mobile=source('components/StreetVerseMobileWorld.tsx')
 const desktop=source('components/StreetVerseLivingWorld.tsx')
 const visuals=source('runtime/StreetVerseCommunityLegacyVisuals.ts')
 const hud=source('components/StreetVerseCommunityLegacyHUD.tsx')
 assert.match(playable,/StreetVerseCommunityLegacyHUD/)
 assert.match(mobile,/installStreetVerseCommunityLegacyVisuals\(scene\)/)
 assert.match(desktop,/installStreetVerseCommunityLegacyVisuals\(scene\)/)
 assert.match(mobile,/disposeCommunityLegacy\(\)/)
 assert.match(desktop,/disposeCommunityLegacy\(\)/)
 for(const id of ['access-ramp','community-garden','solar-wayfinding'])assert.ok(visuals.includes("'"+id+"'"))
 assert.match(visuals,/group\.visible=ids\.includes\(id\)/)
 assert.match(visuals,/STREETVERSE_LEGACY_UPDATED/)
 assert.match(hud,/minHeight:48/)
 assert.match(hud,/aria-live="polite"/)
 assert.match(hud,/No real construction, donations, token sales, payments or ownership rights/)
 assert.match(hud,/detail\.demo!==true\|\|detail\.fictional!==true/)
})
