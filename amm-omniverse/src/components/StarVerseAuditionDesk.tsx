import {useState} from 'react'

/**
 * StarVerse audition intake — private local draft only.
 * No photographs, biometric measurements, uploaded media, payments, public submissions,
 * voting tallies or sensitive contestant information are stored by this module.
 */
export const STARVERSE_AUDITION_SESSION_KEY='tryamm.starverse.audition-draft.v1'
export type StarVerseAuditionDraft={
  version:1
  id:string
  stageName:string
  talent:string
  genre:string
  city:string
  ageGroup:'adult'|'under-18'
  musicRightsConfirmed:true
  guardianPermissionConfirmed:boolean
  reviewedForBroadcast:false
  published:false
  createdAt:string
}
const CATEGORIES=['Singer','Rapper','DJ / Producer','Dancer','Band','Actor','Comedian','Spoken Word','Set Apart / Gospel','Other'] as const
const GENRES=['Original Music','Hip-Hop','Trap','Chicago House','R&B','Gospel','Christian Rap','Set Apart Music','Afrobeats','Jazz','Country','Rock','Classical','Dance','Spoken Word'] as const

export function readStarVerseAuditionDraft():StarVerseAuditionDraft|null{
  if(typeof sessionStorage==='undefined')return null
  try{
    const data=JSON.parse(sessionStorage.getItem(STARVERSE_AUDITION_SESSION_KEY)||'null')
    return data?.version===1&&data?.published===false&&data?.reviewedForBroadcast===false&&
      typeof data.stageName==='string'&&data.stageName.length<=60&&
      typeof data.talent==='string'&&data.talent.length<=60?data as StarVerseAuditionDraft:null
  }catch{return null}
}

