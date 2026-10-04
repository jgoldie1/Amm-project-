import {useEffect,useRef,useState} from 'react'
import {playLottie,stopLottie,type LottieAnimKey} from '../game/lottie/LottieAnimations'
import {lottieForGift} from '../game/gifts/HolographicGiftKit'

type OverlayState={title:string;detail:string;nonce:number;lottieKey:LottieAnimKey}

export default function HoloLivePkLottieOverlay(){
  const [state,setState]=useState<OverlayState|null>(null)
  const timer=useRef<number|undefined>(undefined)
  const animationHost=useRef<HTMLDivElement|null>(null)
  const activeAnimation=useRef<ReturnType<typeof playLottie>|null>(null)

  useEffect(()=>{
    const show=(title:string,detail:string,lottieKey:LottieAnimKey)=>{
      if(timer.current)window.clearTimeout(timer.current)
      setState({title,detail,nonce:Date.now(),lottieKey})
      timer.current=window.setTimeout(()=>setState(null),2600)
    }
    const onLive=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};show('HOLO LIVE',String(d.roomName||d.room||d.type||'LIVE session connected'),'live_pulse')}
    const onPkStart=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};show('PK BATTLE',String(d.mode||'1v1').toUpperCase()+' • HOLOGRAPHIC ARENA','fusion_burst')}
    const onPkEnd=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};show('PK RESULT',`TEAM A ${d.left??0} • ${d.right??0} TEAM B`,'mission_complete')}
    const onGift=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};const kit=lottieForGift(String(d.giftType||''),String(d.tier||''));show('HOLO GIFT',String(d.label||d.giftType||d.collection||'GIFT EFFECT'),kit.lottieKey)}
    window.addEventListener('tryamm:live-session',onLive)
    window.addEventListener('tryamm:pk-start',onPkStart)
    window.addEventListener('tryamm:pk-end',onPkEnd)
    window.addEventListener('tryamm:holo-gift',onGift)
    return()=>{
      if(timer.current)window.clearTimeout(timer.current)
      window.removeEventListener('tryamm:live-session',onLive)
      window.removeEventListener('tryamm:pk-start',onPkStart)
      window.removeEventListener('tryamm:pk-end',onPkEnd)
      window.removeEventListener('tryamm:holo-gift',onGift)
    }
  },[])

  useEffect(()=>{
    stopLottie(activeAnimation.current)
    activeAnimation.current=null
    const host=animationHost.current
    if(!state||!host)return
    activeAnimation.current=playLottie(host,state.lottieKey,{loop:false,autoplay:true,speed:1.12})
    return()=>{stopLottie(activeAnimation.current);activeAnimation.current=null}
  },[state?.nonce,state?.lottieKey])

  if(!state)return null
  return <div key={state.nonce} aria-live="polite" aria-label={state.title} style={{position:'fixed',inset:0,zIndex:22050,pointerEvents:'none',display:'grid',placeItems:'center',background:'radial-gradient(circle at 50% 50%,rgba(28,116,151,.18),transparent 58%)'}}>
    <div style={{position:'relative',width:'min(72vw,360px)',height:'min(72vw,360px)',display:'grid',placeItems:'center',filter:'drop-shadow(0 0 28px #4fe3ff)'}}>
      <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid #4fe3ffaa',boxShadow:'0 0 40px #4fe3ff55,inset 0 0 45px #4fe3ff33',animation:'tryammHoloPulse 1.2s ease-out infinite'}}/>
      <div ref={animationHost} aria-hidden="true" style={{width:'78%',height:'78%'}}/>
      <div style={{position:'absolute',left:'50%',bottom:12,transform:'translateX(-50%)',minWidth:220,maxWidth:'90vw',padding:'10px 14px',borderRadius:14,border:'1px solid #4fe3ff99',background:'#020914e8',color:'#fff',textAlign:'center',fontFamily:'system-ui',boxShadow:'0 10px 35px #000a'}}>
        <div style={{fontSize:11,letterSpacing:2,color:'#4fe3ff',fontWeight:950}}>{state.title}</div>
        <div style={{fontSize:12,marginTop:4,fontWeight:800}}>{state.detail}</div>
      </div>
    </div>
    <style>{`@keyframes tryammHoloPulse{0%{transform:scale(.72);opacity:.95}100%{transform:scale(1.18);opacity:0}}`}</style>
  </div>
}
