import { useEffect, useMemo, useState } from 'react'

type RemotePlayer={userId:string;x:number;z:number;heading?:number;vehicle?:boolean;vehicleType?:string;rideLabel?:string}
type PresenceDetail={players?:RemotePlayer[]}
type LocalPosition={x?:number;z?:number;heading?:number}

export default function StreetVerseRemotePlayerMarkers(){
  const [players,setPlayers]=useState<RemotePlayer[]>([])
  const [local,setLocal]=useState({x:0,z:54,heading:0})
  useEffect(()=>{
    const onPresence=(event:Event)=>setPlayers(((event as CustomEvent<PresenceDetail>).detail?.players||[]).slice(0,10))
    const onPosition=(event:Event)=>{
      const d=(event as CustomEvent<LocalPosition>).detail||{}
      if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))setLocal(v=>({x:Number(d.x),z:Number(d.z),heading:Number.isFinite(Number(d.heading))?Number(d.heading):v.heading}))
    }
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    addEventListener('tryamm:streetverse-player-position',onPosition)
    return()=>{removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:streetverse-player-position',onPosition)}
  },[])

  const visible=useMemo(()=>players.map(p=>{
    const dx=p.x-local.x,dz=p.z-local.z,distance=Math.hypot(dx,dz)
    const angle=Math.atan2(dx,-dz)-local.heading
    const forward=Math.cos(angle)*distance
    const side=Math.sin(angle)*distance
    const depth=Math.max(12,Math.min(120,forward+45))
    const left=Math.max(8,Math.min(92,50+(side/Math.max(24,depth))*52))
    const top=Math.max(18,Math.min(78,60-(forward/120)*38))
    const scale=Math.max(.48,Math.min(1.12,1.15-distance/180))
    return {...p,distance,left,top,scale}
  }).filter(p=>p.distance<115).sort((a,b)=>b.distance-a.distance).slice(0,8),[players,local])

  if(!visible.length)return null
  return <div aria-label="StreetVerse remote players" style={{position:'fixed',inset:0,zIndex:16920,pointerEvents:'none',overflow:'hidden'}}>
    {visible.map(p=>{
      const driving=Boolean(p.vehicle)
      return <div key={p.userId} style={{position:'absolute',left:`${p.left}%`,top:`${p.top}%`,transform:`translate(-50%,-100%) scale(${p.scale})`,transformOrigin:'50% 100%',filter:'drop-shadow(0 8px 10px #000b)',transition:'left 90ms linear, top 90ms linear, transform 90ms linear'}}>
        <div style={{display:'grid',placeItems:'center'}}>
          <div style={{padding:'3px 7px',borderRadius:999,background:'#031019dd',border:'1px solid #71ffc088',color:'#dffff0',fontFamily:'monospace',fontSize:8,fontWeight:950,whiteSpace:'nowrap',boxShadow:'0 0 14px #70ffb033'}}>PLAYER {p.userId.slice(0,4).toUpperCase()} • {Math.round(p.distance)}m</div>
          {driving?<div style={{marginTop:4,width:46,height:22,borderRadius:'10px 13px 7px 7px',background:'linear-gradient(180deg,#44d8ff,#14516d)',border:'2px solid #b8f3ff',boxShadow:'inset 0 -5px #082c3c,0 0 18px #45dfff55',position:'relative'}}><span style={{position:'absolute',left:5,bottom:-5,width:9,height:9,borderRadius:999,background:'#111',border:'1px solid #aaa'}}/><span style={{position:'absolute',right:5,bottom:-5,width:9,height:9,borderRadius:999,background:'#111',border:'1px solid #aaa'}}/><span style={{position:'absolute',left:'50%',top:4,transform:'translateX(-50%)',fontSize:7,color:'#fff',fontFamily:'monospace',fontWeight:900}}>{String(p.rideLabel||p.vehicleType||'RIDE').slice(0,8).toUpperCase()}</span></div>:<div style={{marginTop:4,width:22,height:48,position:'relative'}}><span style={{position:'absolute',left:6,top:0,width:11,height:11,borderRadius:999,background:'#a9eaff',border:'2px solid #d8f8ff'}}/><span style={{position:'absolute',left:7,top:12,width:9,height:20,borderRadius:8,background:'linear-gradient(180deg,#63e4ff,#276f8d)',border:'1px solid #bdefff'}}/><span style={{position:'absolute',left:1,top:16,width:5,height:21,borderRadius:5,background:'#55bdd5',transform:'rotate(10deg)'}}/><span style={{position:'absolute',right:1,top:16,width:5,height:21,borderRadius:5,background:'#55bdd5',transform:'rotate(-10deg)'}}/><span style={{position:'absolute',left:5,top:30,width:5,height:18,borderRadius:5,background:'#20384a',transform:'rotate(5deg)'}}/><span style={{position:'absolute',right:5,top:30,width:5,height:18,borderRadius:5,background:'#20384a',transform:'rotate(-5deg)'}}/></div>}
        </div>
      </div>
    })}
  </div>
}
