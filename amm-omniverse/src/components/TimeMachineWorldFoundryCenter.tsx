import {useEffect,useMemo,useState} from 'react'
import type {TimeMachineWorldFoundryPlan,TimeMachineFoundryMode} from '../runtime/TimeMachineWorldFoundryRuntime'
import {TWO_WEEK_CONVERGENCE_FINDINGS,TWO_WEEK_FIX_ORDER,TWO_WEEK_STOP_RULE} from '../data/TwoWeekConvergenceAnalysis'

type Preset={id:string;label:string;request:{title:string;era:string;mode:TimeMachineFoundryMode;evidenceLevel:string;description:string;objective:string;source:string;cityId?:string;neighborhoodId?:string}}

const PRESETS:Preset[]=[
 {id:'faith-messiah',label:'Faith Chrono • First-Century Judea / Galilee',request:{title:'Walk the Earth in the Time of the Messiah',era:'First-century Judea and Galilee',mode:'RECONSTRUCTION',evidenceLevel:'mixed',description:'Source-grounded Scripture-region educational reconstruction with clearly labeled generated dialogue.',objective:'Build a walkable study scene with teaching setting, travel route, period props and return portal.',source:'metaverse-bible-faith-chrono'}},
 {id:'galilee',label:'Faith Chrono • Sea of Galilee',request:{title:'Sea of Galilee Fishing Study World',era:'First-century Galilee',mode:'RECONSTRUCTION',evidenceLevel:'mixed',description:'Educational shoreline, vessel and fishing-life reconstruction for the Metaverse Bible.',objective:'Build shoreline, boat, fishing props, period cast and immersive study anchors.',source:'metaverse-bible-faith-chrono'}},
 {id:'circle-park-1996',label:'Chicago • Circle Park / ABLA 1996',request:{title:'Circle Park / ABLA Community Archive',era:'1996',mode:'RECONSTRUCTION',evidenceLevel:'primary-source-reference + reconstruction',description:'Original Chicago digital-twin reconstruction using approved evidence and original geometry.',objective:'Build streets, housing context, court/courtyard, community markers, people, vehicles and archive portal.',source:'chicago-time-machine',cityId:'chicago',neighborhoodId:'circle-park'}},
 {id:'kingdom-hebrew',label:'Kingdom • Hebrew School Living Lesson',request:{title:'Kingdom Hebrew School Living Scripture Lesson',era:'living kingdom',mode:'SIMULATION',evidenceLevel:'source-labeled scripture + original world design',description:'Connect the playable Hebrew School to the Metaverse Bible, Holo Lab and source-labeled immersive lesson creation.',objective:'Build one complete lesson world with study portal, hologram preview, NPC teacher role, props and return to Kingdom.',source:'kingdom-yahisrael'}},
]

