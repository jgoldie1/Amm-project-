import {useState} from 'react'
import {PUBLIC_APPROVED_AUDIO_CATALOG,approvedAudioTracks,createAudioReviewDraft,AUDIO_RELEASE_REQUIREMENTS} from '../lib/music/approvedAudioStreaming.mjs'
const b:React.CSSProperties={minHeight:52,padding:'10px 14px',borderRadius:11,border:'1px solid #7fcce3',background:'#132a3e',color:'#fff',fontSize:15,fontWeight:800,cursor:'pointer',touchAction:'manipulation'}
const field:React.CSSProperties={boxSizing:'border-box',width:'100%',minHeight:48,padding:'8px 11px',background:'#101d2d',border:'1px solid #6487a0',borderRadius:9,color:'#fff',fontSize:15}
export default function IndependentMusicListening(){
 const [q,setQ]=useState('')
 const [genre,setGenre]=useState('All')
 const [title,setTitle]=useState('')
 const [artist,setArtist]=useState('')
 const [album,setAlbum]=useState('')
 const [notice,setNotice]=useState('Music listening catalog is not yet licensed or populated. No streams or payouts are being claimed.')
 const [showReview,setShowReview]=useState(false)
 const tracks=approvedAudioTracks(PUBLIC_APPROVED_AUDIO_CATALOG,{query:q,genre})
 const genres=['All','R&B / Soul','Gospel','Hip-Hop','Jazz','Afrobeats','House','Country','Rock','Pop','Other']
 const prepare=()=>{
  const draft=createAudioReviewDraft({title,artist,album,genre:genre==='All'?'Other':genre})
  if(!draft){setNotice('Enter the song title and artist to prepare a review draft.');return}
  const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='all-american-audio-rights-review-draft.json';a.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
  setNotice('Review draft exported. No audio uploaded, released or monetized.')
 }
 return <main aria-label="All American independent music listening" style={{maxWidth:960,margin:'0 auto',padding:'18px 14px 90px',color:'#fff'}}>
  <div style={{fontSize:12,fontWeight:850,color:'#8ee8ff'}}>ALL AMERICAN RECORDS • ORIGINAL MUSICVERSE</div>
  <h2>🎧 Listen to Independent Music</h2>
  <p style={{color:'#c3d6e3',lineHeight:1.6}}>Discover original musicians, albums and new releases. Artist rights, accurate play counts and fair royalty statements must be verified before public streaming starts.</p>
  <section style={{border:'1px solid #48677d',padding:14,borderRadius:13}}>
   <label>Search licensed music<input aria-label="Search approved audio tracks" type="search" style={field} value={q} maxLength={120} onChange={e=>setQ(e.target.value)} placeholder="Song, artist, album or style"/></label>
   <label style={{display:'block',marginTop:10}}>Music genre<select aria-label="Approved audio genre filter" style={field} value={genre} onChange={e=>setGenre(e.target.value)}>{genres.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
   <h3>Approved music</h3>
   {tracks.length===0?<p role="status" style={{color:'#ffe09e'}}>No licensed streaming tracks available for these filters. The public audio catalog is being prepared.</p>:tracks.map(t=><article key={String(t.id)} style={{padding:12,border:'1px solid #385a70',borderRadius:12,marginTop:8}}>
    <strong>{t.title}</strong><p>{t.artist} · {t.album} · {t.genre}</p>
    <audio controls preload="none" src={t.streamUrl} aria-label={`Listen to ${t.title} by ${t.artist}`} style={{width:'100%',minHeight:48}}/>
   </article>)}
  </section>
  <section style={{border:'1px solid #48677d',padding:14,borderRadius:13,marginTop:14}}>
   <h3>Artist catalog submission — private draft</h3>
   <p style={{fontSize:12,color:'#bacbd9'}}>No upload or public release happens here. Create a review file for an original track, then obtain approval before connecting private audio assets.</p>
   <label style={{display:'block'}}>Original song title<input aria-label="Original song title for review" style={field} maxLength={120} value={title} onChange={e=>setTitle(e.target.value)}/></label>
   <label style={{display:'block',marginTop:10}}>Artist<input aria-label="Original artist for review" style={field} maxLength={120} value={artist} onChange={e=>setArtist(e.target.value)}/></label>
   <label style={{display:'block',marginTop:10}}>Album<input aria-label="Original album for review" style={field} maxLength={120} value={album} onChange={e=>setAlbum(e.target.value)}/></label>
   <button style={{...b,width:'100%',marginTop:12}} onClick={prepare}>⬇ EXPORT TRACK REVIEW — NO PUBLISH</button>
   <button style={{...b,width:'100%',marginTop:10}} aria-expanded={showReview} onClick={()=>setShowReview(v=>!v)}>{showReview?'HIDE':'SHOW'} STREAMING RIGHTS REQUIREMENTS</button>
   {showReview&&<ul style={{lineHeight:1.9,color:'#e2e8ef'}}>{AUDIO_RELEASE_REQUIREMENTS.map(x=><li key={x}>{x.replace(/([A-Z])/g,' $1').replaceAll('_',' ')}</li>)}</ul>}
   <p role="status" aria-live="polite" style={{color:'#ffe09e',fontSize:12}}>{notice}</p>
  </section>
 </main>
}
