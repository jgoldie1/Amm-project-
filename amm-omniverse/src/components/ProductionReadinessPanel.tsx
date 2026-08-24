import { useEffect, useMemo, useState } from 'react'

type ReleaseState={ok?:boolean;commitSha?:string;branch?:string;environment?:string;deploymentId?:string}
type AiState={ok?:boolean;provider?:string;degraded?:boolean;providers?:Record<string,boolean>;model?:string|null;message?:string}
type CreatorState={ok?:boolean;creatorPipeline?:Record<string,string>;saveToPhone?:{capabilityContract?:boolean;realDeviceProofRequired?:boolean;realDeviceCertified?:boolean;reason?:string};realReel?:{deviceProofRequired?:boolean;certified?:boolean};fullGreenEligible?:boolean}
type Snapshot={release:ReleaseState|null;ai:AiState|null;creator:CreatorState|null;loadedAt:string|null;error:string|null}

async function getJson<T>(url:string):Promise<T>{
  const response=await fetch(url,{cache:'no-store',headers:{accept:'application/json'}})
  if(!response.ok)throw new Error(`${url} returned ${response.status}`)
  return response.json() as Promise<T>
}

export default function ProductionReadinessPanel(){
  const [open,setOpen]=useState(false)
  const [loading,setLoading]=useState(false)
  const [snapshot,setSnapshot]=useState<Snapshot>({release:null,ai:null,creator:null,loadedAt:null,error:null})

  async function refresh(){
    setLoading(true)
    try{
      const [release,ai,creator]=await Promise.all([
        getJson<ReleaseState>('/api/system/release'),
        getJson<AiState>('/api/ai/health'),
        getJson<CreatorState>('/api/system/creator-convergence'),
      ])
      setSnapshot({release,ai,creator,loadedAt:new Date().toISOString(),error:null})
    }catch(error){
      setSnapshot(current=>({...current,error:error instanceof Error?error.message:'Readiness check failed',loadedAt:new Date().toISOString()}))
    }finally{setLoading(false)}
  }

  useEffect(()=>{if(open&&!snapshot.loadedAt)void refresh()},[open,snapshot.loadedAt])

  const status=useMemo(()=>{
    const deployed=Boolean(snapshot.release?.ok&&snapshot.release?.environment==='production')
    const aiReady=Boolean(snapshot.ai?.ok&&!snapshot.ai?.degraded&&snapshot.ai?.provider&&snapshot.ai.provider!=='diagnostic')
    const creatorReady=Boolean(snapshot.creator?.ok&&snapshot.creator?.saveToPhone?.capabilityContract)
    const phoneCertified=Boolean(snapshot.creator?.saveToPhone?.realDeviceCertified&&snapshot.creator?.realReel?.certified)
    return {deployed,aiReady,creatorReady,phoneCertified,fullGreen:deployed&&aiReady&&creatorReady&&phoneCertified}
  },[snapshot])

  if(!open)return <button type="button" onClick={()=>setOpen(true)} aria-label="Open TRYAMM production readiness" style={{position:'fixed',left:12,bottom:218,zIndex:8992,border:'1px solid #76ffb488',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#071c18,#111425)',color:'#78ffb4',fontSize:10,fontWeight:950,letterSpacing:1,cursor:'pointer'}}>● LIVE STATUS</button>

  const providerNames=Object.entries(snapshot.ai?.providers||{}).filter(([,enabled])=>enabled).map(([name])=>name)
  const pipeline=Object.entries(snapshot.creator?.creatorPipeline||{})

  return <div role="dialog" aria-label="TRYAMM production readiness" style={{position:'fixed',inset:0,zIndex:15140,background:'#02050bf7',color:'#fff',overflow:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:960,margin:'0 auto',padding:'22px 14px 80px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'flex-start',marginBottom:16}}>
        <div><div style={{fontSize:10,fontWeight:950,letterSpacing:3,color:'#78ffb4'}}>TRYAMM PRODUCTION TRUTH</div><h1 style={{margin:'6px 0'}}>Live Readiness</h1><p style={{margin:0,color:'#9fb2c8',fontSize:12}}>Evidence from the currently deployed production APIs. Nothing is marked green without live proof.</p></div>
        <button onClick={()=>setOpen(false)} aria-label="Close production readiness" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #3d536c',background:'#0c1520',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button>
      </header>

      <div style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:15}}><button onClick={()=>void refresh()} disabled={loading} style={primary}>{loading?'CHECKING…':'↻ REFRESH LIVE STATUS'}</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'readiness'}}))} style={secondary}>🎬 OPEN REEL STUDIO</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:hologpt-open',{detail:{source:'readiness'}}))} style={secondary}>AI OPEN HOLOGPT</button></div>

      {snapshot.error&&<div style={{padding:12,border:'1px solid #ff6b7a88',borderRadius:12,background:'#2b0d15',color:'#ffd7dc',marginBottom:14}}>Readiness check error: {snapshot.error}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10}}>
        <Card title="Production deployment" good={status.deployed} detail={status.deployed?`LIVE • ${snapshot.release?.branch||'unknown'} • ${(snapshot.release?.commitSha||'').slice(0,12)}`:'Production identity not verified'} />
        <Card title="HoloGPT generative provider" good={status.aiReady} detail={status.aiReady?`${snapshot.ai?.provider}${snapshot.ai?.model?` • ${snapshot.ai.model}`:''}`:`WAITING • ${providerNames.length?providerNames.join(', '):'no live provider credential'}`} />
        <Card title="Creator / Reel pipeline" good={status.creatorReady} detail={status.creatorReady?'Capture, edit, effects, render and save capability are deployed':'Creator convergence is not verified'} />
        <Card title="Physical phone proof" good={status.phoneCertified} detail={status.phoneCertified?'Certified on a real device':'REQUIRES YOU • render a Reel and confirm it saves to Photos/Files'} />
      </div>

      <section style={{marginTop:14,padding:14,border:'1px solid #294058',borderRadius:16,background:'#08111c'}}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><strong>Exact release identity</strong><span style={badge(status.deployed)}>{status.deployed?'VERIFIED':'WAITING'}</span></div><div style={mono}>SHA: {snapshot.release?.commitSha||'—'}<br/>Deployment: {snapshot.release?.deploymentId||'—'}<br/>Environment: {snapshot.release?.environment||'—'}</div></section>

      <section style={{marginTop:10,padding:14,border:'1px solid #294058',borderRadius:16,background:'#08111c'}}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><strong>Creator convergence</strong><span style={badge(status.creatorReady)}>{status.creatorReady?'SOURCE READY':'WAITING'}</span></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:7,marginTop:10}}>{pipeline.map(([key,value])=><div key={key} style={{padding:9,border:'1px solid #22374b',borderRadius:10,background:'#0b1622'}}><div style={{fontSize:9,color:'#8195aa'}}>{key}</div><div style={{fontSize:11,fontWeight:850,marginTop:4}}>{value}</div></div>)}</div></section>

      <section style={{marginTop:10,padding:14,border:'1px solid #55471e',borderRadius:16,background:'#171207'}}><strong>Completion gates</strong><div style={{fontSize:11,color:'#d7c99a',lineHeight:1.65,marginTop:8}}>1. Activate one real HoloGPT provider in production (preferred: Vercel AI Gateway/OIDC; fallback: secure OpenAI key).<br/>2. On a physical iPhone/Android: StreetVerse → Create Reel → Render Final Reel → Save to Phone → confirm the file appears in Photos/Files.<br/>These are external proof gates, not missing application code.</div></section>

      <div style={{marginTop:14,padding:14,border:`1px solid ${status.fullGreen?'#78ffb477':'#455063'}`,borderRadius:16,background:status.fullGreen?'#092016':'#0e1219',fontWeight:900,color:status.fullGreen?'#78ffb4':'#c4cfda'}}>{status.fullGreen?'FULL RELEASE GREEN • all live and device gates verified':'RELEASE NOT FULL GREEN YET • see the two completion gates above'}</div>
      {snapshot.loadedAt&&<div style={{fontSize:9,color:'#66788b',marginTop:9}}>Last live check: {new Date(snapshot.loadedAt).toLocaleString()}</div>}
    </div>
  </div>
}

