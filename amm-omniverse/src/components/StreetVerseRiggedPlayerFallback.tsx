import { useEffect, useRef, useState } from 'react'

export default function StreetVerseRiggedPlayerFallback(){
  const [moving,setMoving]=useState(false)
  const [label,setLabel]=useState('YOU')
  const last=useRef({x:NaN,z:NaN,t:0})

  useEffect(()=>{
    const onMove=(event:Event)=>{
      const detail=(event as CustomEvent<{x?:number;z?:number;character?:string}>).detail||{}
      const x=Number(detail.x),z=Number(detail.z),now=performance.now()
      if(Number.isFinite(x)&&Number.isFinite(z)){
        const prev=last.current
        const changed=Number.isFinite(prev.x)&&Math.hypot(x-prev.x,z-prev.z)>.015
        setMoving(changed)
        last.current={x,z,t:now}
        window.setTimeout(()=>{if(performance.now()-last.current.t>180)setMoving(false)},220)
      }
      if(detail.character)setLabel(String(detail.character))
    }
    window.addEventListener('tryamm:streetverse-player-position',onMove)
    return()=>window.removeEventListener('tryamm:streetverse-player-position',onMove)
  },[])

  return <div aria-label="StreetVerse articulated player fallback" style={{position:'fixed',left:'50%',bottom:108,zIndex:16980,transform:'translateX(-50%)',pointerEvents:'none',display:'grid',placeItems:'center',filter:'drop-shadow(0 12px 18px #000b)'}}>
    <div style={{fontSize:8,fontWeight:950,letterSpacing:1.4,color:'#8ff6ff',background:'#04121dcc',border:'1px solid #4fe3ff77',borderRadius:999,padding:'5px 8px',marginBottom:4}}>RIG FALLBACK • {label}</div>
    <div style={{position:'relative',width:76,height:150,transformOrigin:'50% 100%',animation:moving?'tryamm-rig-bob .34s linear infinite':'none'}}>
      <div style={{position:'absolute',left:25,top:3,width:28,height:28,borderRadius:'50%',background:'#a96e4c',border:'2px solid #e8b944'}}/>
      <div style={{position:'absolute',left:21,top:32,width:36,height:58,borderRadius:'16px 16px 10px 10px',background:'linear-gradient(180deg,#4fe3ff,#176b8a)',border:'2px solid #bff7ff'}}/>
      <div style={{position:'absolute',left:8,top:39,width:14,height:58,borderRadius:10,background:'#a96e4c',transformOrigin:'50% 8px',animation:moving?'tryamm-arm-left .55s ease-in-out infinite alternate':'none'}}/>
      <div style={{position:'absolute',right:8,top:39,width:14,height:58,borderRadius:10,background:'#a96e4c',transformOrigin:'50% 8px',animation:moving?'tryamm-arm-right .55s ease-in-out infinite alternate':'none'}}/>
      <div style={{position:'absolute',left:23,top:86,width:14,height:55,borderRadius:9,background:'#202936',transformOrigin:'50% 6px',animation:moving?'tryamm-leg-left .55s ease-in-out infinite alternate':'none'}}/>
      <div style={{position:'absolute',right:23,top:86,width:14,height:55,borderRadius:9,background:'#202936',transformOrigin:'50% 6px',animation:moving?'tryamm-leg-right .55s ease-in-out infinite alternate':'none'}}/>
    </div>
    <style>{`@keyframes tryamm-rig-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes tryamm-arm-left{from{transform:rotate(22deg)}to{transform:rotate(-22deg)}}@keyframes tryamm-arm-right{from{transform:rotate(-22deg)}to{transform:rotate(22deg)}}@keyframes tryamm-leg-left{from{transform:rotate(-15deg)}to{transform:rotate(15deg)}}@keyframes tryamm-leg-right{from{transform:rotate(15deg)}to{transform:rotate(-15deg)}}`}</style>
  </div>
}
