import { useEffect, useMemo, useRef, useState } from 'react'

type RemotePlayer={userId:string;x:number;z:number;heading?:number;vehicle?:boolean;vehicleType?:string;rideLabel?:string}
type PresenceDetail={players?:RemotePlayer[]}
type LocalPosition={x?:number;z?:number;heading?:number}
type Smoothed={x:number;z:number;heading:number}

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export default function StreetVerseSharedWorldAvatars(){
  const [players,setPlayers]=useState<RemotePlayer[]>([])
  const [local,setLocal]=useState({x:0,z:54,heading:0})
  const smoothRef=useRef(new Map<string,Smoothed>())
  const [,force]=useState(0)

  useEffect(()=>{
    const onPresence=(event:Event)=>setPlayers(((event as CustomEvent<PresenceDetail>).detail?.players||[]).slice(0,12))
    const onPosition=(event:Event)=>{const d=(event as CustomEvent<LocalPosition>).detail||{};if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))setLocal(v=>({x:Number(d.x),z:Number(d.z),heading:Number.isFinite(Number(d.heading))?Number(d.heading):v.heading}))}
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    addEventListener('tryamm:streetverse-player-position',onPosition)
    let raf=0
    const tick=()=>{
      for(const p of players){
        const current=smoothRef.current.get(p.userId)||{x:p.x,z:p.z,heading:Number(p.heading||0)}
        current.x+=(p.x-current.x)*.18
        current.z+=(p.z-current.z)*.18
        let dh=Number(p.heading||0)-current.heading
        while(dh>Math.PI)dh-=Math.PI*2
        while(dh<-Math.PI)dh+=Math.PI*2
        current.heading+=dh*.18
        smoothRef.current.set(p.userId,current)
      }
      const ids=new Set(players.map(p=>p.userId));for(const id of smoothRef.current.keys())if(!ids.has(id))smoothRef.current.delete(id)
      force(v=>(v+1)%100000)
      raf=requestAnimationFrame(tick)
    }
    raf=requestAnimationFrame(tick)
    return()=>{cancelAnimationFrame(raf);removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:streetverse-player-position',onPosition)}
  },[players])

  const visible=useMemo(()=>players.map(p=>{
    const s=smoothRef.current.get(p.userId)||{x:p.x,z:p.z,heading:Number(p.heading||0)}
    const dx=s.x-local.x,dz=s.z-local.z,distance=Math.hypot(dx,dz)
    const angle=Math.atan2(dx,-dz)-local.heading
    const forward=Math.cos(angle)*distance
    const side=Math.sin(angle)*distance
    const depth=clamp((forward+70)/140,0,1)
    return {...p,s,distance,forward,side,depth}
  }).filter(p=>p.distance<90&&p.forward>-24).sort((a,b)=>b.distance-a.distance).slice(0,8),[players,local])

  if(!visible.length)return null
  return <div aria-label="StreetVerse shared-world avatars" style={{position:'fixed',inset:0,zIndex:16920,pointerEvents:'none',overflow:'hidden',perspective:'700px'}}>
    {visible.map(p=>{
      const left=clamp(50+(p.side/Math.max(18,p.forward+48))*52,7,93)
      const bottom=clamp(12+(1-p.depth)*34,10,50)
      const scale=clamp(1.25-p.distance/115,.42,1.15)
      const ride=Boolean(p.vehicle)
      return <div key={p.userId} style={{position:'absolute',left:`${left}%`,bottom:`${bottom}%`,transform:`translate(-50%,50%) scale(${scale})`,transformOrigin:'50% 100%',filter:`drop-shadow(0 8px 8px rgba(0,0,0,.45))`,transition:'opacity .2s',opacity:clamp(1-p.distance/125,.35,1)}}>
        <div style={{textAlign:'center',fontFamily:'monospace',fontSize:8,fontWeight:950,color:'#dfffee',textShadow:'0 1px 4px #000',marginBottom:4}}>P{p.userId.slice(0,4).toUpperCase()} • {Math.round(p.distance)}m</div>
        {ride?<div style={{position:'relative',width:58,height:28,transform:`rotate(${clamp((p.s.heading-local.heading)*12,-16,16)}deg)`}}><div style={{position:'absolute',left:5,right:5,bottom:4,height:14,borderRadius:9,background:p.vehicleType==='powersport'?'linear-gradient(90deg,#ff7b2e,#ffd45c)':'linear-gradient(90deg,#32a6ff,#8fe8ff)',border:'2px solid #dff8ff'}}/><div style={{position:'absolute',left:19,top:2,width:21,height:12,borderRadius:'8px 8px 3px 3px',background:'#17354a',border:'2px solid #8de8ff'}}/><span style={{position:'absolute',left:1,bottom:0,width:12,height:12,borderRadius:99,background:'#111',border:'2px solid #555'}}/><span style={{position:'absolute',right:1,bottom:0,width:12,height:12,borderRadius:99,background:'#111',border:'2px solid #555'}}/></div>:<div style={{position:'relative',width:34,height:62}}><div style={{position:'absolute',left:9,top:13,width:16,height:30,borderRadius:10,background:'linear-gradient(#53f0c2,#1698a7)',border:'2px solid #d9fff4'}}/><div style={{position:'absolute',left:10,top:0,width:14,height:14,borderRadius:99,background:'#c9906d',border:'2px solid #ffe4cf'}}/><span style={{position:'absolute',left:5,top:22,width:6,height:27,borderRadius:6,background:'#44cdb0',transform:'rotate(8deg)'}}/><span style={{position:'absolute',right:5,top:22,width:6,height:27,borderRadius:6,background:'#44cdb0',transform:'rotate(-8deg)'}}/><span style={{position:'absolute',left:9,bottom:0,width:6,height:23,borderRadius:6,background:'#1f3344'}}/><span style={{position:'absolute',right:9,bottom:0,width:6,height:23,borderRadius:6,background:'#1f3344'}}/></div>}
        <div style={{marginTop:3,padding:'2px 5px',borderRadius:7,background:'rgba(2,14,18,.72)',border:'1px solid rgba(104,255,205,.35)',fontFamily:'monospace',fontSize:7,color:'#bfffdc',textAlign:'center',maxWidth:96,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ride?String(p.rideLabel||p.vehicleType||'RIDE').toUpperCase():'ONLINE PLAYER'}</div>
      </div>
    })}
  </div>
}
