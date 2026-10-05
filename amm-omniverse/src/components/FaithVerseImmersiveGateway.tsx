import {lazy,Suspense,useMemo,useState} from 'react'
import {FEATURED_FAITHVERSE_BOOKS} from '../data/FaithVerseStudyLibrary'

const HoloLabGateway=lazy(()=>import('./HoloLabGateway'))
const XRCommandGateway=lazy(()=>import('./XRCommandGateway'))

type PortalId='kjv1611'|'apocrypha'|'ethiopian81'|'hologpt'|'holo-lab'|'xr'|'chrono'|'kingdom'
type Portal={id:PortalId;icon:string;label:string;sub:string;copy:string}

const PORTALS:Portal[]=[
 {id:'kjv1611',icon:'👑',label:'KJV 1611',sub:'80-BOOK HISTORICAL STUDY',copy:'Open the historical 1611 structure: 39 Old Testament, 14 Apocrypha, 27 New Testament.'},
 {id:'apocrypha',icon:'📜',label:'1611 Apocrypha',sub:'14-BOOK STUDY WORLD',copy:'Enter the inter-testament KJV 1611 Apocrypha lane with source labels and HoloGPT study support.'},
 {id:'ethiopian81',icon:'📚',label:'Ethiopian Canon',sub:'81-BOOK CANON METADATA',copy:'Explore Ethiopian Orthodox canon metadata without blending its canon identity into the KJV lane.'},
 {id:'hologpt',icon:'🧠',label:'HoloGPT Tutor',sub:'STUBBS AI STUDY ORCHESTRATION',copy:'Ask questions, compare sources, create lessons and build clearly labeled immersive study recipes.'},
 {id:'holo-lab',icon:'🌐',label:'Holo Lab',sub:'WORLD / LESSON SANDBOX',copy:'Prototype source-labeled scripture worlds, lessons, maps, scenes, audio and accessible experiences.'},
 {id:'xr',icon:'🥽',label:'AR · VR · MR',sub:'LYONS TECH IMMERSIVE GATE',copy:'Use device-aware WebXR when supported, with safe 2D/3D fallback on unsupported phones and browsers.'},
 {id:'chrono',icon:'⏳',label:'Faith Chrono',sub:'TIME / HISTORY RECONSTRUCTION',copy:'Enter source-grounded historical reconstruction and devotional missions; generated dialogue stays labeled.'},
 {id:'kingdom',icon:'🦁',label:'Yahisrael / Judah',sub:'WHERE HEAVEN MEETS EARTH',copy:'Return to the Kingdom of Yahisrael and its playable Hebrew School / Scripture House.'},
]

function dispatch(name:string,detail:unknown={}){window.dispatchEvent(new CustomEvent(name,{detail}))}
function scroll(id:string){document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})}

