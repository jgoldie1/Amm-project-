import fs from 'node:fs'
const read=p=>fs.readFileSync(p,'utf8');const must=(c,m)=>{if(!c)throw new Error(`IMMERSIVE ACCELERATOR SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),accel=read('src/components/ImmersiveLibraryAccelerator.tsx'),archive=read('src/game/archive/ArchiveToCreatorLegacyEngine.ts'),reality=read('src/components/RealityLabDistrict01.tsx')
must(main.includes('<ImmersiveLibraryAccelerator />'),'immersive accelerator must be mounted')
for(const token of ['Reactive Holographic Hall','Black History & Chicago Legacy Wing','Virtual Zoo & Aquarium','CREATE MOVIE / REEL','SEND TO MISSION DIRECTOR','SEND TO MIDDLEVERSE'])must(accel.includes(token),token)
for(const token of ['ARCHIVE_MISSION_PIPELINE','ARCHIVE_TO_CREATOR_SEEDS','CREATOR_COOPERATIVE_SYSTEMS','NEXT_GENERATION_LOOP'])must(archive.includes(token),`archive engine ${token}`)
must(reality.includes('14 EXPERIENCES')&&reality.includes('Chicago World Museum Experiences'),'recovered Chicago World Museum wing')
must(accel.includes('must not convert an unverified memory into a public fact'),'evidence truth guardrail')
console.log('✅ Immersive Library accelerator contract passed')
