import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const r=fs.readFileSync(new URL('../src/runtime/StreetVerseRodentRuntime.ts',import.meta.url),'utf8')
const i=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoIdentityInteractionRuntime.ts',import.meta.url),'utf8')
for(const x of ['createStreetVerseRodentRuntime','rodentEcology.tick(now)','rodentEcology.dispose()','urbanRodentSpecies:2'])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ["'rat'","'mouse'",'tryamm:urban-rodent-discovered','tryamm:streetverse-sanitation-mission-open'])if(!r.includes(x))throw new Error('missing '+x)
for(const x of ['circle-park-rodent-check','RODENT CHECK'])if(!i.includes(x))throw new Error('missing '+x)
console.log('StreetVerse rat mouse sanitation contract: PASS')
