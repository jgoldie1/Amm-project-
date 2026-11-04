import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve,dirname} from 'node:path'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=p=>readFileSync(resolve(root,p),'utf8')
const carousel=read('src/components/StreetVerseActionCarousel.tsx')
const mobile=read('src/components/StreetVerseMobileWorld.tsx')
const living=read('src/components/StreetVerseLivingWorld.tsx')
const safe=read('src/components/StreetVerseMobilePlayableWorld.tsx')
assert.match(carousel,/GET IN CAR/, 'visible vehicle-entry launcher must exist')
assert.match(carousel,/if\(id==='enter'\)\{[\s\S]*?streetverse-vehicle-interact/, 'ENTER action must use vehicle interaction event')
assert.match(carousel,/entered:true,vehicleId,source:'action-carousel'/, 'entry request must specify entered true')
assert.match(carousel,/streetverse-vehicle-controlled',onVehicleControlled/, 'UI must wait for authoritative gameplay occupancy event')
assert.match(carousel,/streetverse-vehicle-denied',onVehicleDenied/, 'UI must handle rejected entry')
assert.doesNotMatch(carousel,/addEventListener\('tryamm:streetverse-vehicle-input',onMove\)/,'driving should not auto-dismiss menu')
for(const [name,source] of [['mobile',mobile],['living',living],['mobile-safe',safe]]){
 assert.match(source,/addEventListener\('tryamm:streetverse-vehicle-interact'/,name+' should listen for entry requests')
 assert.match(source,/tryamm:streetverse-vehicle-controlled/,name+' should report actual occupancy')
}
console.log('StreetVerse entry carousel event contract: PASS (static source check, not gameplay validation)')
