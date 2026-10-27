import React from 'react';
const sections=[
 {title:'Executive summary',detail:'TRYAMM LLC builds an accessible digital-services ecosystem that connects small businesses, creators and interactive experiences.'},
 {title:'Problem and customer',detail:'Small businesses often need separate providers for websites, marketing, video, accessibility and digital commerce.'},
 {title:'Platform architecture',detail:'A shared business entrance routes to independent business sites, templates, creator services and optionally StreetVerse. AI and regulated services have separate safety gates.'},
 {title:'111-template model',detail:'Templates are reusable business concepts; individual websites require owner approvals, domain tests, verified leads and release checks.'},
 {title:'Accessibility and Stubbs Mobility',detail:'Design for single-handed use, text enlargement, large controls, keyboard navigation, reduced motion and explicit alternatives to immersive features.'},
 {title:'LIVE and holographic experiences',detail:'Creator broadcasting and holographic display concepts are future differentiated experiences; actual broadcasting and device support require verification.'},
 {title:'Business model',detail:'One-time website and production services, recurring maintenance and marketing, licensing and approved branded immersive experiences.'},
 {title:'Funding and governance',detail:'Separate sponsorships, grants, in-kind support and business revenue; disclose obligations, costs, milestones and commercial use of funding.'},
 {title:'Security and milestones',detail:'Verified checkout, written agreements, signed payment webhooks, audit trails, backups, rollback, content rights, privacy and independent mobile tests.'},
];
export default function TryammWhitePaper(){
 return <main style={{fontFamily:'system-ui',minHeight:'100dvh',background:'#0b1020',color:'#fff',padding:'max(22px,env(safe-area-inset-top)) 15px 50px'}}>
 <div style={{maxWidth:900,margin:'auto'}}>
 <a href="/discover" style={{color:'#f2c675',minHeight:48,display:'inline-flex',alignItems:'center'}}>← TRYAMM home</a>
 <header style={{padding:'clamp(24px,5vw,45px)',borderRadius:25,background:'linear-gradient(120deg,#322248,#12223b)',border:'1px solid #78668e'}}>
 <p style={{fontWeight:850,color:'#f2c675',letterSpacing:2}}>TRYAMM LLC · PUBLIC CONCEPT PAPER · 2026</p>
 <h1 style={{fontSize:'clamp(30px,6vw,54px)',lineHeight:1.1}}>Accessible Digital Business & Omniverse Platform</h1>
 <p style={{fontSize:18,lineHeight:1.55}}>Our vision, customer value, commercial model, accessibility commitments, architecture and milestones.</p>
 <a href="/sponsors" style={{display:'inline-flex',alignItems:'center',minHeight:48,padding:'10px 18px',background:'#f2c675',color:'#211626',borderRadius:12,textDecoration:'none',fontWeight:800}}>Explore sponsorship and fundraising</a>
 </header>
 <p style={{color:'#ddc6a7',lineHeight:1.6}}>This is a concept and development white paper, not an audited technical report, financial offering, charity prospectus, or proof that every proposed feature is operational.</p>
 <nav aria-label="White paper chapters" style={{display:'flex',flexWrap:'wrap',gap:8}}>{sections.map((s,i)=><a key={s.title} href={'#chapter-'+i} style={{color:'#f2c675',minHeight:44,padding:'11px',border:'1px solid #69728d',borderRadius:10}}>{i+1}. {s.title}</a>)}</nav>
 {sections.map((s,i)=><section id={'chapter-'+i} key={s.title} style={{padding:'24px 0',borderBottom:'1px solid #37435d'}}><h2>{i+1}. {s.title}</h2><p style={{fontSize:17,lineHeight:1.7}}>{s.detail}</p></section>)}
 <footer style={{paddingTop:25,color:'#b9c5da'}}>TRYAMM LLC · Draft public overview · Request the detailed investor/sponsor materials separately after approval</footer></div></main>;
}