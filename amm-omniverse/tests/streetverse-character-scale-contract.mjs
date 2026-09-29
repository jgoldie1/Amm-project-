import fs from 'node:fs'

const human=fs.readFileSync(new URL('../src/runtime/StreetVerseHumanScale.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const residents=fs.readFileSync(new URL('../src/runtime/StreetVerseMobileLivingCityRuntime.ts',import.meta.url),'utf8')
const living=fs.readFileSync(new URL('../src/components/StreetVerseLivingWorld.tsx',import.meta.url),'utf8')
const loader=fs.readFileSync(new URL('../src/services/streetverseAssetLoader.ts',import.meta.url),'utf8')
const shared=fs.readFileSync(new URL('../src/components/StreetVerseSharedWorldAvatars.tsx',import.meta.url),'utf8')
const remote=fs.readFileSync(new URL('../src/components/StreetVerseNativeRemotePlayers.tsx',import.meta.url),'utf8')

for(const x of ['adultHero:1.82','adultResident:1.76','normalizeStreetVerseHumanHeight','residentHeight'])if(!human.includes(x))throw new Error('human scale contract missing: '+x)
for(const x of ['normalizeStreetVerseHumanHeight(avatar,STREETVERSE_HUMAN_HEIGHT_METERS.adultHero)','activeCar?11:6.6','activeCar?18:10.5'])if(!mobile.includes(x))throw new Error('mobile character framing missing: '+x)
if(!residents.includes('normalizeStreetVerseHumanHeight(group,residentHeight(index))'))throw new Error('mobile residents must use normalized human heights')
for(const x of ['targetHeightMeters:STREETVERSE_HUMAN_HEIGHT_METERS.adultHero','targetHeightMeters:residentHeight(i)','desiredCam.set(controlled.position.x,6.8,controlled.position.z+10.8)'])if(!living.includes(x))throw new Error('desktop scale/framing missing: '+x)
for(const x of ['targetHeightMeters?:number','normalizeStreetVerseHumanHeight(model,options.targetHeightMeters)'])if(!loader.includes(x))throw new Error('loaded GLB target height normalization missing: '+x)
if(!shared.includes("clamp(1.3-p.distance/150,.68,1.22)"))throw new Error('shared avatar minimum visual scale must stay readable')
if(!shared.includes('width:46,height:84'))throw new Error('shared avatar base visual size must stay readable')
if(!remote.includes('normalizeStreetVerseHumanHeight(g,STREETVERSE_HUMAN_HEIGHT_METERS.adultResident)'))throw new Error('native remote player height normalization missing')

console.log('StreetVerse human height + camera readability contract: PASS')
