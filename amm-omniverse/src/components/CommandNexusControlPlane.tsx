import { useEffect, useMemo, useState } from 'react'

type ServiceRow={service:string;status:string;environment?:string;public_url?:string;commit_sha?:string|null;details?:Record<string,unknown>;checked_at?:string}
type Convergence={overall?:string;deployment?:{provider?:string;environment?:string;project?:string|null;commitSha?:string|null;branch?:string|null};probes?:Array<{name:string;status:string;httpStatus?:number;reason?:string}>;registry?:{status?:string;rows?:ServiceRow[]};safety?:{autoRepairAllowedFor?:string[];humanGateRequiredFor?:string[]};checkedAt?:string}
type Props={onClose:()=>void}
type LaunchItem=readonly [string,string,string]

const GROUPS:ReadonlyArray<{title:string;subtitle:string;items:ReadonlyArray<LaunchItem>}>= [
  {title:'AI + HOLO',subtitle:'Start here for HoloGPT and the core holographic system.',items:[['◈','HoloGPT','/hologpt'],['🌀','Holoverse','/holoverse'],['◎','Holo Core','/holo-core'],['✦','Holo Services','/holo-services'],['🧪','Holo Lab','/holo-lab'],['🥽','AR · VR · Mixed Reality','/xr']]},
  {title:'PLAY + WORLDS',subtitle:'Games, living worlds and immersive spaces.',items:[['🎮','StreetVerse','/streetverse'],['◉','Omniverse','/omniverse'],['◈','Immersive Worlds','/immersive-worlds'],['⚛','Quantum Engine','/quantum-engine']]},
  {title:'CREATE + BROADCAST',subtitle:'Reels, video, music, LIVE and network publishing.',items:[['🎬','Create Reel','/reel-creator'],['🎬','Holo Video','/holo-video'],['♫','Holo Music Streaming','/holo-music'],['●','TRYAMM Live','/live'],['✨','Stream FX','/stream-fx'],['♫','Quantum Beat','/quantum-beat'],['▣','Isaiah AI TV','/isaiah-tv'],['🌐','All American Network','/all-american-network'],['✡','Servants of Christ Network','/servants-of-christ-network']]},
  {title:'MOVE + SHOP',subtitle:'Marketplace, ride, delivery and logistics.',items:[['🛍','Holo Marketplace','/marketplace'],['🚘','Holo Ride','/holo-ride'],['📦','Holo Delivery','/holo-delivery'],['🚁','Holo Drone','/holo-drone']]},
  {title:'WORK + KNOWLEDGE',subtitle:'Business, education, publishing and AI workforce surfaces.',items:[['🛡','Jacobie Vision','/jacobie-vision'],['☕','AI Café','/ai-cafe'],['📚','Kingdoms Press','/kingdoms-press'],['📖','Book Club','/book-club'],['♜','Family Legacy','/family-legacy']]},
  {title:'ACCESS + PERFORMANCE',subtitle:'Accessibility and performance controls.',items:[['♿','Omni Access','/omni-access'],['🤟','Sign Language','/sign-language'],['⚡','Lag Buster','/lag-buster']]},
]

