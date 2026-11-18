import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const main=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const mobile=readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
test('core route bypasses outer GeoSpawnBridge and fallback shell',()=>{
 assert.match(main,/const StreetVerseMobileWorldCore=lazy\(\(\)=>import\('\.\/components\/StreetVerseMobileWorld'\)\)/)
 assert.match(main,/streetVerseParams\.get\('core'\)==='1'/)
 assert.match(main,/isStreetVerseCore\?<StreetVerseMobileErrorBoundary/)
 assert.match(main,/isStreetVerseCore\?streetVerseRoute:/)
})
test('core scene includes original BJ restoration and analog joystick',()=>{
 assert.match(mobile,/<StreetVerseRealBJRecoveryHUD\/>/)
 assert.match(mobile,/aria-label="StreetVerse analog joystick"/)
 assert.match(mobile,/data-streetverse-world-root="true"/)
})
