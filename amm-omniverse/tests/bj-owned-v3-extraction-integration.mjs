import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
import crypto from 'node:crypto'
const cwd=process.cwd()
const result=spawnSync(process.execPath,['scripts/extract-bj-owned-v3-glb.mjs'],{cwd,encoding:'utf8'})
assert.equal(result.status,0,`BJ asset extraction failed: ${result.stderr||result.stdout}`)
const filename='public/tryamm-assets/meshy/characters/BJ_Articulated_Animated_v3_PROTOTYPE.glb'
const bytes=fs.readFileSync(path.join(cwd,filename))
const expected='cd8db37f912e7ddbeeb6a672d524249154680aa1c00eca16b0f010f8fcfbc788'
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected)
const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString('utf8').trim())
assert.equal(json.meshes.length,126)
assert.equal(json.nodes.length,139)
assert.equal(json.animations.length,6)
assert.ok(json.animations.some(a=>a.name==='BJ_Walk_Cycle'))
const manifest=JSON.parse(fs.readFileSync(path.join(cwd,filename+'.manifest.json'),'utf8'))
assert.equal(manifest.certifiedPhotoLikeness,false)
const loader=fs.readFileSync(path.join(cwd,'src/runtime/StreetVerseMeshyBJHeroRuntime.ts'),'utf8')
assert.match(loader,/BJ_Articulated_Animated_v3_PROTOTYPE\.glb/)
assert.match(loader,/usingOwnedArticulatedV3/)
assert.match(loader,/rotation\.x=-Math\.PI\/2/)
assert.match(loader,/bjOwnedArticulatedV3/)
const mobile=fs.readFileSync(path.join(cwd,'src/components/StreetVerseMobileWorld.tsx'),'utf8')
assert.match(mobile,/bjOwnedArticulatedV3/)
assert.match(mobile,/nativeLayer\.add\(handle\.object\)/)
assert.match(mobile,/nativeHeroFallback!\.visible=false/)
assert.match(mobile,/BJ V3 ANIMATED/)
const pkg=JSON.parse(fs.readFileSync(path.join(cwd,'package.json'),'utf8'))
assert.match(pkg.scripts['assets:prebuild'],/bj:owned:extract/)
console.log('BJ Owned Articulated v3: real GLB extracted; 126 meshes, 139 nodes, six animations, hash valid, Three.js fallback integrated (source contract PASS).')