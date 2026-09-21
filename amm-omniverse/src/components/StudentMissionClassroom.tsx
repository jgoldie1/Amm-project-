import { useMemo, useState } from 'react'
import { buildStudyPlan, type StudentJarvisProfile } from '../education/studentJarvis'
import { EDUCATION_MISSION_LOOP, homeworkSupportBoundary } from '../education/missionTaskAssessmentEngine'

const demoProfile:StudentJarvisProfile={studentId:'local-student',stage:'high',goals:['Complete today’s learning mission'],subjects:['Math','English','Science','Business','Digital Skills'],tasks:[],accessibilityNeeds:['one-hand-controls','voice-ready']}

export default function StudentMissionClassroom(){
 const [profile]=useState(demoProfile)
 const [question,setQuestion]=useState('')
 const [status,setStatus]=useState('Choose Today, Homework, Missions, Test, Progress, or Ask Benny / JARVIS.')
 const study=useMemo(()=>buildStudyPlan(profile),[profile])
 const ask=()=>{const gate=homeworkSupportBoundary(question);setStatus(gate.allowed?'Tutor mode: explain the concept, give a hint, review my attempt, then create similar practice.':gate.reason)}
 const actions=[
  ['TODAY',()=>setStatus(study.today.length?study.today.join(' • '):'No assigned tasks yet. Start with DIAGNOSE → TEACH → PRACTICE.')],
  ['HOMEWORK',()=>setStatus('Homework mode: understand → attempt → hint → feedback → retry. Student authors the submitted work.')],
  ['MISSIONS',()=>setStatus('Mission mode: apply the skill inside StreetVerse, then preserve evidence in the Learning Passport.')],
  ['TEST',()=>setStatus('Assessment mode: quiz/test evidence. Proctored or human-grade work stays with the authorized assessor.')],
  ['PROGRESS',()=>setStatus('Progress mode: mastery evidence → reteach gaps → different retry → Learning Passport.')],
 ]
 return <main style={{minHeight:'100dvh',background:'#071019',color:'#fff',padding:'18px',fontFamily:'system-ui,sans-serif'}}>
  <section style={{maxWidth:760,margin:'0 auto'}}>
   <div style={{fontSize:11,letterSpacing:2,color:'#72e6ff',fontWeight:900}}>ALL AMERICAN UNIVERSITY • STUDENT MISSION CLASSROOM</div>
   <h1 style={{margin:'8px 0'}}>Learn it. Do it. Prove it.</h1>
   <p style={{opacity:.78,lineHeight:1.55}}>One-hand learning dashboard connecting lessons, homework, StreetVerse missions, assessments and Learning Passport progress.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,margin:'18px 0'}}>
    {actions.map(([label,fn])=><button key={label as string} onClick={fn as ()=>void} style={button}>{label as string}</button>)}
   </div>
   <section aria-live="polite" style={{padding:16,border:'1px solid #72e6ff55',borderRadius:16,background:'#0b1722',minHeight:70}}>{status}</section>
   <h2>Ask Benny / JARVIS</h2>
   <textarea aria-label="Ask Benny or JARVIS" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Explain this, help me study, review my attempt…" style={{width:'100%',minHeight:100,boxSizing:'border-box',borderRadius:14,padding:14,fontSize:16}} />
   <button onClick={ask} style={{...button,width:'100%',marginTop:8}}>ASK / COACH ME</button>
   <details style={{marginTop:18}}><summary style={{cursor:'pointer',fontWeight:900}}>Mastery mission loop</summary><ol>{EDUCATION_MISSION_LOOP.map(x=><li key={x} style={{padding:4}}>{x.replaceAll('_',' ')}</li>)}</ol></details>
   <button onClick={()=>history.back()} style={{...button,marginTop:18}}>BACK</button>
  </section>
 </main>
}
const button:React.CSSProperties={minHeight:52,border:'1px solid #72e6ff77',borderRadius:14,background:'#102332',color:'#fff',fontWeight:900,fontSize:13,cursor:'pointer',padding:'10px 12px'}
