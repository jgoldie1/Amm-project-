import {useEffect,useState} from 'react'
import type {StreetVerseReelCaptureReady,StreetVerseReelCaptureState} from '../runtime/StreetVerseReelCaptureRuntime'

export default function StreetVerseReelCaptureOverlay(){
 const [state,setState]=useState<StreetVerseReelCaptureState>('idle')
 const [ready,setReady]=useState<StreetVerseReelCaptureReady|null>(null)
 const [seconds,setSeconds]=useState(0)

 useEffect(()=>{
  const onState=(e:Event)=>{const d=(e as CustomEvent<{state?:StreetVerseReelCaptureState}>).detail||{};if(d.state)setState(d.state)}
  const onReady=(e:Event)=>{const d=(e as CustomEvent<StreetVerseReelCaptureReady>).detail;if(d){setReady(d);setState('ready')}}
  window.addEventListener('tryamm:reel-capture-state',onState)
  window.addEventListener('tryamm:reel-capture-ready',onReady)
  return()=>{window.removeEventListener('tryamm:reel-capture-state',onState);window.removeEventListener('tryamm:reel-capture-ready',onReady)}
 },[])

 useEffect(()=>{if(state!=='recording'){setSeconds(0);return}const started=Date.now();const timer=window.setInterval(()=>setSeconds(Math.min(30,Math.floor((Date.now()-started)/1000))),250);return()=>window.clearInterval(timer)},[state])

 const toggle=()=>window.dispatchEvent(new CustomEvent('tryamm:reel-capture-toggle'))
 const share=async()=>{
  if(!ready)return
  const file=new File([ready.blob],ready.fileName,{type:ready.mimeType})
  try{
   if(navigator.canShare?.({files:[file]})){await navigator.share({title:'StreetVerse Reel',text:'StreetVerse gameplay Reel',files:[file]});return}
  }catch{}
  window.open(ready.url,'_blank','noopener,noreferrer')
 }
 if(state==='unsupported')return <div aria-label="Reel capture unsupported" style={{position:'fixed',right:18,bottom:100,zIndex:43000,padding:'8px 10px',borderRadius:12,background:'#111d',color:'#fff',font:'800 10px system-ui'}}>REEL • DEVICE CAPTURE UNAVAILABLE</div>
 return <>
  <button aria-label={state==='recording'?'Stop StreetVerse Reel recording':'Start StreetVerse Reel recording'} onClick={toggle} style={{position:'fixed',right:'max(18px,env(safe-area-inset-right))',bottom:'max(102px,calc(env(safe-area-inset-bottom) + 92px))',zIndex:43000,minWidth:126,minHeight:52,padding:'9px 12px',borderRadius:15,border:'2px solid #ff4f6d',background:state==='recording'?'#8b1026ee':'#180a10ee',color:'#fff',font:'950 12px system-ui',boxShadow:'0 0 20px #ff315755',touchAction:'manipulation'}}>
   {state==='recording'?'■ STOP REEL • '+seconds+'s':'● REEL CAPTURE'}
  </button>
  {ready&&state==='ready'&&<section aria-label="StreetVerse Reel ready" style={{position:'fixed',inset:12,zIndex:48000,overflow:'auto',padding:14,borderRadius:18,background:'#070c12f7',color:'#fff'}}>
   <h2>REEL READY</h2>
   <video src={ready.url} controls playsInline preload="metadata" style={{width:'100%',maxHeight:'62vh',borderRadius:14,background:'#000'}}/>
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
    <button onClick={share} style={{minHeight:52,borderRadius:12,fontWeight:950}}>SHARE / SAVE</button>
    <button onClick={()=>{setReady(null);setState('idle')}} style={{minHeight:52,borderRadius:12,fontWeight:950}}>BACK TO GAME</button>
   </div>
   <small style={{display:'block',marginTop:8}}>{Math.max(1,Math.round(ready.durationMs/1000))} sec • {ready.mimeType||'video'}</small>
  </section>}
 </>
}
