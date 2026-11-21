import fs from 'node:fs'
import assert from 'node:assert/strict'
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const hud=fs.readFileSync(new URL('../src/components/StreetVerseChicagoTimeSwitchHUD.tsx',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoTimeSwitchRuntime.ts',import.meta.url),'utf8')
assert.match(world,/<StreetVerseChicagoTimeSwitchHUD\s*\/>/,'Scanner must be mounted in StreetVerse')
assert.match(world,/<details[^>]*>/,'Scanner must start collapsible to avoid blocking gameplay')
for(const era of ["'past'","'present'","'future'"])assert.ok(runtime.includes(era),'Missing era '+era)
assert.match(hud,/tryamm:crossverse-scene-transition/,'Era selection must request a scene transition')
assert.match(hud,/requiresSceneLoad:true/,'Scanner must not claim rendering is complete')
assert.match(runtime,/memories\.get\(timeline\.active\(\)\)/,'NPC memories must be timeline-scoped')
console.log('CrossVerse Chicago scanner integration contract PASS')
