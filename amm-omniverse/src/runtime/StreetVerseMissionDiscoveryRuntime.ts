import { installBennyOmniHostRuntime } from './BennyOmniHostRuntime'
import { installFounderPocketDimensionRuntime } from './FounderPocketDimensionRuntime'

export type MissionRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'secret' | 'mythic'
export type MissionCategory = 'story' | 'racing' | 'drift' | 'motorcycle' | 'delivery' | 'business' | 'crew' | 'relationship' | 'nightlife' | 'after-dark' | 'puzzle' | 'exploration' | 'cross-verse' | 'reality-quest'
export type MissionRouteChoice = 'A' | 'B' | 'C' | 'D'
export type SecretTriggerType = 'location' | 'item' | 'audio-clue' | 'qr-symbol' | 'relationship-state' | 'business-state' | 'race-win' | 'time-window' | 'weather' | 'sequence' | 'world-memory' | 'cross-verse-clue'
export type SecretAreaState = 'hidden' | 'discovered' | 'unlocked' | 'completed'

export interface MissionDiscovery {missionId:string;title:string;rarity:MissionRarity;category:MissionCategory;playerId:string;locationId?:string;clue?:string;adultOnly?:boolean;crossVerseDestination?:'streetverse'|'spaceverse'|'starverse'|'kingdoms-press'|'living-scroll'|'holoverse'|'64-track-studio'|'after-dark';metadata?:Record<string,unknown>}
export interface SecretTrigger {secretId:string;playerId:string;type:SecretTriggerType;value:string;locationId?:string;adultOnly?:boolean;ageVerified18Plus?:boolean;afterDarkOptIn?:boolean}
export type MissionSpecialUnlockKind='skill'|'relationship'|'item'|'business'|'education'|'reputation'|'faith'|'information'|'fame'
export interface MissionRouteSelection {choice:MissionRouteChoice;missionId?:string;title?:string;label?:string;routeDescription?:string;objective?:string;source?:string;mode?:string;hand?:string;specialUnlocked?:boolean;unlockKind?:MissionSpecialUnlockKind;unlockSource?:string}
export interface MissionSpecialRouteUnlock {missionId?:string;kind:MissionSpecialUnlockKind;label:string;description:string;source?:string;oneTime?:boolean;unlockedAt?:string}
type StreetVerseWorldCompletion={id?:string;missionId?:string;label?:string;source?:string;visited?:string[];total?:number;vehicle?:boolean;mobileSafeMode?:boolean;htmlCity?:boolean;mobileLite?:boolean;communityAreaNumber?:string|number;communityAreaName?:string}

const ROUTE_STORAGE_KEY='tryamm.streetverse.mission-routes.v1'
const ROUTE_PREFERENCES:Record<MissionRouteChoice,MissionCategory[]>={
  A:['story','racing','drift','motorcycle','exploration'],
  B:['business','delivery','crew','relationship','story'],
  C:['puzzle','exploration','reality-quest','cross-verse','story'],
  D:['relationship','business','cross-verse','reality-quest','story'],
}
const ROUTE_LABELS:Record<MissionRouteChoice,string>={A:'ACTION',B:'BUILD / BUSINESS',C:'LEARN / TEST',D:'SPECIAL / EARNED'}

const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
const missionState=new Map<string,MissionDiscovery&{status:'discovered'|'completed';discoveredAt:string;completedAt?:string;outcome?:Record<string,unknown>}>()
const secretState=new Map<string,{state:SecretAreaState;updatedAt:string}>()
const missionRouteState=new Map<string,MissionRouteSelection&{missionId:string;selectedAt:string;consumedAt?:string}>()
const specialRouteUnlockState=new Map<string,MissionSpecialRouteUnlock&{missionId:string;unlockedAt:string}>()
const adultGate=(input:{adultOnly?:boolean;ageVerified18Plus?:boolean;afterDarkOptIn?:boolean})=>!input.adultOnly||(input.ageVerified18Plus===true&&input.afterDarkOptIn===true)
const isRouteChoice=(value:unknown):value is MissionRouteChoice=>value==='A'||value==='B'||value==='C'||value==='D'

