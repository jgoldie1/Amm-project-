import {useEffect,useState} from 'react'
const KEY='streetverse:tampa-business-desk:v1'
type Request={id:string;kind:'game-permit'|'website'|'cashapp-question'|'commercial-brand';business:string;message:string;status:'draft-submitted';createdAt:string}
const load=():Request[]=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x.id==='string').slice(-30):[]}catch{return []}}
export function StreetVerseTampaBusinessDesk(){
 const [open,setOpen]=useState(false)
 const [business,setBusiness]=useState('')
 const [message,setMessage]=useState('')
 const [kind,setKind]=useState<Request['kind']>('game-permit')
 const [requests,setRequests]=useState<Request[]>(load)
 const [notice,setNotice]=useState('Choose a request. Nothing is charged or licensed automatically.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(requests))}catch{}},[requests])
 const submit=()=>{
  const name=business.trim().slice(0,80),msg=message.trim().slice(0,500)
  if(name.length<2){setNotice('Enter a business name with at least two characters.');return}
  const item:Request={id:'TAMPA-'+Date.now().toString(36),kind,business:name,message:msg,status:'draft-submitted',createdAt:new Date().toISOString()}
  setRequests(s=>[...s.slice(-29),item])
  setNotice('Request saved on this device. It has NOT been delivered to LaTeasia. A secure inbox integration is still required.')
  setMessage('')
 }
 const control={width:'100%',minHeight:48,fontSize:15,borderRadius:8,padding:8} as const
 return <section aria-label="LaTeasia Tampa business and license requests" style={{position:'absolute',right:12,top:260,zIndex:39,width:'min(290px,60vw)',background:'rgba(25,21,35,.96)',color:'white',padding:10,border:'1px solid #e8b3d0',borderRadius:12}}>
  <button type="button" onClick={()=>setOpen(v=>!v)} style={control}>{open?'CLOSE':'OPEN'} BUSINESS & DM DESK</button>
  {open&&<div style={{display:'grid',gap:7,marginTop:8}}>
   <strong>LaTeasia • Tampa Business Center</strong>
   <label htmlFor="tampa-dm-type">Request type</label>
   <select id="tampa-dm-type" style={control} value={kind} onChange={e=>setKind(e.target.value as Request['kind'])}>
    <option value="game-permit">StreetVerse fictional business permit</option>
    <option value="website">$450 real-world website inquiry</option>
    <option value="commercial-brand">Commercial brand / business partnership inquiry</option>
    <option value="cashapp-question">Ask about Cash App payment</option>
   </select>
   <label htmlFor="tampa-dm-business">Business name</label>
   <input id="tampa-dm-business" style={control} maxLength={80} value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Your business name"/>
   <label htmlFor="tampa-dm-message">Message to LaTeasia (draft)</label>
   <textarea id="tampa-dm-message" style={{...control,minHeight:90}} maxLength={500} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe your storefront or service"/>
   <button type="button" onClick={submit} style={control}>SAVE REQUEST DRAFT</button>
   <div role="status" aria-live="polite" style={{fontSize:12}}>{notice}</div>
   <p style={{fontSize:12,margin:0}}>Requests saved: {requests.length}. Fictional permits do not authorize real-world operations. No Cash App handle, payment link, government credential, real DM delivery, or license issuance is connected. Never send payment based only on an in-game message.</p>
  </div>}
 </section>
}
