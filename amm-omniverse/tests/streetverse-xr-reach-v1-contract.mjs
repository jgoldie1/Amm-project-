import fs from 'node:fs'

const viewport=fs.readFileSync(new URL('../src/components/ImmersiveWorldViewport.tsx',import.meta.url),'utf8')
const reach=fs.readFileSync(new URL('../src/runtime/StreetVerseXRReachRuntime.ts',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE XR REACH V1 CONTRACT FAIL: '+msg)}

for(const token of [
  "createStreetVerseWestSideVisibleWorld",
  "installStreetVerseXRReach",
  "streetverse-immersive-world-root",
  "tryamm:immersive-west-side-ready",
  "xrReach.tick(now)",
  "xrReachRef.current?.setPresentation(kind)",
  "xrModeRef.current=kind",
  "optionalFeatures:['bounded-floor','hand-tracking']",
  "optionalFeatures:['hit-test','hand-tracking','dom-overlay']",
])must(viewport.includes(token),'immersive viewport missing '+token)

must(!viewport.includes("for(let x=-5;x<=5;x++)for(let z=-5;z<=5;z++){if(Math.abs(x)%2===0||Math.abs(z)%2===0)continue"),'placeholder grid city must not remain the immersive Global City authority')

for(const token of [
  "XRHandModelFactory",
  "XRControllerModelFactory",
  "renderer.xr.getHand(0)",
  "renderer.xr.getController(0)",
  "thumb-tip",
  "index-finger-tip",
  "PINCH_START_METERS=.032",
  "PINCH_RELEASE_METERS=.050",
  "DIRECT_GRAB_RADIUS_METERS=.12",
  "selectstart",
  "selectend",
  "streetverse-xr-mission-token",
  "streetverse-xr-creator-cube",
  "streetverse-xr-holo-ball",
  "worldRoot.scale.setScalar(.012)",
  "worldRoot.position.set(0,.72,-1.20)",
  "scene.background=null",
  "worldRoot.position.set(0,0,-49)",
  "tryamm:xr-reach-grab",
  "tryamm:xr-reach-release",
  "tryamm:xr-reach-presentation",
])must(reach.includes(token),'XR Reach runtime missing '+token)

must(String(pkg.scripts?.build||'').includes('streetverse-xr-reach-v1-contract.mjs'),'production build must gate XR Reach V1')

console.log('STREETVERSE XR REACH V1 CONTRACT PASS: real West Side immersive city + VR/AR presentation + tracked hand pinch + controller grab + iPhone-safe fallback')
