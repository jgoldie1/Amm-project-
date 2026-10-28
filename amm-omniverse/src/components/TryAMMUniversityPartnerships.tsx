/** Partnership discovery only. No affiliation or sponsorship is implied. */
const tracks=[
 {name:'Accessible Technology & StreetVerse',desc:'One-handed mobile navigation, user testing, inclusive design and accessibility demonstrations.'},
 {name:'Living Worlds Immersive Game Development',desc:'Student and faculty pilot for StreetVerse Chicago: accessible player movement, a complete mission, NPC interactions, world streaming, browser performance and safe release testing.'},
 {name:'AI Café & Workforce',desc:'Remote workshops, practical AI business skills, creator training and accessible work demonstrations.'},
 {name:'Stubbs AI & Business Automation',desc:'Customer inquiry workflows, small-business digital tools and student-led usability assessments.'},
 {name:'Advanced Fabrication Research',desc:'Feasibility research for the proposed 12D Printer / Nano Factory concept using established prototyping and additive manufacturing methods.'},
] as const
const contacts=[
 {name:'UIC Innovation Center',email:'uicinnovationcenter@uic.edu',focus:'University-industry project design'},
 {name:'UIC Technology Innovation Lab',email:'techinnovationlab@uic.edu',focus:'Incubation and research feasibility'},
 {name:'Polsky Center',email:'polsky@uchicago.edu',focus:'Startup mentoring and commercialization'},
] as const
export default function TryAMMUniversityPartnerships(){
 return <section id="tryamm-university-partnerships" aria-labelledby="partner-title" style={{padding:20,marginTop:24,borderRadius:20,border:'1px solid #5789ad',background:'linear-gradient(140deg,#0e2035,#090f1d)',color:'#fff'}}>
  <div style={{fontSize:11,color:'#9bddff',fontWeight:900,letterSpacing:2}}>UNIVERSITY + INCUBATOR PARTNERSHIPS</div><h2 id="partner-title" style={{fontSize:'clamp(24px,4vw,34px)',margin:'7px 0'}}>Build, research and grow together</h2>
  <p style={{fontSize:13,color:'#bfcfdd',lineHeight:1.6}}>TRYAMM welcomes conversations with universities, student programs, incubators, businesses and research teams about scoped, mutually agreed pilot projects. No university partnership is currently claimed.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,210px),1fr))',gap:9}}>{tracks.map(t=><article key={t.name} style={{padding:13,border:'1px solid #415d75',borderRadius:13,background:'#0d1a2b'}}><h3 style={{fontSize:16,margin:'5px 0'}}>{t.name}</h3><p style={{fontSize:12,lineHeight:1.5,color:'#b7c8d7'}}>{t.desc}</p></article>)}</div>
  <p style={{fontSize:12,color:'#d6e1ed',marginTop:14}}>Academic and incubator outreach is exploratory. To propose a collaboration, contact TRYAMM with your institution, project interest, and suggested meeting format.</p>
  <a href={'mailto:theammonmiverse@gmail.com?subject='+encodeURIComponent('TRYAMM research and innovation partnership inquiry')} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:48,padding:'10px 17px',borderRadius:11,border:'1px solid #a9deff',color:'#fff',textDecoration:'none',fontWeight:800,background:'#135075'}}>Propose a partnership →</a>
  <details style={{marginTop:12,fontSize:12,color:'#b5c7db'}}><summary style={{minHeight:44,cursor:'pointer'}}>Programs we are exploring</summary><ul>{contacts.map(c=><li key={c.name}>{c.name} — {c.focus}</li>)}</ul></details>
  <p style={{fontSize:11,color:'#9aafc3'}}>TRYAMM’s fabrication project is exploratory; no operational “12D printer” is represented. Program eligibility, intellectual property, costs, funding and project terms must be agreed independently.</p>
 </section>
}