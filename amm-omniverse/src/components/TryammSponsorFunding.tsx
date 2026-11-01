import React,{useState} from 'react';
const tiers=[
 {name:'Community Supporter',amount:'$250',benefits:'Name acknowledgment on an approved sponsor page and a campaign update.'},
 {name:'Launch Partner',amount:'$1,000',benefits:'Approved logo placement, sponsor acknowledgment, and a documented project update.'},
 {name:'Innovation Partner',amount:'$5,000',benefits:'Proposed featured sponsor recognition and a project showcase conversation.'},
 {name:'Founding Sponsor',amount:'Custom',benefits:'Custom written sponsorship proposal, deliverables and approval process.'}
] as const;
const input:React.CSSProperties={width:'100%',padding:13,minHeight:48,borderRadius:10,border:'1px solid #8896af',background:'#141d31',color:'#fff',boxSizing:'border-box'};
export default function TryammSponsorFunding(){
 const [name,setName]=useState(''),[organization,setOrganization]=useState(''),[email,setEmail]=useState(''),[type,setType]=useState('Corporate sponsorship'),[interest,setInterest]=useState('Launch Partner'),[notes,setNotes]=useState('');
 const [notice,setNotice]=useState('');
 const send=(e:React.FormEvent)=>{e.preventDefault();if(!name.trim()||!email.includes('@')){setNotice('Enter a name and valid email.');return}
 const subject='TRYAMM partnership inquiry — '+interest;
 const body=['TRYAMM LLC funding / sponsorship inquiry','Name: '+name,'Organization: '+organization,'Reply email: '+email,'Interest type: '+type,'Suggested partnership level: '+interest,'Message: '+notes,'Please send me the current sponsor prospectus, eligibility details, and a written agreement before requesting payment.'].join('\\n');
 // Uses the visitor's own email application; TRYAMM does not persist or transmit this form.
 window.location.href='mailto:theammonmiverse@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 setNotice('Your email app should open with a prepared inquiry. Press Send there; nothing was submitted from this page.');};
 return <main style={{fontFamily:'system-ui',background:'#090f20',color:'#fff',minHeight:'100dvh',padding:'max(20px,env(safe-area-inset-top)) 14px 45px'}}>
 <div style={{maxWidth:1040,margin:'auto'}}>
 <a href="/discover" style={{display:'inline-flex',alignItems:'center',minHeight:48,color:'#f5c96c'}}>← TRYAMM home</a>
 <header style={{padding:'clamp(20px,5vw,48px)',borderRadius:24,background:'linear-gradient(125deg,#292047,#131d35)',border:'1px solid #755a91'}}>
 <p style={{color:'#f5c96c',fontWeight:900,letterSpacing:2}}>PARTNER WITH TRYAMM LLC</p>
 <h1 style={{fontSize:'clamp(34px,6vw,58px)',margin:'8px 0'}}>Help Build Accessible Digital Opportunity</h1>
 <p style={{maxWidth:750,fontSize:18,lineHeight:1.55}}>We're seeking sponsors, business partners, grantmakers and supporters for accessible digital business tools, creator education, StreetVerse development, and the TRYAMM innovation ecosystem.</p>
 <a href="#inquiry" style={{display:'inline-flex',minHeight:48,alignItems:'center',padding:'10px 18px',background:'#f5c96c',color:'#171323',fontWeight:850,borderRadius:11,textDecoration:'none'}}>Request sponsorship information</a>
 </header>
 <section aria-labelledby="funding-priorities"><h2 id="funding-priorities">What support can help fund</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,230px),1fr))',gap:12}}>
 {['Accessible website services and 111 industry template adaptations','Creator training, media tools and first customer launches','StreetVerse prototypes and inclusive virtual environments','Security, hosting, testing and business infrastructure'].map(x=><div key={x} style={{background:'#172137',border:'1px solid #4b5f7d',borderRadius:15,padding:18,lineHeight:1.5}}>{x}</div>)}</div></section>
 <section aria-labelledby="levels"><h2 id="levels">Proposed sponsorship opportunities</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,210px),1fr))',gap:12}}>
 {tiers.map(t=><article key={t.name} style={{border:'1px solid #836b9b',borderRadius:15,padding:18,background:'#161e34'}}><h3>{t.name}</h3><p style={{fontSize:26,color:'#f5c96c',fontWeight:800}}>{t.amount}</p><p>{t.benefits}</p></article>)}</div>
 <p style={{color:'#d5c5ad'}}>All levels are discussion starting points, not accepted payments or guaranteed benefits. Written terms, rights to logos, deliverables and recognition must be approved before collecting funds.</p></section>
 <section style={{marginTop:28,padding:22,border:'1px solid #53637d',borderRadius:18}}><h2>Ways to support</h2><p><strong>Sponsorship:</strong> commercial marketing partnership with a written agreement. <strong>Grants:</strong> eligibility-based funding applications. <strong>In-kind support:</strong> equipment, services, technical expertise and training. <strong>Business preorders:</strong> only for independently verified deliverables with clear terms.</p>
 <p><strong>Important:</strong> TRYAMM LLC is a for-profit business. Sponsorships or contributions to TRYAMM are not represented as charitable, tax-deductible donations. No investment, equity or repayment is offered by this page. No charge is taken here.</p></section>
 <section id="inquiry" style={{marginTop:28,padding:22,border:'1px solid #806399',borderRadius:18,background:'#161d33'}}>
 <h2>Request a sponsorship conversation</h2><p>This form opens your email app with a draft. It does not save your details or send a message until you send the email yourself.</p>
 <form onSubmit={send} style={{display:'grid',gap:13,maxWidth:650}}>
 <label>Contact name *<input aria-label="Contact name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)} style={input}/></label>
 <label>Organization<input aria-label="Organization" maxLength={120} value={organization} onChange={e=>setOrganization(e.target.value)} style={input}/></label>
 <label>Email *<input aria-label="Email" type="email" required maxLength={180} value={email} onChange={e=>setEmail(e.target.value)} style={input}/></label>
 <label>Interest type<select value={type} onChange={e=>setType(e.target.value)} style={input}><option>Corporate sponsorship</option><option>Grant funding</option><option>In-kind partnership</option><option>Other collaboration</option></select></label>
 <label>Level of interest<select value={interest} onChange={e=>setInterest(e.target.value)} style={input}>{tiers.map(t=><option key={t.name}>{t.name}</option>)}</select></label>
 <label>Message<textarea maxLength={1800} rows={4} value={notes} onChange={e=>setNotes(e.target.value)} style={input}/></label>
 <button type="submit" style={{padding:'13px 18px',minHeight:48,border:0,borderRadius:12,background:'#f5c96c',color:'#181427',fontWeight:850,cursor:'pointer'}}>Prepare email inquiry</button>
 <p role="status" aria-live="polite">{notice}</p>
 </form></section>
 <footer style={{marginTop:24,color:'#b7c4da'}}>TRYAMM LLC · Funding discussions only · No payments accepted on this page</footer>
 </div></main>;
}