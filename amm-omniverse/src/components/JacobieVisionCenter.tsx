import { useMemo, useState } from 'react'
import JacobieFlipLab from './JacobieFlipLab'

type Track = 'cyber-defense'|'privacy-compliance'|'appsec-qa'|'incident-response'|'real-estate-analysis'|'team-leadership'

type TeamMember = { id:string; name:string; role:string; track:Track; level:number; status:'training'|'ready'|'assigned' }

type Lab = { id:string; title:string; track:Track; level:number; evidence:string[]; paidEligible:boolean }

const labs:Lab[] = [
  {id:'phish-101',title:'Phishing Detection + Reporting',track:'cyber-defense',level:1,evidence:['screenshot','short incident note'],paidEligible:false},
  {id:'api-auth-201',title:'API Auth + Session Security QA',track:'appsec-qa',level:2,evidence:['test checklist','bug report'],paidEligible:true},
  {id:'privacy-201',title:'Privacy Review + Data Minimization',track:'privacy-compliance',level:2,evidence:['data map','risk notes'],paidEligible:true},
  {id:'ir-301',title:'Incident Response Tabletop',track:'incident-response',level:3,evidence:['timeline','containment plan','postmortem'],paidEligible:true},
  {id:'flip-201',title:'Property Deal Analysis: ARV + Rehab + Carry',track:'real-estate-analysis',level:2,evidence:['comps','ARV worksheet','repair budget'],paidEligible:true},
  {id:'flip-301',title:'Flip Operations: Budget + Media + Holo Listing',track:'real-estate-analysis',level:3,evidence:['scope of work','budget','project log','property media','marketing plan'],paidEligible:true},
  {id:'lead-301',title:'Team Lead: Review + Coach + Approve Evidence',track:'team-leadership',level:3,evidence:['review notes','coaching plan'],paidEligible:true},
]

const btn:React.CSSProperties={border:'1px solid #53ddff77',background:'#0b1c2b',color:'#bff5ff',borderRadius:11,padding:'9px 12px',cursor:'pointer',fontWeight:900}
const card:React.CSSProperties={background:'#07111e',border:'1px solid #173653',borderRadius:16,padding:16}

