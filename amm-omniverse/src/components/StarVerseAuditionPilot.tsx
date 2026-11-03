import {useMemo,useState} from 'react'
import {ISAIAH_AI_TV,STARVERSE_PIPELINE,STARVERSE_ZONES,type StarPath} from '../game/holographic/IsaiahAiTvStarVerse'
import {STREETVERSE_MUSIC_GENRES} from '../data/StreetVerseOmniCastProduction'
import {isSetApartGenre} from '../data/StreetVerseSetApartMusicNetwork'

export type StarVerseAuditionContext={source?:string;genre?:string;performerId?:string}
const PATHS:StarPath[]=['music','acting','dance','comedy','sports','gaming','fashion','film','podcast','creator','host']
const STORAGE_KEY='tryamm.starverse.local-audition-draft.v1'
const styles={
 field:{width:'100%',maxWidth:'100%',minHeight:44,padding:'10px 12px',boxSizing:'border-box',background:'#111a2c',color:'#fff',border:'1px solid #627190',borderRadius:11} as const,
 button:{minHeight:45,padding:'9px 13px',background:'#18253b',color:'#fff',border:'1px solid #627190',borderRadius:11,fontWeight:800,cursor:'pointer'} as const,
 card:{padding:16,border:'1px solid #34446a',background:'#0b1425',borderRadius:17} as const,
}

export const STARVERSE_AUDITION_PREVIEW_RULES={
 name:'Who Wants to Be a Star?',
 network:'Isaiah AI TV',
 venue:'StarVerse Audition Hall',
 submissionLive:false,
 publicVotingLive:false,
 actualTvBroadcastScheduled:false,
 paymentRequired:false,
 rankingAndJudgesLive:false,
 mediaUploadActive:false,
 liveProviderConfigured:false,
 onlyLocalDrafts:true,
 ageAndGuardianGate:true,
 originalOrLicensedPerformance:true,
 noGuaranteedFameOrIncome:true,
} as const

