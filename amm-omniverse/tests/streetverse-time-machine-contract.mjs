import fs from 'node:fs'
import assert from 'node:assert/strict'
const hud=fs.readFileSync(new URL('../src/components/StreetVerseTimeMachineHUD.tsx',import.meta.url),'utf8')
const director=fs.readFileSync(new URL('../src/runtime/StreetVerseCrossVerseTravelDirector.ts',import.meta.url),'utf8')
assert.match(hud,/tryamm:crossverse-scene-transition/,'Travel must request a scene transition')
assert.match(hud,/requiresSceneLoad:true/,'Scene load must be explicit, not simulated as complete')
assert.match(hud,/disabled=\{!consent\|\|busy/,'Travel requires consent')
assert.match(hud,/returnTo\('streetverse:chicago'\)/,'Player must be able to return to original timeline')
assert.match(director,/createMyceliumTimeline/,'Director must use Mycelium timeline')
assert.match(director,/createCrossVerseGateway/,'Director must enforce CrossVerse gateway')
console.log('CrossVerse time machine UI contract PASS')
