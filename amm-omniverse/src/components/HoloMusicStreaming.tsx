import { useEffect, useMemo, useRef, useState } from 'react'
import { getSupabaseClient } from '../services/supabaseClient'

type TrackRecord = Record<string, any>

type Props = { onClose: () => void }

function streamUrl(track: TrackRecord){
  return track.stream_url || track.audio_url || track.preview_url || track.media_url || track.url || ''
}
function trackTitle(track: TrackRecord){return track.title || track.name || 'Untitled track'}
function artistName(track: TrackRecord){return track.artist_name || track.artist || track.creator_name || track.creator || 'TRYAMM Artist'}

export default function HoloMusicStreaming({ onClose }: Props){
  const [tracks,setTracks]=useState<TrackRecord[]>([])
  const [selected,setSelected]=useState<TrackRecord|null>(null)
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState('Loading owned/licensed TRYAMM music catalog…')
  const audioRef=useRef<HTMLAudioElement|null>(null)

  useEffect(()=>{
    let cancelled=false
    async function load(){
      const sb=getSupabaseClient()
      if(!sb){setStatus('Supabase music catalog is not configured in this build.');return}
      try{
        let request=sb.from('tracks').select('*').order('created_at',{ascending:false}).limit(100)
        const {data,error}=await request
        if(error)throw error
        if(cancelled)return
        const rows=(data||[]) as TrackRecord[]
        setTracks(rows)
        setStatus(rows.length?`${rows.length} catalog track(s) loaded. Playback is available only when an authorized audio URL exists.`:'No music has been published to the track catalog yet.')
      }catch(error){
        if(!cancelled)setStatus(error instanceof Error?error.message:'Music catalog unavailable.')
      }
    }
    load();return()=>{cancelled=true;audioRef.current?.pause()}
  },[])

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();if(!q)return tracks
    return tracks.filter(t=>`${trackTitle(t)} ${artistName(t)} ${t.genre||''}`.toLowerCase().includes(q))
  },[tracks,query])

  function play(track:TrackRecord){
    const url=streamUrl(track)
    if(!url){setStatus('This catalog item has no authorized streaming URL yet. Upload/license the audio before playback is enabled.');return}
    setSelected(track)
    window.setTimeout(()=>audioRef.current?.play().catch(()=>setStatus('Browser blocked autoplay. Tap Play in the player.')),0)
  }

  return <div role="dialog" aria-modal="true" aria-label="Holo Music Streaming" style={{position:'fixed',inset:0,zIndex:12150,background:'linear-gradient(180deg,#02050d,#07111d 45%,#02040a)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:3,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'14px 18px',background:'#030812ee',borderBottom:'1px solid #285067',backdropFilter:'blur(12px)'}}>
      <div><div style={{fontSize:10,letterSpacing:2,color:'#4fe3ff'}}>TRYAMM HOLO MUSIC</div><h1 style={{margin:'2px 0'}}>Streaming Command</h1><div style={{fontSize:12,opacity:.65}}>Catalog → playback → creator profile → Reel/TV/Live distribution</div></div>
      <button onClick={onClose} style={button}>CLOSE</button>
    </header>
    <main style={{maxWidth:1100,margin:'0 auto',padding:18,display:'grid',gap:14}}>
      <section style={panel}>
        <strong style={{color:'#8ff5ff'}}>RIGHTS-AWARE STREAMING</strong>
        <p style={{opacity:.72,lineHeight:1.5}}>Holo Music only plays media that has a real catalog URL. Owned, licensed, public-domain or otherwise authorized music can be distributed; missing media stays unavailable instead of being simulated.</p>
        <div style={{fontSize:12,color:'#e8b944'}}>{status}</div>
      </section>
      {selected&&<section style={{...panel,borderColor:'#4fe3ff88'}}><div style={{fontSize:11,color:'#4fe3ff'}}>NOW PLAYING</div><h2 style={{margin:'5px 0'}}>{trackTitle(selected)}</h2><div style={{opacity:.65,marginBottom:10}}>{artistName(selected)}{selected.genre?` · ${selected.genre}`:''}</div><audio ref={audioRef} controls preload="metadata" src={streamUrl(selected)} style={{width:'100%'}}/></section>}
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Holo Music…" style={{padding:13,borderRadius:12,border:'1px solid #315168',background:'#07101b',color:'#fff'}}/>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10}}>
        {filtered.map(track=>{const playable=Boolean(streamUrl(track));return <article key={track.id||`${trackTitle(track)}-${artistName(track)}`} style={panel}><div style={{fontSize:10,color:playable?'#78ffb4':'#e8b944'}}>{playable?'STREAM READY':'MEDIA REQUIRED'}</div><h3 style={{margin:'6px 0'}}>{trackTitle(track)}</h3><div style={{fontSize:12,opacity:.65}}>{artistName(track)}{track.genre?` · ${track.genre}`:''}</div><button disabled={!playable} onClick={()=>play(track)} style={{...button,marginTop:12,opacity:playable?1:.45}}>{playable?'▶ PLAY':'LOCKED'}</button></article>})}
      </section>
    </main>
  </div>
}

const panel:React.CSSProperties={padding:16,border:'1px solid #243f53',borderRadius:16,background:'#07101be8'}
const button:React.CSSProperties={minHeight:42,padding:'0 14px',border:'1px solid #4fe3ff66',borderRadius:11,background:'#0c2633',color:'#fff',fontWeight:900,cursor:'pointer'}
