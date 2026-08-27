import fs from 'node:fs'
import assert from 'node:assert/strict'

const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const scene=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')

assert.match(main,/import StreetVerse3D from '\.\/components\/StreetVerse3D'/)
assert.match(main,/window\.location\.pathname\.startsWith\('\/streetverse'\)/)
assert.match(main,/<StreetVerse3D onClose=/)
assert.match(scene,/const avatar=new THREE\.Group\(\)/)
assert.match(scene,/desiredCam\.set\(avatar\.position\.x,10,avatar\.position\.z\+15\)/)
assert.match(scene,/const checkpoints=/)
assert.match(scene,/const cars=\[/)
assert.match(scene,/const npcs:/)
assert.match(scene,/function Pad\(/)
console.log('streetverse public route contract: PASS')
