import {useState} from 'react'
import {DISCOVERY_PLAYLIST_KEY,MUSIC_VIDEO_GENRES,searchApprovedVideos,listArtistChannels,readLocalWatchlist,saveLocalWatchlist} from '../lib/music/musicDiscoveryFeatures.mjs'
import {PUBLIC_MUSIC_VIDEO_CATALOG,MUSIC_VIDEO_DISCOVERY_POLICY,VIDEO_RIGHTS_REQUIREMENTS,listApprovedMusicVideos,createMusicVideoSubmissionDraft} from '../lib/music/musicVideoDiscoveryPolicy.mjs'
const inputStyle:React.CSSProperties={width:'100%',boxSizing:'border-box',borderRadius:9,minHeight:48,padding:'8px 12px',color:'#fff',background:'#121d2e',border:'1px solid #56718b',fontSize:15}
const buttonStyle:React.CSSProperties={borderRadius:11,minHeight:50,padding:'10px 14px',fontWeight:800,fontSize:14,color:'#fff',background:'#13293d',border:'1px solid #63cde7',cursor:'pointer'}
export default function MusicVideoDiscovery(){
 const [title,setTitle]=useState('')
 const [artist,setArtist]=useState('')
 const [genre,setGenre]=useState('R&B / Soul')
 const [description,setDescription]=useState('')
 const [message,setMessage]=useState('Draft only. No music video has been cleared or published by this form.')
 const [showRights,setShowRights]=useState(false)
 const approved=listApprovedMusicVideos(PUBLIC_MUSIC_VIDEO_CATALOG)
 const [search,setSearch]=useState('')
 const [filterGenre,setFilterGenre]=useState('All')
 const [filterArtist,setFilterArtist]=useState('All')
 const [showSaved,setShowSaved]=useState(false)
 const [savedIds,setSavedIds]=useState<string[]>(()=>{try{return readLocalWatchlist(localStorage,listApprovedMusicVideos(PUBLIC_MUSIC_VIDEO_CATALOG))}catch{return []}})
 const artistChannels=listArtistChannels(approved)
 const matches=searchApprovedVideos(approved,{query:search,genre:filterGenre,artist:filterArtist})
 const shown=showSaved?matches.filter(v=>savedIds.includes(String(v.id))):matches
 const toggleSaved=(id:string)=>{
  try{const next=saveLocalWatchlist(localStorage,savedIds.includes(id)?savedIds.filter(x=>x!==id):[...savedIds,id],approved);setSavedIds(next)}
  catch{setMessage('Browser storage is not available. Video saved only for this session.')}
 }
 const exportDraft=()=>{
  const draft=createMusicVideoSubmissionDraft({title,artist,genre,description})
  if(!draft){setMessage('Enter an original music video title and artist name first.');return}
  const blob=new Blob([JSON.stringify(draft,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url;a.download='all-american-music-video-review-draft.json';a.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
  setMessage('Private submission draft prepared for review. No video uploaded, streamed, monetized or distributed.')
 }
 return <main aria-label="All American independent music video discovery preview" style={{maxWidth:980,margin:'0 auto',padding:'16px 14px 90px',color:'#fff'}}>
  <div style={{color:'#8fe6ff',fontSize:11,letterSpacing:1.4,fontWeight:850}}>ALL AMERICAN NETWORK × ALL AMERICAN RECORDS × TRYAMM</div>
  <h2>🎬 Independent Music Video Discovery</h2>
  <p style={{color:'#c1d3e3',lineHeight:1.6}}>Original artist videos, performances and music showcases will connect viewers to approved release pages, vinyl/CD merchandise and fan clubs. We publish only videos whose music, images, performers, territories and streaming rights have been reviewed.</p>
  <section aria-label="Music video search artist channels and personal watchlist" style={{border:'1px solid #365575',borderRadius:14,padding:14,marginBottom:15}}>
   <h3>Discover independent artists</h3>
   <label style={{display:'block',marginBottom:10}}>Search artist, song or music style
    <input style={inputStyle} aria-label="Search approved music videos" type="search" maxLength={120} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search music videos and artist channels" />
   </label>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10}}>
    <label>Genre <select style={inputStyle} aria-label="Music video genre filter" value={filterGenre} onChange={e=>setFilterGenre(e.target.value)}>{MUSIC_VIDEO_GENRES.map(g=><option key={g} value={g}>{g}</option>)}</select></label>
    <label>Artist channel <select style={inputStyle} aria-label="Approved artist channel filter" value={filterArtist} onChange={e=>setFilterArtist(e.target.value)}><option value="All">All approved artists</option>{artistChannels.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
   </div>
   <button style={{...buttonStyle,width:'100%',marginTop:12}} aria-pressed={showSaved} onClick={()=>setShowSaved(v=>!v)}>{showSaved?'SHOW ALL MUSIC VIDEOS':'★ MY LOCAL WATCHLIST'}</button>
   <p style={{fontSize:12,color:'#bad2e2'}}>Only rights-approved videos appear. Saved videos remain in this browser; there are no public view counts, paid rankings or automatic subscriptions.</p>
  </section>
  <section aria-label="Verified music videos" style={{border:'1px solid #365575',borderRadius:14,padding:14,marginBottom:15}}>
   <h3>Music Videos</h3>
   {approved.length===0?<p role="status" style={{color:'#ffdf9c'}}>No rights-cleared music videos are live. The discovery channel is in preparation; sample video views and artist rankings have not been invented.</p>:
    shown.length===0?<p role="status" style={{color:'#bad2e2'}}>No approved music videos match these search or watchlist filters.</p>:
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>{shown.map(video=><article key={video.id} style={{border:'1px solid #48677e',padding:12,borderRadius:12}}>
     <h4>{video.title}</h4><p>{video.artist} · {video.genre}</p>
     <video controls preload="none" playsInline crossOrigin="anonymous" aria-label={`Play ${video.title} by ${video.artist}`} style={{width:'100%',maxHeight:240}} src={video.streamManifestUrl}><track kind="captions" src={video.captionsUrl} srcLang="en" label="English captions" default/></video>
     <p style={{color:'#c4d6e3',fontSize:12}}>{video.description}</p><button style={{...buttonStyle,width:'100%'}} aria-pressed={savedIds.includes(String(video.id))} onClick={()=>toggleSaved(String(video.id))}>{savedIds.includes(String(video.id))?'★ REMOVE FROM MY WATCHLIST':'☆ SAVE TO MY WATCHLIST'}</button>
    </article>)}</div>}
  </section>
  <section style={{border:'1px solid #365575',borderRadius:14,padding:14,marginBottom:15}}>
   <h3>Prepare a music video for review</h3>
   <p style={{fontSize:12,color:'#b3c7d7'}}>This exports metadata only. Actual private video upload, human rights approval, virus scanning, captioning, encoding and CDN playback are not yet connected.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10}}>
    <label>Music video title<input aria-label="Original music video title" style={inputStyle} maxLength={120} value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <label>Artist name<input aria-label="Independent music video artist" style={inputStyle} maxLength={120} value={artist} onChange={e=>setArtist(e.target.value)}/></label>
    <label>Genre<input aria-label="Music video genre" style={inputStyle} maxLength={50} value={genre} onChange={e=>setGenre(e.target.value)}/></label>
    <label>Description<input aria-label="Music video description" style={inputStyle} maxLength={600} value={description} onChange={e=>setDescription(e.target.value)}/></label>
   </div>
   <button onClick={exportDraft} style={{...buttonStyle,width:'100%',marginTop:14}}>⬇ EXPORT REVIEW DRAFT — NOT PUBLISH</button>
   <p role="status" aria-live="polite" style={{color:'#ffe1a0',fontSize:12}}>{message}</p>
  </section>
  <section style={{border:'1px solid #365575',borderRadius:14,padding:14}}>
   <button style={{...buttonStyle,width:'100%',textAlign:'left'}} aria-expanded={showRights} onClick={()=>setShowRights(v=>!v)}>{showRights?'HIDE':'SHOW'} VIDEO STREAMING RELEASE REQUIREMENTS</button>
   {showRights&&<><ul style={{lineHeight:1.8,color:'#c5d5df'}}>{VIDEO_RIGHTS_REQUIREMENTS.map(k=><li key={k}>{k.replace(/([A-Z])/g,' $1').replaceAll('_',' ')}</li>)}</ul><p style={{fontSize:12,color:'#f7d8aa'}}>{MUSIC_VIDEO_DISCOVERY_POLICY.copyright} No artist is automatically enrolled.</p></>}
  </section>
 </main>
}
