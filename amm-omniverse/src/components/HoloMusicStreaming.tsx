import { useEffect, useMemo, useState } from 'react'
import {VERSE_RADIO_STATIONS,type VerseRadioState} from '../runtime/VerseRadioRuntime'
import { getSupabaseClient } from '../services/supabaseClient'

type TrackRecord = Record<string, any>
type Props = { onClose: () => void }

function streamUrl(track: TrackRecord){return track.file_url || track.stream_url || track.audio_url || track.preview_url || track.media_url || track.url || ''}
function trackTitle(track: TrackRecord){return track.title || track.name || 'Untitled track'}
function artistName(track: TrackRecord){return track.artist_name || track.artist || track.creator_name || track.creator || 'TRYAMM Artist'}

export default function HoloMusicStreaming({ onClose }: Props){
  const [tracks,setTracks]=useState<TrackRecord[]>([])
  const [selected,setSelected]=useState<TrackRecord|null>(null)
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState('Loading owned/licensed TRYAMM music catalog…')
  const [station,setStation]=useState('musicverse-radio')
  const [radio,setRadio]=useState<VerseRadioState|null>(null)

  useEffect(()=>{
    let cancelled=false
    async function load(){
      const sb=getSupabaseClient()
      if(!sb){setStatus('Supabase music catalog is not configured in this build.');return}
      try{
        const {data,error}=await sb.from('tracks').select('*').eq('is_public',true).order('created_at',{ascending:false}).limit(100)
        if(error)throw error
        if(cancelled)return
        const rows=(data||[]) as TrackRecord[]
        setTracks(rows)
        const playable=rows.filter(row=>Boolean(streamUrl(row))).length
        setStatus(rows.length?`${rows.length} public catalog track(s) loaded · ${playable} stream-ready.`:'No public music has been published to the track catalog yet.')
      }catch(error){if(!cancelled)setStatus(error instanceof Error?error.message:'Music catalog unavailable.')}
    }
    const onRadio=(event:Event)=>setRadio((event as CustomEvent<VerseRadioState>).detail)
    addEventListener('tryamm:verse-radio-state',onRadio)
    load();return()=>{cancelled=true;removeEventListener('tryamm:verse-radio-state',onRadio)}
  },[])

  const filtered=useMemo(()=>{const q=query.trim().toLowerCase();const cfg=VERSE_RADIO_STATIONS.find(x=>x.id===station);return tracks.filter(t=>{const hay=`${trackTitle(t)} ${artistName(t)} ${t.genre||''}`.toLowerCase();const queryOk=!q||hay.includes(q);const stationOk=!cfg?.genres.length||cfg.genres.some(g=>hay.includes(g));return queryOk&&stationOk})},[tracks,query,station])

  function play(track:TrackRecord){
    const url=streamUrl(track)
    if(!url){setStatus('This public catalog item has no authorized streaming file yet.');return}
    setSelected(track)
    window.dispatchEvent(new CustomEvent('tryamm:verse-radio-play',{detail:{track:{id:String(track.id||trackTitle(track)),title:trackTitle(track),artist:artistName(track),url,genre:String(track.genre||''),publicAuthorized:true},source:'holo-music-streaming'}}))
    window.dispatchEvent(new CustomEvent('tryamm:verse-radio-open',{detail:{source:'holo-music-streaming'}}))
    setStatus('Sent to Verse Radio. It will follow you across connected Verses; a tap may be required after a full page transition.')
  }

  return <div role="dialog" aria-modal="true" aria-label="Holo Music Streaming" style={{position:'fixed',inset:0,zIndex:12150,background:'linear-gradient(180deg,#02050d,#07111d 45%,#02040a)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:3,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'14px 18px',background:'#030812ee',borderBottom:'1px solid #285067',backdropFilter:'blur(12px)'}}>
      <div><div style={{fontSize:10,letterSpacing:2,color:'#4fe3ff'}}>TRYAMM HOLO MUSIC</div><h1 style={{margin:'2px 0'}}>Streaming Command</h1><div style={{fontSize:12,opacity:.65}}>Catalog → playback → creator profile → Reel/TV/Live distribution</div></div>
      <button onClick={onClose} style={button}>CLOSE</button>
    </header>
    <main style={{maxWidth:1100,margin:'0 auto',padding:18,display:'grid',gap:14}}>
      <section style={panel}><strong style={{color:'#8ff5ff'}}>RIGHTS-AWARE STREAMING</strong><p style={{opacity:.72,lineHeight:1.5}}>Only public catalog items are loaded. Playback requires a real media file URL; private studio sessions stay out of this surface.</p><div style={{fontSize:12,color:'#e8b944'}}>{status}</div></section>
      <section style={{...panel,borderColor:'#4fe3ff55'}}><div style={{fontSize:10,color:'#4fe3ff',fontWeight:900}}>CROSS-VERSE RADIO</div><div style={{display:'flex',gap:6,overflowX:'auto',marginTop:8}}>{VERSE_RADIO_STATIONS.map(s=><button key={s.id} onClick={()=>{setStation(s.id);window.dispatchEvent(new CustomEvent('tryamm:verse-radio-station',{detail:{station:s.id}}))}} style={{...button,minHeight:36,fontSize:9,whiteSpace:'nowrap',borderColor:station===s.id?'#78efff':'#315168'}}>{s.label}</button>)}</div>{radio?.track&&<div style={{marginTop:10}}><b>{radio.track.title}</b><div style={{fontSize:11,opacity:.65}}>{radio.track.artist} • {radio.platform}</div><div style={{display:'flex',gap:7,marginTop:8}}><button onClick={()=>window.dispatchEvent(new Event(radio.playing?'tryamm:verse-radio-pause':'tryamm:verse-radio-resume'))} style={button}>{radio.playing?'Ⅱ PAUSE':'▶ RESUME'}</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:verse-radio-open'))} style={button}>OPEN DOCK</button></div></div>}</section>
      {selected&&<section style={{...panel,borderColor:'#4fe3ff88'}}><div style={{fontSize:11,color:'#4fe3ff'}}>SELECTED FOR VERSE RADIO</div><h2 style={{margin:'5px 0'}}>{trackTitle(selected)}</h2><div style={{opacity:.65}}>{artistName(selected)}{selected.genre?` · ${selected.genre}`:''}</div></section>}
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Holo Music…" style={{padding:13,borderRadius:12,border:'1px solid #315168',background:'#07101b',color:'#fff'}}/>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10}}>{filtered.map(track=>{const playable=Boolean(streamUrl(track));return <article key={track.id||`${trackTitle(track)}-${artistName(track)}`} style={panel}><div style={{fontSize:10,color:playable?'#78ffb4':'#e8b944'}}>{playable?'STREAM READY':'MEDIA REQUIRED'}</div><h3 style={{margin:'6px 0'}}>{trackTitle(track)}</h3><div style={{fontSize:12,opacity:.65}}>{artistName(track)}{track.genre?` · ${track.genre}`:''}</div><button disabled={!playable} onClick={()=>play(track)} style={{...button,marginTop:12,opacity:playable?1:.45}}>{playable?'▶ PLAY':'LOCKED'}</button></article>})}</section>
    </main>
  </div>
}

const panel:React.CSSProperties={padding:16,border:'1px solid #243f53',borderRadius:16,background:'#07101be8'}
const button:React.CSSProperties={minHeight:42,padding:'0 14px',border:'1px solid #4fe3ff66',borderRadius:11,background:'#0c2633',color:'#fff',fontWeight:900,cursor:'pointer'}
