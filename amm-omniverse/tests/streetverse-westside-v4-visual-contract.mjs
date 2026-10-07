import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts',import.meta.url),'utf8')
const nearWest=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('WEST SIDE V4 VISUAL CONTRACT FAIL: '+msg)}

for(const token of [
  "visualUpgradeVersion:'west-side-forger-v4'",
  "architecturePass:'west-side-v4'",
  "fire-escape-platform",
  "entry-awning",
  "roof-parapet",
  "populationPass:'west-side-v4'",
  "humanDetail:'hands-shoes-accessories'",
  "resident-shoe",
])must(world.includes(token),'visible world missing '+token)

for(const token of [
  "visualPass:'near-west-native-density-v4'",
  'taylor-street-architectural-pass-v4',
  'taylor-fire-escape-v4',
  'circle-park-home-v4-',
  'near-west-moving-residents-v4',
  'moving-resident-v4-',
])must(nearWest.includes(token),'Near West scene missing '+token)

console.log('WEST SIDE V4 VISUAL CONTRACT PASS: facade depth + fire escapes + awnings + roof detail + richer residents + Taylor/Circle Park architectural pass')
