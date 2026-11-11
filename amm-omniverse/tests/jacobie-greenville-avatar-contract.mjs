import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname,resolve} from 'node:path'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const scene=readFileSync(resolve(root,'src/components/GreenvilleWalkableCampus.tsx'),'utf8')
const avatar=readFileSync(resolve(root,'src/components/JacobieCampusAvatar.tsx'),'utf8')
assert.match(scene,/import JacobieCampusAvatar from '\.\/JacobieCampusAvatar'/)
assert.match(scene,/<JacobieCampusAvatar moving=/)
assert.match(avatar,/SV_HERO_JACOBIE_GREENVILLE_V1\.glb/)
assert.match(avatar,/GLTFLoader/)
assert.match(avatar,/jacobie-safe-fallback/)
assert.match(avatar,/AnimationMixer/)
assert.match(scene,/onPosition\(g.position.x,g.position.z\)/)
console.log('Jacobie Greenville avatar GLB integration contract passed')
