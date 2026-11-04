import {lazy,Suspense,useEffect,useState} from 'react'
const StreetVerseTransportScreenLab=lazy(()=>import('./StreetVerseTransportScreenLab'))
import {QUANTUM_TOWER_LAUNCH_MODULES} from '../runtime/StreetVerseQuantumTowerLaunchRuntime'

type Health={configured:boolean;hostAllowlistReady?:boolean;readyForPublic?:boolean;missing?:string[]}
type ModApi={list:()=>unknown[]}
const TOWER_EVENT='tryamm:quantum-tower-connectivity'

/**
 * Nonintrusive read-only integration diagnostics. A mounted source component,
 * remote-provider configuration and a verified operating service are distinct.
 */
export default function StreetVerseTowerConnections(){
 const [open,setOpen]=useState(false)
 const [transportLabOpen,setTransportLabOpen]=useState(false)
 const [live,setLive]=useState<Health|null>(null)
 const [error,setError]=useState('')
 const [modCount,setModCount]=useState<number|null>(null)
 const [gameReady,setGameReady]=useState(false)
 const [vehicleConfirmed,setVehicleConfirmed]=useState(false)
 const [lastMission,setLastMission]=useState('')
 const [broadcastObserved,setBroadcastObserved]=useState(false)
 const [aiFabricDetected,setAiFabricDetected]=useState(false)
 const [jarvisDetected,setJarvisDetected]=useState(false)
 const [travelStateObserved,setTravelStateObserved]=useState(false)
 const [injury,setInjury]=useState<{health:number;phase:string;visuals:string;characterId:string}|null>(null)
 const [organs,setOrgans]=useState<{stamina:number;breathing:number;mobility:number;consciousness:string;needsRescue:boolean;integrity:Record<string,number>}|null>(null)
 useEffect(()=>{
  const onGame=()=>setGameReady(true)
  const onBroadcast=()=>setBroadcastObserved(true)
  const onTravel=()=>setTravelStateObserved(true)
  const onAi=()=>setAiFabricDetected(true)
  const onVehicle=(e:Event)=>{if((e as CustomEvent<{entered?:boolean}>).detail?.entered)setVehicleConfirmed(true)}
  const onMission=(e:Event)=>setLastMission(String((e as CustomEvent<{id?:string;label?:string}>).detail?.label||(e as CustomEvent<{id?:string}>).detail?.id||'Completed mission'))
  const onInjury=(event:Event)=>{const next=(event as CustomEvent<{health:number;phase:string;visuals:string;characterId:string}>).detail;if(next)setInjury(next)}
  const onOrgans=(event:Event)=>{const next=(event as CustomEvent<{stamina:number;breathing:number;mobility:number;consciousness:string;needsRescue:boolean;integrity:Record<string,number>}>).detail;if(next)setOrgans(next)}
  addEventListener('tryamm:streetverse-organ-state',onOrgans)
  addEventListener('tryamm:streetverse-injury-state',onInjury)
  addEventListener('tryamm:broadcast-os-state',onBroadcast)
  addEventListener('tryamm:global-travel-state',onTravel)
  addEventListener('tryamm:stubbs-lyons-middleverse-ready',onAi)
  addEventListener('tryamm:streetverse-world-ready',onGame)
  addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
  addEventListener('tryamm:streetverse-mission-complete',onMission)
  return()=>{removeEventListener('tryamm:streetverse-organ-state',onOrgans);removeEventListener('tryamm:streetverse-injury-state',onInjury);removeEventListener('tryamm:broadcast-os-state',onBroadcast);removeEventListener('tryamm:global-travel-state',onTravel);removeEventListener('tryamm:stubbs-lyons-middleverse-ready',onAi);removeEventListener('tryamm:streetverse-world-ready',onGame);removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);removeEventListener('tryamm:streetverse-mission-complete',onMission)}
 },[])
 useEffect(()=>{
  if(!open)return
  let cancelled=false
  const mod=(window as typeof window&{__TRYAMM_MOD_PASS__?:ModApi}).__TRYAMM_MOD_PASS__
  try{setModCount(mod?mod.list().length:null)}catch{setModCount(null)}
  setAiFabricDetected(Boolean((window as typeof window&{__TRYAMM_OPERATING_FABRIC__?:unknown}).__TRYAMM_OPERATING_FABRIC__))
  setJarvisDetected(Boolean((window as typeof window&{__jarvis?:unknown}).__jarvis))
  window.dispatchEvent(new Event('tryamm:broadcast-os-request'))
  window.dispatchEvent(new Event('tryamm:global-travel-request'))
  fetch('/api/live/status',{cache:'no-store'}).then(async response=>{
   if(!response.ok)throw new Error('LIVE status endpoint unavailable')
   return await response.json() as Health
  }).then(status=>{if(!cancelled){setLive(status);setError('')}}).catch(e=>{if(!cancelled){setLive(null);setError(e instanceof Error?e.message:'LIVE status check failed')}})
  return()=>{cancelled=true}
 },[open])
 useEffect(()=>{
  const statuses={streetverseGameEventSeen:gameReady,vehicleOccupancyEventSeen:vehicleConfirmed,missionCompletionEventSeen:Boolean(lastMission),liveProviderConfigured:Boolean(live?.configured),liveHostAllowlist:Boolean(live?.hostAllowlistReady),livePublicVerified:Boolean(live?.readyForPublic),modRuntimeInstalled:modCount!==null,modPackageCount:modCount,broadcastStateObserved:broadcastObserved,aiFabricDetected,jarvisDetected,travelStateObserved}
  window.dispatchEvent(new CustomEvent(TOWER_EVENT,{detail:{statuses,verifiedEndToEnd:false,source:'streetverse-tower-connections'}}))
 },[gameReady,vehicleConfirmed,lastMission,live,modCount,broadcastObserved,aiFabricDetected,jarvisDetected,travelStateObserved])
 return <>
  {transportLabOpen&&<Suspense fallback={null}><StreetVerseTransportScreenLab onClose={()=>setTransportLabOpen(false)}/></Suspense>}
  <button aria-label="Open Quantum Tower connection diagnostics" onClick={()=>setOpen(v=>!v)} style={{position:'fixed',top:76,left:10,zIndex:48001,minHeight:44,padding:'7px 10px',borderRadius:12,border:'1px solid #91eaff88',background:'#071f2aee',color:'#fff',fontWeight:900,fontSize:11,touchAction:'manipulation'}}>🏙️ TOWER {open?'×':'STATUS'}</button>
  {open&&<section role="dialog" aria-label="Quantum Tower integration status" style={{position:'fixed',top:125,left:10,width:'min(92vw,380px)',maxHeight:'70dvh',overflowY:'auto',zIndex:48001,padding:12,borderRadius:14,background:'#05111bf5',border:'1px solid #75d7ed',color:'#fff',fontFamily:'system-ui',boxShadow:'0 12px 38px #000c'}}>
   <h2 style={{margin:'0 0 8px',fontSize:16}}>QUANTUM TOWER CONNECTIONS</h2>
   <p style={{fontSize:11,lineHeight:1.5,color:'#b4ccd8'}}>Read-only diagnostics. Installed code is not proof of working payments, AI, video, multiplayer or deployment.</p>
   <div style={{display:'grid',gap:5,fontSize:11}}>
    <div>StreetVerse world-ready event: <b>{gameReady?'SEEN':'NOT OBSERVED'}</b></div>
    <div>Vehicle entry confirmation: <b>{vehicleConfirmed?'SEEN':'NOT OBSERVED'}</b></div>
    <div>Mission completion: <b>{lastMission||'NOT OBSERVED'}</b></div>
    <div>LiveKit server configuration: <b>{live===null?'UNKNOWN':live.configured?'CONFIGURED':'MISSING'}</b></div>
    <div>Approved host allowlist: <b>{live?.hostAllowlistReady?'CONFIGURED':'NOT VERIFIED'}</b></div>
    <div>Public LIVE verification: <b>{live?.readyForPublic?'SERVER FLAG ON • RECHECK MEDIA':'PENDING'}</b></div>
    <div>Mod Pass runtime: <b>{modCount===null?'NOT OBSERVED':`INSTALLED • ${modCount} PACKAGES`}</b></div>
    <div>CrossVerse consent: <b>POLICY SOURCE PRESENT • RECORDS NOT AUDITED</b></div>
    <div>Broadcast OS event: <b>{broadcastObserved?'OBSERVED':'NOT OBSERVED'}</b></div>
    <div>Global travel state: <b>{travelStateObserved?'OBSERVED':'NOT OBSERVED'}</b></div>
    <div>Stubbs / Lyons / MiddleVerse fabric: <b>{aiFabricDetected?'RUNTIME PRESENT • TASKS UNTESTED':'NOT OBSERVED'}</b></div>
    <div>JARVIS router: <b>{jarvisDetected?'RUNTIME PRESENT • COMMANDS UNTESTED':'NOT OBSERVED'}</b></div>
    <div>Creator earnings: <b>PAYMENT & PAYOUTS NOT VERIFIED</b></div>
    <div>World compilation: <b>SOURCE PRESENT • BUILD NOT VERIFIED</b></div>
   </div>
   <section aria-label="StreetVerse character injury test" style={{border:'1px solid #5d3a46',borderRadius:10,padding:8,marginTop:10,display:'grid',gap:6}}>
    <b style={{fontSize:11}}>CHARACTER INJURY • LOCAL TEST</b>
    <div style={{fontSize:10}}>HP {injury?.health??'—'} • {injury?.phase||'waiting for game'} • {injury?.characterId||'selected player'}</div>
    <div style={{fontSize:10}}>Effects: {injury?.visuals||'minimal'}. These buttons are fictional, local tests only—not medical diagnoses, multiplayer damage or real XP.</div>
    <div style={{fontSize:10}}>BODY SYSTEMS • {organs?.consciousness||'waiting'} • breathing {organs?.breathing??'—'} • stamina {organs?.stamina??'—'} • mobility {organs?.mobility??'—'}</div>
    {organs&&<div style={{fontSize:10}}>Brain {Math.round(organs.integrity.brain)} • Heart {Math.round(organs.integrity.heart)} • Lungs {Math.round(organs.integrity.lungs)} • Liver {Math.round(organs.integrity.liver)} • Kidneys {Math.round(organs.integrity.kidneys)} {organs.needsRescue?'• RESCUE REQUEST':''}</div>}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
     <button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-local-damage-demo',{detail:{amount:25,zone:'chest',source:'tower-injury-test'}}))}>TEST CHEST HIT −25 HP</button>
     <button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-local-damage-demo',{detail:{amount:100,source:'tower-defeat-test'}}))}>TEST DEFEAT</button>
     <button style={btn} onClick={()=>window.dispatchEvent(new Event('tryamm:streetverse-local-respawn-demo'))}>RESPAWN</button>
     <button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-injury-visual-mode',{detail:{mode:injury?.visuals==='standard'?'off':injury?.visuals==='off'?'minimal':'standard'}}))}>FX: {injury?.visuals||'minimal'} • CHANGE</button>
    </div>
   </section>
   {error&&<p role="alert" style={{fontSize:10,color:'#ffb69d'}}>Status error: {error}</p>}
   <div style={{display:'grid',gap:6,marginTop:10}}>
    <button style={btn} onClick={()=>{setOpen(false);const host=window.open('/live?format=gamecast&role=host&from=quantum-tower','_blank');if(host)try{host.opener=null}catch{};if(!host)window.dispatchEvent(new CustomEvent('tryamm:live-center-open',{detail:{source:'quantum-tower',format:'gamecast'}}))}}>📡 OPEN GAMECAST HOST TAB</button>
    <button style={btn} onClick={()=>{setOpen(false);setTransportLabOpen(true)}}>🚌 CAR • BUS • L TRAIN • AIRPORT DISPLAY LAB</button>
    <button style={btn} onClick={()=>window.dispatchEvent(new Event('tryamm:mod-pass-open'))}>🧩 OPEN MOD PASS</button>
    <button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'quantum-tower'}}))}>🎥 OPEN REEL CREATOR</button>
    <button style={btn} onClick={()=>window.location.assign('/network/broadcast-os')}>📺 BROADCAST NETWORK</button>
   </div>
   <div style={{fontSize:10,marginTop:10,color:'#98b5c7'}}>Launch modules tracked: {QUANTUM_TOWER_LAUNCH_MODULES.length}. No authorization or credentials are generated here.</div>
   <button onClick={()=>setOpen(false)} style={{...btn,marginTop:8}}>CLOSE / RETURN TO GAME</button>
  </section>}
 </>
}
const btn:React.CSSProperties={minHeight:44,width:'100%',borderRadius:9,border:'1px solid #78ddea88',background:'#0b3040',color:'#fff',fontWeight:850,fontSize:11,touchAction:'manipulation'}
