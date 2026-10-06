import {useEffect,useMemo,useState} from 'react'

type TransitDetail={
  id:string
  canonicalId:string
  label:string
  route:string
  status:'LIVE'|'BUILDING'|'PLANNED'
  purpose:string
}

export default function HolographicVerseTransitOverlay(){
  const [detail,setDetail]=useState<TransitDetail|null>(null)
  const reduced=useMemo(()=>typeof window!=='undefined'&&Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),[])

  useEffect(()=>{
    let timer=0
    const onTransit=(event:Event)=>{
      const e=event as CustomEvent<TransitDetail>
      if(!e.detail?.route)return
      e.preventDefault()
      window.clearTimeout(timer)
      setDetail(e.detail)
      timer=window.setTimeout(()=>{
        const navigate=(window as typeof window&{__tryammNavigate?:(route:string)=>void}).__tryammNavigate
        setDetail(null)
        if(typeof navigate==='function')navigate(e.detail.route)
        else if(window.location.pathname!==e.detail.route)window.location.href=e.detail.route
      },reduced?120:760)
    }
    addEventListener('tryamm:holo-verse-transit-request',onTransit)
    return()=>{removeEventListener('tryamm:holo-verse-transit-request',onTransit);window.clearTimeout(timer)}
  },[reduced])

  if(!detail)return null
  return <div aria-live="polite" aria-label={'Entering '+detail.label} style={backdrop}>
    <style>{'@keyframes tryammVerseFly{0%{transform:translate3d(0,36px,-240px) scale(.3);opacity:0;filter:blur(16px)}42%{opacity:1;filter:blur(0)}75%{transform:translate3d(0,0,0) scale(1);opacity:1}100%{transform:translate3d(0,-12px,130px) scale(1.32);opacity:0}}@keyframes tryammVerseRing{to{transform:rotate(360deg)}}@keyframes tryammVersePulse{50%{opacity:.55;transform:scale(1.08)}}'}</style>
    <div style={{...portal,animation:reduced?'none':'tryammVerseFly 760ms cubic-bezier(.18,.78,.18,1) both'}}>
      <div style={ringOuter}/><div style={ringInner}/>
      <div style={{position:'relative',zIndex:2,textAlign:'center',padding:24,maxWidth:430}}>
        <div style={{fontSize:10,letterSpacing:3.2,fontWeight:950,color:'#8af4ff'}}>HOLOGRAPHIC TRANSIT</div>
        <div style={{fontSize:'clamp(28px,7vw,58px)',lineHeight:1,fontWeight:1000,marginTop:8,textShadow:'0 0 28px #50e7ff'}}>{detail.label}</div>
        <div style={{display:'inline-flex',marginTop:10,padding:'5px 9px',borderRadius:999,border:'1px solid #75eeff66',fontSize:9,fontWeight:950,color:detail.status==='LIVE'?'#86ffb1':detail.status==='BUILDING'?'#ffd275':'#b9a6ff'}}>{detail.status}</div>
        <p style={{fontSize:11,lineHeight:1.5,color:'#c0dce6',margin:'12px auto 0'}}>{detail.purpose}</p>
      </div>
    </div>
  </div>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:2147483000,display:'grid',placeItems:'center',pointerEvents:'none',perspective:900,background:'radial-gradient(circle at 50% 50%,#073d5570,#02050bea 58%,#000 100%)',backdropFilter:'blur(5px)'}
const portal:React.CSSProperties={position:'relative',width:'min(88vw,560px)',aspectRatio:'1.35',display:'grid',placeItems:'center',transformStyle:'preserve-3d'}
const ringOuter:React.CSSProperties={position:'absolute',width:'78%',aspectRatio:'1',borderRadius:'50%',border:'3px solid #59ebff',boxShadow:'0 0 28px #59ebff, inset 0 0 28px #59ebff55',animation:'tryammVerseRing 3.2s linear infinite'}
const ringInner:React.CSSProperties={position:'absolute',width:'58%',aspectRatio:'1',borderRadius:'50%',border:'1px solid #d659ff',boxShadow:'0 0 42px #d659ff88',animation:'tryammVersePulse 900ms ease-in-out infinite'}