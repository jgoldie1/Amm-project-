export type HoloChannel='control'|'presence'|'construct'|'world-state'|'media'|'commerce'|'telemetry'
export type HoloPriority='critical'|'realtime'|'interactive'|'normal'|'background'

export type HoloNetworkPacket<T=unknown>={
  version:1
  id:string
  sessionId:string
  worldId:string
  zoneId?:string
  objectId?:string
  channel:HoloChannel
  priority:HoloPriority
  source:string
  target?:string
  payload:T
  createdAt:number
  ttlMs:number
}

const priorityRank:Record<HoloPriority,number>={critical:0,realtime:1,interactive:2,normal:3,background:4}
const now=()=>typeof performance!=='undefined'?performance.now():Date.now()
const makeId=()=>globalThis.crypto?.randomUUID?.()??`holo-${Date.now()}-${Math.random().toString(36).slice(2)}`
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

class SpatialSessionRouter{
  private queues=new Map<string,HoloNetworkPacket[]>()

  publish<T>(input:Omit<HoloNetworkPacket<T>,'version'|'id'|'createdAt'>):HoloNetworkPacket<T>{
    const packet:HoloNetworkPacket<T>={...input,version:1,id:makeId(),createdAt:now()}
    const key=`${packet.worldId}:${packet.sessionId}`
    const queue=this.queues.get(key)??[]
    queue.push(packet as HoloNetworkPacket)
    queue.sort((a,b)=>priorityRank[a.priority]-priorityRank[b.priority]||a.createdAt-b.createdAt)
    while(queue.length>256)queue.pop()
    this.queues.set(key,queue)
    emit('tryamm:holo-network-packet',packet)
    emit(`tryamm:holo-channel:${packet.channel}`,packet)
    return packet
  }

  drain(worldId:string,sessionId:string,limit=32){
    const key=`${worldId}:${sessionId}`
    const queue=this.queues.get(key)??[]
    const t=now()
    const valid=queue.filter(packet=>t-packet.createdAt<=packet.ttlMs)
    const batch=valid.splice(0,Math.max(1,Math.min(128,limit)))
    this.queues.set(key,valid)
    return batch
  }
}

class HoloStateSync{
  private state=new Map<string,{revision:number;value:unknown;updatedAt:number}>()

  set(objectId:string,value:unknown){
    const previous=this.state.get(objectId)
    const next={revision:(previous?.revision??0)+1,value,updatedAt:now()}
    this.state.set(objectId,next)
    emit('tryamm:holo-state', {objectId,...next})
    return next
  }

  get(objectId:string){return this.state.get(objectId)??null}
  remove(objectId:string){return this.state.delete(objectId)}
}

class HoloTrustGateway{
  authorize(packet:HoloNetworkPacket){
    if(!packet.sessionId||!packet.worldId)return{allowed:false,reason:'missing-session-or-world'}
    if(packet.ttlMs<=0||packet.ttlMs>120000)return{allowed:false,reason:'invalid-ttl'}
    if(packet.channel==='commerce'&&packet.priority==='critical')return{allowed:false,reason:'commerce-cannot-bypass-ledger-gates'}
    return{allowed:true,reason:'software-policy-pass'}
  }
}

let installed=false
export function installHolographicInternetRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const router=new SpatialSessionRouter()
  const state=new HoloStateSync()
  const trust=new HoloTrustGateway()

  const publish=<T>(input:Omit<HoloNetworkPacket<T>,'version'|'id'|'createdAt'>)=>{
    const provisional:HoloNetworkPacket<T>={...input,version:1,id:'pending',createdAt:now()}
    const auth=trust.authorize(provisional)
    if(!auth.allowed){emit('tryamm:holo-network-denied',{input,auth});return null}
    return router.publish(input)
  }

  ;(window as any).__holoInternet={
    publish,
    drain:(worldId:string,sessionId:string,limit?:number)=>router.drain(worldId,sessionId,limit),
    setState:(objectId:string,value:unknown)=>state.set(objectId,value),
    getState:(objectId:string)=>state.get(objectId),
    removeState:(objectId:string)=>state.remove(objectId),
    capabilities:{spatialSessions:true,priorityRouting:true,sharedObjectState:true,constructTransport:true,presenceTransport:true,providerTransport:'browser-event-adapter'},
    note:'Holographic Internet is a spatial software protocol layer over real internet transports. It does not claim a separate physical internet or zero-latency networking.'
  }

  window.addEventListener('tryamm:universal-controller-input',(event:Event)=>{
    const payload=(event as CustomEvent<unknown>).detail
    publish({sessionId:'local',worldId:'streetverse',channel:'control',priority:'critical',source:'universal-intent',payload,ttlMs:500})
  })

  window.addEventListener('tryamm:secs:frame',(event:Event)=>{
    const payload=(event as CustomEvent<{requestId?:string}>).detail
    publish({sessionId:'local',worldId:'construct-lab',objectId:payload?.requestId,channel:'construct',priority:'realtime',source:'secs',payload,ttlMs:3000})
  })

  emit('tryamm:holo-internet:ready',{status:'software-protocol',transport:'adapter-required-for-cross-device-network',channels:['control','presence','construct','world-state','media','commerce','telemetry']})
}
