import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const src=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('saved vehicle mode initializes both UI and live driving ref',()=>{
 assert.match(src,/const \[vehicle,setVehicle\]=useState\(\(\)=>loadSaved\(\)\.vehicle===true\)/)
 assert.match(src,/const vehicleRef=useRef\(vehicle\)/)
 assert.match(src,/vehicle:vehicleRef\.current/)
})
