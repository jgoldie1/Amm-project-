import assert from 'node:assert/strict'
import fs from 'node:fs'
import {test} from 'node:test'

const shell=fs.readFileSync(new URL('../src/components/StreetVerseMobileGameShell.tsx',import.meta.url),'utf8')
test('mobile shell forwards active vehicle context to one-hand adapter',()=>{
 assert.match(shell,/context:vehicleActiveRef\.current\?'VEHICLE':'ON_FOOT'/)
 assert.match(shell,/applyInput:\(frame\)=>\{window\.dispatchEvent\(new CustomEvent\('tryamm:streetverse-world-input'/)
})
test('explicit parking and exiting remains available',()=>{
 assert.match(shell,/const exitVehicle=\(\)=>/)
 assert.match(shell,/PARK \/ EXIT/)
})
