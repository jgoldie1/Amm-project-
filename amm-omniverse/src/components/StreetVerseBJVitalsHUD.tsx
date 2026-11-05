import {useEffect,useState} from 'react'
type Vitals={characterId:string;health:number;stamina:number;mobility:number;knockedOut:boolean;hasBleedingStatus:boolean;limping:boolean;injuryCount:number}
type Organs={characterId:string;integrity:Record<'brain'|'heart'|'lungs'|'liver'|'kidneys',number>;breathing:number;mobility:number;consciousness:string;needsRescue:boolean}
const healthy:Vitals={characterId:'bj-stubbs',health:100,stamina:100,mobility:100,knockedOut:false,hasBleedingStatus:false,limping:false,injuryCount:0}
export default function StreetVerseBJVitalsHUD(){
 const [vitals,setVitals]=useState<Vitals>(healthy)
 const [organs,setOrgans]=useState<Organs|null>(null)
 const [demoHealth,setDemoHealth]=useState<number|null>(null)
 const [injuryView,setInjuryView]=useState<'off'|'minimal'|'standard'>('minimal')
 const [rigInspectMode,setRigInspectMode]=useState<'off'|'overlay'|'exploded'>('off')
 const [bonesDetected,setBonesDetected]=useState<number|null>(null)
 const [bodyFeedback,setBodyFeedback]=useState<{paceMultiplier:number;breathingEffort:number;canSprint:boolean;collapse:boolean;rescueRecommended:boolean}|null>(null)
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
 useEffect(()=>{
  const onOrgans=(event:Event)=>{
   const d=(event as CustomEvent<Organs>).detail
   if(d?.characterId==='bj-stubbs'&&d.integrity)setOrgans(d)
  }
  const onDamageState=(event:Event)=>{
   const d=(event as CustomEvent<{characterId?:string;health?:number}>).detail
   if(d?.characterId==='bj-stubbs'&&Number.isFinite(Number(d.health)))setDemoHealth(Math.min(100,Math.max(0,Number(d.health))))
  }
  window.addEventListener('tryamm:streetverse-organ-state',onOrgans)
  window.addEventListener('tryamm:streetverse-injury-state',onDamageState)
  return()=>{
   window.removeEventListener('tryamm:streetverse-organ-state',onOrgans)
   window.removeEventListener('tryamm:streetverse-injury-state',onDamageState)
  }
 },[])
 useEffect(()=>{
  const onInspector=(event:Event)=>{
   const d=(event as CustomEvent<{rigBoneCount?:number;mode?:string}>).detail
   if(Number.isInteger(d?.rigBoneCount))setBonesDetected(Number(d!.rigBoneCount))
  }
  window.addEventListener('tryamm:streetverse-anatomy-inspector-status',onInspector)
  return()=>window.removeEventListener('tryamm:streetverse-anatomy-inspector-status',onInspector)
 },[])
 useEffect(()=>{
  const onFeedback=(event:Event)=>{
   const d=(event as CustomEvent<{characterId?:string;paceMultiplier?:number;breathingEffort?:number;canSprint?:boolean;collapse?:boolean;rescueRecommended?:boolean}>).detail
   if(d?.characterId!=='bj-stubbs')return
   const pace=Number(d.paceMultiplier),breathing=Number(d.breathingEffort)
   if(!Number.isFinite(pace)||!Number.isFinite(breathing))return
   setBodyFeedback({paceMultiplier:Math.max(0,Math.min(1,pace)),breathingEffort:Math.max(0,Math.min(1,breathing)),canSprint:d.canSprint===true,collapse:d.collapse===true,rescueRecommended:d.rescueRecommended===true})
  }
  window.addEventListener('tryamm:streetverse-living-body-feedback',onFeedback)
  return()=>window.removeEventListener('tryamm:streetverse-living-body-feedback',onFeedback)
 },[])
 const inspectionAllowed=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('injuryLab')==='1'
 const demo=(name:string,detail:Record<string,unknown>={})=>window.dispatchEvent(new CustomEvent(name,{detail}))
 const organNames:['brain','heart','lungs','liver','kidneys']=['brain','heart','lungs','liver','kidneys']
 const affected=vitals.injuryCount>0||vitals.health<100||vitals.mobility<100
 return <aside aria-label="BJ Stubbs fictional gameplay health" style={{position:'fixed',top:64,left:8,zIndex:24000,pointerEvents:'auto',maxWidth:210,fontFamily:'system-ui',color:'#fff'}}>
  <button type="button" aria-expanded={expanded} aria-controls="streetverse-bj-vitals-details" onClick={()=>setExpanded(v=>!v)} style={{minHeight:44,background:'#0a1825ea',border:'1px solid #60cfff',borderRadius:10,padding:'7px 10px',fontSize:11,fontWeight:850,color:'#fff'}}>
   BJ • HEALTH {Math.round(demoHealth??vitals.health)}% {affected?'• CONDITION':''}
  </button>
  {expanded&&<div id="streetverse-bj-vitals-details" style={{background:'#06111dec',border:'1px solid #51738a',borderRadius:10,padding:9,marginTop:4,fontSize:11}}>
   <div>Stamina: {Math.round(vitals.stamina)}%</div>
   <div>Mobility: {Math.round(vitals.mobility)}%</div>
   {bodyFeedback&&<div aria-label="BJ injury-adjusted movement" style={{padding:'5px 0',marginTop:5,borderTop:'1px solid #51738a'}}>Walk speed: {Math.round(bodyFeedback.paceMultiplier*100)}% • Sprint: {bodyFeedback.canSprint?'Allowed':'Restricted'} • Breathing effort: {Math.round(bodyFeedback.breathingEffort*100)}%{bodyFeedback.rescueRecommended&&<div role="status" style={{color:'#ffc4a6'}}>Rescue or recovery recommended (fictional game).</div>}</div>}
   <div>{vitals.knockedOut?'Recover at a safe zone':vitals.limping?'Reduced movement':'Mobility normal'}</div>
   {vitals.hasBleedingStatus&&<div role="status" style={{color:'#ffb7a4'}}>Fictional bleeding status — use a safe-zone recovery action</div>}
   <div style={{marginTop:8,borderTop:'1px solid #51738a',paddingTop:6}}>BJ 3D rig: {rig.state==='loaded'?'Loaded':rig.state==='unavailable'?'Unavailable / fallback':'Not yet verified'}</div>
   {rig.state==='loaded'&&<div>{rig.version} • {rig.animations} available clips</div>}
   {organs&&<section aria-label="BJ fictional internal organ inspector" style={{marginTop:8,borderTop:'1px solid #51738a',paddingTop:8}}>
    <strong>ANATOMY • FICTIONAL GAME STATE</strong>
    <div style={{marginTop:4}}>Consciousness: {organs.consciousness}</div>
    <div>Breathing: {Math.round(organs.breathing)}%</div>
    <div>Rescue: {organs.needsRescue?'Needed':'Not needed'}</div>
    {organNames.map(name=><div key={name} style={{display:'flex',justifyContent:'space-between',gap:8,marginTop:3}}><span>{name.toUpperCase()}</span><span>{Math.round(organs.integrity[name])}%</span></div>)}
    <small style={{display:'block',marginTop:5,color:'#c4d1e5'}}>These values are fictional gameplay indicators. Optional 3D overlays are schematic, not realistic organ meshes.</small>
   </section>}
   {inspectionAllowed&&<section aria-label="Developer anatomy rig tests" style={{marginTop:7,borderTop:'1px solid #51738a',paddingTop:8}}>
    <strong>TEARDOWN LAB • LOCAL DEMO</strong>
    <div style={{marginTop:7}}>Non-destructive GLB rig / organ inspector</div>
    <div role="group" aria-label="Rig and organ visualization mode" style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:5}}>
     {(['off','overlay','exploded'] as const).map(mode=><button type="button" key={mode} aria-pressed={rigInspectMode===mode} onClick={()=>{setRigInspectMode(mode);demo('tryamm:streetverse-anatomy-inspect-toggle',{mode})}} style={{minHeight:42}}>{mode.toUpperCase()}</button>)}
    </div>
    <small style={{display:'block',marginTop:5}}>Real rig joints detected: {bonesDetected===null?'Not inspected':bonesDetected}. Exploded view moves visual markers only; the source rig remains intact.</small>
    <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:6}}>
     <button onClick={()=>demo('tryamm:streetverse-local-damage-demo',{characterId:'bj-stubbs',amount:25,zone:'chest'})}>TEST HIT −25 HP</button>
     <button onClick={()=>demo('tryamm:streetverse-local-damage-demo',{characterId:'bj-stubbs',amount:100,zone:'head'})}>TEST DEFEAT</button>
     <button onClick={()=>demo('tryamm:streetverse-local-respawn-demo')}>RESPAWN</button>
    </div>
    <label style={{display:'block',marginTop:6}}>Blood particle setting
     <select value={injuryView} onChange={event=>{const mode=event.target.value as 'off'|'minimal'|'standard';setInjuryView(mode);demo('tryamm:streetverse-injury-visual-mode',{mode})}} style={{display:'block',minHeight:40,width:'100%',color:'#111'}}>
      <option value="off">Off</option><option value="minimal">Minimal</option><option value="standard">Standard</option>
     </select>
    </label>
    <small style={{display:'block',marginTop:5}}>Tests are local cosmetic demonstrations, never multiplayer damage authority.</small>
   </section>}
   <small style={{display:'block',marginTop:6,color:'#c4d1e5'}}>Rig loaded does not certify likeness, bone retargeting or full gameplay.</small>
   <small style={{display:'block',marginTop:6,color:'#c4d1e5'}}>Fictional RPG damage; not medical guidance</small>
  </div>}
 </aside>
}
