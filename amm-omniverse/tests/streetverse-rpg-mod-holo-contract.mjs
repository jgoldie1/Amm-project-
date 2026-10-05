import fs from 'node:fs'

const rpg=fs.readFileSync(new URL('../src/runtime/StreetVerseRpgCoreRuntime.ts',import.meta.url),'utf8')
const mod=fs.readFileSync(new URL('../src/runtime/TryammModPassRuntime.ts',import.meta.url),'utf8')
const starter=fs.readFileSync(new URL('../src/data/TryammStarterMods.ts',import.meta.url),'utf8')
const future=fs.readFileSync(new URL('../src/runtime/StreetVerseNeonFutureLayerRuntime.ts',import.meta.url),'utf8')
const gallery=fs.readFileSync(new URL('../src/components/HolographicGalleryCenter.tsx',import.meta.url),'utf8')
const viewport=fs.readFileSync(new URL('../src/components/HolographicGalleryViewport.tsx',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))

const must=(ok,msg)=>{if(!ok)throw new Error('RPG MOD FUTURE HOLO CONTRACT FAIL: '+msg)}

for(const token of [
  "'street'","'business'","'creator'","'tech'","'driving'","'rescue'","'leadership'","'investigation'",
  "'community'","'business'","'creators'","'public-service'","'underground'","'academy'",
  'relationships','inventory','completedQuestIds','activeQuestIds','choices','heat','influence',
  'tryamm:rpg-state','tryamm:rpg-core-ready','tryamm:streetverse-mission-complete','tryamm:npc-conversation',
]) must(rpg.includes(token),'RPG core missing '+token)

for(const token of [
  "schema:'tryamm.modpass.v1'",
  'declarative-no-executable-code',
  'executable-asset-denied',
  'tryamm-native',
  'webxr-ar',
  'tryamm:crossverse-mod-exported',
  'tryamm:ar-mod-overlay',
  'officialAdapterOnlyForExternalGames:true',
]) must(mod.includes(token),'Mod Pass missing '+token)

must(starter.includes("TRYAMM_WEST_SIDE_CC0_STARTER_MOD"),'starter mod missing')
must(starter.includes("CC0-1.0"),'starter mod must preserve CC0 license')
must(starter.includes("/free-assets/kenney/vehicles/police.glb"),'starter mod police asset missing')
must(main.includes("TryammModPassRuntime"),'Mod Pass not installed in app boot')

for(const token of [
  'streetverse-neon-future-layer',
  'tryamm:neon-future-set',
  'tryamm:chrono-run-started',
  'tryamm:time-machine-world-foundry-plan',
  'tryamm:time-machine-return-present',
  'fictional:true',
]) must(future.includes(token),'Neon Future missing '+token)

must(mobile.includes('installStreetVerseRpgCore'),'RPG core not mounted in StreetVerse')
must(mobile.includes('createStreetVerseNeonFutureLayer'),'Neon Future not mounted in StreetVerse')
must(mobile.includes("['future',futureMode?'✓ NEON FUTURE':'🌃 NEON FUTURE']"),'Neon Future quick toggle missing')
must(mobile.includes("['mods','🧩 MOD PASS']"),'Mod Pass quick-menu entry missing')
must(mobile.includes('rpgCoreActive:true'),'world-ready RPG evidence missing')
must(mobile.includes('neonFutureTimeline:true'),'world-ready future evidence missing')
must(mobile.includes('modPassActive:true'),'world-ready Mod Pass evidence missing')

must(gallery.includes('HolographicGalleryViewport'),'Gallery does not use real 3D viewport')
must(gallery.includes('/free-assets/kenney/vehicles/police.glb'),'Gallery CC0 model exhibit missing')
must(gallery.includes('AR / HOLO'),'Gallery AR/Holo action missing')
for(const token of ['GLTFLoader','OrbitControls','renderer.render','tryamm:holographic-gallery-model-ready']) must(viewport.includes(token),'3D gallery viewport missing '+token)

must(String(pkg.scripts?.build||'').includes('streetverse-rpg-mod-holo-contract.mjs'),'production build missing RPG/Mod/Holo contract')

console.log('STREETVERSE RPG + MOD PASS + NEON FUTURE + HOLOGRAPHIC GALLERY CONTRACT PASS')
