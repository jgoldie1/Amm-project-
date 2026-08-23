import { useMemo, useState } from 'react'
import { ALL_AMERICAN_UNIVERSITY_COURSES, AAU_RULES, type EducationDivision } from '../education/allAmericanUniversity'

const card:React.CSSProperties={background:'#07111d',border:'1px solid #173653',borderRadius:18,padding:16}
const btn:React.CSSProperties={border:'1px solid #4fe3ff77',background:'#0b1c2b',color:'#c9f8ff',borderRadius:11,padding:'10px 13px',cursor:'pointer',fontWeight:900}

export default function AllAmericanUniversity({onClose}:{onClose:()=>void}){
  const [division,setDivision]=useState<EducationDivision|'all'>('all')
  const [message,setMessage]=useState('')
  const courses=useMemo(()=>division==='all'?ALL_AMERICAN_UNIVERSITY_COURSES:ALL_AMERICAN_UNIVERSITY_COURSES.filter(c=>c.division===division),[division])
  const divisions:[EducationDivision|'all',string][]=[['all','All Programs'],['university','University'],['trade-school','Trade School'],['career-academy','Career Academy'],['continuing-education','Continuing Education'],['k12-support','School Support']]

  return <section style={{position:'fixed',inset:0,zIndex:10160,overflowY:'auto',background:'radial-gradient(circle at 15% 0,#17344d,#03060d 56%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1220,margin:'0 auto',padding:'22px 18px 120px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:14,flexWrap:'wrap',alignItems:'start'}}>
        <div><div style={{fontSize:10,fontWeight:950,letterSpacing:3,color:'#4fe3ff'}}>POWERED BY STUBBS AI</div><h1 style={{fontSize:'clamp(36px,6vw,68px)',margin:'6px 0'}}>All American University</h1><p style={{maxWidth:900,color:'#adbdca',lineHeight:1.65}}>AI-assisted learning with real teachers, trade-school labs, college/university pathways, industry-certification preparation, portfolios, apprenticeships and workforce progression. AI supports instructors and students; it does not replace required human supervision, licensure or academic responsibility.</p></div>
        <button style={btn} onClick={onClose}>← School Network</button>
      </header>

      {message&&<div style={{...card,marginTop:12,borderColor:'#4fe3ff66'}}>{message}</div>}

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10,marginTop:18}}>
        {[['🤖','Stubbs AI Co-Teacher','Tutoring, explanations, practice, quizzes, accessibility adaptation and portfolio coaching.'],['👩‍🏫','Real Teachers','Verified instructors teach, grade where authorized, supervise labs and provide human feedback.'],['🛠️','Trade School','Electrical, HVAC, plumbing, carpentry, welding and automotive pathways with supervised hands-on labs.'],['🎓','University + Career','AI, cybersecurity, real estate operations, media, business and other college/career pathways.'],['🧪','Labs + Apprenticeships','Practice first, then supervised field/lab experience and employer-connected opportunities.'],['💼','Learn → Work','Learning Passport → evidence → portfolio → internship/apprenticeship → approved paid work.']].map(([i,t,c])=><article key={t} style={card}><div style={{fontSize:30}}>{i}</div><h3>{t}</h3><p style={{fontSize:12,color:'#9fb0bf',lineHeight:1.55}}>{c}</p></article>)}
      </section>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:20}}>{divisions.map(([id,label])=><button key={id} style={{...btn,borderColor:division===id?'#e8b944':'#4fe3ff55',color:division===id?'#ffe49b':'#c9f8ff'}} onClick={()=>setDivision(id)}>{label}</button>)}</div>

      <section style={{marginTop:16}}><h2>Programs + Classes</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:12}}>{courses.map(c=><article key={c.id} style={card}><div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'start'}}><div><div style={{fontSize:9,color:'#4fe3ff',fontWeight:950,textTransform:'uppercase'}}>{c.division} • {c.category}</div><h3 style={{margin:'6px 0'}}>{c.title}</h3></div><span style={{fontSize:9,border:'1px solid #e8b94466',borderRadius:999,padding:'4px 7px',color:'#ffe49b'}}>{c.credentialClaim.replace(/-/g,' ')}</span></div><div style={{fontSize:11,color:'#9fb0bf',lineHeight:1.55}}>Modules: {c.modules.join(' • ')}</div><div style={{fontSize:11,color:'#d7e1ea',lineHeight:1.55,marginTop:9}}>Outcomes: {c.outcomes.join(' • ')}</div><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>{c.delivery.map(d=><span key={d} style={{fontSize:9,border:'1px solid #29445d',borderRadius:999,padding:'4px 7px'}}>{d}</span>)}</div>{c.requiresHumanInstructor&&<div style={{fontSize:10,color:'#8fffc1',marginTop:9}}>✓ Human instructor required</div>}{c.requiresHandsOnSupervision&&<div style={{fontSize:10,color:'#ffcf79',marginTop:4}}>✓ Supervised hands-on lab required</div>}{c.regulatedField&&<div style={{fontSize:10,color:'#ff9aad',marginTop:4}}>Qualified/licensed professional gates may apply.</div>}<button style={{...btn,marginTop:12}} onClick={()=>setMessage(`${c.title}: pathway selected. Enrollment, instructor assignment, schedule and verified credential status must be confirmed before production delivery.`)}>View Pathway</button></article>)}</div></section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12,marginTop:18}}>
        <article style={card}><h2 style={{marginTop:0}}>Teacher Center</h2><p style={{color:'#a8b7c5',lineHeight:1.6}}>Instructor applications, credential verification, specialties, availability, course assignment, grading permissions, lab supervision, student feedback and performance review.</p><button style={btn} onClick={()=>setMessage('Teacher Center requires verified instructor identity/credentials before a teacher is shown as active.')}>Teacher / Instructor Intake</button></article>
        <article style={card}><h2 style={{marginTop:0}}>Student JARVIS</h2><p style={{color:'#a8b7c5',lineHeight:1.6}}>Classes, study plans, Learning Passport, accommodations, tutoring, scholarships, internships and the next best action—without doing graded work for the student.</p><button style={btn} onClick={()=> (window as any).__showSchoolNetwork?.()}>Open Student Network</button></article>
        <article style={card}><h2 style={{marginTop:0}}>Employer + Apprenticeship Network</h2><p style={{color:'#a8b7c5',lineHeight:1.6}}>Employers can sponsor labs, apprenticeships, internships and verified work opportunities. Job or placement outcomes are never guaranteed.</p><button style={btn} onClick={()=>setMessage('Employer intake: verify organization, work scope, pay terms, safety requirements and supervisor before publishing an opportunity.')}>Employer Intake</button></article>
      </section>

      <article style={{...card,marginTop:18,borderColor:'#e8b94466'}}><h2 style={{marginTop:0}}>Academic + Safety Lock</h2><div style={{fontWeight:900,lineHeight:1.9}}>STUDENT → STUBBS AI + HUMAN TEACHER → COURSE → PRACTICE → LAB → ASSESSMENT → VERIFIED EVIDENCE → LEARNING RECORD/CERTIFICATE → APPRENTICESHIP/INTERNSHIP → WORKFORCE → CAREER.</div><p style={{fontSize:11,color:'#8e9baa',lineHeight:1.6}}>All American University is an education platform/program brand unless and until any formal accreditation, degree-granting authority, state approval or institutional partnership is separately obtained and verified. Completion records must not be represented as accredited degrees or professional licenses unless legally authorized.</p><div style={{fontSize:10,color:'#71869a'}}>Rules active: {Object.entries(AAU_RULES).filter(([,v])=>v).map(([k])=>k).join(' • ')}</div></article>
    </div>
  </section>
}
