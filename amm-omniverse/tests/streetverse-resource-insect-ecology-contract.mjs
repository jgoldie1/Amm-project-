import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const e=fs.readFileSync(new URL('../src/runtime/StreetVerseInsectEcologyRuntime.ts',import.meta.url),'utf8')
const r=fs.readFileSync(new URL('../src/runtime/StreetVerseResourcePassportRuntime.ts',import.meta.url),'utf8')
for(const x of ['createStreetVerseInsectEcology','insectEcology.tick(now)','StreetVerseResourcePassport','🎒 RESOURCES','resourcePassportRuntime.dispose()','insectEcologySpecies:6'])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['bee','butterfly','ladybug','dragonfly','firefly','beetle','tryamm:insect-ecology-discovered'])if(!e.includes(x))throw new Error('missing '+x)
for(const x of ['tryamm.resource-passport.v1','circle-park-activity-progress','barbecue','tryamm:resource-passport-updated'])if(!r.includes(x))throw new Error('missing '+x)
console.log('StreetVerse resources and insect ecology contract: PASS')
