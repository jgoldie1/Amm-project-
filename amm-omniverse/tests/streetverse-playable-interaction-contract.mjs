import fs from 'node:fs'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')

assert.match(source,/id:'welcome'.*label:'District Welcome'/s,'StreetVerse must expose an immediately discoverable welcome checkpoint')
assert.match(source,/const businesses=\[/,'StreetVerse must define public-scene business interactions')
assert.match(source,/nearbyBusiness/,'StreetVerse must track nearby business proximity')
assert.match(source,/INTERACT/,'StreetVerse must expose a touch-friendly business interaction control')
assert.match(source,/desiredCam\.set\(avatar\.position\.x,10,avatar\.position\.z\+15\)/,'StreetVerse must retain the player follow camera')
assert.match(source,/Pad label="▲"/,'StreetVerse must retain mobile movement controls')

console.log('StreetVerse playable interaction contract: PASS')
