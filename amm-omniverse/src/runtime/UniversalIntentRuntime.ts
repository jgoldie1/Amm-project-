export type IntentName=
  |'MOVE_LEFT'|'MOVE_RIGHT'|'FORWARD'|'BACK'|'STOP'
  |'SELECT'|'INTERACT'|'JUMP'|'SPRINT'|'VEHICLE_ENTER'|'VEHICLE_EXIT'
  |'CAMERA'|'REEL'|'MAP'|'MISSION'|'HOLOGPT'|'MENU'|'HOME'

export type SignalSource='eeg'|'eog'|'emg'|'gaze'|'head'|'face'|'voice'|'touch'|'controller'

export type IntentSignal={
  source:SignalSource
  intent:IntentName
  confidence:number
  timestamp:number
  artifact?:number
  quality?:number
}

export type FusedIntent={
  intent:IntentName
  confidence:number
  agreement:number
  sources:SignalSource[]
  timestamp:number
  latencyMs:number
}

const clamp01=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0))
const now=()=>typeof performance!=='undefined'?performance.now():Date.now()

/**
 * Neural Noise-Canceling Buffer (NNCB)
 * Software artifact/noise rejection for NON-INVASIVE biosignal intent adapters.
 * It does not read unrestricted thoughts and it is not a medical device.
 */
export class NeuralNoiseCancelingBuffer{
  private readonly windowMs:number
  private readonly history:IntentSignal[]=[]
  private baselines=new Map<SignalSource,number>()

  constructor(windowMs=420){this.windowMs=Math.max(80,windowMs)}

  push(input:IntentSignal):IntentSignal|null{
    const t=Number.isFinite(input.timestamp)?input.timestamp:now()
    const confidence=clamp01(input.confidence)
    const artifact=clamp01(input.artifact??0)
    const quality=clamp01(input.quality??1)

    const previous=this.baselines.get(input.source)??0
    const observed=Math.max(0,artifact+(1-quality)*.5)
    const baseline=previous*.94+observed*.06
    this.baselines.set(input.source,baseline)

    const noisePenalty=Math.min(.9,artifact*.7+(1-quality)*.45+baseline*.25)
    const cleaned=clamp01(confidence*(1-noisePenalty))
    const sample:{source:SignalSource;intent:IntentName;confidence:number;timestamp:number;artifact:number;quality:number}={
      source:input.source,intent:input.intent,confidence:cleaned,timestamp:t,artifact,quality
    }

    this.history.push(sample)
    const cutoff=t-this.windowMs
    while(this.history.length&&this.history[0].timestamp<cutoff)this.history.shift()

    if(artifact>.72||quality<.22||cleaned<.2)return null
    return sample
  }

  recent(intent?:IntentName){
    return intent?this.history.filter(s=>s.intent===intent):[...this.history]
  }

  clear(){this.history.length=0}
}

export class SensorFusionEngine{
  private readonly weights:Record<SignalSource,number>={
    eeg:1,eog:.82,emg:.92,gaze:.88,head:.72,face:.72,voice:.96,touch:1,controller:1
  }

  fuse(samples:IntentSignal[],windowMs=320):FusedIntent|null{
    if(!samples.length)return null
    const newest=Math.max(...samples.map(s=>s.timestamp))
    const active=samples.filter(s=>newest-s.timestamp<=windowMs)
    if(!active.length)return null

    const scores=new Map<IntentName,{score:number;weight:number;sources:Set<SignalSource>;first:number}>()
    for(const s of active){
      const w=(this.weights[s.source]??.7)*clamp01(s.quality??1)
      const row=scores.get(s.intent)??{score:0,weight:0,sources:new Set<SignalSource>(),first:s.timestamp}
      row.score+=clamp01(s.confidence)*w
      row.weight+=w
      row.sources.add(s.source)
      row.first=Math.min(row.first,s.timestamp)
      scores.set(s.intent,row)
    }

    let best:IntentName|null=null,bestScore=-1
    for(const [intent,row] of scores){
      const agreement=Math.min(1,row.sources.size/3)
      const score=(row.weight?row.score/row.weight:0)*(.78+.22*agreement)
      if(score>bestScore){best=intent;bestScore=score}
    }
    if(!best)return null
    const row=scores.get(best)!
    const agreement=Math.min(1,row.sources.size/3)
    return {intent:best,confidence:clamp01(bestScore),agreement,sources:[...row.sources],timestamp:newest,latencyMs:Math.max(0,now()-row.first)}
  }
}

export class QuantumLagBuster{
  private ewmaMs=0
  private samples=0
  private lastSeq=0

  accept(seq:number,sentAt:number){
    if(seq<=this.lastSeq)return false
    this.lastSeq=seq
    const latency=Math.max(0,now()-sentAt)
    this.ewmaMs=this.samples?this.ewmaMs*.82+latency*.18:latency
    this.samples++
    return latency<1500
  }

  observe(latencyMs:number){
    const l=Math.max(0,latencyMs)
    this.ewmaMs=this.samples?this.ewmaMs*.82+l*.18:l
    this.samples++
  }

