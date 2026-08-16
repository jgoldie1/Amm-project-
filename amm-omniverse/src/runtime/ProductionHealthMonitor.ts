import { createRepairCandidate, scoreSignal, type HealingSeverity, type HealthSignal } from './SelfHealingRuntime'
import { persistHealingTelemetryBestEffort } from './healingTelemetry'

const MAX_MESSAGE=500
const TELEMETRY_MARKER='/functions/v1/self-healing-telemetry'
let installed=false
let seq=0

function id(prefix:string){ return `${prefix}-${Date.now()}-${++seq}` }
function text(value:unknown){
  if(value instanceof Error) return `${value.name}: ${value.message}`.slice(0,MAX_MESSAGE)
  if(typeof value==='string') return value.slice(0,MAX_MESSAGE)
  try{return JSON.stringify(value).slice(0,MAX_MESSAGE)}catch{return String(value).slice(0,MAX_MESSAGE)}
}

async function emit(subsystem:string,kind:string,severity:HealingSeverity,message:string,metadata:Record<string,unknown>={}){
  const signal:HealthSignal={id:id('health'),subsystem,kind,severity,message:text(message),occurredAt:Date.now(),metadata}
  const candidate=createRepairCandidate(signal)
  await persistHealingTelemetryBestEffort({signal,candidate,riskScore:scoreSignal(signal)})
}

function classifyStatus(status:number):HealingSeverity{
  if(status>=500) return 'error'
  if(status===429) return 'warning'
  if(status>=400) return 'warning'
  return 'info'
}

export function reportRuntimeHealth(input:{subsystem:string;kind:string;severity:HealingSeverity;message:string;metadata?:Record<string,unknown>}){
  return emit(input.subsystem,input.kind,input.severity,input.message,input.metadata||{})
}

export function installProductionHealthMonitor(){
  if(installed||typeof window==='undefined') return
  installed=true

  window.addEventListener('error',event=>{
    void emit('frontend','code-runtime-error','error',event.message||'Unhandled browser error',{
      filename:event.filename||null,line:event.lineno||null,column:event.colno||null,
    })
  })

  window.addEventListener('unhandledrejection',event=>{
    void emit('frontend','unhandled-promise-rejection','error',text(event.reason),{})
  })

  window.addEventListener('offline',()=>{void emit('network','provider-down','warning','Browser reported network offline')})
  window.addEventListener('online',()=>{void emit('network','provider-recovered','info','Browser network connection restored')})

  const originalFetch=window.fetch.bind(window)
  window.fetch=async (input:RequestInfo|URL,init?:RequestInit)=>{
    const url=typeof input==='string'?input:input instanceof URL?input.toString():input.url
    if(url.includes(TELEMETRY_MARKER)) return originalFetch(input,init)
    const started=performance.now()
    try{
      const response=await originalFetch(input,init)
      const elapsed=Math.round(performance.now()-started)
      if(!response.ok){
        void emit('api',response.status===429?'rate-limit':'provider-error',classifyStatus(response.status),`HTTP ${response.status} from ${new URL(url,location.href).pathname}`,{status:response.status,latencyMs:elapsed})
      }else if(elapsed>4000){
        void emit('api','latency-spike','warning',`Slow API response: ${elapsed}ms`,{latencyMs:elapsed,path:new URL(url,location.href).pathname})
      }
      return response
    }catch(error){
      const elapsed=Math.round(performance.now()-started)
      void emit('api','provider-down','error',text(error),{latencyMs:elapsed,path:new URL(url,location.href).pathname})
      throw error
    }
  }

  window.addEventListener('tryamm:live-health',event=>{
    const d=(event as CustomEvent).detail||{}
    const severity:HealingSeverity=d.severity||((d.packetLossPct||0)>8||(d.reconnects||0)>2?'warning':'info')
    void emit('livekit',d.kind||'stream-health',severity,d.message||'LIVE health update',{
      packetLossPct:d.packetLossPct||0,jitterMs:d.jitterMs||0,rttMs:d.rttMs||0,reconnects:d.reconnects||0,roomId:d.roomId||null,
    })
  })

  window.addEventListener('tryamm:game-health',event=>{
    const d=(event as CustomEvent).detail||{}
    void emit('gameverse',d.kind||'game-health',d.severity||'warning',d.message||'Game health update',{
      gameId:d.gameId||null,sessionId:d.sessionId||null,desyncMs:d.desyncMs||0,fps:d.fps||null,crashCount:d.crashCount||0,
    })
  })

  try{
    const observer=new PerformanceObserver(list=>{
      for(const entry of list.getEntries()){
        if(entry.duration>250) void emit('frontend','long-task','warning',`Long main-thread task: ${Math.round(entry.duration)}ms`,{durationMs:Math.round(entry.duration)})
      }
    })
    observer.observe({entryTypes:['longtask']})
  }catch{/* Long Task API is not supported in every browser. */}
}

export function publishLiveHealth(detail:Record<string,unknown>){
  window.dispatchEvent(new CustomEvent('tryamm:live-health',{detail}))
}

export function publishGameHealth(detail:Record<string,unknown>){
  window.dispatchEvent(new CustomEvent('tryamm:game-health',{detail}))
}
