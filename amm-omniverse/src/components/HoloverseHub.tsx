import { useEffect } from 'react'
import { useGameStore } from '../game/state/useGameStore'

type Props={onClose:()=>void}
type Status='LIVE'|'BETA'|'SANDBOX'
type Launch={icon:string;label:string;description:string;status:Status;open:()=>void}

const invoke=(fn:string)=>{const target=(window as any)[fn];if(typeof target==='function'){target();return true}return false}
const event=(name:string,detail:Record<string,unknown>={})=>window.dispatchEvent(new CustomEvent(name,{detail:{source:'holoverse',...detail}}))

export default function HoloverseHub({onClose}:Props){
  useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc)},[onClose])
  const setScreen=useGameStore(s=>s.setScreen)
  const launches:Launch[]=[
    {icon:'◈',label:'HoloGPT',description:'The same unified assistant used everywhere in TRYAMM.',status:'LIVE',open:()=>{if(!invoke('__showHoloGPT'))event('tryamm:open-hologpt')}},
    {icon:'🏙',label:'StreetVerse',description:'Enter the playable living-world beta.',status:'BETA',open:()=>{window.location.href='/streetverse'}},
    {icon:'🔭',label:'Quantum Zoom',description:'Inspect connected world information across scales.',status:'BETA',open:()=>{if(!invoke('__showQuantumZoom'))event('tryamm:open-quantum-zoom')}},
    {icon:'⏳',label:'Quantum Time',description:'Explore provenance-aware historical and simulated states.',status:'BETA',open:()=>{if(!invoke('__showAdvancedWorlds'))event('tryamm:open-advanced-worlds')}},
    {icon:'🧪',label:'Quantum Sandbox',description:'Experiment without changing authoritative production state.',status:'SANDBOX',open:()=>{if(!invoke('__showQuantumEngine'))event('tryamm:open-quantum-engine')}},
    {icon:'✦',label:'Holo Services',description:'Open the unified Holo service catalog.',status:'BETA',open:()=>{if(!invoke('__showHoloServices'))event('tryamm:open-holo-services')}},
    {icon:'♫',label:'Holo Music',description:'Open the TRYAMM music realm and creator audio experience.',status:'BETA',open:()=>setScreen('music')},
    {icon:'📡',label:'Quantum Network',description:'Open TRYAMM Connect and network control plane.',status:'BETA',open:()=>{if(!invoke('__showTryAMMConnect'))event('tryamm:open-connect')}},
    {icon:'🛍',label:'Marketplace',description:'Open commerce from the TRYAMM ecosystem.',status:'BETA',open:()=>setScreen('marketplace')},
    {icon:'✦',label:'Command Nexus',description:'Inspect controls, telemetry and readiness.',status:'BETA',open:()=>{if(!invoke('__showCommandNexus'))event('tryamm:open-command-nexus')}},
  ]
  const open=(item:Launch)=>{onClose();setTimeout(item.open,0)}
  return <div role="dialog" aria-label="Holoverse" style={{position:'fixed',inset:0,zIndex:11000,overflowY:'auto',background:'radial-gradient(circle at 50% 0%,#0b3540 0,#08091a 38%,#02030a 78%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}><div style={{maxWidth:1050,margin:'0 auto',padding:'24px 16px 80px'}}><header style={{display:'flex',alignItems:'center',gap:14,marginBottom:22}}><div style={{flex:1}}><div style={{fontSize:10,letterSpacing:4,color:'#4fe3ff',fontWeight:900}}>TRYAMM · UNIFIED EXPERIENCE</div><h1 style={{margin:'5px 0',fontSize:'clamp(28px,6vw,54px)'}}>HOLOVERSE</h1><div style={{color:'#a9c4d0',maxWidth:720,lineHeight:1.55}}>One Holo layer for StreetVerse, HoloGPT, Quantum Time, Quantum Zoom, Sandbox, network and commerce.</div></div><button onClick={onClose} aria-label="Close Holoverse" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #4fe3ff66',background:'#07121d',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button></header><div style={{padding:14,border:'1px solid #4fe3ff44',borderRadius:16,background:'#4fe3ff0b',marginBottom:16,lineHeight:1.55,fontSize:12}}><b style={{color:'#78ffb4'}}>CONNECTED HOLOVERSE.</b> Launchers now use real routes, real game realms, existing TRYAMM controls, and event fallbacks instead of dead global function names.</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>{launches.map(item=><button key={item.label} onClick={()=>open(item)} style={{minHeight:150,textAlign:'left',padding:16,border:'1px solid #17364a',borderRadius:18,background:'linear-gradient(145deg,#07131e,#0b0b18)',color:'#fff',cursor:'pointer',boxShadow:'0 14px 38px #0006'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:28}}>{item.icon}</span><span style={{fontSize:9,fontWeight:950,color:item.status==='LIVE'?'#78ffb4':item.status==='SANDBOX'?'#c8a6ff':'#e8b944'}}>{item.status}</span></div><div style={{fontSize:16,fontWeight:950,marginTop:15}}>{item.label}</div><div style={{fontSize:11,color:'#91a8b5',lineHeight:1.45,marginTop:7}}>{item.description}</div></button>)}</div><div style={{marginTop:18,fontFamily:'monospace',fontSize:10,color:'#718897'}}>BETA PATH · SIGN IN → PASSPORT → STREETVERSE → MOVE/PLAY → ZOOM → TIME → SANDBOX → POCKET DIMENSION → HOLOGPT → MISSION → XP → REEL → COMMERCE → LEDGER</div></div></div>
}
