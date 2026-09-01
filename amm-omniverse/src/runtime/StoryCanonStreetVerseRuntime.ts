import { DUEL_REALMS_CANON,SEVEN_LIGHTS_CANON,STORY_CANON_INTEGRATION } from '../data/SevenLightsCanonRegistry'

let installed=false
function emit(type:string,detail:Record<string,unknown>){window.dispatchEvent(new CustomEvent(type,{detail}))}
export function installStoryCanonStreetVerseRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 window.addEventListener('tryamm:streetverse-enter',()=>{
  emit('tryamm:story-canon-ready',{sevenLights:SEVEN_LIGHTS_CANON.title,seasons:SEVEN_LIGHTS_CANON.format.seasons,episodes:SEVEN_LIGHTS_CANON.format.totalCoreEpisodes,duelRealms:DUEL_REALMS_CANON.title,hero:SEVEN_LIGHTS_CANON.hero.name,champion:DUEL_REALMS_CANON.hero,physicalProjection:false})
  emit('tryamm:chronicle:context',{title:'CANON ONLINE',body:`${SEVEN_LIGHTS_CANON.title}: ${SEVEN_LIGHTS_CANON.format.totalCoreEpisodes} core episodes • ${DUEL_REALMS_CANON.title}: ${DUEL_REALMS_CANON.realms.length} realms.`,source:'story-canon'})
 })
 window.addEventListener('tryamm:construct:scan-result',(event:Event)=>{
  const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
  emit('tryamm:story-canon-scan',{...detail,capabilities:['lore','character','faction','episode','manga','realm','power','mission'],integration:STORY_CANON_INTEGRATION.construct})
 })
 window.addEventListener('tryamm:story:request',(event:Event)=>{
  const d=(event as CustomEvent<{kind?:string;season?:number}>).detail||{}
  const payload=d.kind==='duel-realms'?DUEL_REALMS_CANON:d.season?SEVEN_LIGHTS_CANON.seasons.find(s=>s.season===d.season):SEVEN_LIGHTS_CANON
  emit('tryamm:story:response',{request:d,payload})
 })
 emit('tryamm:story-runtime-installed',{media:SEVEN_LIGHTS_CANON.media,integration:STORY_CANON_INTEGRATION,physicalProjection:false})
}
