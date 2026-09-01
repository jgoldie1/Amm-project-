import { DUEL_REALMS_CANON,SEVEN_LIGHTS_CANON,STORY_CANON_INTEGRATION } from '../data/SevenLightsCanonRegistry'
import { ARIEL_MISSION_ROLE,BENNY_MISSION_ROLE,SEVEN_LIGHTS_MISSIONS } from '../data/SevenLightsMissionRegistry'

let installed=false
const ACTIVE_KEY='tryamm_seven_lights_active_mission_v1'
function emit(type:string,detail:Record<string,unknown>){window.dispatchEvent(new CustomEvent(type,{detail}))}
function activeMission(){try{const id=localStorage.getItem(ACTIVE_KEY)||SEVEN_LIGHTS_MISSIONS[0].id;return SEVEN_LIGHTS_MISSIONS.find(m=>m.id===id)||SEVEN_LIGHTS_MISSIONS[0]}catch{return SEVEN_LIGHTS_MISSIONS[0]}}
function activateMission(id:string){const mission=SEVEN_LIGHTS_MISSIONS.find(m=>m.id===id);if(!mission)return;try{localStorage.setItem(ACTIVE_KEY,id)}catch{};emit('tryamm:story-mission-active',{mission,benny:BENNY_MISSION_ROLE,ariel:ARIEL_MISSION_ROLE});emit('tryamm:benny:overlay-request',{mode:'mission',title:`BENNY • ${mission.title}`,message:mission.objective});emit('tryamm:chronicle:context',{title:mission.chapter,body:`${mission.title} — ${mission.objective}`,source:'seven-lights-mission'});emit('tryamm:construct:mission-targets',{missionId:mission.id,steps:mission.steps,construct:mission.construct})}
export function installStoryCanonStreetVerseRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 window.addEventListener('tryamm:streetverse-enter',()=>{
  emit('tryamm:story-canon-ready',{sevenLights:SEVEN_LIGHTS_CANON.title,seasons:SEVEN_LIGHTS_CANON.format.seasons,episodes:SEVEN_LIGHTS_CANON.format.totalCoreEpisodes,duelRealms:DUEL_REALMS_CANON.title,hero:SEVEN_LIGHTS_CANON.hero.name,champion:DUEL_REALMS_CANON.hero,missions:SEVEN_LIGHTS_MISSIONS.length,physicalProjection:false})
  emit('tryamm:chronicle:context',{title:'CANON ONLINE',body:`${SEVEN_LIGHTS_CANON.title}: ${SEVEN_LIGHTS_CANON.format.totalCoreEpisodes} core episodes • ${SEVEN_LIGHTS_MISSIONS.length} starter missions • ${DUEL_REALMS_CANON.title}: ${DUEL_REALMS_CANON.realms.length} realms.`,source:'story-canon'})
  queueMicrotask(()=>activateMission(activeMission().id))
 })
 window.addEventListener('tryamm:construct:scan-result',(event:Event)=>{const detail=(event as CustomEvent<Record<string,unknown>>).detail||{};emit('tryamm:story-canon-scan',{...detail,capabilities:['lore','character','faction','episode','manga','realm','power','mission'],integration:STORY_CANON_INTEGRATION.construct})})
 window.addEventListener('tryamm:story:request',(event:Event)=>{const d=(event as CustomEvent<{kind?:string;season?:number}>).detail||{};const payload=d.kind==='missions'?SEVEN_LIGHTS_MISSIONS:d.kind==='duel-realms'?DUEL_REALMS_CANON:d.season?SEVEN_LIGHTS_CANON.seasons.find(s=>s.season===d.season):SEVEN_LIGHTS_CANON;emit('tryamm:story:response',{request:d,payload})})
 window.addEventListener('tryamm:story-mission-select',(event:Event)=>{const id=(event as CustomEvent<{id?:string}>).detail?.id;if(id)activateMission(id)})
 window.addEventListener('tryamm:story-mission-complete',(event:Event)=>{const id=(event as CustomEvent<{id?:string}>).detail?.id||activeMission().id;const index=SEVEN_LIGHTS_MISSIONS.findIndex(m=>m.id===id),mission=SEVEN_LIGHTS_MISSIONS[index];if(!mission)return;emit('tryamm:mission-completed',{missionId:mission.id,missionTitle:mission.title,xp:mission.reward.xp,unlock:mission.reward.unlock,source:'seven-lights'});const next=SEVEN_LIGHTS_MISSIONS[index+1];if(next)activateMission(next.id)})
 emit('tryamm:story-runtime-installed',{media:SEVEN_LIGHTS_CANON.media,integration:STORY_CANON_INTEGRATION,missions:SEVEN_LIGHTS_MISSIONS,benny:BENNY_MISSION_ROLE,ariel:ARIEL_MISSION_ROLE,physicalProjection:false})
}
