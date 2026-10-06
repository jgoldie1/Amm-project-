import {useEffect,useMemo,useState} from 'react'
import {OCTOBER_PUBLIC_ALPHA_LOCK,octoberLaunchCounts,type OctoberLaunchLane} from '../data/OctoberLaunchLock'

type RuntimeReadiness={
  profiles?:{streetverse?:{ready?:boolean};tryamm?:{ready?:boolean}}
  commerce?:{ready?:boolean}
  checks?:Record<string,boolean>
}
type LiveStatus={configured?:boolean;readyForPublic?:boolean;missing?:string[]}
type ReleaseState={ok?:boolean;commitSha?:string;environment?:string}

export default function OctoberLaunchLockCenter(){
  const [runtime,setRuntime]=useState<RuntimeReadiness|null>(null)
  const [live,setLive]=useState<LiveStatus|null>(null)
  const [release,setRelease]=useState<ReleaseState|null>(null)
  const [error,setError]=useState('')
  const counts=octoberLaunchCounts()

  const refresh=async()=>{
    setError('')
    try{
      const [r,l,s]=await Promise.all([
        fetch('/api/readiness?profile=streetverse',{cache:'no-store'}).then(x=>x.json()),
        fetch('/api/live/status',{cache:'no-store'}).then(x=>x.json()),
        fetch('/api/system/release',{cache:'no-store'}).then(x=>x.json()),
      ])
      setRuntime(r);setLive(l);setRelease(s)
    }catch(e){setError(e instanceof Error?e.message:'Readiness check failed')}
  }
  useEffect(()=>{void refresh()},[])

  const alphaReady=useMemo(()=>Boolean(
    release?.ok&&release?.environment==='production'&&
    runtime?.profiles?.streetverse?.ready&&
    runtime?.profiles?.tryamm?.ready&&
    counts.hardBlockers===0
  ),[release,runtime,counts.hardBlockers])

  const stateColor=(lane:OctoberLaunchLane)=>lane.state==='LAUNCH'?'#7cffad':lane.state==='DEGRADED'?'#6de3ff':lane.state==='PROVIDER_GATED'?'#ffd166':lane.state==='REGULATED'?'#ff9b69':'#c5a4ff'

  return <main style={page}>
    <header style={hero}>
      <div>
        <div style={eyebrow}>TRYAMM • OCTOBER PUBLIC ALPHA LOCK</div>
        <h1 style={{margin:'7px 0 5px'}}>LOCK IN. FINISH. LAUNCH.</h1>
        <p style={copy}>No new scope is allowed to block the web/PWA public alpha. Provider and regulated lanes degrade honestly instead of making the whole super app look unfinished.</p>
      </div>
      <div style={{...badge,borderColor:alphaReady?'#7cffad88':'#ffd16688',color:alphaReady?'#7cffad':'#ffd166'}}>{alphaReady?'PUBLIC ALPHA READY':'CHECKING / GATED'}</div>
    </header>

    {error&&<div style={errorBox}>{error}</div>}

    <section style={stats}>
      <Stat value={String(counts.launchable)} label="LAUNCH LANES"/>
      <Stat value={String(counts.hardBlockers)} label="HARD BLOCKERS"/>
      <Stat value={live?.configured?'ON':'OFF'} label="LIVEKIT"/>
      <Stat value={runtime?.commerce?.ready?'ON':'OFF'} label="REAL MONEY"/>
    </section>

    <section style={panel}>
      <div style={sectionHead}><div><div style={eyebrow}>LAUNCH SET</div><h2 style={{margin:'4px 0'}}>What ships in public alpha</h2></div><button onClick={()=>void refresh()} style={button}>↻ REFRESH</button></div>
      <div style={grid}>{OCTOBER_PUBLIC_ALPHA_LOCK.core.map(lane=><article key={lane.id} style={card}>
        <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>{lane.label}</b><span style={{...miniBadge,color:stateColor(lane),borderColor:stateColor(lane)+'66'}}>{lane.state}</span></div>
        <p style={smallCopy}>{lane.description}</p>
        {lane.route&&<button onClick={()=>{window.location.href=lane.route!}} style={smallButton}>OPEN</button>}
      </article>)}</div>
    </section>

    <section style={panel}>
      <div style={eyebrow}>ACTIVATE AFTER / ALONGSIDE LAUNCH</div>
      <h2 style={{margin:'4px 0'}}>These do not block public alpha</h2>
      <div style={grid}>{OCTOBER_PUBLIC_ALPHA_LOCK.gated.map(lane=>{
        const liveOverride=lane.id==='livekit'&&Boolean(live?.configured)
        const commerceOverride=lane.id==='payments'&&Boolean(runtime?.commerce?.ready)
        const state=liveOverride||commerceOverride?'LAUNCH':lane.state
        const color=state==='LAUNCH'?'#7cffad':stateColor(lane)
        return <article key={lane.id} style={card}>
          <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>{lane.label}</b><span style={{...miniBadge,color,borderColor:color+'66'}}>{state}</span></div>
          <p style={smallCopy}>{lane.description}</p>
          {lane.activation?.length?<div style={activation}>{lane.activation.map(x=><span key={x}>{x}</span>)}</div>:null}
          {lane.id==='livekit'&&!liveOverride&&<div style={warning}>Missing: {(live?.missing||['url','apiKey','apiSecret']).join(' • ')}</div>}
        </article>
      })}</div>
    </section>

    <section style={{...panel,borderColor:alphaReady?'#7cffad55':'#ffd16655'}}>
      <div style={eyebrow}>CURRENT RELEASE EVIDENCE</div>
      <div style={mono}>Production SHA: {release?.commitSha||'—'}<br/>Environment: {release?.environment||'—'}<br/>StreetVerse core: {runtime?.profiles?.streetverse?.ready?'READY':'NOT READY'}<br/>TRYAMM core: {runtime?.profiles?.tryamm?.ready?'READY':'NOT READY'}<br/>LIVE provider: {live?.configured?'CONFIGURED':'CREDENTIAL GATED'}<br/>Commerce: {runtime?.commerce?.ready?'CONFIGURED':'CREDENTIAL GATED'}</div>
    </section>
  </main>
}

