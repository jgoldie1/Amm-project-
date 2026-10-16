import {lazy,Suspense,useState} from 'react'
import {
 STAR_FORMATS,STAR_DISTRIBUTION,newStarTalentDraft,readStarTalentDraft,
 updateStarTalentDraft,prepareStarTalentReview,readyForStarHumanReview,
 starProductionPlan,starBillboardPreview,writeStarTalentDraft,
 type StarTalentDraft,type StarTalentFormat,type StarDistribution,
} from '../runtime/StarVerseNetworkPipeline'
import {readPKStoryDraft} from '../runtime/PKLivingWorldsBridge'
const OTTIsaiahTV=lazy(()=>import('./OTTIsaiahTV'))
const HoloMusicStreaming=lazy(()=>import('./HoloMusicStreaming'))
const MovieStudioCenter=lazy(()=>import('./MovieStudioCenter'))
const Aniyah64TrackStudio=lazy(()=>import('./Aniyah64TrackStudio'))

type Preview='isaiah'|'music'|'movie'|'audio'|null
const surface:React.CSSProperties={background:'#0b1421',border:'1px solid #284458',padding:15,borderRadius:16}
const btn:React.CSSProperties={minHeight:48,padding:'12px 15px',background:'#102a3b',color:'#fff',border:'1px solid #52748e',borderRadius:12,cursor:'pointer',fontSize:14,fontWeight:850}
const field:React.CSSProperties={boxSizing:'border-box',width:'100%',minHeight:48,padding:12,background:'#070d17',color:'#fff',border:'1px solid #577289',borderRadius:10,fontSize:16}
const small:React.CSSProperties={color:'#adbfcd',fontSize:12,lineHeight:1.65}
const makePreview=(t:StarTalentDraft)=>starBillboardPreview(t)
export default function StarVerseNetworkStudio(){
 const [draft,setDraft]=useState<StarTalentDraft>(()=>readStarTalentDraft()||newStarTalentDraft())
 const [preview,setPreview]=useState<Preview>(null)
 const [showBillboard,setShowBillboard]=useState(false)
 const [notice,setNotice]=useState('Saved on this device only. No application, audition, media or billboard has been submitted.')
 const [savedAt,setSavedAt]=useState('')
 const plan=starProductionPlan(draft)
 const billboard=makePreview(draft)
 const canPrepare=readyForStarHumanReview(draft)
 const patch=(update:Parameters<typeof updateStarTalentDraft>[1])=>{
  setDraft(old=>updateStarTalentDraft(old,update))
  setNotice('Unsaved changes. Save the local draft when ready.')
 }
 const toggle=(id:StarDistribution)=>{
  const next=draft.destinations.includes(id)?draft.destinations.filter(d=>d!==id):[...draft.destinations,id]
  patch({destinations:next})
 }
 const save=()=>{
  writeStarTalentDraft(draft)
  setSavedAt(new Date().toLocaleTimeString())
  setNotice('Local talent package saved on this device. No content was uploaded or published.')
 }
 const prepare=()=>{
  const next=prepareStarTalentReview(draft)
  setDraft(next);writeStarTalentDraft(next)
  setNotice(next.status==='REVIEW_PREPARED'
   ?'Editorial package prepared locally. No audition was submitted: secure identity, rights verification and a human review queue are still required.'
   :'Complete the title, creator credit, description, original-media rights and adult consent acknowledgements first. Under-18 auditions require a separate verified guardian process.')
 }
 const importPk=()=>{
  const story=readPKStoryDraft()
  if(!story){setNotice('No saved PK Living Worlds rehearsal exists on this device. Open the PK Story Arena first.');return}
  const title=story.chapters[story.chapters.length-1]?.title||story.name
  patch({format:'pk-special',title,synopsis:'PK Living Worlds — '+story.world+'. '+story.chapters.map(c=>c.title).join(' → ')})
  setNotice('Imported a local PK show concept. No performance recording, rights clearance or live stream was imported.')
 }
 const exportPlan=()=>{
  const blob=new Blob([JSON.stringify({draft,plan,billboard:showBillboard?billboard:undefined},null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download='tryamm-starverse-production-draft.json'
  document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000)
  setNotice('A local production-plan file was prepared for saving. No network upload or billing occurred.')
 }
 const modal=(component:Preview)=>{
  if(component==='isaiah')return <OTTIsaiahTV onClose={()=>setPreview(null)}/>
  if(component==='music')return <HoloMusicStreaming onClose={()=>setPreview(null)}/>
  if(component==='movie')return <MovieStudioCenter onClose={()=>setPreview(null)}/>
  if(component==='audio')return <Aniyah64TrackStudio onClose={()=>setPreview(null)}/>
  return null
 }
 return <main style={{minHeight:'100vh',padding:'18px 14px 80px',color:'#fff',background:'radial-gradient(circle at 42% 0,#2b1e51,#061121 50%,#040713)',fontFamily:'system-ui,sans-serif'}}>
  <div style={{maxWidth:1060,margin:'0 auto'}}>
   <nav aria-label="Network production navigation" style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:18}}>
    <a href="/starverse" style={{...btn,textDecoration:'none'}}>← StarVerse</a>
    <a href="/isaiah-ai-tv" style={{...btn,textDecoration:'none'}}>Isaiah AI TV</a>
    <a href="/network" style={{...btn,textDecoration:'none'}}>All American Network</a>
   </nav>
   <div style={{fontSize:10,letterSpacing:2.4,fontWeight:900,color:'#9fefdd'}}>STARVERSE × ISAIAH AI TV × ALL AMERICAN NETWORK</div>
   <h1 style={{fontSize:'clamp(30px,7vw,53px)',lineHeight:1.08,margin:'9px 0'}}>Anyone Can Be a Star</h1>
   <p style={{...small,maxWidth:870,fontSize:15}}>Create a free audition, concert, music video, movie, PK special or broadcast concept. Plan production with existing TRYAMM tools and prepare an editorial package for Isaiah AI TV and the All American Network.</p>
   <div role="status" aria-live="polite" style={{...surface,borderColor:'#bf8e48',marginBottom:14,fontSize:12,color:'#ffdcac'}}>
    LOCAL PREVIEW / PLANNING DESK — not a casting submission or a streaming service. {notice} {savedAt?('Saved at '+savedAt):''}
   </div>
   <section aria-label="Talent format" style={{...surface,marginBottom:14}}>
    <h2 style={{margin:'0 0 12px',fontSize:18}}>1. Choose what kind of star you want to be</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(215px,1fr))',gap:8}}>
     {STAR_FORMATS.map(f=><button key={f.id} onClick={()=>patch({format:f.id as StarTalentFormat})} aria-pressed={draft.format===f.id} style={{...btn,textAlign:'left',borderColor:draft.format===f.id?'#80f3cc':'#52748e',background:draft.format===f.id?'#16413d':'#102a3b'}}><b>{f.label}</b><span style={{...small,display:'block',marginTop:5}}>{f.desc}</span></button>)}
    </div>
   </section>
   <section aria-label="Create talent production draft" style={{...surface,marginBottom:14}}>
    <h2 style={{margin:'0 0 12px',fontSize:18}}>2. Draft the program</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>
     <label style={small}>Show or audition title<input style={{...field,marginTop:5}} maxLength={120} value={draft.title} placeholder="My StarVerse Performance" onChange={e=>patch({title:e.target.value})}/></label>
     <label style={small}>Creator/stage credit (not a legal name)<input style={{...field,marginTop:5}} maxLength={100} value={draft.creatorCredit} placeholder="Your stage name" onChange={e=>patch({creatorCredit:e.target.value})}/></label>
    </div>
    <label style={{...small,display:'block',marginTop:12}}>What is the show about?<textarea style={{...field,minHeight:100,marginTop:5,resize:'vertical'}} maxLength={500} value={draft.synopsis} placeholder="Describe the performance, music, movie, video, or PK special" onChange={e=>patch({synopsis:e.target.value})}/></label>
    <fieldset style={{border:'1px solid #405a71',borderRadius:12,margin:'14px 0 0',padding:12}}>
     <legend style={{fontSize:12,fontWeight:850}}>Age and safety lane</legend>
     <label style={{...small,display:'block',marginBottom:9}}><input type="radio" checked={draft.audience==='general'} onChange={()=>patch({audience:'general'})}/> Adult creator / adult-submitted production draft</label>
     <label style={{...small,display:'block'}}><input type="radio" checked={draft.audience==='teen'} onChange={()=>patch({audience:'teen'})}/> Under 18: save a concept only; verified guardian authorization and youth safety checks are required before submission</label>
    </fieldset>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
     <button style={btn} onClick={importPk}>Import last PK Living Worlds story</button>
     <button style={btn} onClick={save}>Save local draft</button>
    </div>
   </section>
   <section aria-label="Choose future channels" style={{...surface,marginBottom:14}}>
    <h2 style={{margin:'0 0 8px',fontSize:18}}>3. Plan where the finished show could appear</h2>
    <p style={small}>Selecting a destination creates an editorial planning request only. It does not upload files or buy ads.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(225px,1fr))',gap:8}}>
     {STAR_DISTRIBUTION.map(ch=><label key={ch.id} style={{display:'flex',gap:9,alignItems:'start',padding:12,borderRadius:12,background:'#091f2b',border:'1px solid #2d4f5e',cursor:'pointer'}}>
      <input type="checkbox" checked={draft.destinations.includes(ch.id as StarDistribution)} onChange={()=>toggle(ch.id as StarDistribution)} style={{width:20,height:20,flexShrink:0}}/>
      <span><b style={{fontSize:13}}>{ch.name}</b><span style={{...small,display:'block',marginTop:4}}>{ch.meaning}</span></span>
     </label>)}
    </div>
   </section>
   <section aria-label="Media production tools" style={{...surface,marginBottom:14}}>
    <h2 style={{margin:'0 0 10px',fontSize:18}}>4. Open a real TRYAMM production tool</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(205px,1fr))',gap:8}}>
     <button style={btn} onClick={()=>setPreview('audio')}>♫ Aniyah 64-Track Studio</button>
     <button style={btn} onClick={()=>setPreview('music')}>♫ Holo Music Streaming</button>
     <button style={btn} onClick={()=>setPreview('movie')}>🎬 Movie Studio</button>
     <button style={btn} onClick={()=>setPreview('isaiah')}>📺 Isaiah AI TV Guide</button>
     <a style={{...btn,textDecoration:'none'}} href="/reel-creator">🎞 Reel / Video Studio</a>
     <a style={{...btn,textDecoration:'none'}} href="/holo-drama">🎭 Holo Drama / Movies</a>
     <a style={{...btn,textDecoration:'none'}} href="/network/studio">🎥 Network Control Room</a>
     <a style={{...btn,textDecoration:'none'}} href="/network/broadcast-os">📡 Broadcast OS</a>
    </div>
    <p style={small}>Music playback requires authorized files in the public catalog. Film editing, actual uploads, rights clearance, and live broadcasting use separate provider-backed workflows.</p>
   </section>
   <section aria-label="All American Billboard preview" style={{...surface,marginBottom:14}}>
    <h2 style={{fontSize:18,margin:'0 0 8px'}}>5. All American Billboards — creator promo</h2>
    <p style={small}>Design an ad concept for StreetVerse virtual billboards or future physical digital signs in Chicago, Lagos, or Abuja. No billboard owner, advertiser, impressions or bookings are connected here.</p>
    <button style={btn} onClick={()=>setShowBillboard(v=>!v)} aria-expanded={showBillboard}>{showBillboard?'Hide':'Preview'} my billboard concept</button>
    {showBillboard&&<div role="img" aria-label={'All American billboard concept for '+billboard.title} style={{marginTop:12,aspectRatio:'16 / 9',width:'100%',maxHeight:420,border:'7px solid #263747',borderRadius:13,background:'radial-gradient(circle at 60% 10%,#8a255c,#0d2341 54%,#020714)',display:'grid',placeItems:'center',boxSizing:'border-box',padding:16,textAlign:'center'}}>
     <div><div style={{fontSize:12,letterSpacing:3,color:'#99fbe9'}}>ALL AMERICAN NETWORK • CREATOR PREVIEW</div>
      <h3 style={{fontSize:'clamp(23px,5vw,46px)',margin:'12px 0'}}>{billboard.headline}</h3>
      <p style={{fontSize:15,color:'#ffe196'}}>FEATURING {billboard.creatorCredit}</p>
      <div style={{background:'#f6d47b',color:'#0a1522',padding:'9px 18px',display:'inline-block',borderRadius:8,fontWeight:950}}>WATCH ON TRYAMM</div>
      <div style={{fontSize:11,color:'#c3ced6',marginTop:10}}>CONCEPT ONLY • NOT A PAID OR BOOKED DIGITAL SIGN</div>
     </div>
    </div>}
   </section>
   <section aria-label="Rights and producer review" style={surface}>
    <h2 style={{fontSize:18,margin:'0 0 8px'}}>6. Review before any release</h2>
    <div style={{display:'grid',gap:10}}>
     <label style={small}><input type="checkbox" checked={draft.musicRightsAttested} onChange={e=>patch({musicRightsAttested:e.target.checked})}/> I own or have permission for the audio and music I intend to use.</label>
     <label style={small}><input type="checkbox" checked={draft.visualRightsAttested} onChange={e=>patch({visualRightsAttested:e.target.checked})}/> I own or have permission for the footage, script, designs and images.</label>
     <label style={small}><input type="checkbox" checked={draft.consentAttested} onChange={e=>patch({consentAttested:e.target.checked})}/> I understand performers' consent, age restrictions, editorial review and publication approval are required.</label>
    </div>
    <p style={small}>{canPrepare?'Review information is complete as a local draft.':'Complete the adult-creator rights and consent details to prepare this draft for review.'}</p>
    <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
     <button style={btn} onClick={prepare}>Prepare editorial package</button>
     <button style={btn} onClick={exportPlan}>Save production plan file</button>
    </div>
    <p style={{...small,marginTop:10}}><b>Package:</b> {draft.status==='REVIEW_PREPARED'?'Prepared locally':'Local draft'} • {plan.destinationRequests.length} proposed destination(s). No actual application, network schedule, channel stream, digital billboard booking, royalty balance, sponsor invoice, or payment has been created.</p>
   </section>
   {preview&&<Suspense fallback={<div role="status">Opening existing TRYAMM production tool…</div>}>{modal(preview)}</Suspense>}
  </div>
 </main>
}
