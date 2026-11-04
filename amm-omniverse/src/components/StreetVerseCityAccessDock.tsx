import {useEffect,useState} from 'react'
import {installStreetVerseCommerceWorldRuntime} from '../runtime/StreetVerseCommerceWorldRuntime'

type CommerceMission={id:string;title:string;objectives:string[];type:string}
type CommerceState={city?:string;missions?:CommerceMission[]}
type Panel='retail'|'store'|null

// This dock belongs to the same React 3D surface as the player controls.
// Outer-shell overlays can be obscured by the full-screen WebGL world on iPhone.
export default function StreetVerseCityAccessDock(){
 const [panel,setPanel]=useState<Panel>(null)
 const [missions,setMissions]=useState<CommerceMission[]>([])
 const [notice,setNotice]=useState('')
 useEffect(()=>{
  const onCommerce=(event:Event)=>{
   const detail=(event as CustomEvent<CommerceState>).detail||{}
   setMissions(Array.isArray(detail.missions)?detail.missions.filter(m=>Boolean(m?.id&&m?.title)) : [])
  }
  const onArrival=(event:Event)=>{
   const d=(event as CustomEvent<{missionId?:string}>).detail||{}
   if(d.missionId==='taylor-single-canvas')setNotice('Taylor Street route reached in the 3D world.')
  }
  window.addEventListener('tryamm:streetverse-commerce-state',onCommerce)
  window.addEventListener('tryamm:west-side-route-arrived',onArrival)
  installStreetVerseCommerceWorldRuntime()
  window.dispatchEvent(new Event('tryamm:streetverse-commerce-request'))
  return()=>{
   window.removeEventListener('tryamm:streetverse-commerce-state',onCommerce)
   window.removeEventListener('tryamm:west-side-route-arrived',onArrival)
  }
 },[])
 const travel=()=>{
  setPanel(null);setNotice('Requesting the Taylor Street route…')
  window.dispatchEvent(new CustomEvent('tryamm:west-side-route-request',{detail:{
   x:24,z:-8,missionId:'taylor-single-canvas',source:'streetverse-city-access-dock'
  }}))
 }
 const choose=(mission:CommerceMission)=>{
  setPanel(null)
  setNotice('Selected: '+mission.title)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-commerce-select',{detail:{id:mission.id,source:'streetverse-city-access-dock'}}))
 }
 const style:React.CSSProperties={
  width:108,minHeight:44,border:'1px solid #6fe3ff',borderRadius:11,
  background:'rgba(3,24,34,.94)',color:'#fff',font:'850 10px system-ui',
  touchAction:'manipulation',padding:'7px 8px',boxShadow:'0 5px 14px #0009'
 }
 return <>
  <nav aria-label="StreetVerse city access" style={{
   position:'fixed',top:'max(210px,calc(env(safe-area-inset-top) + 210px))',
   right:'max(12px,env(safe-area-inset-right))',zIndex:41020,display:'grid',gap:5,
   width:108,pointerEvents:'auto'
  }}>
   <button id="sv-city-travel-button" type="button" aria-label="Travel to Taylor Street UIC Medical District" onClick={travel} style={style}>🏙 TAYLOR / UIC</button>
   <button id="sv-city-retail-open" type="button" aria-label="Open StreetVerse neighborhood stores" aria-expanded={panel==='retail'} onClick={()=>{setPanel(p=>p==='retail'?null:'retail');window.dispatchEvent(new Event('tryamm:streetverse-commerce-request'))}} style={style}>🏬 STORES</button>
   <button id="sv-city-store-open" type="button" aria-label="Open StreetVerse local store preview" aria-expanded={panel==='store'} onClick={()=>setPanel(p=>p==='store'?null:'store')} style={style}>🛍 STORE</button>
  </nav>
  {notice&&<div role="status" style={{position:'fixed',top:'max(380px,calc(env(safe-area-inset-top) + 380px))',right:12,zIndex:41018,maxWidth:150,color:'#c7f8ff',font:'750 10px system-ui',background:'#031421ec',padding:7,borderRadius:9,pointerEvents:'none'}}>{notice}</div>}
  {panel&&<section role="dialog" aria-label={panel==='retail'?'StreetVerse commerce missions':'StreetVerse local store preview'} style={{
   position:'fixed',zIndex:45000,left:10,right:10,top:'max(85px,calc(env(safe-area-inset-top) + 85px))',
   maxWidth:370,margin:'0 auto',maxHeight:'min(60dvh,475px)',overflowY:'auto',
   padding:13,background:'rgba(3,13,23,.98)',border:'1px solid #6fe3ff',borderRadius:16,
   color:'#fff',boxShadow:'0 12px 40px #000c',font:'12px system-ui'
  }}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
    <strong>{panel==='retail'?'STREETVERSE BUSINESS MISSIONS':'ALL AMERICAN MARKETPLACE'}</strong>
    <button aria-label="Close StreetVerse store panel" type="button" onClick={()=>setPanel(null)} style={{...style,width:44,minWidth:44}}>×</button>
   </header>
   {panel==='retail'?<>
    <p>Choose a local commerce mission. Rewards and purchases require separate verification.</p>
    {missions.length?missions.map(m=><button key={m.id} onClick={()=>choose(m)} type="button" style={{...style,width:'100%',marginTop:7,textAlign:'left'}}>{m.title}<span style={{display:'block',fontWeight:400,marginTop:4}}>{m.objectives?.[0]||'Explore this mission'}</span></button>):<p>Commerce missions are loading or unavailable. No transaction has been started.</p>}
   </>:<>
    <p>This is an in-game storefront gateway, not a finished 3D shop or active payment checkout.</p>
    <button type="button" onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-commerce-request'));setPanel('retail')}} style={{...style,width:'100%'}}>BROWSE COMMERCE MISSIONS</button>
    <button type="button" onClick={()=>{window.location.href='/business'}} style={{...style,width:'100%',marginTop:8}}>OPEN ALL AMERICAN BUSINESS DIRECTORY</button>
   </>}
  </section>}
 </>
}
