import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const hud=readFileSync(new URL('../src/components/StreetVerseArDiscoveryHud.tsx',import.meta.url),'utf8')
const world=readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
for(const text of ['verified!==true','DISTANCE_METERS=15','MAX_ANCHORS=100',"u.protocol!=='https:'",'aria-pressed={enabled}','noopener noreferrer','tryamm:streetverse-ar-approved-anchors','tryamm:streetverse-player-position'])assert.ok(hud.includes(text), 'AR safety gate missing '+text)
assert.match(world, /<StreetVerseArDiscoveryHud\/>/)
assert.doesNotMatch(hud,/navigator\.geolocation|localStorage|fetch\(/)
console.log('StreetVerse AR discovery safety contract passed')
