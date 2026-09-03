import { useEffect, useMemo, useState } from 'react'

type Player={userId:string;x:number;z:number;vehicle?:boolean;vehicleType?:string;rideLabel?:string}
type PresenceDetail={players?:Player[];online?:number}
type WorldEvent={id:string;label:string;detail:string;x:number;z:number;kind:'RACE'|'SOCIAL'|'CREATOR'|'RESCUE'}

const EVENTS:WorldEvent[]=[
  {id:'loop-rush',label:'LOOP RUSH',detail:'Open-world checkpoint sprint. Cars and powersports welcome.',x:0,z:0,kind:'RACE'},
  {id:'creator-jam',label:'CREATOR JAM',detail:'Meet, record reels and trigger a shared creator moment.',x:38,z:38,kind:'CREATOR'},
  {id:'market-meet',label:'MARKET MEET',detail:'Social meetup at All American Marketplace.',x:42,z:-24,kind:'SOCIAL'},
  {id:'lake-rescue',label:'LAKEFRONT RESPONSE',detail:'Co-op emergency response challenge near the lakefront.',x:72,z:58,kind:'RESCUE'},
]

export default function StreetVerseWorldEvents(){
  const [players,setPlayers]=useState<Player[]>([])
  const [position,setPosition]=useState({x:0,z:54})
  const [active,setActive]=useState<WorldEvent|null>(null)
  const [joined,setJoined]=useState(false)

  useEffect(()=>{
    const onPresence=(event:Event)=>setPlayers(((event as CustomEvent<PresenceDetail>).detail?.players||[]).slice(0,32))
    const onPosition=(event:Event)=>{const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{};if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))setPosition({x:Number(d.x),z:Number(d.z)})}
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    addEventListener('tryamm:streetverse-player-position',onPosition)
    return()=>{removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:streetverse-player-position',onPosition)}
  },[])

  const nearest=useMemo(()=>EVENTS.map(event=>({...event,distance:Math.hypot(event.x-position.x,event.z-position.z)})).sort((a,b)=>a.distance-b.distance)[0],[position])
  const nearby=players.filter(p=>Math.hypot(p.x-nearest.x,p.z-nearest.z)<24).length
  const join=()=>{setActive(nearest);setJoined(true);window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-event-join',{detail:{...nearest,joinedAt:new Date().toISOString()}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{id:`world-${nearest.id}`,label:nearest.label,type:'multiplayer-world-event',x:nearest.x,z:nearest.z}}))}
  const leave=()=>{setJoined(false);setActive(null);window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-event-leave',{detail:{id:active?.id||nearest.id}}))}

  return <div style={{position:'fixed',right:12,top:146,zIndex:16993,width:230,padding:'10px 11px',borderRadius:14,background:'linear-gradient(145deg,rgba(4,13,25,.94),rgba(17,5,31,.91))',border:'1px solid #9b7cff66',boxShadow:'0 12px 32px #0008',color:'#fff',fontFamily:'system-ui'}}>
    <div style={{fontSize:9,fontWeight:950,letterSpacing:1.2,color:'#bca8ff'}}>LIVING WORLD • LIVE EVENT</div>
    <div style={{fontSize:14,fontWeight:1000,marginTop:4}}>{(active||nearest).label}</div>
    <div style={{fontSize:10,opacity:.72,marginTop:3,lineHeight:1.35}}>{(active||nearest).detail}</div>
    <div style={{display:'flex',gap:7,marginTop:7,fontSize:9,fontFamily:'monospace'}}><span>{Math.round(nearest.distance)}m AWAY</span><span>•</span><span>{nearby} PLAYERS NEARBY</span></div>
    <button onClick={joined?leave:join} style={{marginTop:8,width:'100%',border:0,borderRadius:9,padding:'8px 9px',background:joined?'#321d4f':'linear-gradient(90deg,#7657ff,#d54cff)',color:'#fff',fontWeight:950,fontSize:10,cursor:'pointer'}}>{joined?'LEAVE EVENT':'JOIN LIVE EVENT'}</button>
  </div>
}
