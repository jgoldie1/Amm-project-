import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const b=fs.readFileSync(new URL('../src/components/CircleParkBasketballGame.tsx',import.meta.url),'utf8')
const r=fs.readFileSync(new URL('../src/data/circleParkBasketballGame.ts',import.meta.url),'utf8')
for(const x of ['CircleParkBasketballGame','basketballOpen','tryamm:circle-park-basketball-play',"basketballMove==='dunk'","basketballMove==='layup'","basketballMove==='three'"])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['DUNK','AND-1 FREE THROW','1v1','2v2','3v3'])if(!b.includes(x))throw new Error('missing '+x)
for(const x of ['andOne','bonusFreeThrows:1','winScore:21'])if(!r.includes(x))throw new Error('missing '+x)
console.log('Circle Park dunk and and-one contract: PASS')
