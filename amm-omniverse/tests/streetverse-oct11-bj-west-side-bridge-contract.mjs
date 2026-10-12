import fs from 'node:fs'
import assert from 'node:assert/strict'

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
const builder=read('../src/components/StreetVerseWestSideWorldBuilder.tsx')
const west=read('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts')
const mobile=read('../src/components/StreetVerseMobileWorld.tsx')
const bj=read('../src/components/BJStubbsV7Viewer.tsx')

for(const id of ['circle-park','roosevelt','taylor','pilsen']){
  assert.ok(builder.includes(`'${id}':{x:`),`World Builder missing playable district ${id}`)
  assert.ok(west.includes(`{id:'${id}',label:`),`Visible 3D world missing arrival waypoint ${id}`)
}
assert.ok(builder.includes("document.querySelector('[data-streetverse-world-root=\"true\"]')"),'Missing mounted mobile-scene guard')
assert.ok(builder.includes("'tryamm:west-side-route-request'"),'World Builder is not dispatching the existing mobile route event')
assert.ok(builder.includes("'tryamm:west-side-route-arrived'"),'World Builder must wait for real scene acknowledgement')
assert.ok(mobile.includes("addEventListener('tryamm:west-side-route-request',onWestSideRoute)"),'Mobile world must consume the district travel event')
assert.ok(mobile.includes("'tryamm:west-side-route-arrived'"),'Mobile world must confirm actual arrival')
assert.ok(builder.includes("if(zone.status==='planned')"),'Planned districts must not start as playable missions')
assert.ok(west.includes("'west-side-world-builder-arrival-'"),'World requires visible waypoint geometry')
assert.ok(west.includes('worldBuilderDistrictEntries:builderArrivals.length'),'World readiness should report actual entry count')
assert.ok(bj.includes('aria-expanded={advancedOpen}'),'BJ mobile viewer requires collapsible controls')
assert.ok(bj.includes("window.innerWidth<768?1.35:2"),'BJ preview must cap old-phone rendering cost')
assert.ok(bj.includes('not a certified photoreal likeness'),'BJ preview must not claim certified face accuracy')

console.log('STREETVERSE OCT 11 BRIDGE CONTRACT PASS: 4 real district anchors, route acknowledgement, planned-world guard, visible markers and BJ one-hand viewer')
