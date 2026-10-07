import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE MOBILE V7 FACADE CONTRACT FAIL: '+msg)}

for(const token of [
  "streetverse-mobile-brick-v7",
  "mobileArchitecturePass:'brick-window-depth-v7'",
  "mobileBrickTexture:'streetverse-mobile-brick-v7'",
  "mobileBrickTexture.repeat.set(9.5,14)",
  "windowVerticalMullionGeometry",
  "windowHorizontalMullionGeometry",
  "signBand",
  "downspout",
  "utilityBox",
  "railHand",
])must(world.includes(token),'mobile facade missing '+token)

console.log('STREETVERSE MOBILE V7 FACADE CONTRACT PASS: smaller brick scale + window mullions + entry rails/sign band + facade utilities')
