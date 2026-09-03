import { useEffect, useMemo, useState } from 'react'

type RemotePlayer={userId:string;x:number;z:number;vehicle?:boolean;vehicleType?:string;rideLabel?:string}
type PresenceDetail={players?:RemotePlayer[]}
type LocalPosition={x?:number;z?:number}
type PlayerAction={fromUserId:string;toUserId:string;action:'wave'|'crew-invite'|'race-challenge';sentAt:string}

const ACTION_LABELS:Record<PlayerAction['action'],string>={wave:'WAVE', 'crew-invite':'CREW INVITE','race-challenge':'RACE CHALLENGE'}

export default function StreetVersePlayerInteractions(){
  const [players,setPlayers]=useState<RemotePlayer[]>([])
  const [local,setLocal]=useState({x:0,z:54})
  const [notice,setNotice]=useState('')
  useEffect(()=>{
    const onPresence=(event:Event)=>setPlayers(((event as CustomEvent<PresenceDetail>).detail?.players||[]).slice(0,12))
    const onPosition=(event:Event)=>{const d=(event as CustomEvent<LocalPosition>).detail||{};if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))setLocal({x:Number(d.x),z:Number(d.z)})}
    const onAction=(event:Event)=>{const d=(event as CustomEvent<PlayerAction>).detail;if(!d)return;setNotice(`PLAYER ${d.fromUserId.slice(0,4).toUpperCase()} • ${ACTION_LABELS[d.action]}`);window.setTimeout(()=>setNotice(''),4200)}
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    addEventListener('tryamm:streetverse-player-position',onPosition)
    addEventListener('tryamm:streetverse-player-action-received',onAction)
    return()=>{removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:streetverse-player-position',onPosition);removeEventListener('tryamm:streetverse-player-action-received',onAction)}
  },[])
  const nearest=useMemo(()=>players.map(p=>({...p,distance:Math.hypot(p.x-local.x,p.z-local.z)})).sort((a,b)=>a.distance-b.distance)[0],[players,local])
  const send=(action:PlayerAction['action'])=>{if(!nearest)return;window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId:nearest.userId,action}}));setNotice(`${ACTION_LABELS[action]} → PLAYER ${nearest.userId.slice(0,4).toUpperCase()}`);window.setTimeout(()=>setNotice(''),2600)}
  if(!nearest&&!notice)return null
  return <div style={{position:'fixed',right:12,top:110,zIndex:16996,width:220,padding:10,borderRadius:15,background:'#08111deb',border:'1px solid #8b7cff66',boxShadow:'0 12px 34px #0009',color:'#fff',fontFamily:'monospace'}}>
    <div style={{fontSize:8,fontWeight:950,letterSpacing:1.3,color:'#b7a9ff'}}>PLAYER INTERACTIONS</div>
    {nearest&&<><div style={{marginTop:7,fontSize:10}}><b>PLAYER {nearest.userId.slice(0,4).toUpperCase()}</b> • {Math.round(nearest.distance)}m</div><div style={{fontSize:8,color:'#9aa9b8',marginTop:3}}>{nearest.vehicle?String(nearest.rideLabel||nearest.vehicleType||'vehicle').toUpperCase():'ON FOOT'}</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5,marginTop:8}}><button onClick={()=>send('wave')} style={btn}>👋<br/>WAVE</button><button onClick={()=>send('crew-invite')} style={btn}>👥<br/>CREW</button><button onClick={()=>send('race-challenge')} style={btn}>🏁<br/>RACE</button></div></>}
    {notice&&<div role="status" style={{marginTop:8,padding:'7px 8px',borderRadius:9,background:'#15112a',border:'1px solid #8b7cff44',fontSize:8,color:'#ded8ff'}}>{notice}</div>}
  </div>
}
const btn={border:'1px solid #8b7cff55',borderRadius:9,background:'#111526',color:'#fff',padding:'7px 4px',fontSize:7,fontWeight:900,cursor:'pointer'}