export default function StarVerseAuditionPilot({onClose,context}:{onClose:()=>void;context?:StarVerseAuditionContext}){
 const [path,setPath]=useState<StarPath>('music')
 const [genre,setGenre]=useState(()=>context?.genre&&STREETVERSE_MUSIC_GENRES.some(g=>g===context.genre)?context.genre:'Hip-Hop')
 const [stageName,setStageName]=useState('')
 const [pitch,setPitch]=useState('')
 const [ageBand,setAgeBand]=useState<'unknown'|'adult'|'minor'>('unknown')
 const [guardianPermission,setGuardianPermission]=useState(false)
 const [rightsConfirmed,setRightsConfirmed]=useState(false)
 const [notice,setNotice]=useState('Choose your talent category, practice, then save a private local audition draft.')
 const [saved,setSaved]=useState(false)
 const showSetApart=useMemo(()=>isSetApartGenre(genre),[genre])
 const valid=Boolean(stageName.trim()&&rightsConfirmed&&ageBand!=='unknown'&&(ageBand!=='minor'||guardianPermission))

 function saveDraft(){
  if(!valid){setNotice('Enter a stage name, choose adult/minor, confirm rights, and provide guardian authorization if applicable.');return}
  const draft={
   schema:'tryamm.starverse.private-audition-draft.v1',
   title:STARVERSE_AUDITION_PREVIEW_RULES.name,
   status:'saved-locally-not-submitted',
   stageName:stageName.trim().slice(0,80),
   talentPath:path,
   genre:path==='music'?genre:null,
   setApart:path==='music'&&showSetApart,
   performanceIdea:pitch.trim().slice(0,280),
   ageBand,
   guardianPermissionRecorded:ageBand==='minor'&&guardianPermission,
   rightsSelfAttested:rightsConfirmed,
   uploadedMedia:false,
   judged:false,
   broadcast:false,
   productionReviewRequired:true,
   savedAt:new Date().toISOString(),
  }
  try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(draft));setSaved(true);setNotice('Private audition draft saved in this browser. It has NOT been uploaded, judged, or submitted to a TV show.')}catch{setNotice('Browser storage is unavailable. The draft was not saved; no data was sent.')}
 }
 const openStudio=()=>{
  (window as any).__showAniyah64TrackStudio?.()
  window.dispatchEvent(new CustomEvent('tryamm:starverse-studio-rehearsal',{detail:{path,genre,source:'starverse-audition-pilot',originalOrClearedOnly:true}}))
  onClose()
 }
 return <div role="dialog" aria-modal="true" aria-label="Who Wants to Be a Star audition practice" style={{position:'fixed',inset:0,zIndex:19040,overflowY:'auto',background:'radial-gradient(circle at top,#29204d,#070b17 57%)',fontFamily:'system-ui,sans-serif',color:'#fff'}}>
  <div style={{maxWidth:980,margin:'0 auto',padding:'20px 14px 75px'}}>
   <header style={{display:'flex',alignItems:'start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
    <div><div style={{fontSize:11,fontWeight:900,letterSpacing:2,color:'#9fe9ff'}}>{ISAIAH_AI_TV.title} • STARVERSE</div><h1 style={{margin:'7px 0',fontSize:'clamp(28px,5vw,48px)'}}>Who Wants to Be a Star?</h1><p style={{maxWidth:650,opacity:.75,lineHeight:1.5}}>Practice an original audition and build your creator path in StarVerse. This is a private prototype, not a live talent-show application or televised competition.</p></div>
    <button type="button" style={styles.button} onClick={onClose} aria-label="Close StarVerse audition">CLOSE</button>
   </header>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',gap:12,marginTop:15}}>
    <section style={styles.card}>
     <h2 style={{fontSize:18,margin:'0 0 12px'}}>1. Create your Star Passport draft</h2>
     <label htmlFor="star-name">Stage name or creative name</label>
     <input id="star-name" value={stageName} maxLength={80} onChange={e=>{setStageName(e.target.value);setSaved(false)}} placeholder="Your stage name" style={styles.field}/>
     <label htmlFor="star-path" style={{display:'block',marginTop:12}}>Talent path</label>
     <select id="star-path" value={path} onChange={e=>setPath(e.target.value as StarPath)} style={styles.field}>{PATHS.map(x=><option key={x} value={x}>{x.toUpperCase()}</option>)}</select>
     {path==='music'&&<><label htmlFor="star-genre" style={{display:'block',marginTop:12}}>MusicVerse genre ({STREETVERSE_MUSIC_GENRES.length} available)</label>
     <select id="star-genre" value={genre} onChange={e=>setGenre(e.target.value)} style={styles.field}>{STREETVERSE_MUSIC_GENRES.map(x=><option key={x}>{x}</option>)}</select>
     {showSetApart&&<p style={{color:'#f0d99a',fontSize:12}}>Set Apart Music selected. FaithVerse participation is optional; this audition stays open to all genres.</p>}</>}
     <label htmlFor="star-pitch" style={{display:'block',marginTop:12}}>Your original performance idea</label>
     <textarea id="star-pitch" rows={3} value={pitch} maxLength={280} onChange={e=>setPitch(e.target.value)} placeholder="Describe your original song, performance, comedy, dance, or talent…" style={{...styles.field,minHeight:80,resize:'vertical'}}/>
    </section>
    <section style={styles.card}>
     <h2 style={{fontSize:18,margin:'0 0 12px'}}>2. Rights and youth safeguards</h2>
     <label htmlFor="star-age">Age category (no birth date collected)</label>
     <select id="star-age" value={ageBand} onChange={e=>setAgeBand(e.target.value as 'unknown'|'adult'|'minor')} style={styles.field}>
      <option value="unknown">Choose age category</option><option value="adult">Adult (18+)</option><option value="minor">Under 18</option>
     </select>
     {ageBand==='minor'&&<label style={{display:'block',marginTop:14,lineHeight:1.5}}><input type="checkbox" checked={guardianPermission} onChange={e=>setGuardianPermission(e.target.checked)}/> Guardian has approved this local practice draft (public submission will require separate verified consent).</label>}
     <label style={{display:'block',marginTop:14,lineHeight:1.5}}><input type="checkbox" checked={rightsConfirmed} onChange={e=>setRightsConfirmed(e.target.checked)}/> I will perform original or properly licensed material and will not copy another artist's face or voice without permission.</label>
     <p style={{fontSize:12,opacity:.7,lineHeight:1.5}}>No photograph, face scan, audio, video, bank details, or address is collected by this preview. A real audition submission will require protected uploads, consent, moderation, and secure review.</p>
     <button type="button" disabled={!valid} onClick={saveDraft} style={{...styles.button,background:valid?'#224c43':'#292f3b',width:'100%'}}>SAVE PRIVATE AUDITION DRAFT</button>
     <p role="status" aria-live="polite" style={{color:saved?'#9df2c0':'#ffd997',fontSize:12}}>{notice}</p>
    </section>
   </div>
   <section style={{...styles.card,marginTop:12}}>
    <h2 style={{fontSize:18,margin:'0 0 10px'}}>3. Rehearse, perform, distribute</h2>
    <p style={{opacity:.75,fontSize:13}}>Existing systems: Aniyah's 64-Track Studio → StarVerse Audition Hall → original showcase → Isaiah AI TV review → eligible LIVE/Reel distribution. No channel time, award, payment, or public vote is promised.</p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
     <button type="button" onClick={openStudio} style={styles.button}>OPEN 64-TRACK STUDIO</button>
     <button type="button" onClick={()=>{(window as any).__showAvatarCreator?.();onClose()}} style={styles.button}>CREATE MY 3D CHARACTER — CAMERA / 3 PHOTOS</button>
     <button type="button" onClick={()=>{(window as any).__showStarStudio?.();onClose()}} style={styles.button}>OPEN STAR STUDIO</button>
     <button type="button" onClick={()=>{(window as any).__showIsaiahTV?.();onClose()}} style={styles.button}>ISAIAH AI TV</button>
    </div>
    <div style={{display:'flex',flexWrap:'wrap',gap:7,marginTop:16}}>{STARVERSE_ZONES.slice(0,9).map(z=><span key={z} style={{border:'1px solid #444d69',borderRadius:99,padding:'6px 9px',fontSize:10}}>{z}</span>)}</div>
    <details style={{marginTop:15}}><summary style={{cursor:'pointer'}}>Show the full StarVerse creator pathway</summary><ol style={{fontSize:12,opacity:.82,lineHeight:1.8}}>{STARVERSE_PIPELINE.map(x=><li key={x}>{x}</li>)}</ol></details>
   </section>
  </div>
 </div>
}
