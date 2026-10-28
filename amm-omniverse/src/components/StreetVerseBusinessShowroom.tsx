import {useState} from 'react'
import {STREETVERSE_STOREFRONTS,storefrontById} from '../data/StreetVerseStorefrontCatalog'
const btn:React.CSSProperties={minHeight:46,borderRadius:11,padding:'10px 13px',border:'1px solid #8ebad5',background:'#17465c',color:'white',fontWeight:800,cursor:'pointer'}
export default function StreetVerseBusinessShowroom(){
 const [selected,setSelected]=useState('stubbs-mobility')
 const [name,setName]=useState('')
 const [contact,setContact]=useState('')
 const [interest,setInterest]=useState('')
 const [permission,setPermission]=useState(false)
 const [message,setMessage]=useState('')
 const store=storefrontById(selected)??STREETVERSE_STOREFRONTS[0]
 const inquire=(e:React.FormEvent)=>{
  e.preventDefault()
  if(!permission||!contact.trim()){setMessage('Provide a reply contact and consent before opening your inquiry email.');return}
  const subject='TRYAMM StreetVerse business inquiry: '+store.name
  const body=['Business: '+store.name,'Visitor: '+name,'Reply contact: '+contact,'Request: '+interest,'Source: TRYAMM showroom preview'].join('\n')
  window.location.href='mailto:theammonmiverse@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)
  setMessage('Email draft prepared. You must send it from your email app; no booking or purchase has been made.')
 }
 return <section id="streetverse-business-showrooms" aria-labelledby="showroom-title" data-no-realm-swipe="true" style={{marginTop:24,border:'1px solid #5a92a8',borderRadius:20,background:'#0a1727',color:'#fff',padding:18}}>
  <div style={{color:'#96e2fa',fontWeight:900,fontSize:11,letterSpacing:2}}>STREETVERSE · BUSINESS SHOWROOM PILOT</div>
  <h2 id="showroom-title" style={{fontSize:'clamp(23px,4vw,32px)',margin:'8px 0'}}>Explore four business storefront previews</h2>
  <p style={{fontSize:13,color:'#c2d2de'}}>These are accessible storefront cards, not installed 3D shops or live bookings. Choose a business to view its concept and prepare a real inquiry email.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,190px),1fr))',gap:8}}>{STREETVERSE_STOREFRONTS.map(s=><button key={s.id} onClick={()=>{setSelected(s.id);setMessage('');setInterest('')}} aria-pressed={selected===s.id} style={{...btn,textAlign:'left',background:selected===s.id?'#225777':'#12283e',borderColor:s.accent}}>{s.name}<span style={{display:'block',fontSize:11,fontWeight:400,color:'#d0dce5',marginTop:5}}>{s.category}</span></button>)}</div>
  <article style={{marginTop:13,border:'1px solid '+store.accent,borderRadius:16,padding:16,background:'linear-gradient(135deg,#172d42,#0c1526)'}}>
   <div style={{color:store.accent,fontSize:11,fontWeight:900}}>SHOWROOM CONCEPT · INQUIRY ONLY</div><h3 style={{fontSize:23,margin:'8px 0'}}>{store.name}</h3><p style={{fontSize:13,color:'#d3dce6'}}>{store.summary}</p>
   <ul style={{lineHeight:1.7,fontSize:13}}>{store.services.map(x=><li key={x}>{x}</li>)}</ul>
   <form onSubmit={inquire} style={{display:'grid',gap:9,maxWidth:600}}>
    <label style={{fontSize:12}}>Name (optional)<input style={input} value={name} onChange={e=>setName(e.target.value.slice(0,90))}/></label>
    <label style={{fontSize:12}}>Email or phone for reply<input style={input} required value={contact} onChange={e=>setContact(e.target.value.slice(0,120))}/></label>
    <label style={{fontSize:12}}>What would you like to know?<textarea rows={3} style={{...input,minHeight:75}} value={interest} onChange={e=>setInterest(e.target.value.slice(0,500))}/></label>
    <label style={{display:'flex',gap:9,fontSize:12,alignItems:'center'}}><input type="checkbox" style={{width:22,height:22}} checked={permission} onChange={e=>setPermission(e.target.checked)}/>I consent to including this information in an email inquiry.</label>
    <button style={btn} type="submit">Prepare business inquiry</button>
    {message&&<p role="status" style={{fontSize:12,color:'#abe4f0'}}>{message}</p>}
   </form>
  </article>
  <div style={{display:'flex',flexWrap:'wrap',gap:9,marginTop:12}}><a href="/streetverse" style={{...btn,display:'inline-flex',alignItems:'center',textDecoration:'none'}}>Enter StreetVerse preview</a><a href="#living-worlds-proof" style={{...btn,display:'inline-flex',alignItems:'center',textDecoration:'none'}}>View gameplay proof checklist</a></div>
  <p style={{fontSize:11,color:'#a8bdce'}}>No booking confirmation, checkout, payments, licensed business photography or 3D asset placement is implemented here. Independent owner inboxes and verified booking systems are required before launch.</p>
 </section>
}
const input:React.CSSProperties={display:'block',boxSizing:'border-box',width:'100%',minHeight:46,padding:10,marginTop:4,borderRadius:9,border:'1px solid #6691ab',background:'#091e32',color:'#fff',fontSize:16}