export default function StarVerseAuditionDesk({onClose,onOpenShowMaker}:{onClose:()=>void;onOpenShowMaker:()=>void}){
  const [stageName,setStageName]=useState('')
  const [talent,setTalent]=useState<string>('Singer')
  const [genre,setGenre]=useState<string>('Original Music')
  const [city,setCity]=useState('')
  const [ageGroup,setAgeGroup]=useState<'adult'|'under-18'>('adult')
  const [rightsOk,setRightsOk]=useState(false)
  const [guardianOk,setGuardianOk]=useState(false)
  const [draft,setDraft]=useState<StarVerseAuditionDraft|null>(()=>readStarVerseAuditionDraft())
  const [message,setMessage]=useState('')
  const canSave=stageName.trim().length>=2&&stageName.trim().length<=60&&rightsOk&&
    (ageGroup==='adult'||guardianOk)
  const saveDraft=()=>{
    if(!canSave){setMessage('Choose a stage name, confirm performance rights, and provide guardian approval if under 18.');return}
    const data:StarVerseAuditionDraft={
      version:1,id:'starverse-local-'+Date.now().toString(36),
      stageName:stageName.trim().slice(0,60),talent,genre,
      city:city.trim().slice(0,60),ageGroup,
      musicRightsConfirmed:true,guardianPermissionConfirmed:ageGroup==='under-18'?guardianOk:false,
      reviewedForBroadcast:false,published:false,createdAt:new Date().toISOString()
    }
    try{sessionStorage.setItem(STARVERSE_AUDITION_SESSION_KEY,JSON.stringify(data))}
    catch{setMessage('Your browser blocked session saving. No application was submitted.');return}
    setDraft(data)
    setMessage('Local audition draft saved for this browser tab. Not submitted or broadcast.')
    window.dispatchEvent(new CustomEvent('tryamm:starverse-audition-draft',{detail:{
      source:'isaiah-ai-tv',draftId:data.id,talent:data.talent,genre:data.genre,
      ageGroup:data.ageGroup,status:'local-draft',published:false,
      broadcastAuthorized:false,hasMedia:false
    }}))
  }
  const clearDraft=()=>{
    try{sessionStorage.removeItem(STARVERSE_AUDITION_SESSION_KEY)}catch{}
    setDraft(null);setMessage('Local audition draft cleared.')
  }
  const openCreator=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{
      source:'starverse-audition-desk',genre,originalMusicOnly:true,requiresRightsReview:true,
      youthSafety:ageGroup==='under-18',submissionStatus:'not-submitted'
    }}))
    setMessage('Requested creator studio. If no editor opens, use Star Studio / 64-Track Studio.')
  }
  return <div role="dialog" aria-modal="true" aria-label="Who Wants to Be a Star audition desk" style={overlay}>
    <main style={{maxWidth:720,margin:'0 auto',padding:20}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
        <div><small style={{color:'#9ae8ff',letterSpacing:2}}>ISAIAH AI TV × STARVERSE</small><h1 style={{margin:'5px 0'}}>Who Wants to Be a Star?</h1><p style={{color:'#bdc8df',fontSize:13}}>Audition → 64-Track Studio / original act → producer review → Isaiah AI TV show.</p></div>
        <button onClick={onClose} style={button} aria-label="Close audition desk">Close</button>
      </header>
      <section style={panel}>
        <h2 style={{fontSize:17}}>Create a private audition draft</h2>
        <p style={{fontSize:12,color:'#a9b8d8'}}>Use a stage name. No legal name, birthdate, address, photos or video are collected here.</p>
        <label style={label}>Stage name<input maxLength={60} value={stageName} onChange={e=>setStageName(e.target.value)} placeholder="Your original performer name" style={field}/></label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
          <label style={label}>Talent<select value={talent} onChange={e=>setTalent(e.target.value)} style={field}>{CATEGORIES.map(x=><option key={x}>{x}</option>)}</select></label>
          <label style={label}>Music / performance style<select value={genre} onChange={e=>setGenre(e.target.value)} style={field}>{GENRES.map(x=><option key={x}>{x}</option>)}</select></label>
          <label style={label}>City (optional)<input maxLength={60} value={city} onChange={e=>setCity(e.target.value)} style={field} placeholder="City only"/></label>
          <label style={label}>Age group<select value={ageGroup} onChange={e=>setAgeGroup(e.target.value as 'adult'|'under-18')} style={field}><option value="adult">18 or older</option><option value="under-18">Under 18</option></select></label>
        </div>
        <label style={{...label,flexDirection:'row',alignItems:'start',marginTop:12}}><input type="checkbox" checked={rightsOk} onChange={e=>setRightsOk(e.target.checked)}/> I own or have permission to use the performance, music, recording and character/avatar presented.</label>
        {ageGroup==='under-18'&&<label style={{...label,flexDirection:'row',alignItems:'start'}}><input type="checkbox" checked={guardianOk} onChange={e=>setGuardianOk(e.target.checked)}/> A parent or legal guardian has authorized my participation. This is still only a private draft.</label>}
        <div style={{display:'flex',gap:9,flexWrap:'wrap',marginTop:14}}>
          <button disabled={!canSave} onClick={saveDraft} style={{...button,opacity:canSave?1:.55}}>Save local audition draft</button>
          <button onClick={openCreator} style={button}>Open creator / recording studio</button>
          <button onClick={clearDraft} style={button}>Clear local draft</button>
        </div>
        {message&&<p role="status" style={{color:'#b0efcb',fontSize:12}}>{message}</p>}
      </section>
      <section style={panel}>
        <h2 style={{fontSize:17}}>Produce the TV episode</h2>
        {draft?<p style={{fontSize:12}}>Saved for this browser session: <strong>{draft.stageName}</strong> • {draft.talent} • {draft.genre}. No external application or media upload has occurred.</p>:<p style={{fontSize:12,color:'#a9b8d8'}}>Save an audition draft first to prefill the contestant in the existing TV Show Maker.</p>}
        <button onClick={onOpenShowMaker} style={button}>Open Isaiah AI TV Show Maker</button>
        <p style={{fontSize:12,color:'#a9b8d8'}}>The show maker prepares scripts, hosts and schedules. Actual auditions, judging, audience voting, prizes, releases and LIVE broadcast require separate backend and editorial verification.</p>
      </section>
      <p style={{fontSize:11,color:'#9daac5'}}>Private browser-session prototype • not a public audition form • minors require guardian permission • no biometric photos are saved</p>
    </main>
  </div>
}
const overlay:React.CSSProperties={position:'fixed',inset:0,zIndex:13950,overflowY:'auto',background:'linear-gradient(180deg,#11172d,#080b15)',color:'#fff',fontFamily:'system-ui'}
const panel:React.CSSProperties={padding:16,border:'1px solid #4a5274',borderRadius:16,background:'#111b2e',marginTop:16}
const label:React.CSSProperties={display:'flex',flexDirection:'column',gap:5,fontSize:12,fontWeight:700,marginTop:10}
const field:React.CSSProperties={minHeight:42,borderRadius:8,padding:'9px 10px',background:'#0b1220',color:'#fff',border:'1px solid #596582',fontSize:14}
const button:React.CSSProperties={minHeight:44,padding:'9px 14px',borderRadius:9,border:'1px solid #9c9ac3',background:'#24274b',color:'#fff',fontWeight:800,cursor:'pointer'}
