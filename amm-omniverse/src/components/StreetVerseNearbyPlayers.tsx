import { useEffect, useMemo, useState } from 'react'

type RemotePlayer={userId:string;x:number;z:number;heading?:number;vehicle?:boolean;vehicleType?:string;rideLabel?:string}
type PresenceDetail={players?:RemotePlayer[];online?:number}
type LocalPosition={x?:number;z?:number}

export default function StreetVerseNearbyPlayers(){
  const [players,setPlayers]=useState<RemotePlayer[]>([])
  const [local,setLocal]=useState({x:0,z:54})
  useEffect(()=>{
    const onPresence=(event:Event)=>setPlayers(((event as CustomEvent<PresenceDetail>).detail?.players||[]).slice(0,12))
    const onPosition=(event:Event)=>{const d=(event as CustomEvent<LocalPosition>).detail||{};if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))setLocal({x:Number(d.x),z:Number(d.z)})}
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    addEventListener('tryamm:streetverse-player-position',onPosition)
    return()=>{removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:streetverse-player-position',onPosition)}
  },[])
  const nearby=useMemo(()=>players.map(p=>({...p,distance:Math.hypot(p.x-local.x,p.z-local.z)})).sort((a,b)=>a.distance-b.distance).slice(0,5),[players,local])
  if(!nearby.length)return null
  return <aside aria-label="Nearby StreetVerse players" style={{position:'fixed',left:12,top:106,zIndex:16994,width:190,padding:10,borderRadius:14,background:'#04131de8',border:'1px solid #70ffb055',boxShadow:'0 10px 30px #0008',color:'#eafff2',fontFamily:'monospace',pointerEvents:'none'}}>
    <div style={{fontSize:8,fontWeight:950,letterSpacing:1.2,color:'#80ffc0'}}>NEARBY PLAYERS</div>
    <div style={{display:'grid',gap:6,marginTop:7}}>{nearby.map((p,i)=><div key={p.userId} style={{display:'grid',gridTemplateColumns:'20px 1fr auto',gap:6,alignItems:'center',padding:'5px 6px',borderRadius:9,background:'#071c20bb'}}><span aria-hidden style={{width:17,height:17,borderRadius:999,display:'grid',placeItems:'center',background:'#123a3e',fontSize:8}}>{i+1}</span><span style={{minWidth:0}}><b style={{display:'block',fontSize:8,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>PLAYER {p.userId.slice(0,4).toUpperCase()}</b><span style={{display:'block',fontSize:7,color:'#86aeb0',marginTop:2}}>{p.vehicle?String(p.rideLabel||p.vehicleType||'VEHICLE').toUpperCase():'ON FOOT'}</span></span><b style={{fontSize:8,color:'#bfffd8'}}>{Math.round(p.distance)}m</b></div>)}</div>
  </aside>
}
