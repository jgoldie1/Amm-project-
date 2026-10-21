import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=(name)=>fs.readFileSync(new URL('../src/'+name,import.meta.url),'utf8')
test('canonical StreetVerse mounts cinematic mission director and Omni Box is its own route',()=>{
 const main=read('main.tsx')
 assert.match(main,/const StreetVerseCinematicMissions=lazy/)
 assert.match(main,/else if\(isStreetVerse\)routeContent=<>\{streetVerseRoute\}/)
 assert.match(main,/const OmniBoxStoryStudio=lazy/)
 assert.match(main,/else if\(isOmniBox\)routeContent=/)
})
test('mission buttons open scripted scenes instead of only beeping',()=>{
 const carousel=read('components/StreetVerseActionCarousel.tsx')
 const dock=read('components/StreetVerseCoreGameplayDock.tsx')
 const shell=read('components/StreetVerseMobileGameShell.tsx')
 const director=read('components/StreetVerseCinematicMissions.tsx')
 for(const src of [carousel,dock,shell,director])assert.match(src,/tryamm:streetverse-cinematic-mission-open/)
 assert.match(director,/StreetVerse cinematic cutscene/)
 assert.match(director,/NEXT SCENE/)
 assert.match(director,/ENTER MISSION/)
 assert.match(director,/tryamm:streetverse-mission-start/)
 assert.match(director,/tryamm:west-side-route-marker/)
 assert.match(director,/CONTINUE STORY REHEARSAL/)
 assert.match(director,/financialReward:false/)
 assert.match(read('components/StreetVerseCinematicMissions.css'),/@keyframes svCineFade/)
})
test('Omni Box creates six five-minute acts without pretending to render a movie',()=>{
 const studio=read('components/OmniBoxStoryStudio.tsx')
 const hub=read('components/HoloDramaHub.tsx')
 const beats=(studio.match(/durationSeconds:300/g)||[]).length
 assert.equal(beats,6)
 assert.match(studio,/OMNI_BOX_DRAFT_KEY/)
 assert.match(studio,/OMNI_BOX_HANDOFF_KEY/)
 assert.match(studio,/SEND OUTLINE TO HOLO DRAMA/)
 assert.match(studio,/0<\/strong><span>minutes rendered/)
 assert.match(hub,/IMPORT OMNI BOX OUTLINE/)
 assert.match(hub,/if\(!file\)/)
 assert.match(hub,/if\(mode!=='free'\)/)
})
