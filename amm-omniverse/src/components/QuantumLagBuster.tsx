import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type Quality = 'auto'|'ultra'|'high'|'balanced'|'data-saver'
type LagMode = 'adaptive'|'competitive'|'streaming'|'battery-saver'

type Metrics = {
  rtt:number|null
  jitter:number|null
  downlink:number|null
  effectiveType:string
  fps:number|null
  online:boolean
}

function connectionInfo(){
  const c=(navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  return {downlink:typeof c?.downlink==='number'?c.downlink:null,effectiveType:String(c?.effectiveType||'unknown')}
}

export default function QuantumLagBuster({onClose}:{onClose:()=>void}){
  const [mode,setMode]=useState<LagMode>('adaptive')
  const [quality,setQuality]=useState<Quality>('auto')
  const [enabled,setEnabled]=useState(true)
  const [metrics,setMetrics]=useState<Metrics>({rtt:null,jitter:null,downlink:null,effectiveType:'unknown',fps:null,online:navigator.onLine})
  const lastPing=useRef<number[]>([])
  const raf=useRef<number|undefined>(undefined)

  useEffect(()=>{
    let frames=0; let started=performance.now()
    const tick=()=>{frames+=1;const now=performance.now();if(now-started>=1000){setMetrics(m=>({...m,fps:Math.round(frames*1000/(now-started))}));frames=0;started=now}raf.current=requestAnimationFrame(tick)}
    raf.current=requestAnimationFrame(tick)
    const online=()=>setMetrics(m=>({...m,online:navigator.onLine,...connectionInfo()}))
    window.addEventListener('online',online);window.addEventListener('offline',online)
    const timer=window.setInterval(()=>{
      const startedAt=performance.now()
      fetch('/favicon.ico',{method:'HEAD',cache:'no-store'}).then(()=>{
        const rtt=Math.round(performance.now()-startedAt)
        const arr=[...lastPing.current.slice(-5),rtt];lastPing.current=arr
        const avg=arr.reduce((a,b)=>a+b,0)/arr.length
        const jitter=Math.round(arr.reduce((a,b)=>a+Math.abs(b-avg),0)/arr.length)
        setMetrics(m=>({...m,rtt,jitter,...connectionInfo(),online:navigator.onLine}))
      }).catch(()=>setMetrics(m=>({...m,online:navigator.onLine,...connectionInfo()})))
    },4000)
    return()=>{if(raf.current)cancelAnimationFrame(raf.current);clearInterval(timer);window.removeEventListener('online',online);window.removeEventListener('offline',online)}
  },[])

  useEffect(()=>{
    const detail={enabled,mode,quality,metrics}
    document.documentElement.dataset.quantumLagBuster=enabled?'on':'off'
    document.documentElement.dataset.quantumQuality=quality
    document.documentElement.dataset.quantumMode=mode
    window.dispatchEvent(new CustomEvent('tryamm:quantum-lag-buster',{detail}))
  },[enabled,mode,quality,metrics])

  const health = !metrics.online?'OFFLINE':metrics.rtt==null?'MEASURING':metrics.rtt<80&&((metrics.jitter??0)<20)?'EXCELLENT':metrics.rtt<160?'GOOD':metrics.rtt<280?'STRESSED':'POOR'

  return <div role="dialog" aria-modal="true" aria-label="Quantum Lag Buster" style={s.shell}>
    <header style={s.header}><div><div style={s.eyebrow}>QUANTUM SPEED ENGINE</div><h2 style={{margin:'4px 0'}}>⚡ Quantum Lag Buster</h2><div style={s.muted}>Adaptive performance for LIVE, GameVerse, casting, OTT, Holoverse and shared worlds.</div></div><button onClick={onClose} aria-label="Close Quantum Lag Buster" style={s.close}>×</button></header>
    <main style={s.main}>
      <section style={s.card}><div style={s.statusRow}><strong>{health}</strong><span>{metrics.online?'ONLINE':'OFFLINE'}</span></div><div style={s.metrics}><Metric label="RTT" value={metrics.rtt==null?'—':`${metrics.rtt} ms`}/><Metric label="Jitter" value={metrics.jitter==null?'—':`${metrics.jitter} ms`}/><Metric label="Downlink" value={metrics.downlink==null?'—':`${metrics.downlink} Mbps`}/><Metric label="Network" value={metrics.effectiveType}/><Metric label="UI FPS" value={metrics.fps==null?'—':String(metrics.fps)}/></div></section>
      <section style={s.card}><h3>Mode</h3><div style={s.chips}>{(['adaptive','competitive','streaming','battery-saver'] as LagMode[]).map(v=><button key={v} onClick={()=>setMode(v)} style={{...s.chip,...(mode===v?s.active:{})}}>{v.replace('-',' ')}</button>)}</div><p style={s.note}>Adaptive balances quality and stability. Competitive prioritizes input/world-state responsiveness. Streaming protects audio/video continuity. Battery saver reduces effects and background work.</p></section>
      <section style={s.card}><h3>Quality policy</h3><div style={s.chips}>{(['auto','ultra','high','balanced','data-saver'] as Quality[]).map(v=><button key={v} onClick={()=>setQuality(v)} style={{...s.chip,...(quality===v?s.active:{})}}>{v.replace('-',' ')}</button>)}</div></section>
      <section style={s.card}><h3>Adaptive actions</h3><div style={s.grid}><span>✓ latency/jitter monitor</span><span>✓ network quality signal</span><span>✓ UI FPS monitor</span><span>✓ global quality events</span><span>→ bitrate/FPS downgrade hooks</span><span>→ world-state update throttling</span><span>→ texture/effect reduction</span><span>→ cast/OTT buffer policy</span><span>→ reconnect/backoff policy</span><span>→ weak-device mode</span></div><p style={s.note}>This does not eliminate internet latency. It detects bad conditions early and tells each subsystem how to degrade gracefully instead of freezing or disconnecting.</p></section>
      <button onClick={()=>setEnabled(v=>!v)} style={{...s.power,background:enabled?'#123145':'#35151c'}}>{enabled?'LAG BUSTER ON':'LAG BUSTER OFF'}</button>
    </main>
  </div>
}

function Metric({label,value}:{label:string;value:string}){return <div style={{padding:12,border:'1px solid rgba(255,255,255,.1)',borderRadius:14,background:'rgba(255,255,255,.04)'}}><div style={{fontSize:10,opacity:.6}}>{label}</div><strong style={{fontSize:18}}>{value}</strong></div>}
const s:Record<string,CSSProperties>={shell:{position:'fixed',inset:0,zIndex:10050,background:'linear-gradient(180deg,#02050d,#081729)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'},header:{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',background:'rgba(2,5,13,.96)',borderBottom:'1px solid rgba(115,239,255,.18)'},eyebrow:{fontSize:10,letterSpacing:2,fontWeight:900,opacity:.65},muted:{fontSize:12,opacity:.7},close:{width:46,height:46,borderRadius:14,border:'1px solid #345',background:'#0d1726',color:'#fff',fontSize:28},main:{maxWidth:980,margin:'0 auto',padding:16,display:'grid',gap:14},card:{padding:16,borderRadius:18,border:'1px solid rgba(115,239,255,.15)',background:'rgba(255,255,255,.045)'},statusRow:{display:'flex',justifyContent:'space-between',gap:12},metrics:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8,marginTop:12},chips:{display:'flex',flexWrap:'wrap',gap:8},chip:{padding:'9px 11px',borderRadius:999,border:'1px solid rgba(255,255,255,.16)',background:'#0c1627',color:'#fff',fontWeight:800,fontSize:11},active:{border:'1px solid #73efff',background:'#123145',boxShadow:'0 0 14px rgba(115,239,255,.18)'},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8,fontSize:12},note:{fontSize:11,opacity:.65,lineHeight:1.5},power:{minHeight:52,borderRadius:15,border:'1px solid #73efff88',color:'#fff',fontWeight:900,fontSize:15}}
