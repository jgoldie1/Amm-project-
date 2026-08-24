import { useEffect, useState } from 'react'
import StudentJarvisDashboard from './StudentJarvisDashboard'
import AllAmericanUniversity from './AllAmericanUniversity'
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient'

interface Props { onClose: () => void }

type NetworkState = {
  hbcuPartners: any[]
  blackExcellence: any[]
  books: any[]
  labs: any[]
  opportunities: any[]
}

const card: React.CSSProperties = { background:'#07101c', border:'1px solid #17334a', borderRadius:18, padding:16 }
const button: React.CSSProperties = { border:'1px solid #4fe3ff77', borderRadius:12, padding:'11px 13px', background:'#081824', color:'#72e9ff', fontWeight:900, cursor:'pointer' }

function initialTab(): 'network'|'jarvis'|'aau' {
  const target=localStorage.getItem('tryamm_school_network_target')
  if(target==='aau'||target==='jarvis'){
    localStorage.removeItem('tryamm_school_network_target')
    return target
  }
  return 'network'
}

export default function SchoolNetworkPortal({ onClose }: Props) {
  const [tab,setTab]=useState<'network'|'jarvis'|'aau'>(initialTab)
  const [data,setData]=useState<NetworkState>({hbcuPartners:[],blackExcellence:[],books:[],labs:[],opportunities:[]})
  const [message,setMessage]=useState('')

  useEffect(()=>{
    if(!isSupabaseConfigured()) return
    const sb=getSupabaseClient(); if(!sb) return
    Promise.all([
      sb.from('university_hbcu_partners').select('*').in('partnership_status',['active','signed','developing']).limit(25),
      sb.from('university_black_excellence_programs').select('*').eq('active',true).limit(25),
      sb.from('university_library_items').select('*').limit(25),
      sb.from('university_labs').select('*').eq('active',true).limit(25),
      sb.from('university_opportunities').select('*').eq('active',true).limit(25),
    ]).then(([h,b,books,labs,opps])=>setData({
      hbcuPartners:h.data||[], blackExcellence:b.data||[], books:books.data||[], labs:labs.data||[], opportunities:opps.data||[]
    })).catch(e=>setMessage(e instanceof Error?e.message:String(e)))
  },[])

  if(tab==='jarvis') return <div style={{position:'fixed',inset:0,zIndex:10080,background:'#050814',overflowY:'auto'}}><div style={{position:'fixed',right:18,top:18,zIndex:10100,display:'flex',gap:8}}><button style={button} onClick={()=>setTab('network')}>School Network</button><button style={button} onClick={onClose}>Close</button></div><StudentJarvisDashboard/></div>
  if(tab==='aau') return <AllAmericanUniversity onClose={()=>setTab('network')} />

  const lanes=[
    ['🎓','All American University','AI classes + real teachers + trade school + career academy + supervised labs + apprenticeship and workforce pathways.',()=>setTab('aau')],
    ['☕','AI Café Workforce Lab','Inventory, digital-twin QA, creator tables, Holo-ad QA, customer operations and business analytics.',()=> (window as any).__showAICafe?.()],
    ['🛡️','Jacobie Vision Team','Cybersecurity, application-security QA, privacy, incident response, real-estate analysis and supervised team leadership.',()=> (window as any).__showFamilyLegacy?.()],
    ['🤖','Student JARVIS','Stubbs AI study planning, tutoring, Learning Passport, school-first job scheduling and career coaching.',()=>setTab('jarvis')],
    ['📚','College Book + Library','Connect coursework to the existing university library catalog and future book marketplace.',()=>setMessage(`College Book/library catalog: ${data.books.length} current records.`)],
    ['🏫','HBCU + College Network','Explore verified partner records, Black Excellence programs, internships and mentoring pathways.',()=>setMessage(`School network: ${data.hbcuPartners.length} HBCU partner records; ${data.blackExcellence.length} Black Excellence programs.`)],
    ['🧪','Labs + Paid Practice','Move from instruction to supervised labs, evidence, portfolio work and approved paid workforce tasks.',()=>setMessage(`University lab registry: ${data.labs.length} active records.`)],
    ['💼','Jobs + Internships','Match learning progress to verified opportunities without guaranteeing admission, employment or funding.',()=>setMessage(`Opportunity registry: ${data.opportunities.length} active records.`)],
  ] as const

  return <section style={{position:'fixed',inset:0,zIndex:10080,overflowY:'auto',background:'radial-gradient(circle at 20% 0,#102a43,#040712 52%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1180,margin:'0 auto',padding:'22px 18px 110px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'start',flexWrap:'wrap'}}>
        <div><div style={{color:'#4fe3ff',fontSize:10,fontWeight:950,letterSpacing:3}}>POWERED BY STUBBS AI</div><h1 style={{fontSize:'clamp(34px,6vw,64px)',margin:'6px 0 8px'}}>TRYAMM School Network</h1><p style={{maxWidth:860,color:'#a9b9c9',lineHeight:1.6}}>School → All American University → real teachers + Stubbs AI → Student JARVIS → books → labs → AI Café/Jacobie Vision → portfolio → internship/apprenticeship/job → verified pay. One education-to-work network for college, HBCU, trade, high-school and adult learners.</p></div>
        <button onClick={onClose} style={button}>← Back to TRYAMM</button>
      </header>

      <article style={{...card,marginTop:18,borderColor:'#e8b94466',background:'linear-gradient(145deg,#171207,#07101c)'}}>
        <div style={{color:'#e8b944',fontWeight:950,fontSize:11,letterSpacing:2}}>GREENVILLE UNIVERSITY STUDENT PORTAL PROFILE</div>
        <h2 style={{margin:'8px 0'}}>Campus-connected workflow</h2>
        <p style={{color:'#b7bdc8',lineHeight:1.6,marginBottom:8}}>Students can use TRYAMM as a companion portal for study planning, AAU learning pathways, labs, portfolio building and approved remote work. Greenville University is shown here as a student-selected campus context; this does not claim an official institutional partnership unless a formal agreement is separately verified.</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><span style={{fontSize:10,border:'1px solid #4fe3ff55',borderRadius:999,padding:'5px 8px'}}>School-first schedule</span><span style={{fontSize:10,border:'1px solid #4fe3ff55',borderRadius:999,padding:'5px 8px'}}>Human + AI teaching</span><span style={{fontSize:10,border:'1px solid #4fe3ff55',borderRadius:999,padding:'5px 8px'}}>Trade-school labs</span><span style={{fontSize:10,border:'1px solid #4fe3ff55',borderRadius:999,padding:'5px 8px'}}>Portfolio evidence</span><span style={{fontSize:10,border:'1px solid #4fe3ff55',borderRadius:999,padding:'5px 8px'}}>Stubbs AI coaching</span></div>
      </article>

      {message&&<div style={{...card,marginTop:12,borderColor:'#4fe3ff66'}}>{message}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12,marginTop:16}}>{lanes.map(([icon,title,copy,action])=><button key={title} onClick={action} style={{...card,textAlign:'left',color:'#fff',cursor:'pointer',minHeight:185}}><div style={{fontSize:30}}>{icon}</div><div style={{fontSize:18,fontWeight:950,marginTop:12}}>{title}</div><div style={{fontSize:12,color:'#9dacbd',lineHeight:1.55,marginTop:7}}>{copy}</div><div style={{fontSize:9,color:'#4fe3ff',fontWeight:950,marginTop:13}}>OPEN →</div></button>)}</div>

      <article style={{...card,marginTop:16}}><h2 style={{marginTop:0}}>Education-to-income network</h2><div style={{fontWeight:900,lineHeight:1.8,color:'#d8e2ec'}}>AAU CLASSES + REAL TEACHERS + STUBBS AI + TRADE LABS + AI CAFÉ + JACOBIE VISION + EMPLOYER SPONSORSHIP → VERIFIED SKILLS → INTERNSHIPS/APPRENTICESHIPS → APPROVED WORK → OPERATING REVENUE → STAFF/STUDENT PAY → STRONGER PROGRAMS.</div><p style={{fontSize:11,color:'#8998aa',lineHeight:1.6}}>Paid tasks remain separate from classroom grades. Accredited degree, licensure and formal institutional-partnership claims stay disabled unless separately obtained and verified. Restricted player rewards, creator liabilities and customer balances cannot be used as payroll.</p></article>
    </div>
  </section>
}
