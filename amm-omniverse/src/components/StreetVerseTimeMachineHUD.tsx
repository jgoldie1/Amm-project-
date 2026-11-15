import React,{useMemo,useState} from 'react'
import {createCrossVerseTravelDirector} from '../runtime/StreetVerseCrossVerseTravelDirector'

/** Prototype time-machine controls; parent world renderer must implement scene swaps. */
export function StreetVerseTimeMachineHUD(){
 const director=useMemo(()=>{
  const d=createCrossVerseTravelDirector()
  d.registerPortal({id:'chicago-campus',from:'streetverse',to:'campusverse',destination:'campusverse:greenville',timelineKind:'multiverse',requiresConsent:true,enabled:true})
  return d
 },[])
 const [destination,setDestination]=useState('streetverse:chicago')
 const [status,setStatus]=useState('TIME MACHINE STANDBY')
 const [busy,setBusy]=useState(false)
 const [consent,setConsent]=useState(false)
 const travel=()=>{
  if(busy||!consent)return
  setBusy(true)
  try{
   const at=Date.now()
   const receipt=director.enter({portalId:'chicago-campus',playerId:'bj-stubbs',consented:true,at})
   setDestination(receipt.to)
   setStatus('PORTAL OPEN • CAMPUSVERSE ARRIVAL REQUESTED')
   window.dispatchEvent(new CustomEvent('tryamm:crossverse-scene-transition',{detail:{...receipt,effect:'mycelium-warp',requiresSceneLoad:true}}))
  }catch(error){setStatus(error instanceof Error?error.message:'PORTAL ERROR')}
  finally{setBusy(false)}
 }
 const returnHome=()=>{
  director.returnTo('streetverse:chicago')
  setDestination('streetverse:chicago')
  setStatus('CHICAGO RETURN REQUESTED')
  window.dispatchEvent(new CustomEvent('tryamm:crossverse-scene-transition',{detail:{to:'streetverse:chicago',effect:'mycelium-warp',requiresSceneLoad:true}}))
 }
 return <aside aria-label="CrossVerse time machine" style={{padding:14,border:'2px solid #66d8c6',borderRadius:14,background:'#0b1824',color:'white',fontFamily:'system-ui',maxWidth:350}}>
  <h3 style={{margin:'0 0 8px'}}>CROSSVERSE • TIME MACHINE</h3>
  <p role="status" aria-live="polite">{status}</p>
  <p>Current timeline: <strong>{destination}</strong></p>
  <label style={{display:'flex',gap:10,alignItems:'center',minHeight:48}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Allow timeline travel</label>
  <button disabled={!consent||busy||destination!=='streetverse:chicago'} onClick={travel} style={{width:'100%',minHeight:56,borderRadius:10,background:'#91ead7',color:'#081b18',fontWeight:800}}>ACTIVATE TIME MACHINE</button>
  <button disabled={destination==='streetverse:chicago'} onClick={returnHome} style={{width:'100%',minHeight:56,marginTop:10,borderRadius:10,background:'#264a67',color:'white',fontWeight:800}}>RETURN TO CHICAGO</button>
  <small>Prototype: requests a scene transition; a connected 3D scene loader must complete arrival.</small>
 </aside>
}
