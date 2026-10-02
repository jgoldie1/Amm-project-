export type TryammSystemId=
  |'core'
  |'streetverse-world'
  |'characters'
  |'missions'
  |'vehicles'
  |'creator-media'
  |'live'
  |'global'
  |'meshy-assets'
  |'world-forger'
  |'commerce'
  |'delivery'
  |'print-network'
  |'hologpt'
  |'omniverse'
  |'accessibility'

export type TryammSystemStatus='unknown'|'loading'|'ready'|'degraded'|'blocked'|'failed'

export interface TryammSystemSignal{
  system:TryammSystemId
  status:TryammSystemStatus
  source:string
  reason?:string
  evidence?:Record<string,unknown>
  at?:string
}

export interface TryammSystemNode extends TryammSystemSignal{
  dependencies:TryammSystemId[]
  at:string
}

export interface TryammSystemFabricSnapshot{
  schema:'tryamm.system-fabric.v1'
  overall:'READY'|'DEGRADED'|'BLOCKED'|'STARTING'
  systems:Record<TryammSystemId,TryammSystemNode>
  ready:number
  degraded:number
  blocked:number
  failed:number
  unknown:number
  dependencyProblems:Array<{system:TryammSystemId;dependency:TryammSystemId;dependencyStatus:TryammSystemStatus}>
  updatedAt:string
}

const DEPENDENCIES:Record<TryammSystemId,TryammSystemId[]>={
  core:[],
  'streetverse-world':['core'],
  characters:['core'],
  missions:['core'],
  vehicles:['streetverse-world'],
  'creator-media':['core'],
  live:['core'],
  global:['streetverse-world','characters','missions'],
  'meshy-assets':['core'],
  'world-forger':['core','meshy-assets'],
  commerce:['core'],
  delivery:['commerce'],
  'print-network':['commerce','meshy-assets'],
  hologpt:['core'],
  omniverse:['core'],
  accessibility:['core'],
}

const SYSTEMS=Object.keys(DEPENDENCIES) as TryammSystemId[]
let installed=false
let state:Record<TryammSystemId,TryammSystemNode>

const now=()=>new Date().toISOString()

function blankState(){
  return Object.fromEntries(SYSTEMS.map(system=>[system,{
    system,
    status:system==='core'?'ready':'unknown',
    source:system==='core'?'system-fabric-bootstrap':'unobserved',
    dependencies:DEPENDENCIES[system],
    at:now(),
  }])) as Record<TryammSystemId,TryammSystemNode>
}

function computeSnapshot():TryammSystemFabricSnapshot{
  const nodes=state||blankState()
  const values=Object.values(nodes)
  const dependencyProblems:Array<{system:TryammSystemId;dependency:TryammSystemId;dependencyStatus:TryammSystemStatus}>=[]
  for(const node of values){
    for(const dependency of node.dependencies){
      const dependencyStatus=nodes[dependency]?.status||'unknown'
      if(!['ready','degraded'].includes(dependencyStatus))dependencyProblems.push({system:node.system,dependency,dependencyStatus})
    }
  }
  const ready=values.filter(node=>node.status==='ready').length
  const degraded=values.filter(node=>node.status==='degraded').length
  const blocked=values.filter(node=>node.status==='blocked').length
  const failed=values.filter(node=>node.status==='failed').length
  const unknown=values.filter(node=>node.status==='unknown'||node.status==='loading').length
  const overall:TryammSystemFabricSnapshot['overall']=failed||blocked?'BLOCKED':degraded?'DEGRADED':unknown?'STARTING':'READY'
  return{schema:'tryamm.system-fabric.v1',overall,systems:nodes,ready,degraded,blocked,failed,unknown,dependencyProblems,updatedAt:now()}
}