function persistMissionRoutes(){
  try{localStorage.setItem(ROUTE_STORAGE_KEY,JSON.stringify([...missionRouteState.values()]))}catch{}
}
function loadMissionRoutes(){
  try{
    const rows=JSON.parse(localStorage.getItem(ROUTE_STORAGE_KEY)||'[]')
    if(!Array.isArray(rows))return
    for(const row of rows){
      if(!row||typeof row!=='object'||!isRouteChoice(row.choice))continue
      const missionId=String(row.missionId||'')
      if(!missionId)continue
      missionRouteState.set(missionId,{...row,missionId,selectedAt:String(row.selectedAt||new Date().toISOString())})
    }
  }catch{}
}
function resolveMissionRoute(missionId:string){
  const exact=missionRouteState.get(missionId)
  if(exact&&!exact.consumedAt){
    const consumed={...exact,consumedAt:new Date().toISOString()}
    missionRouteState.set(missionId,consumed);persistMissionRoutes();return consumed
  }
  let sourceKey='session-active'
  let pending=missionRouteState.get(sourceKey)
  if(!pending||pending.consumedAt){
    const latest=[...missionRouteState.entries()]
      .filter(([,route])=>!route.consumedAt)
      .sort((a,b)=>Date.parse(b[1].selectedAt)-Date.parse(a[1].selectedAt))[0]
    if(!latest)return undefined
    sourceKey=latest[0];pending=latest[1]
  }
  missionRouteState.delete(sourceKey)
  const rebound={...pending,missionId,consumedAt:new Date().toISOString()}
  missionRouteState.set(missionId,rebound)
  persistMissionRoutes()
  return rebound
}

export function unlockStreetVerseMissionRouteD(input:MissionSpecialRouteUnlock){
  const missionId=String(input.missionId||'session-active')
  const record={...input,missionId,label:String(input.label||'SPECIAL / EARNED'),description:String(input.description||'Use an earned StreetVerse advantage.'),unlockedAt:String(input.unlockedAt||new Date().toISOString())}
  specialRouteUnlockState.set(missionId,record)
  emit('tryamm:mission:special-route-unlocked',record)
  emit('tryamm:world-memory:record',{...record,type:'mission-special-route-unlock'})
  return record
}

function resolveSpecialRouteUnlock(missionId:string){
  return specialRouteUnlockState.get(missionId)||specialRouteUnlockState.get('session-active')
}

export function selectStreetVerseMissionRoute(input:MissionRouteSelection){
  if(!isRouteChoice(input.choice))return{selected:false,reason:'invalid-route-choice'}
  const missionId=String(input.missionId||'session-active')
  const special=input.choice==='D'?resolveSpecialRouteUnlock(missionId):undefined
  if(input.choice==='D'&&!special&&!input.specialUnlocked)return{selected:false,reason:'special-route-not-unlocked',missionId}
  const selectedAt=new Date().toISOString()
  const record={
    ...input,
    missionId,
    label:input.label||special?.label||ROUTE_LABELS[input.choice],
    routeDescription:input.routeDescription||special?.description,
    specialUnlocked:input.choice==='D'?true:input.specialUnlocked,
    unlockKind:input.unlockKind||special?.kind,
    unlockSource:input.unlockSource||special?.source,
    selectedAt
  }
  missionRouteState.set(missionId,record)
  if(input.choice==='D'&&special){
    specialRouteUnlockState.delete(special.missionId)
    if(special.missionId!=='session-active')specialRouteUnlockState.delete('session-active')
  }
  persistMissionRoutes()
  const prefer=ROUTE_PREFERENCES[input.choice]
  emit('tryamm:mission:route-active',{...record,prefer})
  emit('tryamm:world-memory:record',{...record,prefer,type:'mission-route-choice'})
  emit('tryamm:mission:next-candidate',{sourceMissionId:missionId,routeChoice:input.choice,reason:'player-route-choice',prefer})
  emit('tryamm:toast',{message:`Route ${input.choice} • ${record.label} selected`})
  return{selected:true,...record,prefer}
}

