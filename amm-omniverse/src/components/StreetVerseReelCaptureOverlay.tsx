import {useEffect,useState} from 'react'
import type {StreetVerseReelCaptureReady,StreetVerseReelCaptureState} from '../runtime/StreetVerseReelCaptureRuntime'

export default function StreetVerseReelCaptureOverlay(){
 const [state,setState]=useState<StreetVerseReelCaptureState>('idle')
 const [ready,setReady]=useState<StreetVerseReelCaptureReady|null>(null)
 const [seconds,setSeconds]=useState(0)
 const [reelModeOpen,setReelModeOpen]=useState(()=>new URLSearchParams(window.location.search).get('reel')==='1')
 const [shotCue,setShotCue]=useState<{label:string;angle:string;purpose?:string}|null>(null)

 useEffect(()=>{
  const onState=(e:Event)=>{const d=(e as CustomEvent<{state?:StreetVerseReelCaptureState}>).detail||{};if(d.state)setState(d.state)}
  const onReady=(e:Event)=>{const d=(e as CustomEvent<StreetVerseReelCaptureReady>).detail;if(d){setReady(d);setState('ready')}}
  const onShot=(e:Event)=>{const d=(e as CustomEvent<{label?:string;angle?:string;purpose?:string}>).detail||{};if(d.label)setShotCue({label:d.label,angle:String(d.angle||''),purpose:d.purpose})}
  window.addEventListener('tryamm:reel-capture-state',onState)
  window.addEventListener('tryamm:reel-capture-ready',onReady)
  window.addEventListener('tryamm:reel-director-shot',onShot)
  return()=>{window.removeEventListener('tryamm:reel-capture-state',onState);window.removeEventListener('tryamm:reel-capture-ready',onReady);window.removeEventListener('tryamm:reel-director-shot',onShot)}
 },[])

 useEffect(()=>{if(state!=='recording'){setSeconds(0);return}const started=Date.now();const timer=window.setInterval(()=>setSeconds(Math.min(30,Math.floor((Date.now()-started)/1000))),250);return()=>window.clearInterval(timer)},[state])
 useEffect(()=>{
  const onAcceptanceReel=()=>{
   if(state==='unsupported'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-step-failed',{detail:{step:'reel',reason:'capture-unsupported'}}));return}
   if(state==='idle'){
    window.dispatchEvent(new CustomEvent('tryamm:reel-capture-toggle',{detail:{source:'acceptance-one-push'}}))
    window.setTimeout(()=>window.dispatchEvent(new CustomEvent('tryamm:reel-capture-toggle',{detail:{source:'acceptance-one-push-auto-stop'}})),1800)
   }
  }
  const onAcceptanceReturn=()=>{
   if(!ready||state!=='ready'){window.dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-step-failed',{detail:{step:'return',reason:'reel-not-ready'}}));return}
   const detail={source:'streetverse-reel-overlay-acceptance',fileName:ready.fileName,durationMs:ready.durationMs}
   setReady(null);setState('idle')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-return',{detail}))
  }
  window.addEventListener('tryamm:streetverse-acceptance-record-reel',onAcceptanceReel)
  window.addEventListener('tryamm:streetverse-acceptance-return-to-game',onAcceptanceReturn)
  return()=>{
   window.removeEventListener('tryamm:streetverse-acceptance-record-reel',onAcceptanceReel)
   window.removeEventListener('tryamm:streetverse-acceptance-return-to-game',onAcceptanceReturn)
  }
 },[state,ready])

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
  {state==='recording'&&shotCue&&<div aria-live="polite" style={{position:'fixed',left:'50%',top:'max(68px,calc(env(safe-area-inset-top) + 68px))',transform:'translateX(-50%)',zIndex:47000,width:'min(78vw,360px)',padding:'8px 12px',borderRadius:14,border:'1px solid #ffd166',background:'rgba(10,10,16,.88)',color:'#fff',fontFamily:'system-ui',textAlign:'center',pointerEvents:'none'}}>
    <strong style={{fontSize:14}}>{shotCue.label}</strong>
    <div style={{fontSize:11,color:'#ddd',marginTop:3}}>{shotCue.purpose||'Frame the action for the next cut'}</div>
    <div style={{fontSize:10,color:'#9fdcff',marginTop:2}}>9:16 SAFE FRAME • keep faces/text near center</div>
  </div>}
  {reelModeOpen&&state==='idle'&&<section aria-label="HoloReel mode" style={{position:'fixed',left:'50%',top:'max(78px,calc(env(safe-area-inset-top) + 78px))',transform:'translateX(-50%)',zIndex:47990,width:'min(92vw,420px)',padding:14,borderRadius:18,border:'1px solid #ff8bc7',background:'rgba(19,7,20,.96)',color:'#fff',boxShadow:'0 18px 48px #000a',fontFamily:'system-ui'}}>
   <strong style={{fontSize:20}}>HOLOREEL MODE</strong>
   <p style={{margin:'7px 0 12px',fontSize:13,lineHeight:1.4,color:'#e7d5e2'}}>Record up to 30 seconds in a composed 9:16 vertical frame. The director calls camera-angle beats while you record, then you can preview, share/save, and return directly to the game.</p>
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
    <button type="button" onClick={()=>{setReelModeOpen(false);toggle()}} style={{minHeight:54,borderRadius:12,border:'1px solid #ffc1df',background:'#7b234d',color:'#fff',fontWeight:950}}>● START RECORDING</button>
    <button type="button" onClick={()=>setReelModeOpen(false)} style={{minHeight:54,borderRadius:12,border:'1px solid #596273',background:'#1a2130',color:'#fff',fontWeight:900}}>CONTINUE GAME</button>
   </div>
  </section>}
  <button aria-label={state==='recording'?'Stop StreetVerse Reel recording':'Start StreetVerse Reel recording'} onClick={toggle} style={{position:'fixed',top:'max(12px,calc(env(safe-area-inset-top) + 12px))',right:'max(126px,calc(env(safe-area-inset-right) + 126px))',zIndex:43000,minWidth:state==='recording'?88:46,width:state==='recording'?88:46,height:46,padding:'6px',borderRadius:23,border:'2px solid #ff4f6d',background:state==='recording'?'#8b1026ee':'#180a10ee',color:'#fff',font:'950 12px system-ui',boxShadow:'0 0 20px #ff315755',touchAction:'manipulation'}}>
   {state==='recording'?'■ '+seconds+'s':'🎥'}
  </button>
  {ready&&state==='ready'&&<section aria-label="StreetVerse Reel ready" style={{position:'fixed',inset:12,zIndex:48000,overflow:'auto',padding:14,borderRadius:18,background:'#070c12f7',color:'#fff'}}>
   <h2>REEL READY</h2>
   <video src={ready.url} controls playsInline preload="metadata" style={{width:'100%',maxHeight:'62vh',borderRadius:14,background:'#000'}}/>
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
    <button onClick={share} style={{minHeight:52,borderRadius:12,fontWeight:950}}>SHARE / SAVE</button>
    <button onClick={()=>{setReady(null);setState('idle');window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-return',{detail:{source:'streetverse-reel-overlay',fileName:ready.fileName,durationMs:ready.durationMs}}))}} style={{minHeight:52,borderRadius:12,fontWeight:950}}>BACK TO GAME</button>
   </div>
   <small style={{display:'block',marginTop:8}}>{Math.max(1,Math.round(ready.durationMs/1000))} sec • {ready.mimeType||'video'} • {ready.width}×{ready.height} • {ready.aspectRatio}</small>
  </section>}
 </>
}
