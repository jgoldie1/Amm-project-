import fs from 'node:fs'
import assert from 'node:assert/strict'
const src=fs.readFileSync(new URL('../src/runtime/StreetVerseSpaceVerseFlightRuntime.ts',import.meta.url),'utf8')
for(const key of ['earth','orbit','moon','mars','gravityG','breathable','pressureKPa','launching','transit','approach','docked','oxygenPercent','fuelPercent','canExit','equipSuit','refuel'])assert.ok(src.includes(key),'Missing SpaceVerse fundamental: '+key)
assert.match(src,/state\.fuelPercent<20/,'Launch must check fuel')
assert.match(src,/environment\.breathable\|\|state\.suited/,'Vacuum exit must require a suit')
assert.match(src,/Math\.max\(0,state\.oxygenPercent-use\)/,'Oxygen must not become negative')
console.log('SpaceVerse flight foundation contract PASS')
