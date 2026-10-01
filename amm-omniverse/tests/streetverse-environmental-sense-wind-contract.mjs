import fs from 'node:fs'

const consequence=fs.readFileSync(new URL('../src/runtime/StreetVerseWorldConsequenceRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

for(const x of [
 'windDirection',
 'windIntensity',
 'gustIntensity',
 'tryamm:streetverse-environment-sense',
])if(!consequence.includes(x))throw new Error('Environmental wind event missing '+x)

for(const x of [
 'animateEnvironmentalWind',
 'streetTreeCrowns.setMatrixAt',
 "child.name==='hero-loc'",
 'nativeWindLocs',
 'circle-park-grill-smoke',
 'streetverse-wind-debris',
 'navigator.vibrate',
 'windReactiveTrees:true',
 'windReactiveLocs:true',
 'windReactiveSmoke:true',
 'windReactiveDebris:true',
])if(!world.includes(x))throw new Error('Visible/tactile wind response missing '+x)

console.log('StreetVerse Environmental Sense wind contract: PASS')
