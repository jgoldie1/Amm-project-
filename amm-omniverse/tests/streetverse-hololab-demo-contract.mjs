import fs from 'node:fs'
import assert from 'node:assert/strict'
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const demo=fs.readFileSync(new URL('../src/components/StreetVerseHoloLabDemoHUD.tsx',import.meta.url),'utf8')
assert.match(world,/<StreetVerseHoloLabDemoHUD\s*\/>/,'Demo must mount in StreetVerse')
assert.match(demo,/createCrossVerseChicagoJourney/,'Demo must reuse journey coordinator')
assert.match(demo,/journey\.prepare/,'Demo must prepare a transition')
assert.match(demo,/journey\.confirmSceneLoaded/,'Demo must explicitly confirm simulated arrival')
assert.match(demo,/journey\.cancel/,'Demo must support cancellation')
assert.match(demo,/journey\.remember/,'Demo must support NPC memory')
assert.match(demo,/SIMULATED arrival/,'Demo must not claim 3D scene loaded')
assert.match(demo,/minHeight:56/,'One-handed controls must have large targets')
console.log('HoloLab browser demonstration contract PASS')
