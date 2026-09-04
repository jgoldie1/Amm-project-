import { useEffect, useRef, useState } from 'react'

const VIDEO='https://raw.githubusercontent.com/jgoldie1/amm-platform/main/public/brand/TRYAMM-Judah-Logo-App-Splash-POP.mp4'
const POSTER='https://raw.githubusercontent.com/jgoldie1/amm-platform/main/public/brand/TRYAMM-Judah-Logo-App-Splash-Poster.jpg'

export default function JudahSplash(){
  const videoRef=useRef<HTMLVideoElement>(null)
  const [open,setOpen]=useState(true)
  const [muted,setMuted]=useState(true)
  const [fallback,setFallback]=useState(false)
  const [canEnter,setCanEnter]=useState(false)

  useEffect(()=>{
    const enterTimer=window.setTimeout(()=>setCanEnter(true),500)
    const hardStop=window.setTimeout(()=>setOpen(false),5000)
    const video=videoRef.current
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      setFallback(true)
    }else if(video){
      video.muted=true
      video.currentTime=0
      void video.play().catch(()=>setFallback(true))
    }
    return()=>{window.clearTimeout(enterTimer);window.clearTimeout(hardStop)}
  },[])

  const finish=()=>setOpen(false)

  if(!open)return null

  return <section role="dialog" aria-modal="true" aria-label="TRYAMM Lion of Judah opening screen" style={{position:'fixed',inset:0,zIndex:2147483000,overflow:'hidden',background:'#02040a',display:'grid',placeItems:'center'}}>
    <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 45%,#4fe3ff28,transparent 34%),radial-gradient(circle at 50% 55%,#e8b94420,transparent 44%),#02040a'}}/>
    {fallback
      ? <img src={POSTER} alt="TRYAMM Lion of Judah holographic emblem" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
      : <video ref={videoRef} src={VIDEO} poster={POSTER} autoPlay muted playsInline preload="metadata" onEnded={finish} onError={()=>setFallback(true)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>}
    <div aria-hidden="true" style={{position:'absolute',inset:0,boxShadow:'inset 0 0 150px #000',background:'linear-gradient(180deg,#02040a0d,#02040a08 48%,#02040a88)',pointerEvents:'none'}}/>
    <div aria-hidden="true" style={{position:'absolute',left:'50%',bottom:'max(82px,calc(env(safe-area-inset-bottom) + 66px))',transform:'translateX(-50%)',zIndex:2,display:'grid',placeItems:'center',textAlign:'center',textShadow:'0 0 24px #000,0 0 30px #4fe3ff88',whiteSpace:'nowrap'}}>
      <span style={{color:'#e8b944',fontSize:26}}>♛</span>
      <strong style={{fontSize:'clamp(22px,5vw,44px)',letterSpacing:'.22em',color:'#fff'}}>TRYAMM</strong>
      <span style={{color:'#4fe3ff',fontSize:'clamp(9px,1.7vw,14px)',fontWeight:900,letterSpacing:'.18em'}}>THE HOLOGRAPHIC GATEWAY</span>
    </div>
    <div style={{position:'absolute',right:'max(18px,env(safe-area-inset-right))',bottom:'max(22px,env(safe-area-inset-bottom))',zIndex:3,display:'flex',gap:10}}>
      {!fallback&&<button type="button" onClick={()=>{const v=videoRef.current;if(v){v.muted=!v.muted;setMuted(v.muted);void v.play().catch(()=>{})}}} style={{minHeight:44,padding:'10px 16px',borderRadius:999,border:'1px solid #4fe3ff',background:'#02040add',color:'#fff',fontWeight:900,cursor:'pointer'}}>{muted?'PLAY JINGLE':'MUTE'}</button>}
      {canEnter&&<button type="button" onClick={finish} style={{minHeight:44,padding:'10px 18px',borderRadius:999,border:'1px solid #4fe3ff',background:'linear-gradient(135deg,#4fe3ff,#d1fbff)',color:'#041018',fontWeight:1000,cursor:'pointer'}}>ENTER TRYAMM</button>}
    </div>
  </section>
}
