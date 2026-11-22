import {useState,type CSSProperties} from 'react'
type Role='Musician / singer'|'Rapper'|'DJ'|'Producer'|'Dancer'|'Actor'|'Writer'|'Streamer'|'Visual creator'|'Other'
const roles:Role[]=['Musician / singer','Rapper','DJ','Producer','Dancer','Actor','Writer','Streamer','Visual creator','Other']
const field:CSSProperties={width:'100%',boxSizing:'border-box',padding:'14px',minHeight:54,borderRadius:12,border:'1px solid #5e92b6',background:'#10263c',color:'#fff',fontSize:17}
const button:CSSProperties={minHeight:60,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:14,padding:'12px 18px',background:'#176a87',border:'2px solid #72d8f9',fontSize:17,fontWeight:850,color:'white',textDecoration:'none',cursor:'pointer'}
const inbox='theammonmiverse@gmail.com'
export default function SoulAscensionChicagoCasting(){
 const [name,setName]=useState('')
 const [city,setCity]=useState('Chicago')
 const [role,setRole]=useState<Role>('Musician / singer')
 const [handle,setHandle]=useState('')
 const [interests,setInterests]=useState<string[]>([])
 const [isAdult,setIsAdult]=useState(false)
 const [permission,setPermission]=useState(false)
 const [notice,setNotice]=useState('')
 const options=['Character claim / 3D avatar','Write scenes and stories','Record voice dialogue','Original music','Perform on virtual stage','Omni LIVE interview / RP stream']
 const compose=()=>{
  const text=['SOUL ASCENSION: CHICAGO — EXPRESSION OF INTEREST',
   'Artist/stage name: '+name.trim(),'City: '+city.trim(),'Primary role: '+role,
   'Portfolio/social handle: '+handle.trim(),'Interests: '+interests.join(', '),
   'Applicant confirmation: 18+; no likeness, voice, music or performance license granted by this inquiry.',
   'Please send me casting details, release terms and any written compensation/benefit agreements.',
   'No performance slot or character claim has been confirmed.'].join('\n')
  return {subject:'Soul Ascension Chicago — Artist Inquiry',body:text}
 }
 const validate=()=>{
  if(!name.trim()||!city.trim()||!handle.trim()||interests.length===0||!isAdult||!permission){setNotice('Complete the name, city, contact/portfolio, interests and both confirmations. Under-18 performers require a separate guardian-supervised process.');return false}
  return true
 }
 const email=()=>{
  if(!validate())return
  const {subject,body}=compose()
  window.location.href='mailto:'+inbox+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)
  setNotice('Your email app should open. This site has not submitted or saved your inquiry. Send the email in your email app to contact the casting team.')
 }
 const copy=async()=>{
  if(!validate())return
  const {subject,body}=compose()
  try{await navigator.clipboard.writeText('To: '+inbox+'\nSubject: '+subject+'\n\n'+body);setNotice('Inquiry copied. Send it to the address shown below; no application has been submitted by this page.')}
  catch{setNotice('Copy was blocked by this browser. Use OPEN EMAIL APP instead.')}
 }
 return <main aria-label="Soul Ascension Chicago casting inquiry" style={{minHeight:'100vh',background:'radial-gradient(circle at top,#212b64 0%,#090d20 55%,#03060d)',color:'#f4f8ff',fontFamily:'system-ui',padding:'20px 14px 70px'}}>
  <div style={{maxWidth:850,margin:'auto'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}>
    <strong style={{color:'#ffd477',letterSpacing:2}}>TRYAMM LLC • STREETVERSE CHICAGO</strong>
    <a href="/" style={button}>HOME</a>
   </header>
   <h1 style={{fontSize:'clamp(30px,7vw,54px)',lineHeight:1.1,margin:'24px 0 6px'}}>SOUL ASCENSION: CHICAGO</h1>
   <h2 style={{color:'#ffc858',fontSize:'clamp(22px,4vw,33px)',margin:'0 0 14px'}}>All Chicago artists and creators invited</h2>
   <p style={{fontSize:18,lineHeight:1.6}}>An original interactive music, 3D character and live roleplay showcase. Singers, rappers, DJs, producers, dancers, actors, writers and streamers may express interest in helping develop StreetVerse Chicago performances and stories.</p>
   <p style={{padding:14,borderRadius:12,border:'1px solid #c99351',color:'#ffe2a5',lineHeight:1.6}}>This is an interest inquiry, not a contract or guaranteed casting offer. Participation perks, credits, pay, revenue share and launch dates require separate written confirmation. This is an independent TRYAMM production and is not affiliated with or licensed by Soul Train.</p>
   <section style={{background:'#0b1b30',border:'1px solid #42618d',borderRadius:20,padding:'18px 14px'}}>
    <h3 style={{fontSize:23,marginTop:0}}>Express your interest</h3>
    <p style={{color:'#b7d3eb'}}>We do not collect photographs, voice recordings, government IDs or sensitive documents here. This form uses your email app; it does not store or transmit data by itself.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
     <label>Artist / stage name<input style={field} value={name} maxLength={100} onChange={e=>setName(e.target.value)} placeholder="Stage name"/></label>
     <label>City<input style={field} value={city} maxLength={100} onChange={e=>setCity(e.target.value)}/></label>
     <label>Primary creative role<select style={field} value={role} onChange={e=>setRole(e.target.value as Role)}>{roles.map(x=><option key={x}>{x}</option>)}</select></label>
     <label>Public artist handle or portfolio link<input style={field} value={handle} maxLength={180} onChange={e=>setHandle(e.target.value)} placeholder="@yourartistname or website"/></label>
    </div>
    <h4 style={{fontSize:20}}>What interests you?</h4>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8}}>
     {options.map(o=><label key={o} style={{display:'flex',alignItems:'center',gap:12,minHeight:56,padding:10,background:'#112c45',borderRadius:10}}><input type="checkbox" checked={interests.includes(o)} onChange={e=>setInterests(v=>e.target.checked?[...v,o]:v.filter(x=>x!==o))} style={{width:24,height:24}}/>{o}</label>)}
    </div>
    <div style={{display:'grid',gap:10,margin:'20px 0'}}>
     <label style={{display:'flex',alignItems:'center',gap:12,minHeight:56}}><input type="checkbox" checked={isAdult} onChange={e=>setIsAdult(e.target.checked)} style={{width:25,height:25}}/>I am 18 or older. Minors must use a guardian-supervised intake.</label>
     <label style={{display:'flex',alignItems:'center',gap:12,minHeight:56}}><input type="checkbox" checked={permission} onChange={e=>setPermission(e.target.checked)} style={{width:25,height:25}}/>I choose to email TRYAMM about casting. This does not grant likeness, voice, music, animation or streaming rights.</label>
    </div>
    <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
     <button type="button" onClick={email} style={button}>OPEN EMAIL APP</button>
     <button type="button" onClick={copy} style={{...button,background:'#2c3754'}}>COPY INQUIRY</button>
    </div>
    <p role="status" aria-live="polite" style={{fontSize:16,color:'#ffdc91',lineHeight:1.6}}>{notice}</p>
    <p style={{color:'#acd2f2'}}>Contact: <a href={'mailto:'+inbox} style={{color:'#76daff'}}>{inbox}</a></p>
   </section>
   <p style={{fontSize:14,color:'#afc5d9',lineHeight:1.6}}>Artist claims, facial likenesses, original tracks, scripts, and voice performances require separate identity, rights, compensation and moderation agreements before public use. No artist is represented as an official participant without agreement.</p>
  </div>
 </main>
}
