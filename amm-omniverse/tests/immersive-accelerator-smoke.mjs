import fs from 'node:fs'
const read=p=>fs.readFileSync(p,'utf8');const must=(c,m)=>{if(!c)throw new Error(`IMMERSIVE ACCELERATOR SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),accel=read('src/components/ImmersiveLibraryAccelerator.tsx'),archive=read('src/game/archive/ArchiveToCreatorLegacyEngine.ts'),reality=read('src/components/RealityLabDistrict01.tsx'),multiPanel=read('src/components/RealityLabMultiplayerPanel.tsx'),multiSvc=read('src/services/realityLabMultiplayer.ts'),release=read('src/immersive/ImmersiveReleaseConvergence.ts')
must(main.includes('<ImmersiveLibraryAccelerator />'),'immersive accelerator must be mounted')
for(const token of ['Reactive Holographic Hall','Black History & Chicago Legacy Wing','Virtual Zoo & Aquarium','CREATE MOVIE / REEL','SEND TO MISSION DIRECTOR','SEND TO MIDDLEVERSE'])must(accel.includes(token),token)
for(const token of ['ARCHIVE_MISSION_PIPELINE','ARCHIVE_TO_CREATOR_SEEDS','CREATOR_COOPERATIVE_SYSTEMS','NEXT_GENERATION_LOOP'])must(archive.includes(token),`archive engine ${token}`)
must(reality.includes('14 EXPERIENCES')&&reality.includes('Chicago World Museum Experiences'),'recovered Chicago World Museum wing')
for(const token of ['reality_lab_progress','checkpoint_revision','oneHanded','reducedMotion','highContrast','PANIC / SAFE STATE','navigator.getGamepads','RealityLabMultiplayerPanel'])must(reality.includes(token),`District 01 ${token}`)
for(const token of ['AUTHORITATIVE MULTIPLAYER','Create shared session','Join session','revision'])must(multiPanel.includes(token),`multiplayer panel ${token}`)
for(const token of ['reality_lab_create_instance','reality_lab_join_instance','reality_lab_submit_puzzle_action','postgres_changes','reality_lab_puzzle_state'])must(multiSvc.includes(token),`multiplayer service ${token}`)
for(const token of ['RECOVERED IMMERSIVE BRANCH','REALITY LAB / DISTRICT 01','PLAYER STATE','REALTIME MULTIPLAYER','SAVE / REJOIN','CONTROLLERS','ACCESSIBILITY / PANIC','MOBILE PERFORMANCE','COMMERCE GATE','REGRESSION','GREEN','RELEASE'])must(release.includes(token),`release chain ${token}`)
for(const token of ['Authenticated Supabase state is authoritative','revision_conflict','Accessibility is never a paid entitlement','Heavy immersive effects degrade before controls','client-side cash minting','production Supabase migrations'])must(release.includes(token),`release truth ${token}`)
must(accel.includes('must not convert an unverified memory into a public fact'),'evidence truth guardrail')
console.log('✅ Immersive Library + District 01 release convergence contracts passed')
