import {useState} from 'react'
type Goal='website'|'studio'|'ai'|'media'|'sponsor'|'funding'
const paths:{id:Goal;title:string;action:string;details:string}[]=[
 {id:'website',title:'Launch a business website',action:'Request a $499 preview',details:'Website Preview package: starter preview, QR code and one promotional reel. Scope confirmed before payment.'},
 {id:'studio',title:'Book Aniyah Studio vocal editing',action:'Request $35 vocal editing',details:'Starter rap-vocal editing service inquiry. Confirm file requirements, schedule and delivery before payment.'},
 {id:'ai',title:'Get Stubbs AI business support',action:'Request an AI business consultation',details:'Discuss customer inquiries, AI-assisted intake, and service support. Pricing and features confirmed before agreement.'},
 {id:'media',title:'Create Reels or short dramas',action:'Request a production quote',details:'Request approved promotional video, short drama or creative production services. Scope and licensing quoted individually.'},
 {id:'sponsor',title:'Sponsor TRYAMM innovation',action:'Discuss sponsorship',details:'Proposed $250, $1,000 and $5,000 sponsorship levels and custom partnerships.'},
 {id:'funding',title:'Support a pilot project',action:'Request campaign details',details:'Ask about accessibility, creator training and small business launch funding needs.'},
]
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:48,border:'1px solid #5e879c',borderRadius:11,padding:11,color:'#fff',background:'#081829',fontSize:16}
const button:React.CSSProperties={minHeight:48,padding:'10px 16px',border:0,borderRadius:12,color:'#081524',background:'#f2c762',fontWeight:850,cursor:'pointer'}
export default function TryAMMLeadFunnel(){
 const [goal,setGoal]=useState<Goal>('website')
 const [name,setName]=useState('')
 const [contact,setContact]=useState('')
 const [business,setBusiness]=useState('')
 const [notes,setNotes]=useState('')
 const [consent,setConsent]=useState(false)
 const [message,setMessage]=useState('')
 const selected=paths.find(p=>p.id===goal)!
 const submit=(event:React.FormEvent)=>{
  event.preventDefault()
  if(!consent){setMessage('Please approve including your contact details in the email draft.');return}
  if(!contact.trim()){setMessage('Enter an email or phone number to receive a reply.');return}
  const subject='TRYAMM '+selected.title+' inquiry'
  const body=['Inquiry type: '+selected.title,'Name: '+name.trim(),'Contact: '+contact.trim(),'Business: '+business.trim(),'Project: '+notes.trim(),'Please contact me about this request.'].join('\n')
  const uri='mailto:info@tryamm.online?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)
  window.location.href=uri
  setMessage('Your email app should open with a prepared inquiry. Review it and press Send to submit; TRYAMM has not received anything until you send it.')
 }
 return <section id="start-with-tryamm" aria-labelledby="tryamm-funnel-heading" style={{marginTop:28,borderRadius:22,padding:'clamp(18px,4vw,30px)',border:'1px solid #4989a7',background:'linear-gradient(135deg,#102a3d,#09111f)',color:'#fff'}}>
  <div style={{color:'#f4cd74',letterSpacing:2,fontSize:11,fontWeight:900}}>START HERE · TRYAMM</div>
  <h2 id="tryamm-funnel-heading" style={{fontSize:'clamp(25px,4vw,38px)',margin:'9px 0'}}>Turn your idea into a business experience.</h2>
  <p style={{maxWidth:680,color:'#c4d5df',lineHeight:1.6}}>Choose your goal, tell us what you're building, and prepare a direct inquiry. Website and creator services, sponsorships and funding are kept separate so you know what you're requesting.</p>
  <div role="group" aria-label="Choose a TRYAMM service" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))',gap:9,margin:'18px 0'}}>
   {paths.map(path=><button key={path.id} onClick={()=>{setGoal(path.id);setMessage('')}} aria-pressed={goal===path.id} style={{...button,color:'#fff',background:goal===path.id?'#176481':'#101e30',border:'1px solid '+(goal===path.id?'#9ce7ff':'#48617a'),textAlign:'left'}}>
    <strong style={{display:'block',fontSize:15}}>{path.title}</strong><span style={{display:'block',fontSize:11,fontWeight:400,marginTop:7,lineHeight:1.5}}>{path.details}</span>
   </button>)}
  </div>
  <form onSubmit={submit} style={{display:'grid',gap:11,maxWidth:680}}>
   <div style={{fontSize:15,fontWeight:800}}>{selected.action}</div>
   <label style={{fontSize:12}}>Name (optional)<input style={input} value={name} onChange={e=>setName(e.target.value.slice(0,90))} placeholder="Your name" autoComplete="name"/></label>
   <label style={{fontSize:12}}>Email or phone for reply<input required style={input} value={contact} onChange={e=>setContact(e.target.value.slice(0,120))} placeholder="Best way to reach you"/></label>
   <label style={{fontSize:12}}>Business or organization (optional)<input style={input} value={business} onChange={e=>setBusiness(e.target.value.slice(0,120))} placeholder="Business or organization"/></label>
   <label style={{fontSize:12}}>What do you need?<textarea style={{...input,minHeight:90}} value={notes} onChange={e=>setNotes(e.target.value.slice(0,500))} placeholder="Tell us about your project" rows={3}/></label>
   <label style={{display:'flex',alignItems:'flex-start',gap:9,fontSize:12,lineHeight:1.5}}><input type="checkbox" style={{width:22,height:22,flexShrink:0}} checked={consent} onChange={e=>setConsent(e.target.checked)}/>I agree to include these details in a draft email to TRYAMM. No data is saved by this form.</label>
   <button type="submit" style={{...button,justifySelf:'start'}}>{selected.action} →</button>
   {message&&<div role="status" style={{color:'#aee9ff',fontSize:12,lineHeight:1.5}}>{message}</div>}
  </form>
  <p style={{fontSize:11,color:'#a8c0cd',marginTop:13}}>No payment is collected here. Email inquiries require you to send the prepared message in your email app. Website delivery details and pricing are confirmed in writing.</p>
 </section>
}
