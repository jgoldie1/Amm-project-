import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const playable=readFileSync(new URL('../src/components/StreetVersePlayableWorld.tsx',import.meta.url),'utf8')
const geo=readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const mobile=readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
test('Chromebook and phone use same real 3D gameplay scene',()=>{
 assert.match(playable,/StreetVerseMobileWorld onClose=\{onClose\}/)
 assert.doesNotMatch(playable,/return <><StreetVerseWeatherSync\/><StreetVerseWorldBoundary onClose=\{onClose\}><Suspense fallback=\{<MobileLoading\/>\}><StreetVerseLivingWorld/)
})
test('explicit graphics 3d route avoids underpowered device automatic safe boot',()=>{
 assert.match(geo,/params\.get\('graphics'\)==='3d'\)return false/)
 assert.match(geo,/params\.get\('graphics'\)==='character'&&/,'character routes must bypass early safe boot')
 assert.match(geo,/jacobie-stubbs','lateasia','lateasia-monroe/,'all named GLB routes covered')
 assert.match(playable,/if\(safe&&!forceFull3D&&!character3D\)return/)
})
test('joystick and real BJ controls are mounted in playable world',()=>{
 assert.match(mobile,/aria-label="StreetVerse analog joystick"/)
 assert.match(mobile,/<StreetVerseRealBJRecoveryHUD\/>/)
 assert.match(mobile,/nativeLayer\.add\(handle\.object\)/)
})
