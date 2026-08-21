import { useState } from 'react'
import PKBackchannelPanel from './PKBackchannelPanel'
import { useGameStore } from '../game/state/useGameStore'

export default function PKBackchannelLauncher(){
 const player=useGameStore(s=>s.player)
 const [roomId,setRoomId]=useState(()=>localStorage.getItem('tryamm.pk.room')||'tryamm-pk-main')
 const saveRoom=(value:string)=>{const clean=value.trim().replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80)||'tryamm-pk-main';setRoomId(clean);localStorage.setItem('tryamm.pk.room',clean)}
 return <div style={{position:'fixed',right:12,bottom:116,zIndex:8997,width:'min(390px,calc(100vw - 24px))'}}><details style={{borderRadius:14,background:'rgba(2,7,15,.88)',border:'1px solid rgba(79,227,255,.28)',padding:8}}><summary style={{cursor:'pointer',fontWeight:900,color:'#fff'}}>🎧 PK INTERNAL COMMS</summary><label style={{display:'grid',gap:5,color:'#aab8c8',fontSize:11,marginTop:8}}>PK room<input aria-label="PK room ID" defaultValue={roomId} onBlur={e=>saveRoom(e.target.value)} style={{padding:9,borderRadius:8,border:'1px solid #334155',background:'#071020',color:'#fff'}}/></label><PKBackchannelPanel roomId={roomId} displayName={player.name||'Player'} /></details></div>
}
