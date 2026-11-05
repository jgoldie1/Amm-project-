import fs from 'node:fs'
const geo=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const dock=fs.readFileSync(new URL('../src/components/StreetVerseCoreGameplayDock.tsx',import.meta.url),'utf8')
const overlays=fs.readFileSync(new URL('../src/components/StreetVerseFullWorldOverlays.tsx',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE CORE GAMEPLAY DOCK CONTRACT FAIL: '+msg)}
for(const token of ['StreetVerseCoreGameplayDock','StreetVerseMissionWorldBridge','StreetVerseTouchDriveControls','HoloMobilityLauncher','StreetVerseFaithChronoPortal','StreetVerseReelEventBridge','StreetVerseActionCarousel'])must(geo.includes(token),'core route missing '+token)
for(const label of ['MISSION','REPAIR','RIDE','REEL','FAITH','EXIT'])must(dock.includes(label),'dock missing '+label)
must((geo.match(/aria-label="Travel to Taylor Street UIC Medical District"/g)||[]).length>=2,'Taylor UIC travel must be available in both safe-mode and full 3D branches')
must(geo.includes('streetverse-safe-travel-shortcut')&&geo.includes('streetverse-main-travel-shortcut'),'Safe and 3D travel routes must both dispatch mission requests')
must(dock.includes("tryamm:streetverse-first-journey-start"),'mission quick-start event missing')
must(dock.includes("tryamm:holo-mobility-open"),'rideshare launcher event missing')
must(dock.includes("tryamm:open-reel-creator"),'reel launcher event missing')
must(dock.includes("window.location.href='/faithverse'"),'FaithVerse route missing')
must(dock.includes("tryamm:streetverse-vehicle-input")&&dock.includes('exit:true'),'one-hand vehicle exit missing')
must(!overlays.includes('<StreetVerseTouchDriveControls/>'),'delayed overlay must not duplicate touch drive controls')
for(const [signal,purpose] of [
 ['tryamm:streetverse-first-journey-start','mission activation'],
 ['tryamm:streetverse-vehicle-repaired','repair completion'],
 ['tryamm:streetverse-vehicle-interact','vehicle entry and exit'],
 ['tryamm:streetverse-npc-dialogue','NPC conversation'],
 ['tryamm:streetverse-first-journey-ready-to-complete','completion eligibility'],
 ['tryamm:streetverse-first-journey-complete','mission completion'],
 ['tryamm:streetverse-mission-complete','reward ledger bridge'],
 ['tryamm:open-reel-creator','completed journey Reel']
]) must(mobile.includes(signal),'mobile First Ride missing '+purpose)
must(mobile.includes('START FIRST RIDE')&&mobile.includes('completeMountedFirstJourney'),'visible First Ride start and finish actions missing')
must(mobile.includes('firstJourneyReadyRef.current'),'completion requires actual world state')
must(mobile.includes('firstJourneyStarted'),'mission focus should not silently restart the journey')
must(geo.includes('hasUsableWebGL()')&&geo.includes('setNearWestOpen(true)'),'Taylor travel must recover to real 3D when available')

console.log('STREETVERSE CORE GAMEPLAY DOCK CONTRACT PASS: mission repair drive NPC talk reward Reel and Taylor travel are wired')