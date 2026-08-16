import { useEffect, useState } from 'react'

type OverlayMode = 'off' | 'ambient' | 'creator' | 'cinema' | 'game' | 'access'
type Props = { defaultMode?: OverlayMode }

export default function HolographicOverlay({ defaultMode='ambient' }: Props) {
  const [mode,setMode]=useState<OverlayMode>(defaultMode)
  const [visible,setVisible]=useState(defaultMode!=='off')
  const [message,setMessage]=useState('HOLO CORE ONLINE')
  const [intensity,setIntensity]=useState(62)

  useEffect(()=>{
    const handler=(event:Event)=>{
      const detail=(event as CustomEvent).detail||{}
      if(detail.mode) { setMode(detail.mode); setVisible(detail.mode!=='off') }
      if(typeof detail.visible==='boolean') setVisible(detail.visible)
      if(detail.message) setMessage(String(detail.message).slice(0,120))
      if(Number.isFinite(detail.intensity)) setIntensity(Math.max(0,Math.min(100,Number(detail.intensity))))
    }
    window.addEventListener('tryamm:holo-overlay',handler)
    return ()=>window.removeEventListener('tryamm:holo-overlay',handler)
  },[])

  if(!visible||mode==='off') return null
  const alpha=.12+(intensity/100)*.22
  return <div aria-hidden="true" data-holo-overlay={mode} style={{position:'fixed',inset:0,zIndex:8800,pointerEvents:'none',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,background:`repeating-linear-gradient(180deg,rgba(79,227,255,${alpha*.18}) 0 1px,transparent 1px 5px)`}} />
    <div style={{position:'absolute',left:'50%',top:'50%',width:'min(76vw,760px)',aspectRatio:'1',transform:'translate(-50%,-50%)',borderRadius:'50%',border:`1px solid rgba(79,227,255,${alpha+.15})`,boxShadow:`0 0 55px rgba(79,227,255,${alpha}), inset 0 0 55px rgba(232,185,68,${alpha*.55})`}} />
    <div style={{position:'absolute',left:18,top:18,padding:'7px 10px',border:'1px solid rgba(79,227,255,.42)',borderRadius:10,background:'rgba(2,8,18,.44)',color:'#8ff5ff',font:'700 10px monospace',letterSpacing:1.4}}>{message} · {mode.toUpperCase()}</div>
    <div style={{position:'absolute',right:18,bottom:18,padding:'6px 9px',border:'1px solid rgba(232,185,68,.38)',borderRadius:999,background:'rgba(2,8,18,.42)',color:'#ffe493',font:'700 9px monospace'}}>QUANTUM BEAT™ SYNC · HOLO OVERLAY</div>
  </div>
}

export function setHoloOverlay(detail:{mode?:OverlayMode;visible?:boolean;message?:string;intensity?:number}){
  window.dispatchEvent(new CustomEvent('tryamm:holo-overlay',{detail}))
}
