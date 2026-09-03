import { useEffect, useRef, useState } from 'react'

type MotionState={moving:boolean;running:boolean;facing:'front'|'back'|'left'|'right'}

export default function StreetVerseRiggedPlayerFallback(){
  const [motion,setMotion]=useState<MotionState>({moving:false,running:false,facing:'front'})
  const [label,setLabel]=useState('YOU')
  const last=useRef({x:NaN,z:NaN,t:0})
  const clearTimer=useRef<number|undefined>(undefined)

  useEffect(()=>{
    const onMove=(event:Event)=>{
      const detail=(event as CustomEvent<{x?:number;z?:number;character?:string}>).detail||{}
      const x=Number(detail.x),z=Number(detail.z),now=performance.now()
      if(Number.isFinite(x)&&Number.isFinite(z)){
        const prev=last.current
        let moving=false,running=false,facing:MotionState['facing']='front'
        if(Number.isFinite(prev.x)&&Number.isFinite(prev.z)){
          const dx=x-prev.x,dz=z-prev.z,dist=Math.hypot(dx,dz)
          const dt=Math.max(16,now-prev.t)
          moving=dist>.012
          running=dist/(dt/1000)>8
          if(Math.abs(dx)>Math.abs(dz))facing=dx>0?'right':'left'
          else if(Math.abs(dz)>.004)facing=dz>0?'front':'back'
        }
        setMotion(current=>({moving,running,facing:moving?facing:current.facing}))
        last.current={x,z,t:now}
        if(clearTimer.current)window.clearTimeout(clearTimer.current)
        clearTimer.current=window.setTimeout(()=>setMotion(current=>({...current,moving:false,running:false})),220)
      }
      if(detail.character)setLabel(String(detail.character))
    }
    window.addEventListener('tryamm:streetverse-player-position',onMove)
    return()=>{
      window.removeEventListener('tryamm:streetverse-player-position',onMove)
      if(clearTimer.current)window.clearTimeout(clearTimer.current)
    }
  },[])

  const pace=motion.running?'.26s':'.46s'
  const faceTransform=motion.facing==='left'?'scaleX(-1)':motion.facing==='back'?'scale(.94)':'none'
  return <div aria-label="StreetVerse living articulated player fallback" style={{position:'fixed',left:'50%',bottom:102,zIndex:16980,transform:'translateX(-50%)',pointerEvents:'none',display:'grid',placeItems:'center',filter:'drop-shadow(0 16px 22px #000c)'}}>
    <div style={{fontSize:8,fontWeight:950,letterSpacing:1.25,color:'#8ff6ff',background:'#04121dcc',border:'1px solid #4fe3ff77',borderRadius:999,padding:'5px 8px',marginBottom:4}}>LIVING RIG • {label} • {motion.running?'RUN':motion.moving?'WALK':'IDLE'}</div>
    <div style={{width:54,height:12,borderRadius:'50%',background:'radial-gradient(ellipse,#000b 0,#0006 48%,transparent 72%)',filter:'blur(1px)',transform:motion.moving?'scaleX(1.08)':'scaleX(.92)',transition:'transform .15s'}}/>
    <div style={{position:'relative',width:82,height:154,transformOrigin:'50% 100%',animation:motion.moving?`tryamm-rig-bob ${pace} linear infinite`:'tryamm-idle-breathe 2.8s ease-in-out infinite',transform:faceTransform}}>
      <div style={{position:'absolute',left:25,top:0,width:32,height:34,borderRadius:'50%',background:'linear-gradient(160deg,#ba7b56,#8f563b)',border:'2px solid #e8b944',animation:motion.moving?'tryamm-head-walk .7s ease-in-out infinite alternate':'tryamm-head-idle 3.2s ease-in-out infinite'}}>
        <div style={{position:'absolute',left:7,top:13,width:4,height:3,borderRadius:'50%',background:'#16110f'}}/><div style={{position:'absolute',right:7,top:13,width:4,height:3,borderRadius:'50%',background:'#16110f'}}/>
        <div style={{position:'absolute',left:11,top:24,width:10,height:2,borderRadius:2,background:'#5b2e24',opacity:.9}}/>
      </div>
      <div style={{position:'absolute',left:21,top:34,width:40,height:58,borderRadius:'17px 17px 10px 10px',background:'linear-gradient(180deg,#4fe3ff,#176b8a 72%,#0e4f69)',border:'2px solid #bff7ff',animation:motion.moving?`tryamm-torso-walk ${pace} ease-in-out infinite alternate`:'tryamm-torso-idle 2.8s ease-in-out infinite'}}/>
      <div style={{position:'absolute',left:7,top:40,width:15,height:60,borderRadius:10,background:'#a96e4c',transformOrigin:'50% 8px',animation:motion.moving?`tryamm-arm-left ${pace} ease-in-out infinite alternate`:'tryamm-arm-idle-left 2.4s ease-in-out infinite'}}/>
      <div style={{position:'absolute',right:7,top:40,width:15,height:60,borderRadius:10,background:'#a96e4c',transformOrigin:'50% 8px',animation:motion.moving?`tryamm-arm-right ${pace} ease-in-out infinite alternate`:'tryamm-arm-idle-right 2.4s ease-in-out infinite'}}/>
      <div style={{position:'absolute',left:22,top:88,width:15,height:57,borderRadius:9,background:'linear-gradient(180deg,#283548,#17212f)',transformOrigin:'50% 6px',animation:motion.moving?`tryamm-leg-left ${pace} ease-in-out infinite alternate`:'none'}}/>
      <div style={{position:'absolute',right:22,top:88,width:15,height:57,borderRadius:9,background:'linear-gradient(180deg,#283548,#17212f)',transformOrigin:'50% 6px',animation:motion.moving?`tryamm-leg-right ${pace} ease-in-out infinite alternate`:'none'}}/>
      <div style={{position:'absolute',left:17,top:140,width:24,height:9,borderRadius:'7px 9px 4px 4px',background:'#0b0f14',transformOrigin:'100% 50%',animation:motion.moving?`tryamm-foot-left ${pace} ease-in-out infinite alternate`:'none'}}/>
      <div style={{position:'absolute',right:17,top:140,width:24,height:9,borderRadius:'9px 7px 4px 4px',background:'#0b0f14',transformOrigin:'0% 50%',animation:motion.moving?`tryamm-foot-right ${pace} ease-in-out infinite alternate`:'none'}}/>
    </div>
    <style>{`
      @keyframes tryamm-idle-breathe{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-1px) scaleY(1.012)}}
      @keyframes tryamm-head-idle{0%,100%{transform:rotate(0deg) translateY(0)}35%{transform:rotate(1.2deg) translateY(-1px)}70%{transform:rotate(-1deg)}}
      @keyframes tryamm-head-walk{from{transform:rotate(-2deg)}to{transform:rotate(2deg)}}
      @keyframes tryamm-torso-idle{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.018)}}
      @keyframes tryamm-torso-walk{from{transform:rotate(-1.8deg)}to{transform:rotate(1.8deg)}}
      @keyframes tryamm-rig-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      @keyframes tryamm-arm-left{from{transform:rotate(26deg)}to{transform:rotate(-30deg)}}
      @keyframes tryamm-arm-right{from{transform:rotate(-30deg)}to{transform:rotate(26deg)}}
      @keyframes tryamm-arm-idle-left{0%,100%{transform:rotate(5deg)}50%{transform:rotate(1deg)}}
      @keyframes tryamm-arm-idle-right{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(-1deg)}}
      @keyframes tryamm-leg-left{from{transform:rotate(-18deg)}to{transform:rotate(20deg)}}
      @keyframes tryamm-leg-right{from{transform:rotate(20deg)}to{transform:rotate(-18deg)}}
      @keyframes tryamm-foot-left{from{transform:rotate(6deg)}to{transform:rotate(-7deg)}}
      @keyframes tryamm-foot-right{from{transform:rotate(-7deg)}to{transform:rotate(6deg)}}
    `}</style>
  </div>
}