export default function JacobieVisionCenter({onClose}:{onClose:()=>void}){
  const [members,setMembers]=useState<TeamMember[]>([
    {id:'lead-jacobie',name:'Jacobie Stubbs',role:'Founder / Team Lead',track:'cyber-defense',level:3,status:'ready'},
  ])
  const [activeTrack,setActiveTrack]=useState<Track>('cyber-defense')
  const [message,setMessage]=useState('')
  const [showFlipLab,setShowFlipLab]=useState(false)
  const visibleLabs=useMemo(()=>labs.filter(l=>l.track===activeTrack),[activeTrack])

  if(showFlipLab) return <JacobieFlipLab onClose={()=>setShowFlipLab(false)} />

  function addTrainee(){
    const n=members.length+1
    setMembers(m=>[...m,{id:`trainee-${Date.now()}`,name:`Trainee ${n}`,role:'Apprentice',track:activeTrack,level:1,status:'training'}])
    setMessage('Trainee seat created. Production access remains disabled until skills and supervision are verified.')
  }

  const tracks:[Track,string,string][]=[
    ['cyber-defense','Cyber Defense','Threat detection, phishing, endpoint hygiene, log review and defensive operations.'],
    ['appsec-qa','Application Security QA','Authentication, authorization, API/session testing, bug evidence and release security.'],
    ['privacy-compliance','Privacy + Compliance','Data minimization, access reviews, retention, policy mapping and compliance readiness.'],
    ['incident-response','Incident Response','Triage, containment, evidence preservation, communication and post-incident review.'],
    ['real-estate-analysis','Real Estate Analysis + Flipping','Comp research, deal analysis, ARV, rehab/construction budgeting, carrying/financing costs, documentation, property media, 3D scans, Holo listings, marketing, record security and admin support. Regulated activities remain with qualified professionals.'],
    ['team-leadership','Team Leadership','Review evidence, coach trainees, assign work, approve milestones and escalate risk.'],
  ]

  return <section style={{position:'fixed',inset:0,zIndex:10120,overflowY:'auto',background:'radial-gradient(circle at 20% 0,#102b42,#03060d 55%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1180,margin:'0 auto',padding:'22px 18px 110px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'start',flexWrap:'wrap'}}>
        <div><div style={{color:'#53ddff',fontSize:10,fontWeight:950,letterSpacing:3}}>POWERED BY STUBBS AI</div><h1 style={{fontSize:'clamp(34px,6vw,64px)',margin:'6px 0'}}>Jacobie Vision</h1><p style={{maxWidth:820,color:'#a9bbca',lineHeight:1.6}}>Build a defensive cybersecurity + real-estate analysis team through guided labs, supervised work, evidence, portfolio progression and approved paid assignments.</p></div>
        <button style={btn} onClick={onClose}>← Back</button>
      </header>

      {message&&<div style={{...card,marginTop:12,borderColor:'#53ddff66'}}>{message}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:16}}>{tracks.map(([id,title,copy])=><button key={id} style={{...card,textAlign:'left',color:'#fff',cursor:'pointer',borderColor:id===activeTrack?'#53ddff':'#173653'}} onClick={()=>setActiveTrack(id)}><div style={{fontWeight:950}}>{title}</div><div style={{fontSize:11,color:'#9fb0bf',lineHeight:1.5,marginTop:7}}>{copy}</div></button>)}</div>

      {activeTrack==='real-estate-analysis'&&<article style={{...card,marginTop:14,borderColor:'#e8b94466',background:'linear-gradient(145deg,#171207,#07111e)'}}><div style={{color:'#e8b944',fontSize:10,fontWeight:950,letterSpacing:2}}>HOUSE FLIPPING OPERATIONS</div><h2 style={{margin:'7px 0'}}>From comp research to Holo listing</h2><p style={{color:'#a9bbca',lineHeight:1.6}}>Run best/base/worst-case deal models, construction budgets, project documentation, property photography/video, 3D scans, Holo listings, marketing, cybersecurity for property records and administrative project support.</p><button style={btn} onClick={()=>setShowFlipLab(true)}>🏠 Open House Flipping Lab</button></article>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:16}}>
        <article style={card}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}><h2 style={{margin:0}}>Team Builder</h2><button style={btn} onClick={addTrainee}>+ Add Trainee</button></div><div style={{display:'grid',gap:8,marginTop:12}}>{members.map(m=><div key={m.id} style={{border:'1px solid #1f3d55',borderRadius:12,padding:11}}><b>{m.name}</b><div style={{fontSize:11,color:'#9fb0bf'}}>{m.role} • {m.track} • level {m.level} • {m.status}</div></div>)}</div><p style={{fontSize:10,color:'#77899a',lineHeight:1.5}}>Trainees receive sandbox/lab access first. Production permissions require role approval, least privilege, supervision and evidence of competence.</p></article>

        <article style={card}><h2 style={{marginTop:0}}>Stubbs AI Coach</h2><p style={{color:'#a9bbca',lineHeight:1.6}}>Use Stubbs AI for explanations, practice, quizzes, checklists, code/security review guidance, real-estate math practice, construction-budget exercises, documentation review and team coaching. It does not impersonate licensed professionals, approve its own work or bypass authorization.</p><button style={btn} onClick={()=> (window as any).__showBennie?.()}>Open Stubbs AI</button><button style={{...btn,marginLeft:8}} onClick={()=> (window as any).__showSchoolNetwork?.()}>Open School Network</button></article>
      </div>

      <section style={{marginTop:16}}><h2>Training Labs</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10}}>{visibleLabs.map(l=><article key={l.id} style={card}><div style={{fontSize:9,color:'#53ddff',fontWeight:950}}>LEVEL {l.level}</div><h3>{l.title}</h3><div style={{fontSize:11,color:'#9fb0bf'}}>Evidence: {l.evidence.join(' • ')}</div><div style={{marginTop:10,fontSize:10,color:l.paidEligible?'#8fffc1':'#e8b944'}}>{l.paidEligible?'Eligible to become a paid assignment after approval':'Training-only lab'}</div><button style={{...btn,marginTop:10}} onClick={()=>l.id==='flip-301'?setShowFlipLab(true):setMessage(`${l.title}: lab started in training mode. Submit required evidence for supervisor review.`)}>Start Lab</button></article>)}</div></section>

      <article style={{...card,marginTop:16,borderColor:'#e8b94466'}}><h2 style={{marginTop:0}}>Team-to-income model</h2><div style={{fontWeight:900,lineHeight:1.9}}>TRAIN → VERIFY SKILL → ASSIGN CLIENT/TRYAMM WORK → EVIDENCE → SUPERVISOR REVIEW → CLIENT/OPERATING REVENUE → PAYROLL/CONTRACTOR PAYMENT → PORTFOLIO → PROMOTION.</div><p style={{fontSize:11,color:'#8998aa'}}>No restricted player-reward funds, creator liabilities, customer balances or ministry/legacy restricted funds may be used as payroll. Client-facing security work stays defensive and authorized. Brokerage, appraisal, lending, contracting, inspection and legal work stay behind qualification/licensing gates where required.</p></article>
    </div>
  </section>
}
