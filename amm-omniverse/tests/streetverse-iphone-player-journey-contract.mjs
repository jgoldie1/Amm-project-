import fs from 'node:fs'

const playable=fs.readFileSync(new URL('../src/components/StreetVersePlayableWorld.tsx',import.meta.url),'utf8')
const geo=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const bible=fs.readFileSync(new URL('../src/components/EthiopianBibleMetaverse.tsx',import.meta.url),'utf8')
const reader=fs.readFileSync(new URL('../src/components/FaithScriptureReader.tsx',import.meta.url),'utf8')

const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE IPHONE PLAYER JOURNEY CONTRACT FAIL: '+msg)}

must(playable.includes("if(mobile)return")&&playable.includes('<StreetVerseMobileWorld onClose={onClose}/>'),'real mobile route must mount the compact authoritative mobile world')
must(geo.includes("{mobile?<StreetVerseReelEventBridge/>:"),'full mobile route must avoid desktop gameplay overlay stack')
must(!geo.includes("{mobile?<><StreetVerseMobileProofDock"),'legacy proof dock must not mount on full mobile gameplay')
must(world.includes('aria-label="StreetVerse analog joystick"'),'authoritative mobile world must own the single visible movement joystick')
must(world.includes('aria-label="Open StreetVerse quick menu"'),'compact mobile quick menu missing')
must(world.includes("target==='left-hand'||target==='right-hand'"),'one-hand side selection must remain available in compact menu')
must(world.includes("tryamm:streetverse-control-mode"),'one-hand control-mode event missing')
must(world.includes("oneHandCruise=false"),'mobile renderer cruise state missing')
must(world.includes("input.current.up||oneHandCruise"),'vehicle throttle must honor one-hand cruise while steering')
must(world.includes("tryamm:streetverse-cruise-state"),'vehicle exit must report cruise cancellation')

must(world.includes("tryamm:streetverse-first-journey-start"),'mobile world must listen for first-journey start')
must(world.includes("label:'REPAIR CAR'"),'first mission guide must point to repair car')
must(world.includes("label:'ENTER REPAIRED CAR'"),'mission guide must advance to vehicle entry')
must(world.includes("'DRIVE TO ROOSEVELT'")&&world.includes("'EXIT AT ROOSEVELT'"),'mission guide must require real Circle Park to Roosevelt driving before exit')
must(world.includes("'TALK TO ROOSEVELT GUIDE'")&&world.includes("'COMPLETE FIRST RIDE'"),'mission guide must advance through Roosevelt NPC interaction to completion')
must(world.includes("GUIDE CHECK-IN COMPLETE"),'NPC interaction must visibly unlock mission completion')
must(world.includes('TAP TO START / FOCUS'),'mission marker must be tappable to start/focus the mission')
must(world.includes("tryamm:streetverse-first-journey-ready-to-complete"),'guide interaction must unlock mission completion')

for(const asset of ['mobile-native-building-west-spawn','mobile-native-building-east-spawn','mobile-native-bench-west','mobile-native-trash-can','mobile-native-recycling-bin','mobile-parked-car-a'])must(world.includes(asset),'native visual-density placement missing '+asset)

must(main.includes("'/faithverse'")&&main.includes('<EthiopianBibleMetaverse />'),'FaithVerse route must render Ethiopian Bible Metaverse')
must(bible.includes('<FaithScriptureReader />'),'Bible Metaverse must mount scripture reader')
must(reader.includes('id="reader"'),'scripture reader deep-link anchor missing')
must(reader.includes('bible-api.com'),'working online KJV reader provider missing')
must(reader.includes('READ ALOUD'),'accessible scripture read-aloud missing')

console.log('STREETVERSE IPHONE PLAYER JOURNEY CONTRACT PASS: compact mobile world → mission → repair → drive → NPC → reward/Reel/Faith without duplicate shell overlays')
