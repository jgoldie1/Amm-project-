import {useMemo,useState} from 'react'

type LaunchItem={name:string;href:string;purpose:string;gate:string;icon:string}
const creator:readonly LaunchItem[]=[
 {name:'Isaiah AI TV',href:'/isaiah-ai-tv',purpose:'Programming and talent-show discovery',gate:'Scheduling and actual programs need verified media',icon:'📺'},
 {name:'Who Wants to Be a Star • StarVerse',href:'/starverse',purpose:'Talent pipeline, auditions and showcase planning',gate:'Real audition intake and guardian moderation not verified',icon:'⭐'},
 {name:'Star Studio family pipeline',href:'/star-studio',purpose:'Connect talent, Aniyah Studio, film and other creator services',gate:'Cross-service automated handoff not verified',icon:'🎭'},
 {name:'Aniyah 64-Track Studio',href:'/aniyah-studio',purpose:'Recording, music engineering and studio offers',gate:'Audio exports, bookings and live checkout require testing',icon:'🎚️'},
 {name:'Omni Box episode builder',href:'/omni-box',purpose:'Draft six-act scripts and production packets',gate:'This creates outlines, not rendered feature films',icon:'🎬'},
 {name:'Prepare Reels in CreatorVerse',href:'/creatorverse',purpose:'Plan or generate creative assets for short clips',gate:'Real generation and final publishing require a provider',icon:'🎞️'},
 {name:'Omni Workstation',href:'/workstation',purpose:'Organize creative assets and handoffs',gate:'Cloud renders must be separately configured',icon:'🧰'},
 {name:'LIVE / PK studio',href:'/live',purpose:'Live broadcasts and creator events',gate:'LiveKit and two-device broadcast test required',icon:'🔴'},
 {name:'All American Network',href:'/network',purpose:'Free TV, Isaiah AI TV and program showcases',gate:'Licensed feeds, schedules and replay delivery are not verified',icon:'🌐'},
]
const business:readonly LaunchItem[]=[
 {name:'111 website template demos',href:'/templates#business-catalog',purpose:'Browse, customize and download site concepts',gate:'Templates are not independent client domains',icon:'🖥️'},
 {name:'Website order and owner studio',href:'/business-app#template-store',purpose:'Create a customer website draft and intake',gate:'Confirm server payment, form delivery and publish process',icon:'🛍️'},
 {name:'Existing business directory',href:'/business',purpose:'Browse TRYAMM business microsites',gate:'Individual custom domains and payments need verification',icon:'🏬'},
 {name:'Independent-site release tracker',href:'/website-launch',purpose:'Track 20 client sites and export senior-engineer QA',gate:'No site is marked deployed without evidence',icon:'✅'},
 {name:'Aniyah Pay • Cross-Border Payments',href:'/aniyah-pay',purpose:'Global payment corridors for creator commerce and business sales',gate:'Real transfers disabled until approved partners, identity checks, live rates and settlements are verified',icon:'🌍'},
 {name:'Global Payments sandbox preview',href:'/aniyah-pay/demo',purpose:'Inspect Aniyah Pay's local transfer scenarios and provider catalog',gate:'Not a market FX quote or a real transfer; no money can move',icon:'💸'},
 {name:'Omni Cash',href:'/omni-cash',purpose:'Separate wallets, verified provider settlements and payment records',gate:'Real balances, transfers and payouts still require signed provider events',icon:'💳'},
]
const linkStyle:React.CSSProperties={display:'block',minHeight:44,textDecoration:'none',color:'#fff',border:'1px solid #34506c',borderRadius:15,padding:14,background:'linear-gradient(140deg,#101f35,#090f1d)'}
function Cards({items}:{items:readonly LaunchItem[]}){return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,240px),1fr))',gap:10}}>{items.map(item=><a href={item.href} key={item.href} style={linkStyle}><div style={{fontWeight:950,fontSize:16}}>{item.icon} {item.name} ↗</div><p style={{fontSize:13,color:'#bed0df',lineHeight:1.5}}>{item.purpose}</p><div style={{fontSize:11,color:'#ffdb92',lineHeight:1.5}}>NEEDS VERIFICATION: {item.gate}</div></a>)}</div>}
const releaseSteps=['Confirm public domain and owner','Verify mobile display and every button','Verify real lead email or booking delivery','Verify payment webhook and refunds (if selling)','Record rollback, backups and senior review']
export default function CreatorBusinessLaunchHub(){
 const [tab,setTab]=useState<'creators'|'business'>('creators')
 const [done,setDone]=useState<boolean[]>(()=>releaseSteps.map(()=>false))
 const completed=useMemo(()=>done.filter(Boolean).length,[done])
 return <main aria-label="TRYAMM Creator and Business Launch Hub" style={{minHeight:'100dvh',padding:'max(15px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(30px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))',background:'radial-gradient(circle at 40% 0,#18354d,#050911 65%)',color:'#fff',fontFamily:'system-ui'}}>
  <div style={{maxWidth:1050,margin:'0 auto'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><a href="/business-app" style={{color:'#9bdbff',minHeight:44,display:'inline-flex',alignItems:'center'}}>← TRYAMM APP</a><a href="/streetverse" style={{color:'#d5c3ff',minHeight:44,display:'inline-flex',alignItems:'center'}}>🎮 STREETVERSE GAME ↗</a></header>
   <p style={{fontSize:11,color:'#8be5ff',fontWeight:950,letterSpacing:2}}>ONE CREATOR WORKFLOW · SEPARATE VERIFICATION GATES</p>
   <h1 style={{fontSize:'clamp(30px,6vw,54px)',lineHeight:1.05,margin:'8px 0 12px'}}>Create → Showcase → LIVE → Sell</h1>
   <p style={{maxWidth:800,color:'#c0d2df',lineHeight:1.65}}>Everything is organized in one place: Isaiah AI TV, Who Wants to Be a Star, Aniyah’s music studio, Omni Box, Reels preparation, LIVE, and the website business. These links open real existing modules, but some need service connections and final testing before public sales.</p>
   <nav aria-label="Launch tools" style={{display:'flex',gap:8,margin:'15px 0 19px'}}><button type="button" aria-pressed={tab==='creators'} onClick={()=>setTab('creators')} style={tabButton(tab==='creators')}>🎤 CREATORS</button><button type="button" aria-pressed={tab==='business'} onClick={()=>setTab('business')} style={tabButton(tab==='business')}>🛍️ WEBSITES / SALES</button></nav>
   {tab==='creators'?<section aria-label="Creator services"><Cards items={creator}/></section>:<section aria-label="Business services"><Cards items={business}/></section>}
   <section aria-label="Global payments boundary" style={{marginTop:18,border:'1px solid #446f66',borderRadius:16,padding:14,background:'#0b1c21'}}><strong style={{color:'#9bffe1'}}>🌍 GLOBAL PAYMENTS: Aniyah Pay + Omni Cash</strong><p style={{fontSize:12,lineHeight:1.6,color:'#c2d3dc'}}>Keep the global-payment service connected to verified creator and website commerce, but separate from Aniyah’s 64-Track music studio and StreetVerse game coins. Sandbox FX, sample charges and provider names must never be presented as real transfer offers.</p><a href="/aniyah-pay" style={{color:'#91dcff',minHeight:44,display:'inline-flex',alignItems:'center'}}>Open global-payments readiness →</a></section>
   <section style={{marginTop:21,padding:18,border:'1px solid #496176',borderRadius:18,background:'#0d1828'}}>
    <h2 style={{margin:'0 0 9px',fontSize:21}}>First release: the smallest working sales funnel</h2>
    <p style={{fontSize:13,lineHeight:1.6,color:'#b6c7d5'}}>Choose a customer website, deliver a verified lead or order, and demonstrate one working LIVE creator session. Do not spend on unverified automated commissions, digital gifting, a 24/7 broadcast, or full-scale game worlds yet.</p>
    <p style={{fontSize:12,color:'#8be5ff'}}>{completed} of {releaseSteps.length} local QA checklist items marked for your review. This does not independently certify production.</p>
    <div style={{display:'grid',gap:10}}>{releaseSteps.map((label,i)=><label key={label} style={{display:'flex',gap:12,alignItems:'center',minHeight:44,fontSize:13}}><input type="checkbox" checked={done[i]} onChange={e=>setDone(a=>a.map((v,k)=>k===i?e.target.checked:v))}/>{label}</label>)}</div>
    <a href="/website-launch" style={{...linkStyle,marginTop:14,textAlign:'center'}}>OPEN 20-SITE CLIENT RELEASE TRACKER →</a>
   </section>
   <footer style={{padding:'20px 0',color:'#8b9faf',fontSize:11}}>This is an operational navigation hub, not confirmation of streaming, production deployment, payments or creator earnings.</footer>
  </div>
 </main>
}
function tabButton(active:boolean):React.CSSProperties{return{padding:'12px 14px',minHeight:44,borderRadius:12,border:'1px solid '+(active?'#76e3ff':'#47617a'),background:active?'#15435e':'#0b1525',color:'#fff',fontWeight:900,cursor:'pointer'}}
