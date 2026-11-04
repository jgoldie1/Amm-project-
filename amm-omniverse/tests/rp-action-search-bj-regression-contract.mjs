import fs from 'node:fs'
const catalog=fs.readFileSync(new URL('../src/data/streetVerseRPActionCatalog.ts',import.meta.url),'utf8')
const search=fs.readFileSync(new URL('../src/components/StreetVerseRPActionSearch.tsx',import.meta.url),'utf8')
const carousel=fs.readFileSync(new URL('../src/components/StreetVerseActionCarousel.tsx',import.meta.url),'utf8')
const hero=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const boneGestures=fs.readFileSync(new URL('../src/runtime/StreetVerseBJRPProceduralAnimator.ts',import.meta.url),'utf8')
const extra50=fs.readFileSync(new URL('../src/data/streetVerseRPExtra50.ts',import.meta.url),'utf8')
const geo=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const route=fs.readFileSync(new URL('../src/components/KingdomDistrictRoute.tsx',import.meta.url),'utf8')
const people=fs.readFileSync(new URL('../public/streetverse-kingdom/02-physics-traffic.js',import.meta.url),'utf8')
const spawn=fs.readFileSync(new URL('../public/streetverse-kingdom/03-spawn-phone.js',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../public/streetverse-kingdom/tryamm-bridge.js',import.meta.url),'utf8')

for(const x of ['searchByPurpose:true','gifPreviewQuery:true','addToWheel:true','synchronizedActions:true','externalGifProvider:\'provider-gated\''])if(!catalog.includes(x))throw new Error('RP catalog missing '+x)
for(const x of ['RP SEARCH • ANIMATION / GIF / PURPOSE','GIF PREVIEW','PLAY','LOOP','FAVORITE','+ WHEEL','TOGETHER','LIVE','REEL'])if(!search.includes(x))throw new Error('RP search UI missing '+x)
if(!carousel.includes('StreetVerseRPActionSearch'))throw new Error('HOLO ACTIONS missing RP search')
if(!geo.includes('<StreetVerseActionCarousel/>'))throw new Error('StreetVerse route no longer exposes HOLO ACTIONS')
if(!route.includes('StreetVerseRPActionSearch')||!route.includes('tryamm:streetverse-rp-action-play'))throw new Error('Kingdom route RP bridge missing')
for(const x of ['makeBJStubbsFallback','attachBJProductionHuman','ONLY YAHAVAH','SV_BJ_STUBBS_V6.glb','setPersonRpAction'])if(!people.includes(x))throw new Error('BJ/RP Kingdom character system missing '+x)
if(spawn.includes('attachProductionHuman(player,2)'))throw new Error('BJ reverted to generic NPC slot')
if(!spawn.includes('makeBJStubbsFallback')||!spawn.includes('attachBJProductionHuman'))throw new Error('BJ dedicated spawn missing')
if(!bridge.includes("channel!=='tryamm:kingdom-control'")||!bridge.includes("type==='RP_ACTION'"))throw new Error('Kingdom RP action message bridge missing')

// Guard the actual 3D playback bridge, not only a carousel button that fires an event.
for(const actionId of ['wave-friendly','handshake','hug','laugh','argue','sit-relaxed','street-dance','two-step','victory','pray-standing','mechanic-work','security-scan','police-radio','medical-assist','basketball-dribble','creator-pose','mic-performance']){
  if(!boneGestures.includes(`'${actionId}':`)&&!boneGestures.includes(`${actionId}:`))throw new Error('BJ procedural catalogue action missing '+actionId)
}
for(const token of ['createStreetVerseBJRPProceduralAnimator','const playRPAction:',"mode:'clip'",'proceduralRP.tick(nowMs)'])if(!hero.includes(token))throw new Error('3D BJ GLB/procedural playback bridge missing '+token)
for(const token of ["addEventListener('tryamm:streetverse-rp-action-play',onRPActionPlay)","removeEventListener('tryamm:streetverse-rp-action-play',onRPActionPlay)",'nativeRPAnimator?.tick(now)',"tryamm:streetverse-rp-action-result"])if(!mobile.includes(token))throw new Error('mobile 3D RP playback missing '+token)
for(const token of ["BJ RP playback result","tryamm:streetverse-rp-action-result","BJ ACTION UNAVAILABLE"])if(!search.includes(token))throw new Error('user playback proof missing '+token)
const newIds=extra50.split('\n').filter(line=>line.trim().startsWith('{id:"')).map(line=>line.split('"')[1])
if(newIds.length!==50||new Set(newIds).size!==50)throw new Error('Expected exactly 50 distinct new gesture recipes')
if(!catalog.includes('...STREETVERSE_RP_EXTRA50'))throw new Error('New 50 RP actions are not mounted in the carousel catalog')
if(!boneGestures.includes('STREETVERSE_RP_EXTRA_POSE_MAP'))throw new Error('New 50 gesture recipes are not connected to real BJ bones')
for(const token of ['Next RP gesture page','Previous RP gesture page','RP ACTIONS • PAGE','allResults.slice('])if(!search.includes(token))throw new Error('RP search cannot page through 67 gestures: '+token)
if(boneGestures.includes("'shadow-box':")||newIds.some(id=>id.includes('shadow-box')))throw new Error('boxing-only Shadow Box cannot be an open-world gesture')

console.log('RP animation search + BJ identity regression contract: PASS')
