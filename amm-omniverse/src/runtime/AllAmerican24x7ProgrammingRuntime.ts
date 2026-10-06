import {ALL_AMERICAN_24H_TEMPLATE,CRYPTO_BROADCAST_RULES,minuteNow,slotAtMinute,type NetworkProgramSlot} from '../data/AllAmerican24x7Programming'

type Host={userId:string;displayName?:string;live?:boolean;creatorMode?:boolean}
type SourceRef={title:string;url:string;publishedAt?:string;publisher?:string}
type ProgramState={slot:NetworkProgramSlot;status:'human-live-ready'|'host-needed'|'source-needed'|'replay-ready'|'education-ready';hostIds:string[];sources:SourceRef[];fallback:'replay'|'education'|'none';updatedAt:string}

function sourceOk(s:SourceRef){
 try{const u=new URL(s.url);return u.protocol==='https:'&&Boolean(s.title?.trim())}catch{return false}
}
function chooseStatus(slot:NetworkProgramSlot,hosts:Host[],sources:SourceRef[]):ProgramState['status']{
 if(slot.mode==='replay')return'replay-ready'
 if(slot.mode==='education'&&!slot.hostRequired)return'education-ready'
 if(slot.hostRequired&&hosts.length===0)return'host-needed'
 if(slot.sourceRequired&&sources.filter(sourceOk).length===0)return'source-needed'
 return'human-live-ready'
}

export function installAllAmerican24x7ProgrammingRuntime(){
 if(typeof window==='undefined')return()=>{}
 let hosts:Host[]=[]
 let sources:SourceRef[]=[]
 let last:ProgramState|null=null

 const publish=(reason:string)=>{
   const slot=slotAtMinute(minuteNow())
   const eligible=hosts.filter(h=>h.live||h.creatorMode)
   const status=chooseStatus(slot,eligible,sources)
   const fallback=status==='host-needed'||status==='source-needed'?(slot.channelId==='aan-crypto-education'?'education':'replay'):'none'
   last={slot,status,hostIds:eligible.map(h=>h.userId).slice(0,4),sources:sources.filter(sourceOk).slice(0,12),fallback,updatedAt:new Date().toISOString()}
   window.dispatchEvent(new CustomEvent('tryamm:all-american-24x7-state',{detail:{...last,reason,templateSlots:ALL_AMERICAN_24H_TEMPLATE.length,cryptoRules:CRYPTO_BROADCAST_RULES,noFakeLive:true,noFakeAnalysts:true,temporarySyntheticHost:'aan-ai-twin-host',syntheticHostDisclosureRequired:true,humanHostPriority:true}}))
   if(fallback!=='none')window.dispatchEvent(new CustomEvent('tryamm:all-american-fallback-program',{detail:{slot,fallback,reason:status,disclosure:fallback==='education'?'Educational program — not live news.':'Replay — not live.',syntheticHostSuggested:fallback==='education',syntheticHostId:fallback==='education'?'aan-ai-twin-host':null,humanApprovalRequired:true}}))
 }

 const onPresence=(event:Event)=>{const d=(event as CustomEvent<{players?:Host[]}>).detail||{};hosts=Array.isArray(d.players)?d.players:[];publish('presence')}
 const onSources=(event:Event)=>{const d=(event as CustomEvent<{sources?:SourceRef[]}>).detail||{};sources=Array.isArray(d.sources)?d.sources.filter(sourceOk):[];publish('sources')}
 const onRequest=()=>publish('request')
 const onStart=(event:Event)=>{
   const d=(event as CustomEvent<{slotId?:string;hostIds?:string[];sources?:SourceRef[]}>).detail||{}
   const slot=ALL_AMERICAN_24H_TEMPLATE.find(s=>s.id===d.slotId)||slotAtMinute(minuteNow())
   const selectedHosts=(d.hostIds||[]).length?hosts.filter(h=>(d.hostIds||[]).includes(h.userId)):hosts.filter(h=>h.live||h.creatorMode)
   const selectedSources=(d.sources||sources).filter(sourceOk)
   const status=chooseStatus(slot,selectedHosts,selectedSources)
   if(status!=='human-live-ready'&&slot.mode!=='education'&&slot.mode!=='replay'){
     window.dispatchEvent(new CustomEvent('tryamm:broadcast-blocked',{detail:{reason:status,slotId:slot.id,source:'all-american-24x7'}}));return
   }
   window.dispatchEvent(new CustomEvent('tryamm:broadcast-studio-update',{detail:{scene:slot.channelId==='aan-crypto-education'?'news-desk':slot.channelId==='aan-streetverse'?'gaming':'news-desk',programTitle:slot.title,formatId:slot.formatId,hostIds:selectedHosts.map(h=>h.userId),scheduledMinutes:slot.durationMinutes}}))
   window.dispatchEvent(new CustomEvent('tryamm:all-american-network-program',{detail:{slotId:slot.id,title:slot.title,channelId:slot.channelId,formatId:slot.formatId,mode:slot.mode,hostIds:selectedHosts.map(h=>h.userId),sources:selectedSources,disclosure:slot.disclosure||null,source:'all-american-24x7',noFakeLive:true}}))
 }

 addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
 addEventListener('tryamm:all-american-source-packet',onSources)
 addEventListener('tryamm:all-american-24x7-request',onRequest)
 addEventListener('tryamm:all-american-start-slot',onStart)
 const timer=window.setInterval(()=>publish('clock'),60000)
 publish('startup')
 return()=>{window.clearInterval(timer);removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:all-american-source-packet',onSources);removeEventListener('tryamm:all-american-24x7-request',onRequest);removeEventListener('tryamm:all-american-start-slot',onStart)}
}