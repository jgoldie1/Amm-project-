import React, {useState} from 'react';
const offers=[
{name:'Website Preview',price:'$499 one-time',desc:'Mobile website preview, branded Reel, QR code and branding.',url:'/business-app#template-store',note:'Payment and fulfillment require verification.'},
{name:'111 Industry Templates',price:'Explore demos',desc:'Browse 111 categories; each customer site must be individually launched.',url:'/templates#business-catalog',note:'Previews are not published client sites.'},
{name:'Stubbs Mobility',price:'Accessibility first',desc:'One-handed and mobile-friendly experiences with large controls and reduced-motion support.',url:'/business-app',note:'Independent accessibility testing remains required.'},
{name:'StreetVerse',price:'Custom quote',desc:'Immersive business showrooms and RP RPG concepts.',url:'/streetverse',note:'Production virtual locations are not ready for checkout.'},
{name:'Global Business',price:'Coming soon',desc:'Business discovery, logistics and supported international commerce.',url:'/business',note:'No real-money transfers are offered here.'},
{name:'NueAmerica',price:'Coming soon',desc:'Original music, RP RPG album, stories and creator experiences.',url:'/creator-launch',note:'Commercial rights and distribution require validation.'},
{name:'LIVE and Reels',price:'Coming soon',desc:'Creator content, video and streaming workflows.',url:'/creator-launch',note:'Live provider and device tests pending.'},
{name:'Stubbs AI',price:'Coming soon',desc:'Owner-approved FAQs, inquiries and project follow-ups.',url:'/business-app',note:'Automated outreach is not enabled.'}
] as const;
const button:React.CSSProperties={minHeight:48,borderRadius:12,padding:'12px 16px',fontWeight:750,display:'inline-flex',alignItems:'center',textDecoration:'none'};
export default function TryammPublicGateway(){
 const [index,setIndex]=useState(0),[reduced,setReduced]=useState(true);
 const offer=offers[index];
 const change=(n:number)=>setIndex(i=>(i+n+offers.length)%offers.length);
 return <main style={{fontFamily:'system-ui',background:'#080e1c',color:'#fff',minHeight:'100dvh',padding:'max(16px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(28px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))'}}>
 <div style={{maxWidth:1100,margin:'auto'}}>
 <header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center',marginBottom:24}}>
 <a href="/" style={{color:'#f2c674',fontSize:24,fontWeight:900,textDecoration:'none'}}>TRYAMM LLC</a>
 <nav aria-label="Main navigation" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
 <a href="/templates#business-catalog" style={{...button,color:'#fff',border:'1px solid #70849d'}}>Templates</a><a href="/streetverse" style={{...button,color:'#fff',border:'1px solid #70849d'}}>StreetVerse</a>
 </nav></header>
 <section style={{borderRadius:26,padding:'clamp(20px,6vw,50px)',background:'radial-gradient(circle at 90% 15%,#50306f,#17172c 45%,#0b192d)',border:'1px solid #7d608e'}}>
 <p style={{color:'#f5c675',fontWeight:800,letterSpacing:2,fontSize:12}}>BUSINESS FIRST · YOUR WORLD NEXT</p>
 <h1 style={{fontSize:'clamp(32px,6vw,64px)',lineHeight:1.08,maxWidth:760,margin:'10px 0'}}>Build your business. Enter the Omniverse.</h1>
 <p style={{fontSize:18,maxWidth:720,color:'#e4e0ee'}}>Websites, branding, accessible business tools, creators, StreetVerse and the wider TRYAMM world—all from one clear entrance.</p>
 <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:22}}>
 <a href="/business-app#template-store" style={{...button,background:'#efc374',color:'#18151a'}}>Explore $499 website preview</a>
 <a href="/streetverse" style={{...button,border:'1px solid #c9b6eb',color:'#fff'}}>Explore StreetVerse</a>
 </div><p style={{fontSize:12,color:'#ecd8ed'}}>This gateway does not take payments. Any checkout must pass independent verification before sales.</p>
 </section>
 <section aria-labelledby="offers" style={{marginTop:30}}>
 <h2 id="offers">Services and worlds</h2>
 <label style={{display:'flex',alignItems:'center',gap:8,minHeight:48,marginBottom:8}}><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Reduced motion (default on)</label>
 <div role="region" aria-roledescription="carousel" aria-label="TRYAMM services carousel" style={{border:'1px solid #576a86',background:'#111b30',borderRadius:20,padding:22}}>
 <p aria-live="polite" style={{color:'#f2c674'}}>Service {index+1} of {offers.length}</p>
 <h3 style={{fontSize:26,margin:'6px 0'}}>{offer.name}</h3><p style={{color:'#f2c674',fontWeight:750}}>{offer.price}</p>
 <p>{offer.desc}</p><p style={{color:'#e0c9ab',fontSize:13}}>{offer.note}</p>
 <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
 <button type="button" onClick={()=>change(-1)} aria-label="Previous service" style={{...button,color:'#fff',background:'#2c3c57',border:'1px solid #7295b4'}}>← Previous</button>
 <button type="button" onClick={()=>change(1)} aria-label="Next service" style={{...button,color:'#fff',background:'#2c3c57',border:'1px solid #7295b4'}}>Next →</button>
 <a href={offer.url} style={{...button,color:'#171322',background:'#f2c674'}}>Explore {offer.name}</a>
 </div></div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,230px),1fr))',gap:12,marginTop:15}}>
 {offers.map((s,i)=><button key={s.name} type="button" aria-pressed={i===index} onClick={()=>setIndex(i)} style={{cursor:'pointer',minHeight:85,textAlign:'left',padding:16,borderRadius:15,color:'#fff',background:'#131f34',border:i===index?'2px solid #f2c674':'1px solid #52647c'}}><strong style={{display:'block'}}>{s.name}</strong><span style={{fontSize:13,color:'#dec28e'}}>{s.price}</span></button>)}
 </div>
 </section>
 <section style={{padding:22,borderRadius:20,marginTop:32,border:'1px solid #52647c'}}><h2>Website customer journey</h2>
 <p>1. Choose package → 2. Request service → 3. Approve written terms → 4. Verified secure checkout → 5. Build and review → 6. Delivery → 7. Optional recurring care.</p>
 <p style={{color:'#e0c9ab'}}>These are required launch gates, not claims that every step is already operational.</p>
 <a href="/website-launch" style={{...button,border:'1px solid #f2c674',color:'#f2c674'}}>Open launch verification tracker</a>
 </section>
 <footer style={{fontSize:14,marginTop:30,color:'#bfcada'}}>TRYAMM LLC · Instagram @tryammllc · TikTok @tryammllc · tryamm.online</footer>
 </div></main>;
}