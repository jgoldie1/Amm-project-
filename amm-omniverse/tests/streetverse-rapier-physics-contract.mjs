import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseRapierPhysicsRuntime.ts',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')

if(!pkg.dependencies?.['@dimforge/rapier3d-compat'])throw new Error('Rapier dependency missing')
for(const x of [
  "new RAPIER.World",
  "RigidBodyDesc",
  "ColliderDesc.cuboid",
  "applyImpulse",
  "setLinearVelocity",
  "getTransform",
  "tryamm:rapier-physics-ready",
  "vehicleFoundation"
])if(!runtime.includes(x))throw new Error('Rapier runtime missing '+x)

if(!main.includes('installStreetVerseRapierPhysics'))throw new Error('Rapier runtime is not installed from main.tsx')
console.log('StreetVerse Rapier physics engine contract: PASS')