function Stat({value,label}:{value:string;label:string}){return <div style={stat}><b style={{fontSize:23}}>{value}</b><span style={{fontSize:8,letterSpacing:1.4,color:'#8fa8b6'}}>{label}</span></div>}

const page:React.CSSProperties={minHeight:'100dvh',padding:'max(18px,env(safe-area-inset-top)) 14px 50px',background:'radial-gradient(circle at 50% 0,#0b3142,#050912 46%,#010203)',color:'#fff',fontFamily:'system-ui'}
const hero:React.CSSProperties={maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',gap:15,flexWrap:'wrap',padding:18,border:'1px solid #31576a',borderRadius:20,background:'linear-gradient(145deg,#081923ee,#100b1fee)'}
const eyebrow:React.CSSProperties={fontSize:9,letterSpacing:2.4,color:'#6de3ff',fontWeight:950}
const copy:React.CSSProperties={margin:0,maxWidth:760,fontSize:11,lineHeight:1.6,color:'#a9bdc7'}
const badge:React.CSSProperties={padding:'8px 10px',borderRadius:999,border:'1px solid #6de3ff55',fontSize:9,fontWeight:1000,letterSpacing:1.1}
const stats:React.CSSProperties={maxWidth:1100,margin:'10px auto',display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:7}
const stat:React.CSSProperties={display:'grid',placeItems:'center',gap:3,padding:10,borderRadius:12,border:'1px solid #244556',background:'#07131d'}
const panel:React.CSSProperties={maxWidth:1100,margin:'10px auto',padding:14,borderRadius:18,border:'1px solid #274758',background:'#06111aeb'}
const sectionHead:React.CSSProperties={display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}
const grid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:8,marginTop:10}
const card:React.CSSProperties={padding:12,borderRadius:14,border:'1px solid #223f50',background:'#08151f'}
const miniBadge:React.CSSProperties={padding:'3px 6px',borderRadius:999,border:'1px solid #ffffff33',fontSize:7,fontWeight:1000,whiteSpace:'nowrap'}
const smallCopy:React.CSSProperties={fontSize:10,lineHeight:1.5,color:'#99afba'}
const activation:React.CSSProperties={display:'grid',gap:3,fontFamily:'ui-monospace,monospace',fontSize:8,color:'#c4d3da',wordBreak:'break-all'}
const warning:React.CSSProperties={marginTop:8,padding:7,borderRadius:9,border:'1px solid #ffd16655',background:'#261d07',fontSize:8,color:'#ffe3a0'}
const button:React.CSSProperties={minHeight:40,padding:'7px 10px',borderRadius:10,border:'1px solid #4f8498',background:'#09202a',color:'#fff',fontWeight:900}
const smallButton:React.CSSProperties={minHeight:34,padding:'6px 9px',borderRadius:9,border:'1px solid #3a687b',background:'#0a1d27',color:'#fff',fontSize:8,fontWeight:950}
const mono:React.CSSProperties={marginTop:9,fontFamily:'ui-monospace,monospace',fontSize:9,lineHeight:1.65,color:'#a6bac5',wordBreak:'break-all'}
const errorBox:React.CSSProperties={maxWidth:1100,margin:'10px auto',padding:10,borderRadius:11,border:'1px solid #ff6d7d66',background:'#2c0a12',color:'#ffd9de'}
