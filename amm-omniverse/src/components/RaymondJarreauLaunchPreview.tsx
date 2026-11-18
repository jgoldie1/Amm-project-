import { useState, type CSSProperties } from 'react'

type View='home'|'showcase'|'booking'
export default function RaymondJarreauLaunchPreview({onClose,onOpenShowcase}:{onClose:()=>void;onOpenShowcase:()=>void}){
 const [view,setView]=useState<View>('home')
 const btn:CSSProperties={minHeight:54,borderRadius:12,background:'#17374a',border:'1px solid #98c7db',color:'#fff',fontSize:16,fontWeight:800,padding:'12px 16px',cursor:'pointer'}
 return <section role="dialog" aria-modal="true" aria-label="Raymond Jarreau website launch preview" style={{position:'fixed',inset:0,zIndex:2147483550,overflowY:'auto',padding:'clamp(16px,4vw,35px)',background:'#0b1722',color:'#fff'}}>
  <main style={{maxWidth:780,margin:'0 auto',display:'grid',gap:16}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:15}}><div><p style={{fontSize:12,color:'#99d6e8',letterSpacing:2,margin:0}}>TRYAMM BUSINESS WEBSITE LAUNCH PREVIEW</p><h1 style={{fontSize:32,margin:'8px 0'}}>Raymond Jarreau</h1></div><button style={btn} onClick={onClose}>Close</button></header>
   <p style={{lineHeight:1.65}}>An owner-approved professional website can connect Raymond Jarreau to the All American Showcase and TRYAMM business network. Business biography, services, portrait, contact channels, domain and publication authorization still require Raymond's approval.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{(['home','showcase','booking'] as View[]).map(item=><button type="button" key={item} style={{...btn,background:view===item?'#246785':'#17374a'}} aria-pressed={view===item} onClick={()=>setView(item)}>{item==='home'?'Overview':item==='showcase'?'Showcase': 'Booking readiness'}</button>)}</div>
   {view==='home'&&<article style={{background:'#132e42',padding:18,borderRadius:14}}><h2>Welcome to Raymond Jarreau's website preview</h2><p>Original brand photography, biography, approved professional services, and customer contact details can be added after owner authorization. No unverified testimonial, service, credential, or public contact information is displayed.</p><p style={{color:'#ffe4ae'}}>Status: Private design preview. Not a published independent website.</p></article>}
   {view==='showcase'&&<article style={{background:'#132e42',padding:18,borderRadius:14}}><h2>All American Showcase connection</h2><p>Raymond's approved appearance, hosting, talent, business and promotion opportunities may be connected to the original showcase production after role and rights clearance.</p><button style={btn} onClick={onOpenShowcase}>Open existing Showcase</button></article>}
   {view==='booking'&&<article style={{background:'#132e42',padding:18,borderRadius:14}}><h2>Website launch acceptance</h2><ol style={{lineHeight:1.85}}><li>Raymond approves business name, biography, services and photos</li><li>Raymond approves his domain, contact method and privacy notice</li><li>Owner tests accessible mobile navigation and inquiry confirmation</li><li>Commercial and talent releases are reviewed before publishing</li><li>Website domain, hosting, analytics and production deployment are verified</li></ol><p>Live contact forms and payments are intentionally not enabled until an authorized backend, consent and spam controls exist.</p></article>}
   <p style={{fontSize:12,color:'#bbd1dd'}}>This private preview does not publish a website or claim Raymond endorses any performance or commercial until approved.</p>
  </main>
 </section>
}