export default function TimeMachineWorldFoundryCenter(){
 const [active,setActive]=useState<TimeMachineWorldFoundryPlan|null>(null)
 const [history,setHistory]=useState<TimeMachineWorldFoundryPlan[]>([])
 const [prompt,setPrompt]=useState('Build a source-grounded historical world with walkable architecture, people, props, missions, mobile LOD and a Holo Lab preview.')
 const [mode,setMode]=useState<TimeMachineFoundryMode>('RECONSTRUCTION')
 const [historicalUrl,setHistoricalUrl]=useState('')
 const [status,setStatus]=useState('Ready. Choose a recovered world or describe a new scene.')
 const [receiptStatus,setReceiptStatus]=useState('LOCAL CACHE • server receipt sync waits for sign-in/build activity.')
 useEffect(()=>{
  const on=(event:Event)=>{const d=(event as CustomEvent<{activePlan:TimeMachineWorldFoundryPlan|null;history:TimeMachineWorldFoundryPlan[]}>).detail;if(!d)return;setActive(d.activePlan||null);setHistory(d.history||[])}
  const synced=(event:Event)=>{const d=(event as CustomEvent<{planId?:string;phase?:string}>).detail||{};setReceiptStatus(`SERVER RECEIPT SYNCED • ${d.phase||'updated'} • ${d.planId||''}`)}
  const failed=(event:Event)=>{const d=(event as CustomEvent<{phase?:string;error?:string}>).detail||{};setReceiptStatus(`SERVER RECEIPT DEGRADED • ${d.phase||'update'} • ${d.error||'local cache retained'}`)}
  window.addEventListener('tryamm:time-machine-world-foundry-state',on as EventListener)
  window.addEventListener('tryamm:time-machine-foundry-receipt-synced',synced as EventListener)
  window.addEventListener('tryamm:time-machine-foundry-receipt-sync-failed',failed as EventListener)
  window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-request-state'))
  return()=>{window.removeEventListener('tryamm:time-machine-world-foundry-state',on as EventListener);window.removeEventListener('tryamm:time-machine-foundry-receipt-synced',synced as EventListener);window.removeEventListener('tryamm:time-machine-foundry-receipt-sync-failed',failed as EventListener)}
 },[])
 const build=(request:Preset['request'])=>{
  window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-request',{detail:{...request,autoPreview:true}}))
  setStatus('Foundry request sent: World Builder → Genie → Mind Over Matter → HoloForge preview → Holo Lab.')
 }
 const buildCustom=()=>{window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-request',{detail:{title:'Custom Time Machine World',era:'user-selected',mode,evidenceLevel:mode==='HISTORY'?'verified-source-required':'mixed',description:prompt,objective:prompt,source:'time-machine-world-foundry',historicalUrl:historicalUrl.trim()||undefined,autoPreview:true}}));setStatus(mode==='HISTORY'&&!historicalUrl.trim()?'HISTORY stopped at evidence gate • add an archived/source URL before preview.':'Foundry request sent: evidence → World Builder → Genie → Mind Over Matter → HoloForge preview → Holo Lab.')}
 const ready=useMemo(()=>active?.assets.filter(a=>a.state==='preview-ready').length||0,[active])
 const degraded=useMemo(()=>active?.assets.filter(a=>a.state==='preview-degraded'||a.state==='failed').length||0,[active])

 return <main style={{minHeight:'100dvh',background:'radial-gradient(circle at 50% 0,#142d42,#060912 48%,#020309)',color:'#fff',fontFamily:'system-ui',padding:'18px 14px 90px'}}>
  <div style={{maxWidth:1180,margin:'0 auto'}}>
   <nav style={{display:'flex',gap:7,flexWrap:'wrap'}}><a href='/kingdom-of-yahisrael' style={pill}>👑 YAHISRAEL</a><a href='/metaverse-bible' style={pill}>📖 METAVERSE BIBLE</a><a href='/holo-lab' style={pill}>🧪 HOLO LAB</a><a href='/streetverse' style={pill}>🏙 STREETVERSE</a></nav>
   <header style={{padding:'34px 0 18px'}}><div style={{fontSize:10,letterSpacing:2.8,color:'#65e5ff',fontWeight:950}}>TRYAMM • TIME MACHINE • WORLD FOUNDRY</div><h1 style={{fontSize:'clamp(44px,8vw,86px)',lineHeight:.9,margin:'8px 0'}}>BUILD THE PAST.<br/>PREVIEW THE WORLD.</h1><p style={muted}>One conductor for the technology already built: Quantum World Builder, World Forger/CAD, Genie in the Bottle, Mind Over Matter, HoloForge, Holo Gen, Holo Lab holograms, Metaverse Bible/Faith Chrono and the StreetVerse Time Machine.</p></header>

   <section style={panel}><div style={eyebrow}>HOW THE TIME MACHINE WORKS</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:7,marginTop:10}}>{['1 • SOURCE / ARCHIVE','2 • TRUTH LABEL','3 • WORLD BUILDER PLAN','4 • WORLD FORGER / CAD','5 • GENIE ×4','6 • MIND OVER MATTER','7 • HOLOFORGE PREVIEW','8 • HOLO LAB','9 • QA / REVIEW','10 • CERTIFY / PUBLISH'].map(x=><div key={x} style={step}>{x}</div>)}</div><p style={muted}>HISTORY shows archived/verified observations. RECONSTRUCTION fills gaps but labels uncertainty. SIMULATION models what-if scenarios. ADVENTURE is fictional entertainment. ENGINEERING compares digital-twin versions. None of these modes claims literal physical time travel.</p></section>

   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:9,marginTop:12}}>{PRESETS.map(p=><article key={p.id} style={panel}><div style={eyebrow}>{p.request.mode}</div><h2 style={{fontSize:17,margin:'6px 0'}}>{p.label}</h2><p style={muted}>{p.request.objective}</p><button onClick={()=>build(p.request)} style={primary}>BUILD HOLOGRAM PREVIEW</button></article>)}</section>

   <section style={{...panel,marginTop:12}}><div style={eyebrow}>ABRACADABRA • CUSTOM WORLD REQUEST</div><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:8}}>{(['HISTORY','RECONSTRUCTION','SIMULATION','ADVENTURE','ENGINEERING','SPACE'] as TimeMachineFoundryMode[]).map(m=><button key={m} onClick={()=>setMode(m)} style={{...modeBtn,borderColor:mode===m?'#65e5ff':'#34485a',color:mode===m?'#fff':'#8fa2b1'}}>{m}</button>)}</div><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={area}/><button onClick={buildCustom} style={primary}>🧞 GENIE + WORLD BUILDER + HOLO LAB</button></section>

   {active&&<section style={{...panel,marginTop:12,borderColor:'#7a6630'}}><div style={eyebrow}>ACTIVE FOUNDRY PLAN</div><h2 style={{margin:'5px 0'}}>{active.title} • {active.era}</h2><div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={pill}>{active.mode}</span><span style={pill}>{active.truthLabel}</span><span style={pill}>PREVIEW READY {ready}/{active.assets.length}</span><span style={pill}>DEGRADED / FAILED {degraded}</span><span style={pill}>PRODUCTION MUTATION: NO</span></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:7,marginTop:10}}>{active.assets.map(a=><article key={a.id} style={asset}><div style={eyebrow}>{a.kind.toUpperCase()} • {a.state.toUpperCase()}</div><b>{a.label}</b><div style={{fontSize:9,color:'#9fb0be',lineHeight:1.45,marginTop:4}}>{a.purpose}</div><div style={{fontSize:9,color:'#d6bd78',marginTop:5}}>GENIE WINNER: {a.genieWinner} • {a.genieScore}</div>{a.worldForge&&<div style={{fontSize:8,color:'#7fe8ff',marginTop:4}}>FORGE: {a.worldForge.kind.toUpperCase()} • {a.worldForge.stage.toUpperCase()} {a.worldForge.cadPlan?'• CAD PLAN':''}</div>}<div style={{fontSize:8,color:'#78909d',marginTop:4}}>{a.provider||'provider pending'}{a.message?' • '+a.message:''}</div></article>)}</div><div style={{marginTop:9,fontSize:9,color:'#ffcf8d'}}>BLOCKERS: {active.blockers.join(' • ')}</div></section>}

   <section style={{...panel,marginTop:12,borderColor:'#8b5c45'}}><div style={eyebrow}>TWO-WEEK CONVERGENCE DIAGNOSIS</div><p style={muted}>{TWO_WEEK_STOP_RULE}</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:7,marginTop:8}}>{TWO_WEEK_CONVERGENCE_FINDINGS.map(f=><article key={f.id} style={asset}><div style={eyebrow}>{f.state.toUpperCase().replaceAll('-',' ')}</div><b>{f.area}</b><p style={muted}>{f.problem}</p><div style={{fontSize:9,color:'#84eaff',lineHeight:1.45}}>{f.fix}</div></article>)}</div><div style={{display:'grid',gap:5,marginTop:10}}>{TWO_WEEK_FIX_ORDER.map(x=><div key={x} style={step}>{x}</div>)}</div></section>

   <section style={{...panel,marginTop:12}}><div style={eyebrow}>SERVER / CROSS-DEVICE RECEIPT</div><div style={{fontSize:9,color:'#c7d8e0',lineHeight:1.5}}>{receiptStatus}</div><div style={{fontSize:8,color:'#7f929f',marginTop:5}}>Browser memory is a cache. Signed-in Foundry plans now attempt to persist through the authenticated receipt API; production publishing still requires certification.</div></section>
   <section style={{...panel,marginTop:12}}><div style={eyebrow}>RECENT FOUNDRY MEMORY</div><div style={{display:'grid',gap:5,marginTop:7}}>{history.slice(-8).reverse().map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',gap:8,padding:8,borderRadius:9,background:'#08111b',fontSize:9}}><span>{p.title} • {p.era}</span><b style={{color:'#74e6ff'}}>{p.assets.length} assets</b></div>)}</div></section>
   <div role='status' style={{...panel,marginTop:12,fontSize:9,color:'#c8d7df'}}>{status}</div>
  </div>
 </main>
}
const panel:React.CSSProperties={padding:14,border:'1px solid #2d4658',borderRadius:16,background:'#07111bdd'}
const muted:React.CSSProperties={fontSize:11,color:'#aebbc5',lineHeight:1.6}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.7,color:'#71e8ff',fontWeight:950}
const step:React.CSSProperties={padding:9,borderRadius:10,border:'1px solid #314b5c',background:'#081722',fontSize:9,fontWeight:900}
const asset:React.CSSProperties={padding:10,borderRadius:12,border:'1px solid #334859',background:'#08131d'}
const pill:React.CSSProperties={display:'inline-flex',alignItems:'center',minHeight:32,padding:'0 8px',border:'1px solid #3b596d',borderRadius:999,background:'#07141e',color:'#d9edf5',fontSize:8,fontWeight:900,textDecoration:'none'}
const primary:React.CSSProperties={width:'100%',minHeight:42,marginTop:9,borderRadius:10,border:'1px solid #65e5ff88',background:'linear-gradient(135deg,#0b3040,#172243)',color:'#fff',fontWeight:950}
const modeBtn:React.CSSProperties={minHeight:34,padding:'0 8px',borderRadius:999,border:'1px solid #34485a',background:'#07111b',fontSize:8,fontWeight:950}
const area:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:96,marginTop:8,borderRadius:11,border:'1px solid #344c5d',background:'#03070c',color:'#fff',padding:10,fontSize:12,resize:'vertical'}
