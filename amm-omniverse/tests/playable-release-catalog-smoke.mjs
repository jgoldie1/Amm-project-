import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(c,m)=>{if(!c)throw new Error(`PLAYABLE CATALOG SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),hub=read('src/components/TierOnePlayableHub.tsx'),catalog=read('src/game/release/PlayableReleaseCatalog.ts')
must(main.includes('<TierOnePlayableHub />'),'tier-one playable hub mounted')
for(const token of ['StreetVerse','Court Kings','Volcano: Last Route','Battle Deck: Holo Champions','Living Sports Framework','Living Racing'])must(catalog.includes(token),`${token} catalog`)
for(const token of ['StreetVerse + Court Kings + Volcano + Battle Deck + Living Sports + Living Racing','TIER‑1 PLAY','TIER_ONE_RELEASE_GAMES'])must(hub.includes(token),`dynamic catalog UI ${token}`)
for(const token of ['The Block Remembers','Shootaround','The Rumble','Deck Academy','Athlete Combine','Driver Academy','Sponsor Challenge','Championship Podium'])must(catalog.includes(token),`level ${token}`)
for(const token of ['sports-framework','living-racing','server-authoritative result','anti-cheat','sponsor/prize rules'])must(catalog.includes(token),`release contract ${token}`)
must(catalog.includes("status:'PLAYABLE_SLICE'"),'playable slice status')
must(catalog.includes('A world counts upward only when its playable slice has input'),'progress truth rule')
for(const token of ['score','progress','REPLAY SLICE','Release gates','Complete sponsor objective','Finalize podium'])must(hub.includes(token),`runtime ${token}`)
console.log('✅ playable release catalog smoke contracts passed')
