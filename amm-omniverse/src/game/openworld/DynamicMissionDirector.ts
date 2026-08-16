import type { DistrictId } from './LivingCitySystems'

export type MissionKind='story'|'secret'|'business'|'rescue'|'race'|'investigation'|'heist-fiction'|'sports'|'creator'|'delivery'|'security'|'exploration'|'holo'|'world-event'
export type MissionApproach='social'|'stealth'|'driving'|'investigation'|'skill'|'combat-fiction'|'business'|'mixed'
export type MissionState='locked'|'available'|'active'|'completed'|'failed'|'cooldown'

export interface MissionCondition { minReputation?:number; maxHeat?:number; district?:DistrictId; ownsProperty?:string; memoryTag?:string; eventTag?:string; timeWindow?:[number,number]; discoveredSecret?:string }
export interface MissionObjective { id:string; text:string; optional?:boolean; hidden?:boolean; approach?:MissionApproach; target?:number }
export interface MissionBranch { id:string; label:string; requires?:MissionCondition; objectives:MissionObjective[]; reputationDelta?:number; relationshipDelta?:number; cash?:number; xp?:number; unlockSecret?:string }
export interface DynamicMission { id:string; title:string; kind:MissionKind; district:DistrictId; giverNpcId?:string; state:MissionState; secret:boolean; discoveryHint?:string; conditions:MissionCondition; objectives:MissionObjective[]; branches:MissionBranch[]; replayable:boolean; cooldownMs?:number; tags:string[] }
export interface PlayerMissionContext { reputation:number; heat:number; district:DistrictId; properties:string[]; memoryTags:string[]; eventTags:string[]; secrets:string[]; hour:number }

const has=(xs:string[],v?:string)=>!v||xs.includes(v)
export function conditionsMet(c:MissionCondition,p:PlayerMissionContext){
  if(c.minReputation!==undefined&&p.reputation<c.minReputation) return false
  if(c.maxHeat!==undefined&&p.heat>c.maxHeat) return false
  if(c.district&&p.district!==c.district) return false
  if(!has(p.properties,c.ownsProperty)||!has(p.memoryTags,c.memoryTag)||!has(p.eventTags,c.eventTag)||!has(p.secrets,c.discoveredSecret)) return false
  if(c.timeWindow){ const [start,end]=c.timeWindow; if(start<=end ? p.hour<start||p.hour>end : p.hour>end&&p.hour<start) return false }
  return true
}

export function availableMissions(missions:DynamicMission[],p:PlayerMissionContext){
  return missions.filter(m=>m.state!=='completed'&&conditionsMet(m.conditions,p)).map(m=>({...m,state:'available' as const}))
}

// AI may propose mission ingredients, but this deterministic validator remains authoritative.
export function validateAiMissionProposal(m:DynamicMission){
  const errors:string[]=[]
  if(!m.id||!m.title) errors.push('missing-identity')
  if(m.objectives.length<1||m.objectives.length>8) errors.push('objective-count')
  if(m.branches.length>4) errors.push('branch-count')
  if(m.secret&&!m.discoveryHint) errors.push('secret-needs-discovery-hint')
  if(m.objectives.some(o=>o.text.length>180)) errors.push('objective-too-long')
  if(m.tags.some(t=>['real-crime-instructions','real-person-target','private-data','payment-bypass'].includes(t))) errors.push('forbidden-tag')
  return {ok:errors.length===0,errors}
}

export function missionVarietyScore(m:DynamicMission,recent:DynamicMission[]){
  let score=100
  for(const r of recent.slice(-5)){
    if(r.kind===m.kind) score-=15
    if(r.district===m.district) score-=8
    if(r.giverNpcId&&r.giverNpcId===m.giverNpcId) score-=10
    const overlap=m.tags.filter(t=>r.tags.includes(t)).length
    score-=Math.min(20,overlap*4)
  }
  return Math.max(0,score)
}

