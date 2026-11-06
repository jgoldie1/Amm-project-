import assert from 'node:assert/strict'
import {storefrontBounds,canOccupyStore,moveWithStoreCollisions} from '../src/runtime/StreetVerseStoreNavigation.ts'
const b=storefrontBounds(-12,12)
assert.equal(canOccupyStore({x:-12,z:15},b),true)
assert.equal(canOccupyStore({x:-12,z:12},b),true)
assert.equal(canOccupyStore({x:-14.4,z:12},b),false)
assert.equal(canOccupyStore({x:-12,z:9.55},b),false)
assert.equal(canOccupyStore({x:-10,z:14.45},b),false)
const entered=moveWithStoreCollisions({x:-12,z:16},{x:-12,z:12},[b])
assert.ok(entered.z<14,'walk through centered doorway')
const blocked=moveWithStoreCollisions({x:-10,z:16},{x:-10,z:12},[b])
assert.ok(blocked.z>14,'front wall blocks off-center entry')
console.log('StreetVerse store doorway, interior and collision PASS')
