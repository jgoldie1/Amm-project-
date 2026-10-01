import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const r=fs.readFileSync(new URL('../src/runtime/StreetVerseUnderwaterPoolRuntime.ts',import.meta.url),'utf8')
const u=fs.readFileSync(new URL('../src/components/StreetVersePoolGame.tsx',import.meta.url),'utf8')
for(const x of ['createStreetVerseUnderwaterPoolRuntime','streetverse-ground','underwaterPool.isActive()','underwaterPool.tick(now)','underwaterPool.dispose()','underwaterImmersiveSwimming:true'])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['FogExp2','streetverse-underwater-pool-runtime','bubbles','freestyle','breaststroke','backstroke','dolphin','pool-swim-command'])if(!r.includes(x))throw new Error('missing '+x)
for(const x of ['ENTER WATER • IMMERSIVE SWIM','UNDERWATER •','STROKE STYLE','DIVE','ASCEND','CLIMB OUT'])if(!u.includes(x))throw new Error('missing '+x)
console.log('StreetVerse immersive underwater swim contract: PASS')