export function discoverStreetVerseMission(mission:MissionDiscovery){const record={...mission,status:'discovered' as const,discoveredAt:new Date().toISOString()};missionState.set(mission.missionId,record);emit('tryamm:mission:discovered',record);emit('tryamm:world-memory:record',{...record,type:'mission-discovery'});if(mission.rarity==='secret'||mission.rarity==='mythic')emit('tryamm:easter-egg:found',record);if(mission.crossVerseDestination)emit('tryamm:cross-verse:clue',{missionId:mission.missionId,destination:mission.crossVerseDestination,clue:mission.clue});return record}
export function triggerStreetVerseSecret(trigger:SecretTrigger){const allowed=adultGate(trigger);if(!allowed){const denied={allowed:false,secretId:trigger.secretId,reason:'adult-gate-required'};emit('tryamm:after-dark:mission-gate',denied);return denied}const record={...trigger,allowed:true,triggeredAt:new Date().toISOString()};secretState.set(trigger.secretId,{state:'discovered',updatedAt:record.triggeredAt});emit('tryamm:secret:triggered',record);emit('tryamm:secret-area:unlocked',{secretId:trigger.secretId,state:'unlocked',trigger:trigger.type});secretState.set(trigger.secretId,{state:'unlocked',updatedAt:record.triggeredAt});emit('tryamm:world-memory:record',{...record,type:'secret-discovery'});return record}
export function completeStreetVerseMission(missionId:string,outcome:Record<string,unknown>={}){
  const mission=missionState.get(missionId)
  if(!mission)return{completed:false,missionId,reason:'mission-not-discovered'}
  const route=resolveMissionRoute(missionId)
  const missionRoute=route?{choice:route.choice,label:route.label||ROUTE_LABELS[route.choice],routeDescription:route.routeDescription,selectedAt:route.selectedAt}:undefined
  const resolvedOutcome=missionRoute?{...outcome,missionRoute}:outcome
  const record={...mission,status:'completed' as const,completedAt:new Date().toISOString(),outcome:resolvedOutcome}
  missionState.set(missionId,record)
  const routePrefer=route?ROUTE_PREFERENCES[route.choice]:undefined
  const prefer:MissionCategory[]=mission.rarity==='mythic'
    ? Array.from(new Set<MissionCategory>(['cross-verse','reality-quest',...(routePrefer||[])]))
    : routePrefer||['story','exploration','business']
  emit('tryamm:mission:completed',record)
  emit('tryamm:mission:consequence',{missionId,rarity:mission.rarity,category:mission.category,outcome:resolvedOutcome,missionRoute,destinations:['world-memory','relationships','crew-reputation','business-network','creator-content','command-nexus']})
  emit('tryamm:world-memory:record',{...record,type:'mission-consequence'})
  emit('tryamm:mission:next-candidate',{sourceMissionId:missionId,routeChoice:route?.choice,reason:route?'completed-player-route':'mission-complete',prefer})
  return record
}
export function bridgeStreetVerseWorldCompletion(detail:StreetVerseWorldCompletion){
  const missionId=String(detail.missionId||detail.id||'')
  if(!missionId)return{completed:false,reason:'missing-world-mission-id'}
  const existing=missionState.get(missionId)
  if(existing?.status==='completed')return existing
  if(!existing){
    discoverStreetVerseMission({
      missionId,
      title:String(detail.label||'StreetVerse World Mission'),
      rarity:'common',
      category:'exploration',
      playerId:'streetverse-player',
      locationId:detail.communityAreaNumber?String(detail.communityAreaNumber):undefined,
      metadata:{source:detail.source||'streetverse-world',communityAreaName:detail.communityAreaName,mobileSafeMode:Boolean(detail.mobileSafeMode),htmlCity:Boolean(detail.htmlCity),mobileLite:Boolean(detail.mobileLite)},
    })
  }
  const worldCompletion={
    source:detail.source||'streetverse-world',
    visited:Array.isArray(detail.visited)?detail.visited.map(String):[],
    total:Number(detail.total||0),
    vehicle:Boolean(detail.vehicle),
    mobileSafeMode:Boolean(detail.mobileSafeMode),
    htmlCity:Boolean(detail.htmlCity),
    mobileLite:Boolean(detail.mobileLite),
    communityAreaNumber:detail.communityAreaNumber,
    communityAreaName:detail.communityAreaName,
  }
  return completeStreetVerseMission(missionId,{sourceEvent:'tryamm:streetverse-mission-complete',worldCompletion})
}
export function buildLivingMysteryContext(input:{playerId:string;timeOfDay?:string;weather?:string;neighborhood?:string;reputation?:number;crewId?:string;relationshipStates?:string[];businessStates?:string[];worldMemoryKeys?:string[]}){const context={...input,generatedAt:new Date().toISOString(),directors:['time','weather','location','reputation','crew','relationships','business-state','world-memory']};emit('tryamm:living-mystery:context',context);return context}
export function buildRealityQuest(input:{questId:string;playerId:string;virtualStart:string;optionalRealWorldClue?:string;approvedLocationId?:string;xrEncounter?:string;accessibilityVirtualAlternative:string}){const quest={...input,stages:['virtual-discovery','optional-reality-bridge','ar-xr-encounter','streetverse-return','world-memory'],rightsAndLocationApprovalRequired:Boolean(input.approvedLocationId),generatedAt:new Date().toISOString()};emit('tryamm:reality-quest:created',quest);return quest}
export function getStreetVerseMissionDiscoveryState(){return{missions:[...missionState.values()],routes:[...missionRouteState.values()],specialRoutes:[...specialRouteUnlockState.values()],secrets:[...secretState.entries()].map(([secretId,value])=>({secretId,...value}))}}

