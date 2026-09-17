import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './accessibility/accessibility.css'
import StreetVerseGeoSpawnBridge from './components/StreetVerseGeoSpawnBridge'

function StreetVerseProductionEntry(){
 return <>
  <StreetVerseGeoSpawnBridge onClose={()=>{window.location.href='/'}} />
  <nav aria-label="StreetVerse quick navigation" style={{position:'fixed',left:12,top:12,zIndex:16990,display:'flex',gap:8,maxWidth:'calc(100vw - 24px)',overflowX:'auto'}}>
   <button onClick={()=>{window.location.href='/streetverse/twin-world'}} style={navButton}>🌎 TWIN WORLD</button>
   <button onClick={()=>{window.location.href='/streetverse/meet-the-stubbs'}} style={navButton}>MEET THE STUBBS</button>
   <button onClick={()=>{window.location.href='/live'}} style={navButton}>● LIVE</button>
   <button onClick={()=>{window.location.href='/holo-drama'}} style={navButton}>🎬 HOLO DRAMA</button>
  </nav>
 </>
}

const navButton={border:'1px solid #62b8ff99',borderRadius:999,padding:'10px 14px',background:'#071725',color:'#fff',fontWeight:950,cursor:'pointer',whiteSpace:'nowrap' as const}

createRoot(document.getElementById('root')!).render(<StrictMode><StreetVerseProductionEntry/></StrictMode>)

const deferRuntimeBoot=()=>{
 const boot=async()=>{
  const installers=await Promise.all([
   import('./runtime/ProductionHealthMonitor').then(m=>m.installProductionHealthMonitor),
   import('./runtime/mediaCloudBridge').then(m=>m.installMediaCloudBridge),
   import('./runtime/StreetVerseLivingWorldRuntime').then(m=>m.installStreetVerseLivingWorldRuntime),
   import('./runtime/StreetVerseWorldMemory').then(m=>m.installStreetVerseWorldMemory),
   import('./runtime/StreetVerseCheckpointRuntime').then(m=>m.installStreetVerseCheckpointRuntime),
   import('./runtime/StreetVersePerformanceBudget').then(m=>m.installStreetVersePerformanceBudget),
   import('./runtime/StreetVerseResilienceRuntime').then(m=>m.installStreetVerseResilienceRuntime),
   import('./runtime/StreetVerseUnifiedProgressionRuntime').then(m=>m.installStreetVerseUnifiedProgressionRuntime),
   import('./runtime/StreetVerseGameModeRuntime').then(m=>m.installStreetVerseGameModeRuntime),
   import('./runtime/StreetVerseCommerceWorldRuntime').then(m=>m.installStreetVerseCommerceWorldRuntime),
   import('./runtime/CreatorExperienceRuntime').then(m=>m.installCreatorExperienceRuntime),
   import('./runtime/SocialShareBridge').then(m=>m.installSocialShareBridge),
   import('./runtime/StreetVerseMissionDiscoveryRuntime').then(m=>m.installStreetVerseMissionDiscoveryRuntime),
   import('./runtime/OmniverseEventFabricRuntime').then(m=>m.installOmniverseEventFabricRuntime),
  ])
  installers.forEach(install=>{try{install()}catch{}})
 }
 void boot()
}

type IdleWindow=Window&{requestIdleCallback?:(cb:()=>void,options?:{timeout:number})=>number}
const idleWindow=window as IdleWindow
if(typeof idleWindow.requestIdleCallback==='function'){
 idleWindow.requestIdleCallback(deferRuntimeBoot,{timeout:2500})
}else{
 globalThis.setTimeout(deferRuntimeBoot,900)
}
