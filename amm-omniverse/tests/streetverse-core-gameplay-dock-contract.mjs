import fs from 'node:fs'
const geo=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const dock=fs.readFileSync(new URL('../src/components/StreetVerseCoreGameplayDock.tsx',import.meta.url),'utf8')
const overlays=fs.readFileSync(new URL('../src/components/StreetVerseFullWorldOverlays.tsx',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE CORE GAMEPLAY DOCK CONTRACT FAIL: '+msg)}
for(const token of ['StreetVerseCoreGameplayDock','StreetVerseMissionWorldBridge','StreetVerseTouchDriveControls','HoloMobilityLauncher','StreetVerseFaithChronoPortal','StreetVerseReelEventBridge','StreetVerseActionCarousel'])must(geo.includes(token),'core route missing '+token)
for(const label of ['MISSION','REPAIR','RIDE','REEL','FAITH','EXIT'])must(dock.includes(label),'dock missing '+label)
must(dock.includes("tryamm:streetverse-first-journey-start"),'mission quick-start event missing')
must(dock.includes("tryamm:holo-mobility-open"),'rideshare launcher event missing')
must(dock.includes("tryamm:open-reel-creator"),'reel launcher event missing')
must(dock.includes("window.location.href='/faithverse'"),'FaithVerse route missing')
must(dock.includes("tryamm:streetverse-vehicle-input")&&dock.includes('exit:true'),'one-hand vehicle exit missing')
must(!overlays.includes('<StreetVerseTouchDriveControls/>'),'delayed overlay must not duplicate touch drive controls')
console.log('STREETVERSE CORE GAMEPLAY DOCK CONTRACT PASS: mission repair ride reel faith and exit are always mounted')