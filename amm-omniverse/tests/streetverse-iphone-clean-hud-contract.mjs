import fs from 'node:fs'

const playable=fs.readFileSync(new URL('../src/components/StreetVersePlayableWorld.tsx',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const overlays=fs.readFileSync(new URL('../src/components/StreetVerseFullWorldOverlays.tsx',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const reel=fs.readFileSync(new URL('../src/components/StreetVerseReelCaptureOverlay.tsx',import.meta.url),'utf8')

const mobileReturn=playable.slice(playable.indexOf('if(mobile)return'),playable.indexOf('return <><StreetVerseWeatherSync/><StreetVerseWorldBoundary',playable.indexOf('if(mobile)return')+20)+400)
if(mobileReturn.includes('StreetVerseMobileGameShell'))throw new Error('duplicate MobileGameShell still mounted on 3D mobile path')
if(mobileReturn.includes('StreetVerseMobileProofDock'))throw new Error('duplicate MobileProofDock still mounted on 3D mobile path')

for(const x of ["mobile?<StreetVerseReelEventBridge/>","const mobile=useMemo"])if(!bridge.includes(x))throw new Error('missing mobile bridge gate '+x)
for(const bad of ['<StreetVersePlayerGridMap/>','<StreetVerseRPLinguaCoach/>','<StreetVerseMobileProofDock/>'])if(overlays.match(/if\(mobile\)return[^\n]+/)?.[0]?.includes(bad))throw new Error('mobile full overlay still contains '+bad)

for(const x of ["mobileHudPass:'safe-area-separated-v3'","closer-third-person-v2","bright-circle-park-v1","controlSide==='left'","✓ LEFT HAND","✓ RIGHT HAND"])if(!world.includes(x))throw new Error('missing clean HUD feature '+x)
if(world.includes('3D MOBILE • CLEAN CONTROL'))throw new Error('redundant mobile debug badge still present')
for(const x of ["right:'max(126px","'🎥'"])if(!reel.includes(x))throw new Error('reel control still occupies movement zone')

console.log('StreetVerse iPhone clean HUD contract: PASS')
