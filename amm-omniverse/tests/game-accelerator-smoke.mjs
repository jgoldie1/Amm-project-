import fs from 'node:fs'
const read=p=>fs.readFileSync(p,'utf8');const must=(c,m)=>{if(!c)throw new Error(`GAME ACCELERATOR SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),accel=read('src/components/GameReleaseAccelerator.tsx'),hub=read('src/components/GameVerseHub.tsx'),movie=read('src/components/MovieMakerHub.tsx'),reality=read('src/components/RealityLabDistrict01.tsx')
must(main.includes('<GameReleaseAccelerator />'),'accelerator must be mounted')
for(const token of ['GameVerse + StreetVerse','District 01 Reality Lab','Movie / Reel Studio','LIVE + PK','AR • VR • MR','Holoverse','Summer + Winter Global Games'])must(accel.includes(token),token)
for(const token of ['MovieMakerHub','GlobalGamesHub','GlobalAccessHub','StreetVerseBiographyProofHub','StreetVerseMissionDirectorHub'])must(hub.includes(token),`GameVerse ${token}`)
must(movie.includes('tryamm:movie-studio-open'),'movie studio event')
must(reality.includes('Chicago World Museum Experiences')&&reality.includes('RealityLabMultiplayerPanel'),'Reality Lab immersive + multiplayer')
console.log('✅ GameVerse accelerator contract passed')
