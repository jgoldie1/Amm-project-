import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const main=read('src/main.tsx')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const sound=read('src/runtime/StreetVerseSoundBankRuntime.ts')
const cafe=read('src/runtime/StreetVerseAICafeBridgeRuntime.ts')
const hologpt=read('src/components/HoloGPTAssistant.tsx')
const oracleSearch=read('api/oracle/search.js')
const aiAnswer=read('api/ai/answer.js')

const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE CONVERGENCE CONTRACT FAIL: '+msg)}

must(main.includes("AICafeMultiAgentRuntime")&&main.includes("installAICafeMultiAgentRuntime"),'AI Cafe must mount on /streetverse')
must(main.includes("DynamicDispatchRuntime")&&main.includes("installDynamicDispatchRuntime"),'dynamic dispatch must mount on /streetverse')
must(main.includes("StreetVerseWorldMemory")&&main.includes("installStreetVerseWorldMemory"),'world memory must mount on /streetverse')
must(main.includes("StreetVerseLivingWorldRuntime")&&main.includes("installStreetVerseLivingWorldRuntime"),'living world runtime must mount on /streetverse')
must(main.includes("StreetVerseMissionDiscoveryRuntime")&&main.includes("installStreetVerseMissionDiscoveryRuntime"),'mission discovery must mount on /streetverse')
must(main.includes("StreetVerseUnifiedProgressionRuntime")&&main.includes("installStreetVerseUnifiedProgressionRuntime"),'unified progression must mount on /streetverse')
must(main.includes("PublicServiceCareerRuntime")&&main.includes("installPublicServiceCareerRuntime"),'public-service careers must mount on /streetverse')
must(main.includes("GuardianMissionProgressRuntime")&&main.includes("installGuardianMissionProgressRuntime"),'Guardian mission progress must mount on /streetverse')
must(main.includes("StreetVerseTemporalConsequencesRuntime")&&main.includes("installStreetVerseTemporalConsequencesRuntime"),'Time Machine consequences must mount on /streetverse')
must(main.includes("StreetVerseCommerceWorldRuntime")&&main.includes("installStreetVerseCommerceWorldRuntime"),'commerce missions must mount on /streetverse')
must(main.includes("StreetVerseGrowthNetworkRuntime")&&main.includes("installStreetVerseGrowthNetworkRuntime"),'business growth network must mount on /streetverse')
must(main.includes("HolographicInternetGoogloplexBridge")&&main.includes("installHolographicInternetBridge"),'Holographic Internet bridge must mount on /streetverse')

must(world.includes("installStreetVerseSoundBankRuntime"),'automatic sound bank must mount in the mobile world')
must(world.includes("installStreetVerseAICafeBridgeRuntime"),'StreetVerse AI Cafe bridge must mount in the mobile world')
must(world.includes("StreetVerseRescueMissionHUD"),'rescue ops must be visible in the mobile world')
must(world.includes("CircleParkGuardCheckInHUD"),'guard check-in must be visible in the mobile world')
must(world.includes("StreetVerseEmergencyCallHUD"),'GAME 911 must be visible in the mobile world')
must(world.includes("StreetVerseEmergencyFleetWorld"),'real world-space emergency fleet must be mounted')
must(!world.includes("<StreetVerseEmergencyVehicles/>"),'obsolete emergency picture-in-picture must stay off the mobile gameplay surface')
must(world.includes("StreetVerseResponderNPCController"),'responder NPCs must be mounted')
must(world.includes("StreetVerseDialogueHUD"),'dialogue HUD must be mounted')
must(world.includes("HoloGPTAssistant showLauncher={false}"),'HoloGPT must be mounted behind the one-hand StreetVerse menu')
must(world.includes("['hologpt','◈ HOLOGPT']"),'HoloGPT must be reachable from the one-hand StreetVerse menu')
must(world.includes("['time','⏳ TIME MACHINE']"),'TIME MACHINE must be reachable from the one-hand StreetVerse menu')
must(world.includes("tryamm:world-player-signal"),'mobile world must feed the living-world scheduler')
must(world.includes("tryamm:world-clock"),'mobile world must publish day/night clock state')
must(world.includes("tryamm:world-weather"),'mobile world must publish weather state')
must(!world.includes("'sound'|'adult'"),'sound must not require a manual quick-action target')
must(!world.includes("['sound','🔊 SOUND FX']"),'sound must not consume a permanent one-hand menu slot')

for(const event of [
  'tryamm:streetverse-player-position',
  'tryamm:streetverse-rescue-incident-start',
  'tryamm:streetverse-emergency-response',
  'tryamm:streetverse-structure-fire-state',
  'tryamm:streetverse-vehicle-collision',
  'tryamm:circle-park-access-result',
  'tryamm:streetverse-threat-action',
]){
  must(sound.includes(event),'sound bank must react naturally to '+event)
}

for(const key of [
  'fire_crackle','police_siren','sheriff_siren','ambulance_siren','firetruck_siren',
  'metal_crunch','glass_break','water_hose','distant_shot','gate_buzzer','rescue_success'
]){
  must(sound.includes(key),'sound bank missing '+key)
}

must(sound.includes("onQuantumBeat")&&sound.includes("quantumBeatClock"),'automatic sound bank must use Quantum Beat timing')
must(sound.includes("idleBpm:84")&&sound.includes("walkBpm:108")&&sound.includes("driveBpm:124")&&sound.includes("emergencyBpm:138"),'Quantum Beat must adapt to idle walk drive and emergency states')
must(hologpt.includes("AUTO")&&hologpt.includes("HOLO")&&hologpt.includes("ORACLE")&&hologpt.includes("'old-web'")&&hologpt.includes("HISTORY"),'HoloGPT must expose AUTO HOLO ORACLE OLD WEB and HISTORY source modes')
must(hologpt.includes("/api/oracle/search")&&hologpt.includes("tryamm:holo-internet-query"),'HoloGPT must query both Oracle index and Holographic Internet')
must(oracleSearch.includes("/api/omni-news/items")&&oracleSearch.includes("/api/quantum-crawler/status"),'Oracle search API must bridge indexed items and Quantum Crawler status')
must(aiAnswer.includes("retrievalPacket")&&aiAnswer.includes("groundedQuestion"),'HoloGPT answer API must ground model answers in selected retrieval context')
must(aiAnswer.includes("UNTRUSTED RETRIEVAL CONTEXT"),'retrieved old-web content must be treated as untrusted data rather than instructions')
must(cafe.includes("tryamm:ai-cafe-task"),'StreetVerse AI Cafe bridge must create real agent tasks')
must(cafe.includes("tryamm:streetverse-world-ready"),'AI Cafe must audit the visible world after mount')

console.log('STREETVERSE CONVERGENCE CONTRACT PASS: Quantum Beat automatic SFX + AI Cafe + dispatch + memory + rescue + guards are mounted on the playable mobile route')