function Card({title,good,detail}:{title:string;good:boolean;detail:string}){return <article style={{padding:14,border:`1px solid ${good?'#397b5e':'#55471e'}`,borderRadius:16,background:good?'#081a13':'#171207'}}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><strong>{title}</strong><span style={badge(good)}>{good?'GREEN':'GATED'}</span></div><div style={{fontSize:11,color:good?'#aee8ca':'#d7c99a',lineHeight:1.5,marginTop:8}}>{detail}</div></article>}
const badge=(good:boolean):React.CSSProperties=>({fontSize:8,fontWeight:950,letterSpacing:1,borderRadius:999,padding:'4px 7px',border:`1px solid ${good?'#78ffb477':'#e8b94477'}`,color:good?'#78ffb4':'#e8b944'})
const mono:React.CSSProperties={fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:10,color:'#9fb2c8',lineHeight:1.65,marginTop:9,wordBreak:'break-all'}
const primary:React.CSSProperties={border:0,borderRadius:12,padding:'12px 14px',background:'linear-gradient(135deg,#78ffb4,#4FE3FF)',color:'#04111a',fontWeight:950,cursor:'pointer'}
const secondary:React.CSSProperties={border:'1px solid #3b536b',borderRadius:12,padding:'11px 13px',background:'#101a25',color:'#fff',fontWeight:900,fontSize:11,cursor:'pointer'}
