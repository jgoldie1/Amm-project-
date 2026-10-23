/** Original StreetVerse Holo Arena creature + music event choreography.
 * Virtual rendering only. No claim of projected physical holograms.
 */
export type HoloCreatureId='astral-lion'|'quantum-wisp'|'specter-sentinel'|'rhythm-golem'
export type HoloPhase='dormant'|'materializing'|'active'|'telegraphing'|'cooldown'|'dissolving'
export type HoloCue={timeMs:number;kind:'portal'|'mesh-reveal'|'beat-pulse'|'attack-warning'|'safe-impact'|'dissolve';intensity:number;caption:string}
export interface HoloEncounter{creatureId:HoloCreatureId;phase:HoloPhase;bpm:number;startedAt:number;attackCooldownMs:number;lastAttackAt:number;musicRightsVerified:boolean;xrCertified:boolean}
const CREATURES:Record<HoloCreatureId,{label:string;category:string;color:string}>={
 'astral-lion':{label:'Astral Lion',category:'guardian',color:'#f9d991'},
 'quantum-wisp':{label:'Quantum Wisp',category:'tag',color:'#8ddcf0'},
 'specter-sentinel':{label:'Specter Sentinel',category:'mystery',color:'#cab9ff'},
 'rhythm-golem':{label:'Rhythm Golem',category:'music',color:'#efabdc'},
}
export function makeHoloEncounter(id:HoloCreatureId,bpm=100):HoloEncounter{
 if(!CREATURES[id]||!Number.isFinite(bpm)||bpm<50||bpm>200)throw Error('invalid_holo_encounter')
 return {creatureId:id,phase:'dormant',bpm,startedAt:0,attackCooldownMs:1800,lastAttackAt:-Infinity,musicRightsVerified:false,xrCertified:false}
}
export function materializationCues(encounter:HoloEncounter):HoloCue[]{
 const beat=60000/encounter.bpm
 return [{timeMs:0,kind:'portal',intensity:.4,caption:'Portal opening'},
 {timeMs:beat,kind:'mesh-reveal',intensity:.7,caption:CREATURES[encounter.creatureId].label+' appears'},
 {timeMs:beat*2,kind:'beat-pulse',intensity:.4,caption:'Holographic creature is ready'}]
}
export function requestVirtualAttack(encounter:HoloEncounter,nowMs:number){
 if(encounter.phase!=='active'||!Number.isFinite(nowMs)||nowMs-encounter.lastAttackAt<encounter.attackCooldownMs)return {allowed:false,reason:'cooldown-or-inactive',cues:[] as HoloCue[]}
 encounter.lastAttackAt=nowMs;encounter.phase='telegraphing'
 return {allowed:true,reason:'virtual-only',cues:[
 {timeMs:0,kind:'attack-warning' as const,intensity:.6,caption:'Attack incoming: move to a safe zone'},
 {timeMs:650,kind:'safe-impact' as const,intensity:.45,caption:'Virtual impact'}]}
}
export const HOLO_ENCOUNTER_GATES={cameraRequiresPermission:true,physicalLocationDataNotUploadedByDefault:true,
 vrRequiresSupportedHardware:true,arRequiresTrackingCertification:true,staticAlternativeRequired:true,
 volumeAndFlashingLimitsRequired:true,licensedMusicOnly:true,noRealWorldDamage:true,
 noPayToWinRankedScores:true,rewardsServerVerified:true,moderationRequired:true} as const
export const HOLO_CREATURES=CREATURES
