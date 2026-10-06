import {useEffect,useMemo,useState} from 'react'

type Player={
  userId:string
  displayName?:string
  avatarUrl?:string
  x:number
  z:number
  vehicle?:boolean
  vehicleType?:string
  live?:boolean
  streamRoom?:string
  creatorMode?:boolean
}
type PresenceEvent={players?:Player[];online?:number}

const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join('')||'SV'

export default function StreetVerseWhoOnlineRail(){
  const [players,setPlayers]=useState<Player[]>([])
  const [online,setOnline]=useState(0)
  const [open,setOpen]=useState(false)

  useEffect(()=>{
    const onPresence=(event:Event)=>{
      const d=(event as CustomEvent<PresenceEvent>).detail||{}
      setPlayers(Array.isArray(d.players)?d.players:[])
      setOnline(Number(d.online||0))
    }
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    return()=>removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
  },[])

  const visible=useMemo(()=>[...players].sort((a,b)=>Number(Boolean(b.live))-Number(Boolean(a.live))||String(a.displayName||a.userId).localeCompare(String(b.displayName||b.userId))),[players])

  const join=(player:Player)=>{
    if(player.live&&player.streamRoom){
      const room=encodeURIComponent(player.streamRoom)
      window.location.href='/live?room='+room+'&from=streetverse'
      return
    }
    dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId:player.userId,action:'drop-request'}}))
  }
  const wave=(player:Player)=>dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId:player.userId,action:'wave'}}))

  if(!open)return <button aria-label="Open Who is Online" onClick={()=>setOpen(true)} style={pill}>👥 {online||1} ONLINE</button>

  return <aside aria-label="StreetVerse Who is Online" style={panel}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
      <div><div style={{fontSize:8,letterSpacing:1.8,color:'#78efff',fontWeight:950}}>STREETVERSE NOW</div><b>WHO'S ONLINE • {online||1}</b></div>
      <div style={{display:'flex',gap:5}}><button onClick={()=>{window.location.href='/live?from=streetverse&role=host'}} style={{...close,width:'auto',padding:'0 9px',borderColor:'#ff4a6f88'}}>🔴 GO LIVE</button><button aria-label="Collapse Who is Online" onClick={()=>setOpen(false)} style={close}>×</button></div>
    </div>
    <div style={{display:'flex',gap:8,overflowX:'auto',padding:'10px 1px 4px',scrollSnapType:'x mandatory'}}>
      {visible.length===0&&<div style={{minWidth:210,padding:9,borderRadius:12,border:'1px solid #294454',background:'#07151e',fontSize:10,color:'#91a9b5'}}>No other signed-in players are in this StreetVerse district yet.</div>}
      {visible.map(player=>{
        const name=String(player.displayName||'StreetVerse Player')
        return <article key={player.userId} style={card}>
          <div style={{position:'relative',width:48,height:48,margin:'0 auto'}}>
            {player.avatarUrl?<img alt="" src={player.avatarUrl} width={48} height={48} style={{width:48,height:48,borderRadius:'50%',objectFit:'cover',border:player.live?'3px solid #ff3d62':'2px solid #62e8ff'}}/>:<div style={{...avatar,borderColor:player.live?'#ff3d62':'#62e8ff'}}>{initials(name)}</div>}
            {player.live&&<span style={liveDot}>LIVE</span>}
          </div>
          <div style={{marginTop:6,fontSize:9,fontWeight:950,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</div>
          <div style={{fontSize:8,color:'#8ca4b0',marginTop:2}}>{player.live?'STREAMING':player.vehicle?'DRIVING':'IN WORLD'}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginTop:6}}>
            <button onClick={()=>wave(player)} style={mini}>👋</button>
            <button onClick={()=>join(player)} style={{...mini,borderColor:player.live?'#ff496b88':'#5de6ff77'}}>{player.live?'WATCH':'MEET'}</button>
          </div>
        </article>
      })}
    </div>
  </aside>
}

const pill:React.CSSProperties={position:'fixed',right:8,top:'calc(env(safe-area-inset-top, 0px) + 68px)',zIndex:17120,minHeight:38,padding:'0 10px',borderRadius:999,border:'1px solid #64eaff66',background:'#061722e8',color:'#fff',font:'950 9px system-ui',boxShadow:'0 6px 20px #0008',touchAction:'manipulation'}
const panel:React.CSSProperties={position:'fixed',left:8,right:8,top:'calc(env(safe-area-inset-top, 0px) + 58px)',zIndex:17120,padding:9,borderRadius:15,border:'1px solid #3e7084',background:'#041019f4',color:'#fff',boxShadow:'0 14px 40px #000c',backdropFilter:'blur(10px)',fontFamily:'system-ui'}
const card:React.CSSProperties={scrollSnapAlign:'start',minWidth:104,maxWidth:104,padding:8,borderRadius:13,border:'1px solid #294454',background:'#07151e',textAlign:'center'}
const avatar:React.CSSProperties={width:48,height:48,borderRadius:'50%',display:'grid',placeItems:'center',border:'2px solid #62e8ff',background:'radial-gradient(circle,#18394a,#0b1119)',fontSize:14,fontWeight:1000}
const liveDot:React.CSSProperties={position:'absolute',left:'50%',bottom:-3,transform:'translateX(-50%)',padding:'2px 5px',borderRadius:999,background:'#f32251',color:'#fff',fontSize:6,fontWeight:1000,letterSpacing:.8}
const mini:React.CSSProperties={minHeight:30,padding:'3px 5px',borderRadius:8,border:'1px solid #395666',background:'#0a202b',color:'#fff',fontSize:7,fontWeight:950,touchAction:'manipulation'}
const close:React.CSSProperties={width:34,height:34,borderRadius:9,border:'1px solid #ffffff33',background:'#111b23',color:'#fff',fontSize:18}
