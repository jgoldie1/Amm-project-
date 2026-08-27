import { useEffect } from 'react'

type Props={onClose:()=>void}
type Launch={icon:string;label:string;description:string;fn:string;status:'LIVE'|'BETA'|'SANDBOX'}

const launches:Launch[]=[
 {icon:'◈',label:'HoloGPT',description:'One assistant across TRYAMM, StreetVerse and Holoverse.','fn':'__showHoloGPT',status:'LIVE'},
 {icon:'🏙',label:'StreetVerse',description:'Enter the playable living-world beta.','fn':'__showPlayableBeta',status:'BETA'},
 {icon:'🔭',label:'Quantum Zoom',description:'Inspect the world across connected information scales.','fn':'__showQuantumZoom',status:'BETA'},
 {icon:'⏳',label:'Quantum Time',description:'Explore provenance-aware historical and simulated world states.','fn':'__showAdvancedWorlds',status:'BETA'},
 {icon:'🧪',label:'Quantum Sandbox',description:'Experiment without changing authoritative production state.','fn':'__showQuantumEngine',status:'SANDBOX'},
 {icon:'✦',label:'Holo Services',description:'Open the unified Holo service catalog.','fn':'__showHoloServices',status:'BETA'},
 {icon:'♫',label:'Holo Music',description:'Open the Holo Music experience.','fn':'__showHoloMusic',status:'BETA'},
 {icon:'📡',label:'Quantum Network',description:'Open TRYAMM Connect and network control plane.','fn':'__showTryAMMConnect',status:'BETA'},
 {icon:'🛍',label:'Marketplace',description:'Open commerce from the living-world ecosystem.','fn':'__showHoloMarketplace',status:'BETA'},
 {icon:'✦',label:'Command Nexus',description:'Inspect platform controls and readiness.','fn':'__showCommandNexusV2',status:'BETA'},
]

function launch(fn:string){const target=(window as any)[fn];if(typeof target==='function'){target();return true}return false}

export default function UnifiedHoloverseHub({onClose}:Props){
 useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc)},[onClose])
 const open=(item:Launch)=>{if(item.fn==='__showHoloGPT'){onClose();setTimeout(()=>{if(!launch(item.fn))window.dispatchEvent(new CustomEvent('tryamm:open-hologpt',{detail:{source:'holoverse'}}))},0);return} if(launch(item.fn))onClose()}
 return <div role="dialog" aria-label="Holoverse" style={{position:'fixed',inset:0,zIndex:11000,overflowY:'auto',background:'radial-gradient(circle at 50% 0%,#0b3540 0,#08091a 38%,#02030a 78%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
  <div style={{maxWidth:1050,margin:'0 auto',padding:'24px 16px 80px'}}>
   <header style={{display:'flex',alignItems:'center',gap:14,marginBottom:22}}><div style={{flex:1}}><div style={{fontSize:10,letterSpacing:4,color:'#4fe3ff',fontWeight:900}}>TRYAMM · UNIFIED EXPERIENCE</div><h1 style={{margin:'5px 0',fontSize:'clamp(28px,6vw,54px)'}}>HOLOVERSE</h1><div style={{color:'#a9c4d0',maxWidth:720,lineHeight:1.55}}>One Holo layer for StreetVerse, HoloGPT, Quantum Time, Quantum Zoom, Sandbox, network and commerce. The legacy embedded HoloGPT is retired from this release path.</div></div><button onClick={onClose} aria-label="Close Holoverse" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #4fe3ff66',background:'#07121d',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button></header>
   <div style={{padding:14,border:'1px solid #4fe3ff44',borderRadius:16,background:'#4fe3ff0b',marginBottom:16,lineHeight:1.55,fontSize:12}}><b style={{color:'#78ffb4'}}>RELEASE CONVERGENCE ACTIVE.</b> HoloGPT now opens the same production assistant used by the rest of TRYAMM. Beta and Sandbox labels remain visible until their production evidence passes.</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>{launches.map(item=><button key={item.label} onClick={()=>open(item)} style={{minHeight:150,textAlign:'left',padding:16,border:'1px solid #17364a',borderRadius:18,background:'linear-gradient(145deg,#07131e,#0b0b18)',color:'#fff',cursor:'pointer',boxShadow:'0 14px 38px #0006'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:28}}>{item.icon}</span><span style={{fontSize:9,fontWeight:950,color:item.status==='LIVE'?'#78ffb4':item.status==='SANDBOX'?'#c8a6ff':'#e8b944'}}>{item.status}</span></div><div style={{fontSize:16,fontWeight:950,marginTop:15}}>{item.label}</div><div style={{fontSize:11,color:'#91a8b5',lineHeight:1.45,marginTop:7}}>{item.description}</div></button>)}</div>
   <div style={{marginTop:18,fontFamily:'monospace',fontSize:10,color:'#718897'}}>RELEASE PATH · SIGN IN → PASSPORT → STREETVERSE → ZOOM → TIME → SANDBOX → PERSISTENCE → HOLOGPT → MISSION → XP → REEL → COMMERCE → LEDGER</div>
  </div>
 </div>
}