function statusColor(status='unverified'){return status==='healthy'?'#78ffb4':status==='gated'?'#e8b944':status==='down'?'#ff6577':'#ffb86b'}
function serviceKey(path:string,label:string){return [path.replace(/^\//,''),label.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')]}

export default function CommandNexusControlPlane({onClose}:Props){
  const [data,setData]=useState<Convergence|null>(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const [query,setQuery]=useState('')
  async function refresh(){setLoading(true);setError('');try{const r=await fetch('/api/system/convergence',{cache:'no-store'});const d=await r.json();setData(d);if(!r.ok&&!d)throw new Error(`Convergence API ${r.status}`)}catch(e){setError(e instanceof Error?e.message:'Convergence control plane unavailable')}finally{setLoading(false)}}
  useEffect(()=>{refresh();const id=window.setInterval(refresh,60_000);return()=>window.clearInterval(id)},[])
  const rows=useMemo(()=>data?.registry?.rows||[],[data])
  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return GROUPS;return GROUPS.map(g=>({...g,items:g.items.filter(([,label,path])=>`${label} ${path} ${g.title}`.toLowerCase().includes(q))})).filter(g=>g.items.length)},[query])
  function nav(path:string){const fn=(window as any).__tryammNavigate;if(typeof fn==='function')fn(path);else window.location.hash=path;onClose()}
  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Command Nexus Control Plane" style={{position:'fixed',inset:0,zIndex:12200,background:'radial-gradient(circle at 80% 10%,#14304a,#050914 42%,#02030a)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:3,padding:'14px 18px',background:'#040814ed',borderBottom:'1px solid #4fe3ff44',backdropFilter:'blur(14px)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gap:12}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:'#4fe3ff',letterSpacing:3}}>TRYAMM HOLO CONTROL CENTER</div><h1 style={{margin:'3px 0'}}>Command Nexus</h1><div style={{fontSize:12,opacity:.65}}>One organized launcher for AI, Holoverse, games, creator tools, services and accessibility.</div></div><div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}><button style={button} onClick={refresh}>{loading?'CHECKING…':'REFRESH'}</button><button style={button} onClick={onClose}>CLOSE</button></div></div>
        <input aria-label="Search TRYAMM systems" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search HoloGPT, Holoverse, StreetVerse, reels, ride, accessibility…" style={{width:'100%',boxSizing:'border-box',minHeight:44,borderRadius:12,border:'1px solid #31536b',background:'#07111d',color:'#fff',padding:'0 13px',fontSize:14,outline:'none'}}/>
      </div>
    </header>
    <main style={{maxWidth:1200,margin:'0 auto',padding:18,display:'grid',gap:14}}>
      <section style={{...panel,borderColor:statusColor(data?.overall)}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:11,color:statusColor(data?.overall)}}>SYSTEM STATUS · {(data?.overall||'UNVERIFIED').toUpperCase()}</div><h2 style={{margin:'5px 0'}}>Release Truth</h2><div style={{fontSize:11,opacity:.65}}>A BETA/GATED label means the route exists but still needs provider, device or production proof.</div></div><div style={{fontFamily:'monospace',fontSize:11,opacity:.75}}>branch: {data?.deployment?.branch||'unknown'}<br/>sha: {data?.deployment?.commitSha?.slice(0,12)||'unverified'}<br/>project: {data?.deployment?.project||'unverified'}</div></div>{error&&<div style={{color:'#ff8795',marginTop:8}}>{error}</div>}</section>
      {filtered.map(group=><section key={group.title} style={panel}><div style={{marginBottom:10}}><div style={{fontSize:10,color:'#4fe3ff',fontWeight:950,letterSpacing:2}}>{group.title}</div><div style={{fontSize:11,opacity:.58,marginTop:3}}>{group.subtitle}</div></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>{group.items.map(([icon,label,path])=>{const keys=serviceKey(path,label);const row=rows.find(r=>keys.includes(r.service));return <button key={`${label}-${path}`} onClick={()=>nav(path)} style={{...launch,borderColor:row?statusColor(row.status):'#2d4d62'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><span style={{fontSize:20}}>{icon}</span><span style={{fontSize:8,color:row?statusColor(row.status):'#8797a4'}}>{(row?.status||'ROUTE').toUpperCase()}</span></div><div style={{fontWeight:950,marginTop:9}}>{label}</div></button>})}</div></section>)}
      {!filtered.length&&<section style={panel}>No TRYAMM system matches “{query}”.</section>}
      <details style={panel}><summary style={{cursor:'pointer',fontWeight:950}}>Diagnostics + convergence details</summary><div style={{marginTop:12,display:'grid',gap:12}}><section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:9}}>{(data?.probes||[]).map(p=><article key={p.name} style={{...panel,padding:11}}><div style={{fontSize:10,color:statusColor(p.status)}}>{p.status.toUpperCase()}</div><strong>{p.name}</strong><div style={{fontSize:11,opacity:.62,marginTop:5}}>{p.httpStatus?`HTTP ${p.httpStatus}`:p.reason||'probe complete'}</div></article>)}</section><div style={{fontSize:11,color:'#78ffb4'}}>AUTO-REPAIR: {(data?.safety?.autoRepairAllowedFor||[]).join(' · ')||'policy unavailable'}</div><div style={{fontSize:11,color:'#e8b944'}}>HUMAN GATE: {(data?.safety?.humanGateRequiredFor||[]).join(' · ')||'policy unavailable'}</div></div></details>
    </main>
  </div>
}
const panel:React.CSSProperties={padding:15,border:'1px solid #28485d',borderRadius:16,background:'#07101bdd'}
const button:React.CSSProperties={minHeight:40,padding:'0 12px',border:'1px solid #4fe3ff66',borderRadius:10,background:'#0b2634',color:'#fff',fontWeight:900,cursor:'pointer'}
const launch:React.CSSProperties={minHeight:82,textAlign:'left',padding:12,border:'1px solid',borderRadius:14,background:'#08131f',color:'#fff',cursor:'pointer'}
