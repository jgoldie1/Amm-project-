import fs from 'node:fs'
const g=fs.readFileSync(new URL('../src/components/GameVerseHub.tsx',import.meta.url),'utf8')
const h=fs.readFileSync(new URL('../src/components/SportVerseWorldGamesHub.tsx',import.meta.url),'utf8')
const d=fs.readFileSync(new URL('../src/data/sportVerseWorldGames.ts',import.meta.url),'utf8')
for(const x of ['SportVerseWorldGamesHub','WORLD GAMES','living-sports','worldGamesOpen'])if(!g.includes(x))throw new Error('missing '+x)
for(const x of ['REUSE READY','SHARED ENGINE','ENTER / REUSE FOUNDATION','tryamm:pool-open'])if(!h.includes(x))throw new Error('missing '+x)
for(const x of ['legacyFoundation:\'Olympic Kingdom\'','court-kings','gridiron-x','world-pitch','streetverse-pool','living-racing','clip-capture'])if(!d.includes(x))throw new Error('missing '+x)
console.log('SportVerse World Games reuse contract: PASS')
