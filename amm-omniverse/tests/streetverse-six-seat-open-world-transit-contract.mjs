import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=p=>readFileSync(resolve(root,p),'utf8')
const manifest=read('src/runtime/StreetVersePassengerTransportRuntime.ts')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const travel=read('src/runtime/StreetVerseOpenWorldTransitRuntime.ts')
const carousel=read('src/components/StreetVerseActionCarousel.tsx')
assert.match(manifest,/SIX_SEAT_CAR/, 'six seat layout declared')
assert.match(manifest,/third-row-passenger/, 'sixth seat declared')
assert.match(world,/createTransportManifest\(vehicleId,'car',5\)/, 'world chooses six total seats')
assert.match(world,/installSixSeatManifest\(starterCar,'starter-car'\)/)
assert.match(world,/installSixSeatManifest\(repairCar,'first-repair-car'\)/)
assert.match(world,/passengerCapacity=6/, 'world shows six total occupants')
assert.match(travel,/mode==='car'\?boardTransport\(manifest,members\[0\]\.actorId,'front-driver'\)/, 'private driver seat assigned')
assert.match(travel,/mode==='car'&&driverSeat\?members\.slice\(1\):members/, 'driver cannot double-board')
assert.match(travel,/mode==='rideshare'/, 'rideshare is a supported mode')
for(const mode of ['rideshare','car','bus','train','plane']) assert.match(travel,new RegExp(mode))
assert.match(carousel,/RIDE SHARE \/ BUS \/ TRAIN \/ FLY IN/)
assert.match(carousel,/requestOpenWorldTrip/)
assert.doesNotMatch(travel,/dispatchEvent\(new CustomEvent\('tryamm:global-city-state'/, 'planning must not falsely claim arrival')
console.log('Six-seat travel static contract PASS; gameplay, animations, networking and world loads not certified')
