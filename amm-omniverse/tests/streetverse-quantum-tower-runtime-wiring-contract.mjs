import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=path=>readFileSync(resolve(root,path),'utf8')
const geo=read('src/components/StreetVerseGeoSpawnBridge.tsx')
const center=read('src/components/LiveCenter.tsx')
const main=read('src/main.tsx')
const tower=read('src/components/StreetVerseTowerConnections.tsx')
const dock=read('src/components/StreetVerseCoreGameplayDock.tsx')
const action=read('src/components/StreetVerseActionCarousel.tsx')
const tests=[
 ['live overlay listener',geo.includes("addEventListener('tryamm:live-center-open',openLive)")],
 ['live overlay render',geo.includes('<LiveCenter initialFormat="gamecast"')],
 ['playable and safe world tower panel',(geo.match(/<StreetVerseTowerConnections\/>/g)||[]).length===2],
 ['live center selects gamecast',center.includes('initialFormat?: Format')],
 ['LiveKit screen share',center.includes('setScreenShareEnabled(enable)')],
 ['live dock opens real center',dock.includes("'tryamm:live-center-open'")],
 ['carousel opens live overlay',geo.includes("'tryamm:streetverse-live-mission-request'")],
 ['Broadcast OS streetverse installer',main.includes("StreetVerse Broadcast OS bridge failed")],
 ['operations streetverse installer',main.includes("StreetVerse operating fabric bridge failed")],
 ['Jarvis streetverse installer',main.includes("StreetVerse JARVIS command router failed")],
 ['travel streetverse installer',main.includes("StreetVerse global travel bridge failed")],
 ['live status request',tower.includes("fetch('/api/live/status'")],
 ['mod pass window probe',tower.includes('__TRYAMM_MOD_PASS__')],
 ['broadcast state observed',tower.includes("'tryamm:broadcast-os-state'")],
 ['gameplay entry observed',tower.includes("'tryamm:streetverse-vehicle-controlled'")],
 ['no false end-to-end certification',tower.includes('verifiedEndToEnd:false')],
 ['accessible diagnostics',tower.includes('Quantum Tower integration status')],
 ['gamecast entry selection',action.includes("tryamm:streetverse-vehicle-interact")]
]
for(const [name,ok] of tests)assert.ok(ok,name)
console.log('Quantum Tower runtime integration source contract: '+tests.length+' passed (static only; provider & browser e2e unverified)')
