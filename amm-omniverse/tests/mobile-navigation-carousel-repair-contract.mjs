import fs from 'node:fs'
import assert from 'node:assert/strict'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const app=read('../src/App.tsx')
const main=read('../src/main.tsx')
const mobile=read('../src/components/StreetVerseMobileWorld.tsx')
const carousel=read('../src/components/HoloClipScreenLayer.tsx')
const social=read('../src/components/HoloSocialEngine.tsx')
const sparrow=read('../src/components/SparrowMapCenter.tsx')

assert.match(app,/__tryammNavigate/,'shell must expose the shared TRYAMM navigator')
for(const intent of ['holoverse','holofon','sparrow','carousel']) assert.match(app,new RegExp("open === '"+intent+"'"),'shell must consume '+intent+' intent')
for(const route of ['/propertyverse','/musicverse','/sportverse','/time-machine','/middleverse','/gameverse']) assert.ok(app.includes(route),'shared navigator must handle '+route)
assert.ok(main.includes("'/faithverse'")&&main.includes('isEthiopianBible'),'FaithVerse must resolve to the Ethiopian Bible experience')

assert.match(mobile,/openShell\('holofon'\)/,'StreetVerse Holo FON button must leave the dead event-only path')
for(const target of ['sparrow','holoverse','carousel','faithverse','home']) assert.ok(mobile.includes("'"+target+"'"),'StreetVerse quick menu must include '+target)
assert.doesNotMatch(mobile,/onClick=\{\(\)=>window\.dispatchEvent\(new CustomEvent\('tryamm:holo-fon-open'/,'mobile Holo FON must not depend on an unmounted global listener')

assert.match(carousel,/startSwipe/,'carousel must implement pointer swipe start')
assert.match(carousel,/finishSwipe/,'carousel must implement pointer swipe completion')
assert.match(carousel,/SWIPE LEFT \/ RIGHT/,'carousel must explain swipe navigation')
assert.match(carousel,/panels\.map\(\(panel,index\)=>/,'carousel must expose direct panel position controls')

assert.match(social,/TRYAMM_VERSE_DIRECTORY/,'world mode must use the canonical Verse directory')
assert.match(social,/openVerse/,'Verse directory entries must have a launch path')
assert.match(social,/ALL VERSES • TAP TO OPEN/,'All Verses must render an actual directory')
assert.match(sparrow,/__tryammNavigate/,'Sparrow actions must use the shared navigator')

console.log('Mobile navigation + Holo carousel repair contract: PASS')
