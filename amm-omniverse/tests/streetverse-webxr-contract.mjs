import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here=path.dirname(fileURLToPath(import.meta.url))
const root=path.resolve(here,'..')
const source=fs.readFileSync(path.join(root,'src/components/ImmersiveWorldViewport.tsx'),'utf8')

const required=[
  'renderer.xr.enabled=true',
  "isSessionSupported('immersive-vr')",
  "isSessionSupported('immersive-ar')",
  "requestSession(kind,init)",
  'renderer.xr.setSession(session)',
  'renderer.setAnimationLoop(animate)',
  'ENTER VR',
  'ENTER AR',
  '3D FALLBACK',
]

for(const token of required){
  if(!source.includes(token)) throw new Error(`StreetVerse WebXR contract missing: ${token}`)
}

if(!source.includes("optionalFeatures:['bounded-floor','hand-tracking']")) throw new Error('VR safety/interaction features missing')
if(!source.includes("optionalFeatures:['hit-test','hand-tracking','dom-overlay']")) throw new Error('AR interaction features missing')

console.log('streetverse WebXR contract: OK')
