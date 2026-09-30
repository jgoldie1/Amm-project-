import fs from 'node:fs'

const consequence=fs.readFileSync(new URL('../src/runtime/StreetVerseWorldConsequenceRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/game/simulation/gameplaySimulationBridge.ts',import.meta.url),'utf8')

for(const x of [
 'tryamm:streetverse-weather-visual',
 'tryamm:character-body-state-change-request',
 'tryamm:streetverse-business-disruption',
 'tryamm:streetverse-environment-sense',
 'tryamm:world-consequence-mission-offer',
 'tryamm:world-consequence-mission-complete',
 "action:'public-safety-mission'",
 'tryamm:world-consequence-reward',
])if(!consequence.includes(x))throw new Error('World consequence chain missing '+x)

for(const x of [
 'STORM RESPONSE',
 'FLOOD CHECK',
 'SNOW RESPONSE',
 'LOW VISIBILITY',
 'deliveryDelayMultiplier',
 'customerTrafficMultiplier',
 'hapticIntensity',
 'serverValidate:true',
])if(!consequence.includes(x))throw new Error('World consequence effect missing '+x)

for(const x of [
 'installStreetVerseWorldConsequenceRuntime',
 'world-consequence-beacon',
 'onWorldConsequenceOffer',
 'onWorldMissionStart',
 'WORLD TARGET REACHED',
 'earnCash(cash)',
 'earnXp(xp)',
 'tryamm:reel-moment',
 'environmentSenseFeedback:true',
 'weatherToMissionConsequences:true',
 'dynamicWorldEventMission:true',
])if(!world.includes(x))throw new Error('Mobile consequence integration missing '+x)

if(!world.includes('if(!firstJourneyActive)setMissionGuide'))throw new Error('First Journey priority protection missing')
if(!bridge.includes("'public-safety-mission'"))throw new Error('Public safety consequence action missing')

console.log('StreetVerse World Consequence Engine contract: PASS')
