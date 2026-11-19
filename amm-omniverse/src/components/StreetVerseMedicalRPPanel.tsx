import {useEffect,useState} from 'react'

/** Fictional game-only missions. Never dispatch real emergency calls, collect PHI,
 * represent clinical triage, or activate real telehealth/telesales integrations. */
const SCENARIOS = [
 ['injury','Injury / fall','Call fictional responders','NPC assesses scene','Hospital handoff'],
 ['allergy','Allergy','Find NPC help','Simulated emergency dispatch','Hospital scene'],
 ['headache','Headache','Talk to NPC','Care-navigation dialogue','Referral scene'],
 ['stroke','Suspected stroke','Recognize fictional emergency','Call game dispatch','Emergency hospital handoff'],
 ['nosebleed','Nosebleed','NPC reports bleeding','Fictional responder arrives','Clinic / hospital story'],
 ['pregnancy','Pregnancy','Prenatal care story','Contact maternity team','Support visit'],
 ['delivery','Labor / delivery','Labor story begins','Maternity transfer','Narrated birth and recovery'],
 ['triage','Emergency triage','Game intake','Fictional priority dialogue','Responder handoff'],
 ['telehealth','Telehealth access','Ask about online care','Provider authorization explained','No clinical session started'],
 ['telesales','Nonclinical telesales','Customer asks about services','Explain nonmedical offerings','Fictional follow-up']
] as const
type Scenario = typeof SCENARIOS[number][0]
type Actor='BJ Stubbs'|'Jacobie Stubbs'|'LaTeasia Monroe'
type Progress=Partial<Record<Scenario,number>>
const button:React.CSSProperties={minHeight:54,borderRadius:12,padding:'10px 12px',fontSize:15,fontWeight:750,color:'#fff',background:'#17465d',border:'1px solid #83c3db',touchAction:'manipulation'}
export default function StreetVerseMedicalRPPanel(){
 const [open,setOpen]=useState(false)
 const [actor,setActor]=useState<Actor>('LaTeasia Monroe')
 const [scenario,setScenario]=useState<Scenario>('injury')
 const [progress,setProgress]=useState<Progress>({})
 const [completed,setCompleted]=useState<Scenario[]>([])
 const [choice,setChoice]=useState<string>('')
 const current=SCENARIOS.find(c=>c[0]===scenario)!
 const stage=progress[scenario]||0
 const complete=(id:Scenario)=>{
   setProgress(prev=>({...prev,[id]:3}))
   setCompleted(prev=>prev.includes(id)?prev:[...prev,id])
 }
 const next=()=>{
   if(stage<3)setProgress(prev=>({...prev,[scenario]:stage+1}))
   else complete(scenario)
 }
 const onePush=()=>complete(scenario)
 const persistResult=(payload:any)=>{try{localStorage.setItem('tryamm.streetverse.medical-rp.last-report.v1',JSON.stringify(payload))}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-medical-rp-test-result',{detail:payload}))}
 const runAll=()=>{const allProgress=Object.fromEntries(SCENARIOS.map(c=>[c[0],3])) as Progress;const allCompleted=SCENARIOS.map(c=>c[0]);setProgress(allProgress);setCompleted(allCompleted);persistResult({schema:'streetverse.medical-rp.live-branch-preview.v1',actor,scenario,progress:allProgress,completed:allCompleted,choice,fictional:true,clinicalServiceActive:false,model3DVerified:false,deviceAcceptanceVerified:false,serverPersisted:false,exportedAt:new Date().toISOString()})}
 useEffect(()=>{const onMaster=()=>runAll();window.addEventListener('tryamm:streetverse-medical-rp-test-all',onMaster);return()=>window.removeEventListener('tryamm:streetverse-medical-rp-test-all',onMaster)},[actor,scenario,choice])
 const report=()=>{
   const payload={schema:'streetverse.medical-rp.live-branch-preview.v1',actor,scenario,progress,completed,choice,fictional:true,clinicalServiceActive:false,model3DVerified:false,deviceAcceptanceVerified:false,serverPersisted:false,exportedAt:new Date().toISOString()};persistResult(payload)
   const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}))
   const anchor=document.createElement('a');anchor.href=url;anchor.download='StreetVerse_Medical_RP_Branch_Report.json';document.body.appendChild(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 return <aside data-streetverse-medical-rp="true" style={{position:'fixed',right:8,bottom:'max(12px,env(safe-area-inset-bottom))',zIndex:42016,maxWidth:'calc(100vw - 16px)',color:'white'}}>
   <button style={button} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>🚑 MEDICAL RP / LaTEASIA</button>
   {open&&<div role="region" aria-label="StreetVerse fictional medical roleplay" style={{width:'min(390px,calc(100vw - 16px))',maxHeight:'65dvh',overflowY:'auto',background:'#081a28f5',border:'1px solid #6ca9ba',borderRadius:12,padding:12,marginTop:8,fontFamily:'system-ui'}}>
    <strong>Medical RP · Chicago</strong>
    <p style={{fontSize:12,lineHeight:1.5}}>Fictional education and story only. No real triage, diagnosis, telehealth, appointments or sales. In a real medical emergency, call 911 in the United States. Do not enter personal health information.</p>
    <div style={{display:'grid',gap:8}}>
     <label>Character<select value={actor} onChange={e=>setActor(e.target.value as Actor)} style={{width:'100%',minHeight:48}}><option>BJ Stubbs</option><option>Jacobie Stubbs</option><option>LaTeasia Monroe</option></select></label>
     <label>Scenario<select value={scenario} onChange={e=>{setScenario(e.target.value as Scenario);setChoice('')}} style={{width:'100%',minHeight:48}}>{SCENARIOS.map(c=><option key={c[0]} value={c[0]}>{c[1]}</option>)}</select></label>
     <div role="status" aria-live="polite"><b>{current[1]}</b> · stage {stage+1}/4 {completed.includes(scenario)?'· COMPLETE':''}<p>{stage===0?'Arrival':current[stage+1]}</p></div>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
      <button style={button} onClick={next}>NEXT SCENE</button><button style={button} onClick={onePush}>ONE PUSH</button>
      <button style={button} onClick={runAll}>TEST ALL TEN</button><button style={button} onClick={report}>EXPORT REPORT</button>
     </div>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{(['A','B','C','D'] as const).map(k=><button key={k} style={button} onClick={()=>setChoice(k)}>{k} · {({A:'Dispatch',B:'NPC',C:'Hospital',D:'Family'})[k]}</button>)}</div>
     <p>Movie choice: {choice||'none'} · Completed: {completed.length}/10. Choices change only this interface's fictional story.</p>
    </div>
   </div>}
 </aside>
}
