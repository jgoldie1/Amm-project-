import { useState } from 'react'
const SERVICES = [
 {id:'makeup',name:'Makeup Consultation',duration:30},
 {id:'hair',name:'Hair Services Inquiry',duration:60},
 {id:'lashes',name:'Lash Services Inquiry',duration:60},
 {id:'skin',name:'Esthetics and Skincare Inquiry',duration:45},
] as const
export default function BeautyVerseBookingBeta(){
 const [service,setService]=useState<string>('makeup')
 const [date,setDate]=useState('')
 const [time,setTime]=useState('')
 const [notice,setNotice]=useState('')
 const validDate=/^\d{4}-\d{2}-\d{2}$/.test(date)
 const preview=()=>setNotice(validDate&&time?'Booking preview only: no appointment has been made. Shop schedule, licensed services, identity and server calendar must be connected first.':'Choose a future date and time to preview your request.')
 return <main style={{minHeight:'100vh',background:'#1b101a',color:'#fef5fa',padding:'24px 16px',fontFamily:'system-ui'}}>
 <div style={{maxWidth:650,margin:'auto'}}>
  <a style={{color:'#ffd2e8'}} href="/streetverse/tampa">← Back to Tampa StreetVerse</a>
  <h1>La Taeasia BeautyVerse — Appointment Preview</h1>
  <p>Demo only. All requests remain on this screen. No payment, customer information, or appointments are collected.</p>
  <form onSubmit={e=>{e.preventDefault();preview()}} style={{display:'grid',gap:14,border:'1px solid #ad7795',padding:18,borderRadius:14}}>
   <label>Service inquiry<select value={service} onChange={e=>setService(e.target.value)} style={{display:'block',padding:12,width:'100%'}}>{SERVICES.map(s=><option key={s.id} value={s.id}>{s.name} · approximate {s.duration} minutes</option>)}</select></label>
   <label>Preferred date<input required type="date" min={today} value={date} onChange={e=>setDate(e.target.value)} style={{display:'block',padding:12,width:'100%'}}/></label>
   <label>Preferred time<input required type="time" value={time} onChange={e=>setTime(e.target.value)} style={{display:'block',padding:12,width:'100%'}}/></label>
   <button type="submit" style={{padding:14,fontWeight:700}}>Preview Appointment Request</button>
  </form>
  <p role="status" aria-live="polite">{notice}</p>
  <p>Prices, hours, appointment availability, professional credentials, and policies are pending La Taeasia's review. A date shown here does not imply availability.</p>
  <a style={{color:'#ffd2e8'}} href="/beautyverse/owner-preview">Owner operations preview</a>
 </div></main>
}