function publish(){
  if(typeof window==='undefined')return
  const snapshot=computeSnapshot()
  try{sessionStorage.setItem('tryamm.system-fabric.v1',JSON.stringify(snapshot))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:system-fabric-state',{detail:snapshot}))
}

export function signalTryammSystem(input:TryammSystemSignal){
  if(typeof window==='undefined')return
  if(!SYSTEMS.includes(input.system))return
  if(!state)state=blankState()
  state[input.system]={
    ...state[input.system],
    ...input,
    dependencies:DEPENDENCIES[input.system],
    at:input.at||now(),
  }
  publish()
}

export function getTryammSystemFabricSnapshot(){
  if(!state)state=blankState()
  return computeSnapshot()
}

function detail(event:Event){return (event as CustomEvent<Record<string,unknown>>).detail||{}}

function installLegacyAdapters(){
  const adapters:Array<[string,(event:Event)=>void]>=[
    ['tryamm:streetverse-native-mobile-ready',event=>{
      const d=detail(event)
      const failed=Number(d.failed||0)
      signalTryammSystem({system:'streetverse-world',status:failed>0?'degraded':'ready',source:event.type,reason:failed>0?`${failed} native assets failed to load`:undefined,evidence:d})
    }],
    ['tryamm:streetverse-hero-visual-authority',event=>{
      const d=detail(event)
      signalTryammSystem({system:'characters',status:d.authoritative3DMesh||d.active3DMesh?'ready':'degraded',source:event.type,evidence:d})
    }],
    ['tryamm:universal-mission-start',event=>signalTryammSystem({system:'missions',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:universal-mission-objective',event=>signalTryammSystem({system:'missions',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:streetverse-vehicle-controlled',event=>signalTryammSystem({system:'vehicles',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:media-studio-output-ready',event=>signalTryammSystem({system:'creator-media',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:media-publish-queued',event=>signalTryammSystem({system:'creator-media',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:streetverse-global-character-select',event=>signalTryammSystem({system:'global',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:global-city-select',event=>signalTryammSystem({system:'global',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:omniverse-fabric-state',event=>signalTryammSystem({system:'omniverse',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:universal-intent-ready',event=>signalTryammSystem({system:'accessibility',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:open-hologpt',event=>signalTryammSystem({system:'hologpt',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:live-room-ready',event=>signalTryammSystem({system:'live',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:commerce-order-paid',event=>signalTryammSystem({system:'commerce',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:delivery-tracking-update',event=>signalTryammSystem({system:'delivery',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:meshy-asset-ready',event=>signalTryammSystem({system:'meshy-assets',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:world-forger-plan',event=>signalTryammSystem({system:'world-forger',status:'ready',source:event.type,evidence:detail(event)})],
    ['tryamm:print-network-ready',event=>signalTryammSystem({system:'print-network',status:'ready',source:event.type,evidence:detail(event)})],
  ]
  adapters.forEach(([name,handler])=>window.addEventListener(name,handler))
  return()=>adapters.forEach(([name,handler])=>window.removeEventListener(name,handler))
}

export function installTryammSystemFabricRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true
  state=blankState()
  const disposeLegacy=installLegacyAdapters()
  const onSignal=(event:Event)=>{
    const d=(event as CustomEvent<TryammSystemSignal>).detail
    if(d?.system&&d?.status)signalTryammSystem(d)
  }
  const onQuery=()=>publish()
  window.addEventListener('tryamm:system-fabric-signal',onSignal)
  window.addEventListener('tryamm:system-fabric-query',onQuery)
  ;(window as Window&{__tryammSystemFabric?:{snapshot:()=>TryammSystemFabricSnapshot;signal:(input:TryammSystemSignal)=>void}}).__tryammSystemFabric={
    snapshot:getTryammSystemFabricSnapshot,
    signal:signalTryammSystem,
  }
  publish()
  return()=>{
    disposeLegacy()
    window.removeEventListener('tryamm:system-fabric-signal',onSignal)
    window.removeEventListener('tryamm:system-fabric-query',onQuery)
    delete (window as Window&{__tryammSystemFabric?:unknown}).__tryammSystemFabric
    installed=false
  }
}
