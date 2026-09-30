import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const d=fs.readFileSync(new URL('../src/data/circleParkBasketballGame.ts',import.meta.url),'utf8')
const c=fs.readFileSync(new URL('../src/components/CircleParkBasketballGame.tsx',import.meta.url),'utf8')
for(const x of ["basketballDunkStyle==='windmill'","basketballDunkStyle==='360'","basketballDunkStyle==='self-alley-oop'","basketballDunkStyle==='off-backboard-alley-oop'","basketballDunkStyle==='reverse-windmill'"])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['Two-Hand Power','One-Hand Tomahawk','Windmill','Reverse','360','Double-Clutch','Self Alley-Oop','Teammate Alley-Oop','Off-Backboard Alley-Oop','Reverse Windmill'])if(!d.includes(x))throw new Error('missing '+x)
for(const x of ['DUNK STYLE','dunkStyle','highlight'])if(!c.includes(x))throw new Error('missing '+x)
console.log('Circle Park multi-dunk package contract: PASS')
