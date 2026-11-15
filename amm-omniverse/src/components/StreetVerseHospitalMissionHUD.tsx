import {useEffect,useState} from 'react'
import type {BJBodyRegion,BJInjuryKind} from '../runtime/StreetVerseBJInjuryBridgeRuntime'
type Assessment={kind:BJInjuryKind;region:BJBodyRegion;painScore:number;health:number;needsTriage:boolean;potentialOrganImpact:readonly string[]}
const dialogue=[
  {speaker:'911 Dispatcher',line:'Emergency call received. Tell us where BJ is injured.',action:'DISPATCH AMBULANCE'},
  {speaker:'Paramedic',line:'We are here, BJ. We will take you to the hospital for assessment.',action:'ARRIVE AT HOSPITAL'},
  {speaker:'Triage Nurse',line:'Welcome to StreetVerse Hospital. I am checking your pain, mobility and vital signs.',action:'BEGIN TRIAGE'},
  {speaker:'Emergency Doctor',line:'We will examine the injured region. X-ray mode is available for roleplay assessment.',action:'EXAMINE IN X-RAY'},
  {speaker:'Hospital Nurse',line:'Treatment is complete in this simulation. We will review your recovery plan.',action:'COMPLETE TREATMENT'},
  {speaker:'Discharge Nurse',line:'You are cleared for the next mission. Follow up if symptoms return.',action:'DISCHARGE BJ'},
]
export default function StreetVerseHospitalMissionHUD(){
 const [assessment,setAssessment]=useState<Assessment|null>(null)
 const [step,setStep]=useState(0)
 const [open,setOpen]=useState(false)
 const [examined,setExamined]=useState(false)
 const [voiceEnabled,setVoiceEnabled]=useState(false)
 const [spoken,setSpoken]=useState(false)
 useEffect(()=>{
  const injury=(event:Event)=>{
   const next=(event as CustomEvent<Assessment>).detail
   if(!next)return
   if(next.kind==='hospital-discharge'){setAssessment(null);setOpen(false);return}
   setAssessment(next);setStep(0);setExamined(false);setSpoken(false);setOpen(true)
  }
  const triage=(event:Event)=>{
   const next=(event as CustomEvent<Assessment>).detail
   if(next){setAssessment(next);setOpen(true)}
  }
  window.addEventListener('tryamm:streetverse-bj-injury-assessment',injury)
  window.addEventListener('tryamm:streetverse-bj-medical-triage',triage)
  return ()=>{window.removeEventListener('tryamm:streetverse-bj-injury-assessment',injury);window.removeEventListener('tryamm:streetverse-bj-medical-triage',triage)}
 },[])
 if(!assessment)return null
 const stage=dialogue[Math.min(step,dialogue.length-1)]
 const speak=()=>{
  setSpoken(true)
  if(voiceEnabled&&typeof window!=='undefined'&&'speechSynthesis' in window){
   window.speechSynthesis.cancel()
   const utterance=new SpeechSynthesisUtterance(stage.speaker+'. '+stage.line)
   utterance.rate=.9
   window.speechSynthesis.speak(utterance)
  }
 }
 const advance=()=>{
  if(step===0)window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-rescue-request'))
  if(step>=1&&step<=3)window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-rescue-advance'))
  if(step===3){setExamined(true);window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-anatomy-mode',{detail:{xray:true,tearApart:false,injured:true}}))}
  if(step===5){
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-rescue-advance'))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-anatomy-mode',{detail:{xray:false,tearApart:false,injured:false}}))
   setOpen(false);return
  }
  setSpoken(false)
  setStep(value=>Math.min(5,value+1))
 }
 return <aside aria-label="StreetVerse hospital roleplay mission" style={{position:'fixed',right:12,top:100,zIndex:45000,width:'min(330px,calc(100vw - 24px))',padding:12,borderRadius:16,background:'rgba(7,23,35,.96)',border:'2px solid #8be3f6',color:'white',fontFamily:'system-ui',boxShadow:'0 10px 32px #0008'}}>
  <button onClick={()=>setOpen(value=>!value)} style={{width:'100%',minHeight:48,background:'#174c63',color:'white',border:'1px solid #8be3f6',borderRadius:10,fontWeight:800}}>🏥 HOSPITAL MISSION {open?'−':'+'}</button>
  {open&&<div aria-live="polite">
   <p style={{margin:'10px 0'}}>BJ • {assessment.region.replaceAll('-',' ')} • pain {assessment.painScore}/10 • health {assessment.health}/100</p>
   <p style={{fontWeight:800}}>STEP {step+1}/6 — {stage.speaker}</p>
   <p>“{stage.line}”</p>
   <button onClick={speak} style={{width:'100%',minHeight:48,borderRadius:10,background:'#204b5a',color:'white',border:'1px solid #a1c7d1',fontWeight:800}}>💬 TALK TO {stage.speaker.toUpperCase()}</button>
   <label style={{display:'flex',gap:8,alignItems:'center',margin:'10px 0',fontSize:13}}><input type="checkbox" checked={voiceEnabled} onChange={event=>setVoiceEnabled(event.target.checked)} /> Optional spoken staff dialogue</label>
   {spoken&&<p role="status">✓ {stage.speaker} dialogue delivered</p>}
   {step===3&&<p>Examine: {assessment.potentialOrganImpact.length?assessment.potentialOrganImpact.join(', '):'bones and soft tissue'} (fictional visualization; no confirmed organ damage)</p>}
   {examined&&<p>✓ X-ray examination opened</p>}
   <button onClick={advance} style={{width:'100%',minHeight:56,borderRadius:12,background:'#b8f4df',color:'#06251f',fontWeight:900,border:0,touchAction:'manipulation'}}>{stage.action}</button>
   <button onClick={()=>setOpen(false)} style={{width:'100%',minHeight:44,marginTop:8,background:'transparent',color:'white',border:'1px solid #a1c7d1',borderRadius:10}}>MINIMIZE</button>
  </div>}
 </aside>
}
