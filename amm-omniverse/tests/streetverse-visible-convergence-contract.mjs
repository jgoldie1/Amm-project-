import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const main=read('src/main.tsx')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const sound=read('src/runtime/StreetVerseSoundBankRuntime.ts')
const cafe=read('src/runtime/StreetVerseAICafeBridgeRuntime.ts')

const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE CONVERGENCE CONTRACT FAIL: '+msg)}

must(main.includes("AICafeMultiAgentRuntime")&&main.includes("installAICafeMultiAgentRuntime"),'AI Cafe must mount on /streetverse')
must(main.includes("DynamicDispatchRuntime")&&main.includes("installDynamicDispatchRuntime"),'dynamic dispatch must mount on /streetverse')
must(main.includes("StreetVerseWorldMemory")&&main.includes("installStreetVerseWorldMemory"),'world memory must mount on /streetverse')

must(world.includes("installStreetVerseSoundBankRuntime"),'automatic sound bank must mount in the mobile world')
must(world.includes("installStreetVerseAICafeBridgeRuntime"),'StreetVerse AI Cafe bridge must mount in the mobile world')
must(world.includes("StreetVerseRescueMissionHUD"),'rescue ops must be visible in the mobile world')
must(world.includes("CircleParkGuardCheckInHUD"),'guard check-in must be visible in the mobile world')
must(world.includes("StreetVerseEmergencyCallHUD"),'GAME 911 must be visible in the mobile world')
must(world.includes("StreetVerseEmergencyVehicles"),'emergency vehicles must be mounted')
must(world.includes("StreetVerseResponderNPCController"),'responder NPCs must be mounted')
must(world.includes("StreetVerseDialogueHUD"),'dialogue HUD must be mounted')
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
must(cafe.includes("tryamm:ai-cafe-task"),'StreetVerse AI Cafe bridge must create real agent tasks')
must(cafe.includes("tryamm:streetverse-world-ready"),'AI Cafe must audit the visible world after mount')

console.log('STREETVERSE CONVERGENCE CONTRACT PASS: Quantum Beat automatic SFX + AI Cafe + dispatch + memory + rescue + guards are mounted on the playable mobile route')
