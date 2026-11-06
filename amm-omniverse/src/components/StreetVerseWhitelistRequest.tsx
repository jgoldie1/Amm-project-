import {useState} from 'react'
type RequestDraft={displayName:string;purpose:string;device:string;createdAt:string;status:'draft'}
const KEY='streetverse.access-request.draft.v1'
function readDraft():RequestDraft|null{try{const raw=localStorage.getItem(KEY);if(!raw)return null;const p=JSON.parse(raw);return p?.status==='draft'?p:null}catch{return null}}
export default function StreetVerseWhitelistRequest({onClose}:{onClose:()=>void}){
 const saved=readDraft()
 const [displayName,setDisplayName]=useState(saved?.displayName||'')
 const [purpose,setPurpose]=useState(saved?.purpose||'playtest')
 const [device,setDevice]=useState(saved?.device||'Chromebook')
 const [message,setMessage]=useState('Request access to a future private StreetVerse playtest. This form does not grant access.')
 const [draft,setDraft]=useState<RequestDraft|null>(saved)
 const save=()=>{
  const name=displayName.trim()
  if(name.length<2||name.length>60){setMessage('Enter a display name between 2 and 60 characters.');return}
  const next:RequestDraft={displayName:name,purpose,device,createdAt:new Date().toISOString(),status:'draft'}
  try{localStorage.setItem(KEY,JSON.stringify(next));setDraft(next);setMessage('Draft saved on this device. Not submitted or approved.')}catch{setMessage('Browser storage unavailable. You may still copy the request details.');setDraft(next)}
 }
 const exportDraft=()=>{
  if(!draft)return
  const blob=new Blob([JSON.stringify(draft,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='streetverse-whitelist-request.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  setMessage('Request file download started. Give the file to the StreetVerse administrator for manual review.')
 }
 return <section role="dialog" aria-modal="true" aria-label="StreetVerse whitelist request" style={{position:'fixed',inset:0,zIndex:19000,background:'#091523',color:'white',padding:20,overflow:'auto'}}>
 <div style={{maxWidth:580,margin:'auto'}}>
 <button type="button" onClick={onClose} style={btn}>Return to Chicago</button>
 <h2>StreetVerse · Private Playtest Whitelist Request</h2>
 <p role="status">{message}</p>
 <p>Ask to join a future controlled beta for Chicago, Sculptify, Aniyah's photo missions and Cross Borders education. No password, bank account, payment or identity documents are needed.</p>
 <label style={label}>Display name <input maxLength={60} value={displayName} onChange={e=>setDisplayName(e.target.value)} style={input}/></label>
 <label style={label}>Access requested <select value={purpose} onChange={e=>setPurpose(e.target.value)} style={input}><option value="playtest">Game playtesting</option><option value="creator">Creator / photography testing</option><option value="business">Business owner / Sculptify testing</option><option value="accessibility">Accessibility testing</option></select></label>
 <label style={label}>Device <select value={device} onChange={e=>setDevice(e.target.value)} style={input}><option>Chromebook</option><option>Android</option><option>iPhone</option><option>Windows PC</option><option>Mac</option><option>VR headset</option></select></label>
 <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button type="button" onClick={save} style={btn}>Save Request Draft</button><button type="button" disabled={!draft} onClick={exportDraft} style={btn}>Download for Review</button></div>
 <p style={{fontSize:12}}>Status: {draft?'DRAFT — NOT SUBMITTED':'NO REQUEST SAVED'}. Only an authenticated server-side administrator can approve access. This demo does not create an account, contact an administrator or bypass private access controls.</p>
 </div></section>
}
const btn:React.CSSProperties={padding:12,minHeight:44,border:'1px solid #85a9c9',borderRadius:9,background:'#163553',color:'#fff',cursor:'pointer'}
const input:React.CSSProperties={display:'block',padding:10,minHeight:44,width:'100%',maxWidth:440}
const label:React.CSSProperties={display:'block',margin:'12px 0'}
