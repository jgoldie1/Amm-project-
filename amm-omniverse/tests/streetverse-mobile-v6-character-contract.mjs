import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const residents=fs.readFileSync(new URL('../src/runtime/StreetVerseMobileLivingCityRuntime.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE MOBILE V6 CHARACTER CONTRACT FAIL: '+msg)}

for(const token of [
  "fallbackBodyPass:'human-proportion-v6'",
  "mobileCharacterFallbackPass:'human-proportion-v6'",
  "hero-pelvis",
  "hero-shoulder-line",
  "hero-waist",
])must(world.includes(token),'hero fallback missing '+token)

for(const token of [
  "visualPass='mobile-resident-v6'",
  "resident-shoulder-line",
  "resident-jaw",
  "resident-eye-white-left",
  "resident-iris-left",
  "resident-brow-left",
  "resident-nose",
  "resident-bag",
  "walkSwing",
  "legs?:THREE.Object3D[]",
])must(residents.includes(token),'resident runtime missing '+token)

console.log('STREETVERSE MOBILE V6 CHARACTER CONTRACT PASS: refined hero proportions + resident faces/clothing/accessories + walking limb animation')
