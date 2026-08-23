import { useEffect, useMemo, useState } from 'react'

type ServiceRow={service:string;status:string;environment?:string;public_url?:string;commit_sha?:string|null;details?:Record<string,unknown>;checked_at?:string}
type Convergence={overall?:string;deployment?:{provider?:string;environment?:string;project?:string|null;commitSha?:string|null;branch?:string|null};probes?:Array<{name:string;status:string;httpStatus?:number;reason?:string}>;registry?:{status?:string;rows?:ServiceRow[]};safety?:{autoRepairAllowedFor?:string[];humanGateRequiredFor?:string[]};checkedAt?:string}
type Props={onClose:()=>void}

const ACTIONS=[
  ['◈','HoloGPT','/hologpt'],['♫','Holo Music Streaming','/holo-music'],['🎬','Holo Video','/holo-video'],['🚘','Holo Ride','/holo-ride'],['📦','Holo Delivery','/holo-delivery'],['🚁','Holo Drone','/holo-drone'],['🌀','Holoverse','/holoverse'],['🎮','StreetVerse','/streetverse'],['🎬','Create Reel','/reel-creator'],['🛡','Jacobie Vision','/jacobie-vision'],['▣','Isaiah AI TV','/isaiah-tv'],['🌐','All American Network','/all-american-network'],['✡','Servants of Christ Network','/servants-of-christ-network'],
] as const

function statusColor(status='unverified'){return status==='healthy'?'#78ffb4':status==='gated'?'#e8b944':status==='down'?'#ff6577':'#ffb86b'}

export default function CommandNexusControlPlane({onClose}:Props){
  const [data,setData]=useState<Convergence|null>(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  async function refresh(){setLoading(true);setError('');try{const r=await fetch('/api/system/convergence',{cache:'no-store'});const d=await r.json();setData(d);if(!r.ok&&!d)throw new Error(`Convergence API ${r.status}`)}catch(e){setError(e instanceof Error?e.message:'Convergence control plane unavailable')}finally{setLoading(false)}}
  useEffect(()=>{refresh();const id=window.setInterval(refresh,60_000);return()=>window.clearInterval(id)},[])
  const rows=useMemo(()=>data?.registry?.rows||[],[data])
  function nav(path:string){const fn=(window as any).__tryammNavigate;if(typeof fn==='function')fn(path);else window.location.hash=path;onClose()}
  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Command Nexus Control Plane" style={{position:'fixed',inset:0,zIndex:12200,background:'radial-gradient(circle at 80% 10%,#14304a,#050914 42%,#02030a)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:3,display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',padding:'14px 18px',background:'#040814ed',borderBottom:'1px solid #4fe3ff44',backdropFilter:'blur(14px)'}}>
      <div><div style={{fontSize:10,color:'#4fe3ff',letterSpacing:3}}>TRYAMM QUANTUM CONTROL PLANE</div><h1 style={{margin:'3px 0'}}>Command Nexus</h1><div style={{fontSize:12,opacity:.65}}>Observe → diagnose → launch → verify → recover</div></div>
      <div style={{display:'flex',gap:8}}><button style={button} onClick={refresh}>{loading?'CHECKING…':'REFRESH'}</button><button style={button} onClick={onClose}>CLOSE</button></div>
    </header>
    <main style={{maxWidth:1200,margin:'0 auto',padding:18,display:'grid',gap:14}}>
      <section style={{...panel,borderColor:statusColor(data?.overall)}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:11,color:statusColor(data?.overall)}}>SYSTEM STATUS · {(data?.overall||'UNVERIFIED').toUpperCase()}</div><h2 style={{margin:'5px 0'}}>Release Truth</h2></div><div style={{fontFamily:'monospace',fontSize:11,opacity:.75}}>branch: {data?.deployment?.branch||'unknown'}<br/>sha: {data?.deployment?.commitSha?.slice(0,12)||'unverified'}<br/>project: {data?.deployment?.project||'unverified'}</div></div>{error&&<div style={{color:'#ff8795',marginTop:8}}>{error}</div>}</section>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:9}}>{(data?.probes||[]).map(p=><article key={p.name} style={panel}><div style={{fontSize:10,color:statusColor(p.status)}}>{p.status.toUpperCase()}</div><strong>{p.name}</strong><div style={{fontSize:11,opacity:.62,marginTop:5}}>{p.httpStatus?`HTTP ${p.httpStatus}`:p.reason||'probe complete'}</div></article>)}</section>
      <section style={panel}><h2 style={{marginTop:0}}>Launch Systems</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8}}>{ACTIONS.map(([icon,label,path])=>{const key=path.replace(/^\//,'');const row=rows.find(r=>r.service===key||r.service===label.toLowerCase().replace(/ /g,'-'));return <button key={path} onClick={()=>nav(path)} style={{...launch,borderColor:row?statusColor(row.status):'#2d4d62'}}><div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:20}}>{icon}</span><span style={{fontSize:8,color:row?statusColor(row.status):'#8797a4'}}>{(row?.status||'ROUTE').toUpperCase()}</span></div><div style={{fontWeight:950,marginTop:9}}>{label}</div>{row?.details&&<div style={{fontSize:9,opacity:.55,marginTop:5}}>tracked by convergence registry</div>}</button>})}</div></section>
      <section style={panel}><h2 style={{marginTop:0}}>Convergence Registry</h2><div style={{display:'grid',gap:6}}>{rows.map(row=><div key={row.service} style={{display:'grid',gridTemplateColumns:'minmax(150px,1fr) 90px minmax(180px,2fr)',gap:8,padding:'9px 10px',border:'1px solid #203849',borderRadius:10,alignItems:'center'}}><strong>{row.service}</strong><span style={{color:statusColor(row.status),fontSize:10,fontWeight:900}}>{row.status.toUpperCase()}</span><span style={{fontSize:10,opacity:.6,overflow:'hidden',textOverflow:'ellipsis'}}>{row.details?JSON.stringify(row.details):row.checked_at||''}</span></div>)}</div></section>
      <section style={{...panel,borderColor:'#e8b94455'}}><h2 style={{marginTop:0}}>Self-Repair Boundary</h2><p style={{opacity:.7}}>Low-risk reversible failures may retry, fail over, disable safely, or roll back. Money, wallets, payouts, identity, permissions, moderation and player inventory remain human-gated.</p><div style={{fontSize:11,color:'#78ffb4'}}>AUTO: {(data?.safety?.autoRepairAllowedFor||[]).join(' · ')||'policy unavailable'}</div><div style={{fontSize:11,color:'#e8b944',marginTop:5}}>HUMAN GATE: {(data?.safety?.humanGateRequiredFor||[]).join(' · ')||'policy unavailable'}</div></section>
    </main>
  </div>
}
const panel:React.CSSProperties={padding:15,border:'1px solid #28485d',borderRadius:16,background:'#07101bdd'}
const button:React.CSSProperties={minHeight:40,padding:'0 12px',border:'1px solid #4fe3ff66',borderRadius:10,background:'#0b2634',color:'#fff',fontWeight:900,cursor:'pointer'}
const launch:React.CSSProperties={minHeight:82,textAlign:'left',padding:12,border:'1px solid',borderRadius:14,background:'#08131f',color:'#fff',cursor:'pointer'}