export const seedMissions:DynamicMission[]=[
  {id:'story-neon-signal',title:'The Neon Signal',kind:'story',district:'holo-heights',giverNpcId:'npc-oracle-01',state:'locked',secret:false,conditions:{minReputation:5,maxHeat:3},objectives:[{id:'meet',text:'Meet the source beneath the Holo Heights transit deck.',approach:'social'},{id:'trace',text:'Trace the corrupted city signal through three relay points.',approach:'investigation'},{id:'choose',text:'Decide who receives the recovered evidence.',approach:'mixed'}],branches:[{id:'community',label:'Give it to the community network',objectives:[{id:'deliver',text:'Deliver the evidence to the public archive.',approach:'social'}],reputationDelta:8,xp:300,unlockSecret:'archive-echo'},{id:'security',label:'Give it to city security',objectives:[{id:'deliver',text:'Meet the security liaison.',approach:'social'}],reputationDelta:3,cash:450,xp:250}],replayable:false,tags:['mystery','holo','choice']},
  {id:'secret-midnight-court',title:'Midnight Court',kind:'secret',district:'kingdom-core',state:'locked',secret:true,discoveryHint:'A court with no lights sometimes has one player after midnight.',conditions:{minReputation:10,maxHeat:1,timeWindow:[0,3],memoryTag:'heard-midnight-rumor'},objectives:[{id:'find',text:'Find the unmarked court without using a mission waypoint.',hidden:true,approach:'exploration' as MissionApproach},{id:'challenge',text:'Complete the mystery skill challenge.',hidden:true,approach:'skill'}],branches:[{id:'win',label:'Complete the challenge',objectives:[{id:'finish',text:'Finish before sunrise.',approach:'skill'}],xp:700,unlockSecret:'court-legend'}],replayable:true,cooldownMs:86400000,tags:['secret','sports','night','discovery']},
  {id:'business-after-hours',title:'After Hours',kind:'business',district:'creator-district',giverNpcId:'npc-manager-01',state:'locked',secret:false,conditions:{ownsProperty:'studio-creator-01',maxHeat:2},objectives:[{id:'book',text:'Book three acts with different audience profiles.',approach:'business'},{id:'prepare',text:'Prepare the venue and solve one unexpected production problem.',approach:'mixed'},{id:'show',text:'Run the showcase and protect audience satisfaction.',approach:'skill'}],branches:[{id:'premium',label:'Premium showcase',objectives:[{id:'quality',text:'Hit the premium quality target.',approach:'business'}],cash:1200,xp:450},{id:'community',label:'Community showcase',objectives:[{id:'access',text:'Maximize community access and creator discovery.',approach:'social'}],reputationDelta:10,xp:500}],replayable:true,cooldownMs:21600000,tags:['creator','business','music','dynamic-event']},
  {id:'secret-ghost-route',title:'Ghost Route',kind:'secret',district:'harbor-industrial',state:'locked',secret:true,discoveryHint:'Some delivery routes disappear from the map during heavy fog.',conditions:{maxHeat:0,eventTag:'heavy-fog',memoryTag:'dockworker-rumor'},objectives:[{id:'follow',text:'Follow the unmarked route using environmental clues.',hidden:true,approach:'driving'},{id:'discover',text:'Discover why the abandoned relay keeps broadcasting.',hidden:true,approach:'investigation'}],branches:[{id:'restore',label:'Restore the relay',objectives:[{id:'repair',text:'Complete the relay repair puzzle.',approach:'skill'}],reputationDelta:5,xp:650,unlockSecret:'harbor-frequency'},{id:'archive',label:'Archive the signal',objectives:[{id:'record',text:'Record the signal for the city archive.',approach:'investigation'}],cash:300,xp:600}],replayable:false,tags:['secret','driving','mystery','weather']}
]

export function buildMissionFeed(missions:DynamicMission[],p:PlayerMissionContext,recent:DynamicMission[]){
  return availableMissions(missions,p).sort((a,b)=>missionVarietyScore(b,recent)-missionVarietyScore(a,recent))
}