export default function FaithVerseImmersiveGateway(){
 const [overlay,setOverlay]=useState<'lab'|'xr'|null>(null)
 const [last,setLast]=useState('Gateway ready.')
 const support=useMemo(()=>({secure:window.isSecureContext,webxr:Boolean((navigator as any).xr),speech:'speechSynthesis'in window}),[])

 const routeFabric=(action:string,payload:Record<string,unknown>)=>{
  const fabric=(window as any).__TRYAMM_OPERATING_FABRIC__
  if(typeof fabric?.route==='function'){
   fabric.route({id:'faith-stubbs-'+Date.now(),domain:'media',action:'faithverse-study-orchestration:'+action,priority:'routine',payload,requiresHumanApproval:false})
   fabric.route({id:'faith-lyons-'+Date.now(),domain:'technology',action:'faithverse-immersive-runtime:'+action,priority:'routine',payload,requiresHumanApproval:false})
  }
  dispatch('tryamm:faithverse-intelligence-context',{action,payload,agents:['stubbs-ai','hologpt','lyons-tech'],source:'faithverse-immersive-gateway'})
 }

 const holoPrompt=(prompt:string)=>{
  dispatch('tryamm:hologpt-study-context',{prompt,source:'faithverse-immersive-gateway'})
  setLast('HoloGPT opened with FaithVerse source-label rules.')
 }

 const open=(portal:Portal)=>{
  routeFabric(portal.id,{portal:portal.id,label:portal.label,sourceLabelsRequired:true})
  dispatch('tryamm:faithverse-gateway-opened',{portal:portal.id,label:portal.label,source:'metaverse-bible'})
  if(portal.id==='kjv1611'){dispatch('tryamm:faith-holobook-layer-request',{layer:'kjv1611',source:'immersive-gateway'});scroll('faith-holobook');setLast('KJV 1611 80-book study layer opened.');return}
  if(portal.id==='apocrypha'){dispatch('tryamm:faith-holobook-layer-request',{layer:'apocrypha',source:'immersive-gateway'});scroll('faith-holobook');setLast('KJV 1611 Apocrypha study world opened.');return}
  if(portal.id==='ethiopian81'){dispatch('tryamm:faith-holobook-layer-request',{layer:'canon81',source:'immersive-gateway'});scroll('faith-holobook');setLast('Ethiopian 81-book canon metadata world opened.');return}
  if(portal.id==='hologpt'){holoPrompt('You are the FaithVerse HoloGPT tutor. Help me study the KJV 1611, its 14-book Apocrypha, Ethiopian Orthodox 81-book canon metadata, Biblical Hebrew/Paleo-script study and Strong’s where applicable. Keep scripture text, edition facts, canon metadata, commentary, reconstruction and AI explanation separately labeled. Never invent missing scripture text.');return}
  if(portal.id==='holo-lab'){setOverlay('lab');setLast('Holo Lab opened inside FaithVerse.');return}
  if(portal.id==='xr'){setOverlay('xr');setLast('AR / VR / Mixed Reality gateway opened.');return}
  if(portal.id==='chrono'){scroll('faith-chrono');dispatch('tryamm:faith-chrono-gateway-request',{source:'faithverse-immersive-gateway'});setLast('Faith Chrono gateway opened.');return}
  if(portal.id==='kingdom'){window.location.href='/kingdom-of-yahisrael'}
 }

 return <section id="faithverse-immersive-gateway" aria-label="FaithVerse immersive gateway" style={shell}>
  <style>{`
   @keyframes faithverse-ring{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
   @keyframes faithverse-pulse{0%,100%{opacity:.55;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}
   @media (prefers-reduced-motion:reduce){.faith-ring,.faith-core{animation:none!important}}
  `}</style>
  <div style={{fontSize:10,letterSpacing:2.7,color:'#6cecff',fontWeight:950}}>FAITHVERSE IMMERSIVE GATEWAY • STUBBS AI × HOLOGPT × LYONS TECH</div>
  <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.2fr) minmax(250px,.8fr)',gap:16,alignItems:'center',marginTop:9}}>
   <div>
    <h2 style={{fontSize:'clamp(34px,6vw,62px)',lineHeight:.92,margin:'6px 0'}}>ENTER THE<br/><span style={{color:'#e8b944'}}>LIVING SCRIPTURE WORLD</span></h2>
    <p style={muted}>Read the source. Study the language. Ask HoloGPT. Build a Holo Lab lesson. Step into AR/VR when the device supports it. Use Faith Chrono for clearly labeled reconstruction. Carry the lesson back into Yahisrael, the Kingdom Workbook, ministry and publishing.</p>
    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={chip}>STUBBS AI • ORCHESTRATE</span><span style={chip}>HOLOGPT • TUTOR</span><span style={chip}>LYONS TECH • SPATIAL</span><span style={chip}>HOLO LAB • BUILD</span><span style={chip}>AR / VR • ENTER</span></div>
   </div>
   <div aria-hidden="true" style={{position:'relative',height:280,display:'grid',placeItems:'center',overflow:'hidden'}}>
    <div className="faith-ring" style={{position:'absolute',width:238,height:238,borderRadius:'50%',border:'3px solid #4fe3ff88',borderTopColor:'#e8b944',boxShadow:'0 0 45px #4fe3ff33',animation:'faithverse-ring 14s linear infinite'}}/>
    <div className="faith-ring" style={{position:'absolute',width:182,height:182,borderRadius:'50%',border:'2px dashed #e8b944aa',animation:'faithverse-ring 10s linear infinite reverse'}}/>
    <div className="faith-core" style={{width:126,height:126,borderRadius:'50%',display:'grid',placeItems:'center',textAlign:'center',background:'radial-gradient(circle,#e8b94455,#0a2430 54%,#04060a)',border:'1px solid #d8bd68',boxShadow:'0 0 60px #4fe3ff44',animation:'faithverse-pulse 3.8s ease-in-out infinite'}}><div><div style={{fontSize:42}}>📖</div><b style={{fontSize:10}}>WORD → WORLD</b></div></div>
   </div>
  </div>

  <div style={{...panel,marginTop:10,borderColor:'#806a35'}}>
   <div style={{fontSize:9,letterSpacing:1.8,color:'#e8b944',fontWeight:950}}>FEATURED SCRIPTURE WORLDS • ESTHER + JUBILEES</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:7,marginTop:8}}>{FEATURED_FAITHVERSE_BOOKS.map(book=><button key={book.id} onClick={()=>{
    const layer=book.id==='rest-of-esther'?'apocrypha':book.id==='jubilees'?'canon81':'kjv1611'
    dispatch('tryamm:faith-holobook-layer-request',{layer,source:'featured-faithverse-book',featuredBook:book.id})
    scroll('faith-holobook')
    holoPrompt(`Open a source-labeled immersive study for ${book.title}. Lanes: ${book.lanes.join(', ')}. ${book.note} Keep scripture text, edition/canon facts, commentary, reconstruction and AI explanation separately labeled.`)
    setLast(`${book.title} study path opened.`)
   }} style={portalBtn}><strong style={{fontSize:14}}>{book.title}</strong><span style={{fontSize:8,color:'#e8b944',fontWeight:900}}>{book.lanes.join(' • ')}</span><small style={{fontSize:9,color:'#c6d2d8',lineHeight:1.45}}>{book.note}</small></button>)}</div>
  </div>

  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8,marginTop:10}}>{PORTALS.map(p=><button key={p.id} onClick={()=>open(p)} style={portalBtn}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><span style={{fontSize:28}}>{p.icon}</span><span style={{fontSize:8,color:'#77ecff',fontWeight:950}}>ENTER</span></div><strong style={{fontSize:14}}>{p.label}</strong><span style={{fontSize:8,color:'#e8b944',fontWeight:900}}>{p.sub}</span><small style={{fontSize:9,color:'#c6d2d8',lineHeight:1.45}}>{p.copy}</small></button>)}</div>

  <div style={{...panel,marginTop:10}}>
   <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={chip}>HTTPS {support.secure?'READY':'REQUIRED'}</span><span style={chip}>WEBXR {support.webxr?'DETECTED':'FALLBACK'}</span><span style={chip}>READ ALOUD {support.speech?'READY':'UNAVAILABLE'}</span></div>
   <p role="status" style={{...muted,marginBottom:0}}>{last}</p>
  </div>

  {overlay==='lab'&&<Suspense fallback={<div style={loading}>Loading Holo Lab…</div>}><HoloLabGateway onClose={()=>setOverlay(null)}/></Suspense>}
  {overlay==='xr'&&<Suspense fallback={<div style={loading}>Loading AR / VR gateway…</div>}><XRCommandGateway onClose={()=>setOverlay(null)}/></Suspense>}
 </section>
}

const shell:React.CSSProperties={marginTop:18,padding:16,border:'2px solid #2d7d91',borderRadius:22,background:'radial-gradient(circle at 50% 0,#102c3a,#080b0e 45%,#100d07)',color:'#fff',overflow:'hidden'}
const muted:React.CSSProperties={color:'#d2dadd',lineHeight:1.62}
const chip:React.CSSProperties={padding:'6px 8px',border:'1px solid #4f7480',borderRadius:999,background:'#08151b',fontSize:8,color:'#d8f7ff',fontWeight:900}
const portalBtn:React.CSSProperties={display:'grid',gap:5,textAlign:'left',padding:11,border:'1px solid #345865',borderRadius:14,background:'linear-gradient(145deg,#07131a,#0e0b07)',color:'#fff',cursor:'pointer'}
const panel:React.CSSProperties={padding:11,border:'1px solid #345865',borderRadius:14,background:'#071117'}
const loading:React.CSSProperties={position:'fixed',inset:0,zIndex:12400,display:'grid',placeItems:'center',background:'#03060bdd',color:'#fff',fontWeight:900}
