type NPCEventDetail={npcId?:string;animation?:string;tipperId?:string;intentId?:string;pending?:boolean}
type SocialActionDetail={action?:string;npcId?:string;label?:string;move?:string;amount?:number;intentId?:string}

let installed=false
const clean=(v:unknown,max=80)=>String(v??'').replace(/[^a-zA-Z0-9:_ -]/g,'').slice(0,max)
const allowedAnimations=new Set(['idle','dance','wave','acknowledge_tip','celebrate'])

function emitNPC(detail:NPCEventDetail){
 const npcId=clean(detail.npcId);const animation=clean(detail.animation,40).toLowerCase()
 if(!npcId||!allowedAnimations.has(animation))return
 dispatchEvent(new CustomEvent('tryamm:streetverse-npc-animation',{detail:{npcId,animation,source:'npc-social-runtime'}}))
 if(animation==='acknowledge_tip')dispatchEvent(new CustomEvent('tryamm:streetverse-streamer-moment',{detail:{kind:'npc-tip-reaction',npcId,intentId:clean(detail.intentId),pending:Boolean(detail.pending),financialReward:false}}))
}

export function installStreetVerseNPCSocialRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 addEventListener('tryamm:streetverse-npc-sync',(e:Event)=>emitNPC((e as CustomEvent<NPCEventDetail>).detail||{}))
 addEventListener('tryamm:streetverse-context-action',(e:Event)=>{
  const d=(e as CustomEvent<SocialActionDetail>).detail||{},action=clean(d.action,32).toLowerCase(),npcId=clean(d.npcId)
  if(!npcId)return
  if(action==='dance')emitNPC({npcId,animation:'dance'})
  if(action==='wave')emitNPC({npcId,animation:'wave'})
 })
 addEventListener('tryamm:streetverse-npc-tip-receipt',(e:Event)=>{
  const d=(e as CustomEvent<NPCEventDetail>).detail||{}
  if(d.pending)emitNPC({...d,animation:'acknowledge_tip'})
 })
 dispatchEvent(new CustomEvent('tryamm:streetverse-npc-social-ready',{detail:{animations:[...allowedAnimations],financialAuthority:'server-only',source:'npc-social-runtime'}}))
}
