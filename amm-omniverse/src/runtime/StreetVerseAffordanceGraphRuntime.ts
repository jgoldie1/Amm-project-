import type {StreetVerseCognitionAction,StreetVerseCognitionFrame} from './StreetVerseCognitionRuntime'

export type StreetVerseAffordanceNode=Readonly<{
 id:string
 label:string
 kind:'bench'|'wayfinder'|'shelter'|'security'|'entrance'|'sidewalk-pocket'|'social'|'landmark'
 x:number
 z:number
 tags:readonly string[]
 capacity:number
 quality:number
 reservationMs?:number
}>

export type StreetVerseAffordanceAssignment=Readonly<{
 npcId:string
 nodeId:string
 nodeLabel:string
 nodeKind:StreetVerseAffordanceNode['kind']
 action:StreetVerseCognitionAction
 x:number
 z:number
 score:number
 distance:number
 reservationId:string
 expiresAt:number
 source:'streetverse-affordance-graph-v1'
}>

type AgentState={npcId:string;role:string;x:number;z:number}
type Reservation={assignment:StreetVerseAffordanceAssignment;arrived:boolean}

const ACTION_TAGS:Record<StreetVerseCognitionAction,readonly string[]>={
 patrol:['route','lookout','sidewalk'],
 observe:['lookout','wayfinding','security','landmark'],
 greet:['social','bench','wayfinding'],
 assist:['wayfinding','shelter','security','entrance'],
 guide:['wayfinding','entrance','landmark'],
 investigate:['lookout','security','landmark'],
 'seek-safety':['shelter','security','entrance'],
 deescalate:['open-space','security','sidewalk'],
 socialize:['social','bench','rest'],
 'yield-path':['sidewalk','open-space'],
}

const clamp01=(n:number)=>Math.max(0,Math.min(1,n))
const clean=(value:unknown,max=80)=>String(value??'').replace(/[^a-zA-Z0-9:_ -]/g,'').slice(0,max)

