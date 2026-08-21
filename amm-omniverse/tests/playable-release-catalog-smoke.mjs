import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(c,m)=>{if(!c)throw new Error(`PLAYABLE CATALOG SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),hub=read('src/components/TierOnePlayableHub.tsx'),catalog=read('src/game/release/PlayableReleaseCatalog.ts')
must(main.includes('<TierOnePlayableHub />'),'tier-one playable hub mounted')
for(const token of ['StreetVerse','Court Kings','Volcano: Last Route','Battle Deck: Holo Champions']){must(hub.includes(token),`${token} UI`);must(catalog.includes(token),`${token} catalog`)}
for(const token of ['The Block Remembers','Shootaround','The Rumble','Deck Academy'])must(catalog.includes(token),`level ${token}`)
must(catalog.includes("status:'PLAYABLE_SLICE'"),'playable slice status')
must(catalog.includes('A world counts upward only when its playable slice has input'),'progress truth rule')
for(const token of ['score','progress','REPLAY SLICE','Release gates'])must(hub.includes(token),`runtime ${token}`)
console.log('✅ playable release catalog smoke contracts passed')
