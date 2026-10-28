import {useState} from 'react'
const sponsorTiers=[{name:'Community Supporter',amount:250,description:'Support an early public demonstration or accessibility testing.'},{name:'Innovation Partner',amount:1000,description:'Support creator tools, workforce demos or business onboarding.'},{name:'Founding Sponsor',amount:5000,description:'Discuss underwriting a defined pilot with agreed deliverables.'}] as const
const campaigns=[
 {id:'accessibility',title:'Accessible StreetVerse & Mobility',description:'One-handed mobile controls, captions and practical device testing.',phase:'Planning'},
 {id:'creator',title:'Creator and Workforce Pilot',description:'Starter studios, youth-friendly training and creator-business demonstrations.',phase:'Planning'},
 {id:'commerce',title:'Small Business Launch Fund',description:'Help participating businesses establish a functioning digital storefront and customer workflow.',phase:'Planning'},
] as const
function inquiry(subject:string,body:string){window.location.href='mailto:info@tryamm.online?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)}
export default function TryAMMSponsorshipFunding(){
 const [custom,setCustom]=useState('')
 const [campaign,setCampaign]=useState<string>('accessibility')
 return <section id="sponsors-and-funding" aria-labelledby="sponsors-heading" style={{marginTop:30,padding:'clamp(16px,3vw,28px)',borderRadius:22,border:'1px solid #98733877',background:'linear-gradient(125deg,#1c150b,#0b1626)',color:'#fff'}}>
 <span style={{fontSize:11,letterSpacing:2,color:'#edc970',fontWeight:800}}>SUPPORT THE NEXT GENERATION</span>
 <h2 id="sponsors-heading" style={{fontSize:'clamp(24px,4vw,38px)',margin:'8px 0'}}>Sponsors, Funding & Community Support</h2>
 <p style={{maxWidth:760,lineHeight:1.6,fontSize:14,color:'#d2d6df'}}>Partner with TRYAMM on accessible technology, Chicago creative worlds, business launches and workforce opportunities. Explore sponsorship proposals or ask about a specific fundraising campaign.</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,210px),1fr))',gap:10,marginTop:18}}>
  {sponsorTiers.map(t=><article key={t.amount} style={{background:'#071424',padding:16,borderRadius:15,border:'1px solid #b8984f66'}}>
   <div style={{fontSize:12,color:'#edcc78'}}>{t.name}</div><strong style={{fontSize:26}}>${t.amount.toLocaleString()}</strong>
   <p style={{fontSize:12,minHeight:54,color:'#bfccd9',lineHeight:1.5}}>{t.description}</p>
   <button style={action} onClick={()=>inquiry('TRYAMM sponsorship inquiry: '+t.name,'Hello TRYAMM, I would like sponsorship details for the ${t.amount} proposed level. Please send the scope, benefits, deliverables, and written terms.')}>Request sponsor details</button>
  </article>)}
  <article style={{background:'#071424',padding:16,borderRadius:15,border:'1px solid #b8984f66'}}>
   <div style={{fontSize:12,color:'#edcc78'}}>Corporate / Custom / In-kind</div><strong style={{fontSize:23}}>Let's collaborate</strong>
   <p style={{fontSize:12,color:'#bfccd9'}}>Cash sponsorship, equipment, donated services, grants and strategic partnerships are reviewed separately.</p>
   <label style={{fontSize:12}}>Proposal type<input value={custom} maxLength={80} onChange={e=>setCustom(e.target.value)} placeholder="e.g. equipment sponsor" style={field}/></label>
   <button style={{...action,marginTop:9}} onClick={()=>inquiry('TRYAMM custom sponsorship inquiry','I would like to discuss: '+custom)}>Contact partnerships</button>
  </article>
 </div>
 <div style={{marginTop:20,borderTop:'1px solid #b8984f55',paddingTop:17}}>
  <h3 style={{fontSize:20}}>Fundraising Campaigns</h3>
  <p style={{fontSize:12,color:'#bfccd9'}}>Select a proposed funding purpose. These campaigns are not active donation checkouts; amounts collected and donor lists are not represented here.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,190px),1fr))',gap:10}}>
  {campaigns.map(c=><button key={c.id} onClick={()=>setCampaign(c.id)} aria-pressed={campaign===c.id} style={{textAlign:'left',padding:14,minHeight:95,borderRadius:13,background:campaign===c.id?'#173950':'#081827',border:'1px solid '+(campaign===c.id?'#7edbf6':'#465769'),color:'#fff'}}>
   <strong style={{display:'block',fontSize:14}}>{c.title}</strong><span style={{display:'block',fontSize:11,color:'#bfd0de',marginTop:6}}>{c.description}</span><span style={{display:'block',fontSize:10,color:'#edc970',marginTop:6}}>{c.phase}</span>
  </button>)}
  </div>
  <button style={{...action,marginTop:12,maxWidth:320}} onClick={()=>{const c=campaigns.find(x=>x.id===campaign);inquiry('TRYAMM funding inquiry: '+(c?.title||'Campaign'),'Please send the campaign budget, milestones, reporting terms, and how I can support this initiative.')}}>Request campaign information</button>
 </div>
 <p style={{fontSize:11,lineHeight:1.5,color:'#b8bfd0',marginTop:17}}>TRYAMM LLC is a business. Do not assume contributions are tax-deductible charitable donations. Sponsorships, grants, in-kind support and purchases have different terms. No payment is collected on this page; campaign budgets, sponsor benefits, and financial reporting require approval before activation.</p>
 </section>
}
const field:React.CSSProperties={display:'block',width:'100%',boxSizing:'border-box',marginTop:5,minHeight:44,padding:10,borderRadius:10,border:'1px solid #65788f',background:'#0b2135',color:'#fff'}
const action:React.CSSProperties={width:'100%',minHeight:46,padding:'10px 12px',background:'#e6bd5c',border:0,borderRadius:11,fontWeight:800,color:'#132032',cursor:'pointer'}
