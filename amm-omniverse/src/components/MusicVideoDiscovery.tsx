import {useState} from 'react'
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
  <section aria-label="Verified music videos" style={{border:'1px solid #365575',borderRadius:14,padding:14,marginBottom:15}}>
   <h3>Music Videos</h3>
   {approved.length===0?<p role="status" style={{color:'#ffdf9c'}}>No rights-cleared music videos are live. The discovery channel is in preparation; sample video views and artist rankings have not been invented.</p>:
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>{approved.map(video=><article key={video.id} style={{border:'1px solid #48677e',padding:12,borderRadius:12}}>
     <h4>{video.title}</h4><p>{video.artist} · {video.genre}</p>
     <video controls preload="none" playsInline crossOrigin="anonymous" aria-label={`Play ${video.title} by ${video.artist}`} style={{width:'100%',maxHeight:240}} src={video.streamManifestUrl}><track kind="captions" src={video.captionsUrl} srcLang="en" label="English captions" default/></video>
     <p style={{color:'#c4d6e3',fontSize:12}}>{video.description}</p>
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