  get latencyMs(){return Math.round(this.ewmaMs)}
  get health(){return this.ewmaMs<80?'green':this.ewmaMs<180?'yellow':'red'}
  reset(){this.lastSeq=0;this.ewmaMs=0;this.samples=0}
}

export class QuantumSpeedEngine{
  private pending=new Map<IntentName,FusedIntent>()
  private scheduled=false
  constructor(private readonly deliver:(intent:FusedIntent)=>void){}

  enqueue(intent:FusedIntent){
    if(intent.intent==='STOP'){
      this.pending.clear()
      this.deliver(intent)
      return
    }
    this.pending.set(intent.intent,intent)
    if(this.scheduled)return
    this.scheduled=true
    queueMicrotask(()=>{
      this.scheduled=false
      const priority:IntentName[]=['FORWARD','BACK','MOVE_LEFT','MOVE_RIGHT','SPRINT','JUMP','INTERACT','SELECT','VEHICLE_ENTER','VEHICLE_EXIT','CAMERA','REEL','MAP','MISSION','HOLOGPT','MENU','HOME']
      for(const key of priority){
        const next=this.pending.get(key)
        if(next){this.pending.delete(key);this.deliver(next)}
      }
    })
  }
}

function toControllerInput(intent:IntentName){
  switch(intent){
    case'MOVE_LEFT':return{x:-1,y:0,buttons:{}}
    case'MOVE_RIGHT':return{x:1,y:0,buttons:{}}
    case'FORWARD':return{x:0,y:-1,buttons:{}}
    case'BACK':return{x:0,y:1,buttons:{}}
    case'STOP':return{x:0,y:0,buttons:{stop:true}}
    case'SPRINT':return{x:0,y:0,buttons:{sprint:true}}
    case'SELECT':return{x:0,y:0,buttons:{primary:true}}
    case'INTERACT':return{x:0,y:0,buttons:{interact:true}}
    case'JUMP':return{x:0,y:0,buttons:{jump:true}}
    case'VEHICLE_ENTER':return{x:0,y:0,buttons:{vehicleEnter:true}}
    case'VEHICLE_EXIT':return{x:0,y:0,buttons:{vehicleExit:true}}
    case'CAMERA':return{x:0,y:0,buttons:{camera:true}}
    case'REEL':return{x:0,y:0,buttons:{reel:true}}
    case'MAP':return{x:0,y:0,buttons:{map:true}}
    case'MISSION':return{x:0,y:0,buttons:{mission:true}}
    case'HOLOGPT':return{x:0,y:0,buttons:{hologpt:true}}
    case'MENU':return{x:0,y:0,buttons:{menu:true}}
    case'HOME':return{x:0,y:0,buttons:{home:true}}
  }
}

let runtime:ReturnType<typeof createRuntime>|null=null
function createRuntime(){
  const buffer=new NeuralNoiseCancelingBuffer()
  const fusion=new SensorFusionEngine()
  const lag=new QuantumLagBuster()
  let seq=0
  let lastActionAt=0

  const speed=new QuantumSpeedEngine((fused)=>{
    const t=now()
    const threshold=fused.intent==='STOP'?.45:.68
    const cooldown=fused.intent==='STOP'?0:90
    if(fused.confidence<threshold||t-lastActionAt<cooldown)return
    lastActionAt=t
    lag.observe(fused.latencyMs)
    const detail={...toControllerInput(fused.intent),intent:fused.intent,confidence:fused.confidence,sources:fused.sources,seq:++seq,timestamp:t}
    window.dispatchEvent(new CustomEvent('tryamm:universal-controller-input',{detail}))
    window.dispatchEvent(new CustomEvent('tryamm:intent-status',{detail:{...fused,lagMs:lag.latencyMs,lagHealth:lag.health}}))
  })

  const submit=(raw:IntentSignal)=>{
    const cleaned=buffer.push(raw)
    if(!cleaned)return null
    const fused=fusion.fuse(buffer.recent(cleaned.intent))
    if(fused)speed.enqueue(fused)
    return fused
  }

  return{buffer,fusion,lag,speed,submit,reset:()=>{buffer.clear();lag.reset()}}
}

export function installUniversalIntentRuntime(){
  if(typeof window==='undefined')return null
  if(runtime)return runtime
  runtime=createRuntime()
  window.addEventListener('tryamm:noninvasive-signal',(e:Event)=>{
    const d=(e as CustomEvent<IntentSignal>).detail
    if(d?.source&&d?.intent)runtime?.submit(d)
  })
  ;(window as any).__tryammIntent={
    submit:(signal:IntentSignal)=>runtime?.submit({...signal,timestamp:signal.timestamp??now()}),
    stop:()=>runtime?.submit({source:'touch',intent:'STOP',confidence:1,quality:1,artifact:0,timestamp:now()}),
    reset:()=>runtime?.reset(),
    note:'Non-invasive intent adapter API. EEG/EOG/EMG devices must provide calibrated intent/confidence samples; this runtime does not read unrestricted thoughts.'
  }
  return runtime
}
