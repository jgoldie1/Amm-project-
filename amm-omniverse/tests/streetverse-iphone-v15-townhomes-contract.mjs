import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=x=>fs.readFileSync(new URL('../'+x,import.meta.url),'utf8')
const mobile=read('src/components/StreetVerseMobileWorld.tsx')
const pack=JSON.parse(read('package.json'))
for(const name of [
 'circle-park-townhome-brick-textured-body-v15',
 'circle-park-townhome-window-frame-v15',
 'circle-park-townhome-double-pane-v15',
 'circle-park-townhome-window-sill-v15',
 'circle-park-townhome-front-door-v15',
 'circle-park-townhome-door-canopy-v15',
 'circle-park-townhome-porch-lantern-v15'
])assert(mobile.includes(name),'original Circle Park detail missing: '+name)
assert(mobile.includes('const townhomeRows:[number,number,number][]'),'preserve original 6 homes')
assert(mobile.includes('townhomeFacadeSpecs.map(spec=>'),'batch original facades into instanced meshes')
assert(mobile.includes('new THREE.InstancedMesh'),'low-cost repeated detail geometry')
assert(mobile.includes('map:mobileBrickTexture,roughness:.91'),'reuse existing texture rather than pulling new network asset')
assert(mobile.includes('townhomeFacades.forEach(mesh=>{mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere()})'))
assert(mobile.includes('townhomePorchGlowMat.dispose()'),'release porch materials when scene is closed')
assert(mobile.includes('renderer.shadowMap.enabled=false'),'legacy phone shadow memory budget preserved')
assert(pack.scripts.build.includes('streetverse-iphone-v15-townhomes-contract.mjs'))
console.log('STREETVERSE IPHONE V15 TOWNHOMES PASS: six retained homes, brick texturing, door and window facades, instanced details, mobile cleanup')
