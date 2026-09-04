export type AIFactoryLaneId='llm'|'vision_ocr'|'image'|'video'|'audio'|'world_3d'|'game_agents'
export type ExecutionState='available'|'blocked'|'unknown'
export type ProviderOwnership='owned'|'self-hosted'|'cloud'

export type AIFactoryProvider={
  id:string
  name:string
  ownership:ProviderOwnership
  lanes:AIFactoryLaneId[]
  configured:boolean
  healthy:boolean|null
  model?:string|null
}

export type AIFactoryLane={
  id:AIFactoryLaneId
  label:string
  purpose:string
  architectureReady:true
  execution:ExecutionState
  selectedProvider:string|null
  providers:AIFactoryProvider[]
}

export type AIFactorySnapshot={
  service:'Stubbs AI Model Router / AI Factory'
  architectureReady:true
  ownedGpuConnected:boolean
  ownedGpuProvider:string|null
  fullMovieRenderReady:boolean
  lanes:AIFactoryLane[]
  source:'local-architecture'|'server-health'
  checkedAt:string
}

export const AI_FACTORY_LANES:{id:AIFactoryLaneId;label:string;purpose:string}[]=[
  {id:'llm',label:'LLM / REASONING',purpose:'HoloGPT direction, scripts, planning, agents and code'},
  {id:'vision_ocr',label:'VISION / OCR',purpose:'reference analysis, continuity inspection, captions and documents'},
  {id:'image',label:'IMAGE',purpose:'character sheets, keyframes, storyboards and image edits'},
  {id:'video',label:'VIDEO',purpose:'shot rendering, motion, lip sync and cinematic generation'},
  {id:'audio',label:'AUDIO',purpose:'voices, dialogue, sound design, music and mastering'},
  {id:'world_3d',label:'3D / WORLD',purpose:'StreetVerse sets, props, characters, environments and world assets'},
  {id:'game_agents',label:'GAME AGENTS',purpose:'NPC intelligence, mission agents, simulation and interactive direction'},
]

export function localFactorySnapshot():AIFactorySnapshot{
  return {
    service:'Stubbs AI Model Router / AI Factory',
    architectureReady:true,
    ownedGpuConnected:false,
    ownedGpuProvider:null,
    fullMovieRenderReady:false,
    source:'local-architecture',
    checkedAt:new Date().toISOString(),
    lanes:AI_FACTORY_LANES.map(lane=>({...lane,architectureReady:true as const,execution:'blocked' as const,selectedProvider:null,providers:[]})),
  }
}

function laneId(value:unknown):AIFactoryLaneId|null{
  return AI_FACTORY_LANES.some(x=>x.id===value)?value as AIFactoryLaneId:null
}

export function factorySnapshotFromHealth(raw:any):AIFactorySnapshot{
  const fallback=localFactorySnapshot()
  if(!raw||raw.architectureReady!==true||!Array.isArray(raw.lanes))return fallback
  const serverLanes=new Map<AIFactoryLaneId,AIFactoryLane>()
  for(const item of raw.lanes){
    const id=laneId(item?.id);if(!id)continue
    const meta=AI_FACTORY_LANES.find(x=>x.id===id)!
    const providers=Array.isArray(item.providers)?item.providers.map((provider:any)=>({
      id:String(provider?.id||''),name:String(provider?.name||provider?.id||'provider'),ownership:['owned','self-hosted','cloud'].includes(provider?.ownership)?provider.ownership:'cloud',lanes:Array.isArray(provider?.lanes)?provider.lanes.filter((x:any)=>laneId(x)):[],configured:provider?.configured===true,healthy:provider?.healthy===true?true:provider?.healthy===false?false:null,model:provider?.model?String(provider.model):null,
    } as AIFactoryProvider)):[]
    const execution:ExecutionState=item?.execution==='available'?'available':item?.execution==='unknown'?'unknown':'blocked'
    serverLanes.set(id,{...meta,architectureReady:true,execution,selectedProvider:item?.selectedProvider?String(item.selectedProvider):null,providers})
  }
  const lanes=AI_FACTORY_LANES.map(meta=>serverLanes.get(meta.id)||fallback.lanes.find(x=>x.id===meta.id)!)
  return {
    service:'Stubbs AI Model Router / AI Factory',architectureReady:true,
    ownedGpuConnected:raw.ownedGpuConnected===true,ownedGpuProvider:raw.ownedGpuProvider?String(raw.ownedGpuProvider):null,
    fullMovieRenderReady:raw.fullMovieRenderReady===true,lanes,source:'server-health',checkedAt:String(raw.checkedAt||new Date().toISOString()),
  }
}

export function laneReady(snapshot:AIFactorySnapshot,id:AIFactoryLaneId){return snapshot.lanes.find(l=>l.id===id)?.execution==='available'}
