import { useEffect, useRef, useState } from 'react'
import { setHoloOverlay } from './HolographicOverlay'

type MediaKind='music'|'video'|'movie'|'episode'|'podcast'|'replay'
type Props={src:string;kind:MediaKind;title:string;poster?:string;captions?:string;onClose?:()=>void}

export default function OmniPlayer({src,kind,title,poster,captions,onClose}:Props){
  const mediaRef=useRef<HTMLMediaElement|null>(null)
  const [playing,setPlaying]=useState(false)
  const [rate,setRate]=useState(1)
  const [holo,setHolo]=useState(true)
  const [muted,setMuted]=useState(false)
  const isAudio=kind==='music'||kind==='podcast'

  useEffect(()=>{
    setHoloOverlay({mode:holo?(kind==='music'?'creator':'cinema'):'off',visible:holo,message:`OMNIPLAYER · ${title}`})
    return()=>setHoloOverlay({mode:'ambient',visible:true,message:'HOLO CORE ONLINE'})
  },[holo,kind,title])

  function emit(action:string,detail:Record<string,unknown>={}){
    window.dispatchEvent(new CustomEvent('tryamm:omni-player',{detail:{action,kind,title,...detail}}))
  }

  async function togglePlay(){
    const el=mediaRef.current
    if(!el)return
    if(el.paused){await el.play();setPlaying(true);emit('play')}else{el.pause();setPlaying(false);emit('pause')}
  }

  function setPlaybackRate(next:number){
    if(mediaRef.current)mediaRef.current.playbackRate=next
    setRate(next);emit('rate',{rate:next})
  }

  async function pictureInPicture(){
    const el=mediaRef.current as HTMLVideoElement|null
    if(!el||isAudio||!('requestPictureInPicture'in el))return
    try{await el.requestPictureInPicture();emit('pip')}catch{}
  }

  async function fullscreen(){
    const el=mediaRef.current
    if(!el)return
    try{await (el as any).requestFullscreen?.();emit('fullscreen')}catch{}
  }

  return <section aria-label={`OmniPlayer ${title}`} style={{position:'fixed',inset:0,zIndex:12050,background:'#02040bee',color:'#fff',display:'grid',placeItems:'center',padding:18,fontFamily:'system-ui,sans-serif'}}>
    <div style={{width:'min(1000px,100%)',border:'1px solid #31435e',borderRadius:20,overflow:'hidden',background:'#080d18',boxShadow:'0 18px 80px #000'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'12px 14px',borderBottom:'1px solid #26344d'}}>
        <div><div style={{fontSize:10,letterSpacing:1.8,color:'#7eeaff'}}>OMNIPLAYER · {kind.toUpperCase()}</div><strong>{title}</strong></div>
        {onClose&&<button onClick={onClose} aria-label="Close player" style={{width:44,height:44,borderRadius:12,border:'1px solid #4b5a73',background:'#101827',color:'#fff',fontSize:24}}>×</button>}
      </header>

      <div style={{background:'#000',minHeight:isAudio?160:240,display:'grid',placeItems:'center'}}>
        {isAudio?
          <audio ref={el=>{mediaRef.current=el}} src={src} preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={e=>emit('time',{currentTime:(e.currentTarget as HTMLMediaElement).currentTime})}/>
          :<video ref={el=>{mediaRef.current=el}} src={src} poster={poster} playsInline preload="metadata" style={{width:'100%',maxHeight:'68vh',background:'#000'}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={e=>emit('time',{currentTime:(e.currentTarget as HTMLMediaElement).currentTime})}>{captions&&<track kind="captions" src={captions} srcLang="en" label="Captions" default/>}</video>}
        {isAudio&&<div style={{textAlign:'center',padding:24}}><div style={{fontSize:52}}>♫</div><div style={{opacity:.72}}>Quantum Beat™ audio session</div></div>}
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',padding:14}}>
        <button onClick={togglePlay} style={primary}>{playing?'❚❚ PAUSE':'▶ PLAY'}</button>
        <button onClick={()=>{if(mediaRef.current){mediaRef.current.currentTime=Math.max(0,mediaRef.current.currentTime-10)}}} style={secondary}>↶ 10s</button>
        <button onClick={()=>{if(mediaRef.current){mediaRef.current.currentTime+=10}}} style={secondary}>10s ↷</button>
        <button onClick={()=>{if(mediaRef.current){mediaRef.current.muted=!muted;setMuted(!muted)}}} style={secondary}>{muted?'UNMUTE':'MUTE'}</button>
        <button onClick={fullscreen} style={secondary}>FULLSCREEN</button>
        {!isAudio&&<button onClick={pictureInPicture} style={secondary}>PIP</button>}
        <button onClick={()=>{setHolo(!holo);setHoloOverlay({mode:!holo?(kind==='music'?'creator':'cinema'):'off',visible:!holo})}} style={secondary}>{holo?'HOLO ON':'HOLO OFF'}</button>
        <label style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center',fontSize:12}}>Speed <select value={rate} onChange={e=>setPlaybackRate(Number(e.target.value))} style={{background:'#111827',color:'#fff',border:'1px solid #40506a',borderRadius:8,padding:8}}><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label>
      </div>

      <footer style={{padding:'0 14px 14px',fontSize:11,opacity:.62,lineHeight:1.5}}>Casting, entitlement, HoloLingo, offline-download and WebXR actions are exposed through OmniPlayer platform events and are activated only when the corresponding provider/device capability is configured.</footer>
    </div>
  </section>
}

const primary:React.CSSProperties={minHeight:44,padding:'0 15px',borderRadius:11,border:'1px solid #4fe3ff',background:'#0b3947',color:'#fff',fontWeight:900,cursor:'pointer'}
const secondary:React.CSSProperties={minHeight:44,padding:'0 12px',borderRadius:11,border:'1px solid #3b4860',background:'#111827',color:'#fff',fontWeight:800,cursor:'pointer'}
