import fs from 'node:fs'
const d=fs.readFileSync(new URL('../src/data/circleParkBasketballGame.ts',import.meta.url),'utf8')
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
for(const x of ["ft-one-hand-1985","ft-double-clutch-1988","homageOnly:true","noEndorsement:true"])if(!d.includes(x))throw new Error('missing '+x)
for(const x of ["basketballDunkStyle==='ft-one-hand-1985'","basketballDunkStyle==='ft-double-clutch-1988'"])if(!w.includes(x))throw new Error('missing '+x)
console.log('Free-throw-line dunk homage contract: PASS')
