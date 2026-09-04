import fs from 'node:fs'

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
const qa=read('../src/runtime/StreetVerseJourneyQARuntime.ts')
const reel=read('../src/components/StreetVerseReelRecorder.tsx')
const bridge=read('../src/components/StreetVerseGeoSpawnBridge.tsx')
const safe=read('../src/components/StreetVerseMobilePlayableWorld.tsx')
const reward=read('../src/runtime/StreetVerseMobileMissionRewardRuntime.ts')
const npc=read('../public/streetverse-npc-conversation.js')

const orderedSteps=['spawn','walk','talk','enter-car','drive','reach-mission','complete-mission','verify-reward','open-reel','record','preview','save-share','exit']
let cursor=-1
for(const step of orderedSteps){
  const next=qa.indexOf(`id:'${step}'`,cursor+1)
  if(next<0)throw new Error(`StreetVerse journey QA missing ordered step: ${step}`)
  if(next<cursor)throw new Error(`StreetVerse journey QA step is out of order: ${step}`)
  cursor=next
}
const qaEvents=[
 'tryamm:streetverse-world-ready',
 'tryamm:streetverse-player-position',
 'tryamm:streetverse-npc-conversation-open',
 'tryamm:streetverse-vehicle-controlled',
 'tryamm:streetverse-drive-telemetry',
 'tryamm:streetverse-checkpoint',
 'tryamm:streetverse-mission-complete',
 'tryamm:streetverse-mobile-reward-recorded',
 'tryamm:streetverse-reel-opened',
 'tryamm:streetverse-reel-recorded',
 'tryamm:streetverse-reel-preview-ready',
 'tryamm:streetverse-reel-save-share-complete',
 'tryamm:streetverse-exit',
]
for(const event of qaEvents)if(!qa.includes(event))throw new Error(`StreetVerse journey QA is not observing: ${event}`)
if(!qa.includes("index!==nextIndex")||!qa.includes('outOfOrder'))throw new Error('StreetVerse journey QA must enforce the requested sequence instead of accepting unordered events')
if(!qa.includes('tryamm:streetverse-journey-qa-complete'))throw new Error('StreetVerse journey QA must publish a completion receipt')

for(const event of ['tryamm:streetverse-reel-opened','tryamm:streetverse-reel-recording-started','tryamm:streetverse-reel-recorded','tryamm:streetverse-reel-preview-ready','tryamm:streetverse-reel-save-share-complete']){
  if(!reel.includes(event))throw new Error(`Reel QA lifecycle missing: ${event}`)
}
if(!reel.includes("action:'share'")||!reel.includes("action:'download'"))throw new Error('Reel save/share QA must distinguish native share from local download')
if(!bridge.includes('installStreetVerseJourneyQARuntime')||!bridge.includes('tryamm:streetverse-exit'))throw new Error('StreetVerse bridge must install journey QA and emit verified exit')
if(!bridge.includes("tryamm:streetverse-world-ready")||!bridge.includes("mode:'mobile-safe'")||!bridge.includes('htmlCity:true'))throw new Error('StreetVerse safe-mode boot must emit real spawn readiness after the QA observer is installed')
if(!reward.includes('tryamm:streetverse-mobile-reward-recorded'))throw new Error('StreetVerse reward ledger must expose verified reward evidence')
if(!npc.includes('tryamm:streetverse-npc-conversation-open'))throw new Error('StreetVerse NPC interaction must expose conversation evidence')
for(const event of ['tryamm:streetverse-player-position','tryamm:streetverse-vehicle-controlled','tryamm:streetverse-checkpoint','tryamm:streetverse-mission-complete','tryamm:open-reel-creator']){
  if(!safe.includes(event))throw new Error(`StreetVerse safe city journey evidence missing: ${event}`)
}
console.log('StreetVerse journey QA contract: PASS (spawn → walk → talk → enter car → drive → mission → reward → Reel → preview → save/share → exit)')
