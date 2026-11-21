/** CrossVerse Chicago dual-era prototype: timeline-scoped NPC memories, economy and scanner. */
import {createMyceliumTimeline,type VerseEvent} from './StreetVerseMyceliumTimelineRuntime'
export type ChicagoEra='past'|'present'|'future'
export type ChicagoScene={era:ChicagoEra;timelineId:string;sky:string;architecture:string;transport:string;shopsOpen:string[]}
const SCENES:Record<ChicagoEra,Omit<ChicagoScene,'timelineId'>>={
 past:{era:'past',sky:'warm',architecture:'historic-brick',transport:'classic-streetcar',shopsOpen:['corner-grocer','record-shop']},
 present:{era:'present',sky:'daylight',architecture:'modern-chicago',transport:'city-bus',shopsOpen:['corner-grocer','tech-store']},
 future:{era:'future',sky:'neon',architecture:'solar-towers',transport:'autonomous-shuttle',shopsOpen:['holo-market','repair-lab']},
}
export function createChicagoTimeSwitch(){
 const timeline=createMyceliumTimeline('chicago:present')
 timeline.fork('chicago:past','chronoverse',-100,'chicago:present')
 timeline.fork('chicago:future','chronoverse',100,'chicago:present')
 const memories=new Map<string,Map<string,string[]>>()
 const current=():ChicagoEra=>timeline.active().split(':')[1] as ChicagoEra
 return {
  active:()=>current(),
  scene:():ChicagoScene=>({...SCENES[current()],timelineId:timeline.active(),shopsOpen:[...SCENES[current()].shopsOpen]}),
  scan:()=>Object.values(SCENES).map(s=>({...s,timelineId:'chicago:'+s.era,shopsOpen:[...s.shopsOpen]})),
  switchTo:(era:ChicagoEra)=>{timeline.travel('chicago:'+era);return {...SCENES[era],timelineId:timeline.active(),shopsOpen:[...SCENES[era].shopsOpen]}},
  remember:(npcId:string,message:string)=>{
   if(!npcId||!message)throw new Error('NPC and memory required')
   const branch=timeline.active()
   if(!memories.has(branch))memories.set(branch,new Map())
   const npc=memories.get(branch)!
   npc.set(npcId,[...(npc.get(npcId)??[]),message])
  },
  recall:(npcId:string)=>[...(memories.get(timeline.active())?.get(npcId)??[])],
  record:(event:VerseEvent)=>timeline.record(event),
  history:()=>timeline.history(),
  timelineIds:()=>timeline.branches().map(b=>b.id),
 }
}
