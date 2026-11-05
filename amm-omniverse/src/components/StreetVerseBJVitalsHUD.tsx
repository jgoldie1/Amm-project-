import {useEffect,useState} from 'react'
type Vitals={characterId:string;health:number;stamina:number;mobility:number;knockedOut:boolean;hasBleedingStatus:boolean;limping:boolean;injuryCount:number}
const healthy:Vitals={characterId:'bj-stubbs',health:100,stamina:100,mobility:100,knockedOut:false,hasBleedingStatus:false,limping:false,injuryCount:0}
export default function StreetVerseBJVitalsHUD(){
 const [vitals,setVitals]=useState<Vitals>(healthy)
 const [expanded,setExpanded]=useState(false)
 const [rig,setRig]=useState<{state:'loading'|'loaded'|'unavailable';version:string;animations:number;source:string}>({state:'loading',version:'unverified',animations:0,source:'unknown'})
 useEffect(()=>{
  const onReady=(event:Event)=>{
   const d=(event as CustomEvent<{url?:string;clipNames?:string[];assetId?:string}>).detail||{}
   setRig({state:'loaded',version:String(d.assetId||'BJ rig'),animations:Array.isArray(d.clipNames)?d.clipNames.length:0,source:String(d.url||'provider-managed')})
  }
  const onV15=(event:Event)=>{
   const d=(event as CustomEvent<{version?:string;animationCount?:number;sourceUrl?:string}>).detail||{}
   setRig({state:'loaded',version:String(d.version||'V15'),animations:Number(d.animationCount||0),source:String(d.sourceUrl||'provider-managed')})
  }
  const onError=()=>setRig(current=>({...current,state:'unavailable'}))
  window.addEventListener('tryamm:bj-meshy-v6-ready',onReady)
  window.addEventListener('tryamm:streetverse-bj-visible-version',onV15)
  window.addEventListener('tryamm:bj-meshy-v6-error',onError)
  return()=>{
   window.removeEventListener('tryamm:bj-meshy-v6-ready',onReady)
   window.removeEventListener('tryamm:streetverse-bj-visible-version',onV15)
   window.removeEventListener('tryamm:bj-meshy-v6-error',onError)
  }
 },[])
 useEffect(()=>{
  const onVitals=(event:Event)=>{
   const d=(event as CustomEvent<Partial<Vitals>>).detail
   if(d?.characterId!=='bj-stubbs')return
   const clamp=(n:unknown)=>Math.max(0,Math.min(100,Number.isFinite(Number(n))?Number(n):0))
   setVitals({...healthy,...d,health:clamp(d.health),stamina:clamp(d.stamina),mobility:clamp(d.mobility)})
  }
  window.addEventListener('tryamm:streetverse-character-vitals',onVitals)
  return()=>window.removeEventListener('tryamm:streetverse-character-vitals',onVitals)
 },[])
 const affected=vitals.injuryCount>0||vitals.health<100||vitals.mobility<100
 return <aside aria-label="BJ Stubbs fictional gameplay health" style={{position:'fixed',top:64,left:8,zIndex:24000,pointerEvents:'auto',maxWidth:210,fontFamily:'system-ui',color:'#fff'}}>
  <button type="button" aria-expanded={expanded} aria-controls="streetverse-bj-vitals-details" onClick={()=>setExpanded(v=>!v)} style={{minHeight:44,background:'#0a1825ea',border:'1px solid #60cfff',borderRadius:10,padding:'7px 10px',fontSize:11,fontWeight:850,color:'#fff'}}>
   BJ • HEALTH {Math.round(vitals.health)}% {affected?'• CONDITION':''}
  </button>
  {expanded&&<div id="streetverse-bj-vitals-details" style={{background:'#06111dec',border:'1px solid #51738a',borderRadius:10,padding:9,marginTop:4,fontSize:11}}>
   <div>Stamina: {Math.round(vitals.stamina)}%</div>
   <div>Mobility: {Math.round(vitals.mobility)}%</div>
   <div>{vitals.knockedOut?'Recover at a safe zone':vitals.limping?'Reduced movement':'Mobility normal'}</div>
   {vitals.hasBleedingStatus&&<div role="status" style={{color:'#ffb7a4'}}>Fictional bleeding status — use a safe-zone recovery action</div>}
   <div style={{marginTop:8,borderTop:'1px solid #51738a',paddingTop:6}}>BJ 3D rig: {rig.state==='loaded'?'Loaded':rig.state==='unavailable'?'Unavailable / fallback':'Not yet verified'}</div>
   {rig.state==='loaded'&&<div>{rig.version} • {rig.animations} available clips</div>}
   <small style={{display:'block',marginTop:6,color:'#c4d1e5'}}>Rig loaded does not certify likeness, bone retargeting or full gameplay.</small>
   <small style={{display:'block',marginTop:6,color:'#c4d1e5'}}>Fictional RPG damage; not medical guidance</small>
  </div>}
 </aside>
}
