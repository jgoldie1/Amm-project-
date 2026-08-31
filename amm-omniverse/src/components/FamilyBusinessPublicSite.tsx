import { FAMILY_BUSINESS_REGISTRY } from '../data/familyBusinessRegistry'
import UniversalLeadPanel from './UniversalLeadPanel'

function titleCase(s:string){return s.replace(/[-_]/g,' ').replace(/\b\w/g,m=>m.toUpperCase())}

export default function FamilyBusinessPublicSite({slug,onClose}:{slug:string;onClose:()=>void}){
 const profile=FAMILY_BUSINESS_REGISTRY.find(x=>x.id===slug)
 if(!profile)return <div style={{position:'fixed',inset:0,zIndex:22000,background:'#05080d',color:'#fff',display:'grid',placeItems:'center',padding:24}}><div><h1>Business page not found</h1><button onClick={onClose}>Back to TRYAMM</button></div></div>
 const primary=profile.ventures[0]
 const contact=()=>window.dispatchEvent(new CustomEvent('tryamm:family-business-contact',{detail:{id:profile.id}}))
 const book=()=>window.dispatchEvent(new CustomEvent('tryamm:family-business-booking',{detail:{id:profile.id}}))
 const shop=()=>window.dispatchEvent(new CustomEvent('tryamm:family-business-store',{detail:{id:profile.id}}))
 const leadActions=[{label:'REQUEST SERVICE',onClick:contact,primary:true},...(profile.modules.includes('booking')||profile.modules.includes('service-booking')?[{label:'BOOK NOW',onClick:book}]:[]),...(profile.modules.includes('store')?[{label:'SHOP',onClick:shop}]:[]),{label:'ENTER STREETVERSE',href:'/streetverse'}]
 return <main style={{position:'fixed',inset:0,zIndex:22000,overflow:'auto',background:'linear-gradient(145deg,#04070b,#0a1720 55%,#151008)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
  <section style={{maxWidth:1120,margin:'0 auto',padding:'28px 20px 56px'}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><button onClick={onClose} style={btn}>← TRYAMM</button><div style={{fontSize:11,letterSpacing:2,color:'#e8b944',fontWeight:900}}>ALL AMERICAN MARKETPLACE BUSINESS NETWORK</div></header>
   <div style={{padding:'72px 0 38px'}}><div style={{fontSize:12,color:'#4fe3ff',fontWeight:900,textTransform:'uppercase'}}>{profile.region}</div><h1 style={{fontSize:'clamp(38px,7vw,78px)',lineHeight:.98,margin:'10px 0 18px',maxWidth:900}}>{profile.owner}</h1><h2 style={{fontSize:'clamp(20px,3vw,34px)',fontWeight:650,color:'#d7e4eb',margin:0,maxWidth:800}}>{primary}</h2><p style={{maxWidth:720,lineHeight:1.7,color:'#9fb1be',fontSize:15}}>A TRYAMM-powered business profile prepared for website, booking or commerce, customer relationship tools, Holo Ads, StreetVerse presence and analytics. Service availability depends on the modules selected for this business.</p><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:22}}><button onClick={contact} style={primaryBtn}>CONTACT / REQUEST SERVICE</button>{profile.modules.includes('booking')||profile.modules.includes('service-booking')?<button onClick={book} style={btn}>BOOK</button>:null}{profile.modules.includes('store')?<button onClick={shop} style={btn}>SHOP</button>:null}<button onClick={()=>{window.location.href='/';queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:middleverse-open')))}} style={btn}>AI WORKFORCE</button></div></div>
   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>
    <article style={card}><div style={eyebrow}>SERVICES</div>{profile.ventures.map(v=><div key={v} style={{padding:'9px 0',borderBottom:'1px solid #24313a'}}>{titleCase(v)}</div>)}</article>
    <article style={card}><div style={eyebrow}>DIGITAL CAPABILITIES</div>{profile.modules.map(m=><span key={m} style={{display:'inline-block',margin:'5px 5px 0 0',padding:'7px 9px',borderRadius:999,background:'#10202a',border:'1px solid #274250',fontSize:11}}>{titleCase(m)}</span>)}</article>
    <article style={card}><div style={eyebrow}>STATUS</div><div style={{fontSize:26,fontWeight:950,marginTop:8}}>{profile.status==='live'?'LIVE':'PRE-LAUNCH'}</div><p style={{fontSize:12,lineHeight:1.6,color:'#9fb1be'}}>This public microsite is generated from the recovered business registry. A custom domain, payment provider, booking provider or external inventory connection is not represented as active until separately verified.</p></article>
   </section>
   <UniversalLeadPanel eyebrow="BUSINESS LEAD PANEL" title={`Ready to connect with ${profile.owner}?`} copy="Every business page now carries a clear conversion path so visitors can request service, book or shop when that capability is enabled, and continue into the wider StreetVerse and TRYAMM business network." actions={leadActions}/>
   <footer style={{marginTop:36,paddingTop:18,borderTop:'1px solid #24313a',color:'#738794',fontSize:11}}>Powered by TRYAMM • All American Marketplace • Stubbs AI business network</footer>
  </section>
 </main>
}
const card:React.CSSProperties={padding:18,borderRadius:18,border:'1px solid #263944',background:'#081017cc'}
const eyebrow:React.CSSProperties={fontSize:10,letterSpacing:2,color:'#e8b944',fontWeight:900}
const btn:React.CSSProperties={padding:'10px 13px',borderRadius:10,border:'1px solid #39505e',background:'#0b1720',color:'#fff',fontWeight:850,cursor:'pointer'}
const primaryBtn:React.CSSProperties={...btn,background:'linear-gradient(135deg,#4fe3ff,#78ffb4)',color:'#041016',border:0}