export function installStreetVerseAffordanceGraphRuntime(nodes:readonly StreetVerseAffordanceNode[]){
 if(typeof window==='undefined')return{dispose:()=>{},getAssignments:()=>[] as StreetVerseAffordanceAssignment[]}

 const agents=new Map<string,AgentState>()
 const reservations=new Map<string,Reservation[]>()
 const activeByNpc=new Map<string,Reservation>()
 const lastAssignedAction=new Map<string,StreetVerseCognitionAction>()

 const prune=(now=performance.now())=>{
  for(const [nodeId,list] of reservations){
   const live=list.filter(item=>item.assignment.expiresAt>now)
   if(live.length)reservations.set(nodeId,live)
   else reservations.delete(nodeId)
  }
  for(const [npcId,item] of activeByNpc)if(item.assignment.expiresAt<=now)activeByNpc.delete(npcId)
 }

 const occupancy=(nodeId:string,now:number)=>{
  prune(now)
  return reservations.get(nodeId)?.length||0
 }

 const compatible=(node:StreetVerseAffordanceNode,action:StreetVerseCognitionAction)=>{
  const desired=ACTION_TAGS[action]||[]
  return desired.some(tag=>node.tags.includes(tag))
 }

 const nodeScore=(node:StreetVerseAffordanceNode,agent:AgentState,action:StreetVerseCognitionAction,now:number)=>{
  const distance=Math.hypot(node.x-agent.x,node.z-agent.z)
  const occupied=occupancy(node.id,now)
  if(occupied>=node.capacity)return null
  const tags=ACTION_TAGS[action]||[]
  const matches=tags.filter(tag=>node.tags.includes(tag)).length
  if(!matches)return null
  const matchScore=clamp01(matches/Math.max(1,tags.length))
  const distanceScore=clamp01(1-distance/48)
  const qualityScore=clamp01(node.quality)
  const roleBonus=(agent.role==='security'&&node.tags.includes('security')?0.12:0)
  const noveltyPenalty=activeByNpc.get(agent.npcId)?.assignment.nodeId===node.id?0.08:0
  const score=matchScore*.48+distanceScore*.30+qualityScore*.20+roleBonus-noveltyPenalty
  return{score:Math.round(clamp01(score)*1000)/1000,distance:Math.round(distance*10)/10}
 }

 const reserve=(agent:AgentState,action:StreetVerseCognitionAction,now:number)=>{
  if(action==='patrol')return null
  const existing=activeByNpc.get(agent.npcId)
  if(existing&&existing.assignment.expiresAt>now&&lastAssignedAction.get(agent.npcId)===action)return existing.assignment

  const ranked=nodes
   .filter(node=>compatible(node,action))
   .map(node=>({node,result:nodeScore(node,agent,action,now)}))
   .filter((item):item is {node:StreetVerseAffordanceNode;result:{score:number;distance:number}}=>Boolean(item.result))
   .sort((a,b)=>b.result.score-a.result.score||a.result.distance-b.result.distance)

  const best=ranked[0]
  if(!best||best.result.score<.20)return null
  if(existing){
   const oldList=(reservations.get(existing.assignment.nodeId)||[]).filter(item=>item!==existing)
   if(oldList.length)reservations.set(existing.assignment.nodeId,oldList);else reservations.delete(existing.assignment.nodeId)
  }

  const expiresAt=now+(best.node.reservationMs||8500)
  const reservationId=`${agent.npcId}:${best.node.id}:${Math.round(now)}`
  const assignment:StreetVerseAffordanceAssignment={
   npcId:agent.npcId,
   nodeId:best.node.id,
   nodeLabel:best.node.label,
   nodeKind:best.node.kind,
   action,
   x:best.node.x,
   z:best.node.z,
   score:best.result.score,
   distance:best.result.distance,
   reservationId,
   expiresAt,
   source:'streetverse-affordance-graph-v1',
  }
  const entry:Reservation={assignment,arrived:false}
  reservations.set(best.node.id,[...(reservations.get(best.node.id)||[]),entry])
  activeByNpc.set(agent.npcId,entry)
  lastAssignedAction.set(agent.npcId,action)
  window.dispatchEvent(new CustomEvent('tryamm:npc-affordance-assigned',{detail:assignment}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-affordance-telemetry',{detail:{
   kind:'reserved',
   assignment,
   candidates:ranked.slice(0,4).map(item=>({nodeId:item.node.id,label:item.node.label,score:item.result.score,distance:item.result.distance})),
  }}))
  return assignment
 }

 const onFrame=(event:Event)=>{
  const frame=(event as CustomEvent<StreetVerseCognitionFrame>).detail
  if(!frame?.agents)return
  for(const agent of frame.agents){
   agents.set(agent.npcId,{npcId:agent.npcId,role:agent.role||'resident',x:agent.x,z:agent.z})
  }
  prune(performance.now())
 }

 const onAction=(event:Event)=>{
  const d=(event as CustomEvent<{npcId?:string;action?:StreetVerseCognitionAction}>).detail||{}
  const npcId=clean(d.npcId)
  if(!npcId||!d.action)return
  const agent=agents.get(npcId)
  if(!agent)return
  reserve(agent,d.action,performance.now())
 }

 const onArrived=(event:Event)=>{
  const d=(event as CustomEvent<{npcId?:string;nodeId?:string;reservationId?:string}>).detail||{}
  const npcId=clean(d.npcId),nodeId=clean(d.nodeId),reservationId=clean(d.reservationId)
  const entry=activeByNpc.get(npcId)
  if(!entry||entry.assignment.nodeId!==nodeId||entry.assignment.reservationId!==reservationId)return
  entry.arrived=true
  window.dispatchEvent(new CustomEvent('tryamm:npc-affordance-complete',{detail:{
   ...entry.assignment,
   completedAt:performance.now(),
   source:'streetverse-affordance-graph-v1',
  }}))
 }

 const onRelease=(event:Event)=>{
  const d=(event as CustomEvent<{npcId?:string}>).detail||{}
  const npcId=clean(d.npcId)
  const entry=activeByNpc.get(npcId)
  if(!entry)return
  const list=(reservations.get(entry.assignment.nodeId)||[]).filter(item=>item!==entry)
  if(list.length)reservations.set(entry.assignment.nodeId,list);else reservations.delete(entry.assignment.nodeId)
  activeByNpc.delete(npcId)
 }

 window.addEventListener('tryamm:npc-cognition-frame',onFrame)
 window.addEventListener('tryamm:streetverse-npc-cognition-action',onAction)
 window.addEventListener('tryamm:npc-affordance-arrived',onArrived)
 window.addEventListener('tryamm:npc-affordance-release',onRelease)

 queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-affordance-graph-ready',{detail:{
  version:'v1',
  nodeCount:nodes.length,
  nodeKinds:[...new Set(nodes.map(node=>node.kind))],
  reservationSystem:true,
  spatialScoring:true,
  utilityDriven:true,
  source:'streetverse-affordance-graph-v1',
 }})))

 return{
  getAssignments:()=>[...activeByNpc.values()].map(item=>item.assignment),
  dispose:()=>{
   window.removeEventListener('tryamm:npc-cognition-frame',onFrame)
   window.removeEventListener('tryamm:streetverse-npc-cognition-action',onAction)
   window.removeEventListener('tryamm:npc-affordance-arrived',onArrived)
   window.removeEventListener('tryamm:npc-affordance-release',onRelease)
   reservations.clear();activeByNpc.clear();agents.clear()
  },
 }
}
