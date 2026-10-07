import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const css=fs.readFileSync(new URL('../src/components/streetverse-mobile-layout.css',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE MOBILE V5 VISUAL CONTRACT FAIL: '+msg)}

for(const token of [
  "streetverse-mobile-brick-v5",
  "mobileArchitecturePass:'brick-window-depth-v5'",
  "mobileHudPass:'safe-area-separated-v5'",
  "mobile-brick-building-v5",
  "windowFrameGeometry",
  "windowGlassGeometry",
  "fireEscapeMat",
  "data-streetverse-camera-control",
])must(world.includes(token),'mobile world missing '+token)

for(const token of [
  "top: calc(env(safe-area-inset-top) + 108px) !important",
  "top: calc(env(safe-area-inset-top) + 184px) !important",
  "[data-streetverse-camera-control]",
  "bottom: calc(env(safe-area-inset-bottom) + 54px) !important",
])must(css.includes(token),'mobile layout missing '+token)

console.log('STREETVERSE MOBILE V5 VISUAL CONTRACT PASS: brick texture + framed windows + fire escapes + separated mission/travel/camera HUD')