export function installStreetVerseMissionDiscoveryRuntime(){
  const runtime=window as unknown as Record<string,unknown>
  if(runtime.__streetVerseMissionDiscoveryRuntimeInstalled)return
  runtime.__streetVerseMissionDiscoveryRuntimeInstalled=true
  loadMissionRoutes()
  runtime.__discoverStreetVerseMission=discoverStreetVerseMission
  runtime.__triggerStreetVerseSecret=triggerStreetVerseSecret
  runtime.__selectStreetVerseMissionRoute=selectStreetVerseMissionRoute
  runtime.__unlockStreetVerseMissionRouteD=unlockStreetVerseMissionRouteD
  runtime.__completeStreetVerseMission=completeStreetVerseMission
  runtime.__bridgeStreetVerseWorldCompletion=bridgeStreetVerseWorldCompletion
  runtime.__getStreetVerseMissionDiscoveryState=getStreetVerseMissionDiscoveryState
  runtime.__buildStreetVerseLivingMysteryContext=buildLivingMysteryContext
  runtime.__buildStreetVerseRealityQuest=buildRealityQuest
  window.addEventListener('tryamm:streetverse-special-route-unlock',(event:Event)=>unlockStreetVerseMissionRouteD((event as CustomEvent<MissionSpecialRouteUnlock>).detail||({kind:'information',label:'SPECIAL / EARNED',description:'Earned StreetVerse route'} as MissionSpecialRouteUnlock)))
  window.addEventListener('tryamm:streetverse-mission-route-selected',(event:Event)=>selectStreetVerseMissionRoute((event as CustomEvent<MissionRouteSelection>).detail))
  window.addEventListener('tryamm:streetverse-mission-complete',(event:Event)=>bridgeStreetVerseWorldCompletion((event as CustomEvent<StreetVerseWorldCompletion>).detail||{}))
  installBennyOmniHostRuntime()
  installFounderPocketDimensionRuntime()
  emit('tryamm:mission-discovery:ready',{rarities:['common','uncommon','rare','legendary','secret','mythic'],systems:['mission-compiler','living-mystery-director','mission-route-consequences','contextual-special-route-d','easter-eggs','secret-areas','cross-verse-clues','world-memory','reality-quests','adult-gated-after-dark','benny-omnihost','founder-pocket-dimension','all-american-app-store'],interfaceLadder:['phone-3d','ar','vr-mr','spatial-display','compatible-holographic-display','haptics','experimental-construct-interface'],boundaries:{adultLane18Plus:true,noMinorsInAdultLane:true,nonGraphicAdultPresentationOnly:true,noPublicIntimateTelemetry:true,noIntimateAdTargeting:true,physicalHologramClaimsRequireHardwareValidation:true,appStoreDistributionRequiresPlatformApproval:true}})
}
