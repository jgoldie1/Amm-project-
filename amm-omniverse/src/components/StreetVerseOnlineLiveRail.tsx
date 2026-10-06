import {useEffect,useMemo,useState} from 'react'
import type {HostShiftState} from '../runtime/CreatorHostShiftRuntime'

type PresencePlayer={userId:string;x:number;z:number;vehicle?:boolean;vehicleType?:string;rideLabel?:string}
type LiveDirectoryItem={userId:string;displayName?:string;roomName?:string;title?:string;verse?:string;live?:boolean;pkReady?:boolean;avatarUrl?:string;viewers?:number}

export default function StreetVerseOnlineLiveRail(){
  const [players,setPlayers]=useState<PresencePlayer[]>([])
  const [online,setOnline]=useState(0)
  const [live,setLive]=useState<Record<string,LiveDirectoryItem>>({})
  const [open,setOpen]=useState(false)
  const [shift,setShift]=useState<HostShiftState|null>(null)

  useEffect(()=>{
    const onPresence=(event:Event)=>{
      const d=(event as CustomEvent<{players?:PresencePlayer[];online?:number}>).detail||{}
      setPlayers(Array.isArray(d.players)?d.players:[])
      setOnline(Number(d.online)||0)
    }
    const onDirectory=(event:Event)=>{
      const d=(event as CustomEvent<{hosts?:LiveDirectoryItem[]}>).detail||{}
      const next:Record<string,LiveDirectoryItem>={}
      for(const h of d.hosts||[])if(h?.userId)next[h.userId]=h
      setLive(next)
    }
    const onShift=(event:Event)=>setShift((event as CustomEvent<HostShiftState>).detail||null)
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    addEventListener('tryamm:live-directory-state',onDirectory)
    addEventListener('tryamm:creator-host-shift-state',onShift)
    dispatchEvent(new CustomEvent('tryamm:live-directory-request',{detail:{source:'streetverse-online-rail'}}))
    return()=>{
      removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
      removeEventListener('tryamm:live-directory-state',onDirectory)
      removeEventListener('tryamm:creator-host-shift-state',onShift)
    }
  },[])

  const rows=useMemo(()=>players.map(p=>({...p,...live[p.userId]})),[players,live])
  const initials=(id:string)=>String(id||'P').slice(0,2).toUpperCase()
  const distance=(p:PresencePlayer)=>Math.round(Math.hypot(Number(p.x)||0,Number(p.z)||0))

  const wave=(id:string)=>dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId:id,action:'wave'}}))
  const drop=(id:string)=>dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId:id,action:'drop-request'}}))
  const pk=(item:LiveDirectoryItem)=>dispatchEvent(new CustomEvent('tryamm:pk-invite-request',{detail:{toUserId:item.userId,roomName:item.roomName||'',source:'streetverse-online-rail'}}))
  const watch=(item:LiveDirectoryItem)=>{
    if(item.roomName)dispatchEvent(new CustomEvent('tryamm:live-watch-room',{detail:{roomName:item.roomName,userId:item.userId,source:'streetverse-online-rail'}}))
    else dispatchEvent(new CustomEvent('tryamm:live-open',{detail:{source:'streetverse-online-rail'}}))
  }

  if(!open)return <button aria-label="Open who's online" onClick={()=>setOpen(true)} style={pill}>
    <span style={{color:'#78ffae'}}>●</span> {online||rows.length} ONLINE
    {Object.values(live).some(x=>x.live)&&<span style={{marginLeft:5,color:'#ff6b78'}}>• LIVE</span>}
  </button>

  return <aside aria-label="Who's online in StreetVerse" style={panel}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
      <div><div style={{fontSize:8,letterSpacing:1.7,color:'#71e8ff',fontWeight:950}}>WHO'S ONLINE • STREETVERSE</div><div style={{fontSize:10,color:'#b8cbd4'}}>{online||rows.length} connected • tap a player to interact</div></div>
      <button aria-label="Collapse online rail" onClick={()=>setOpen(false)} style={close}>×</button>
    </div>

    <div style={{display:'flex',gap:7,overflowX:'auto',padding:'8px 1px 4px',scrollSnapType:'x mandatory'}}>
      {rows.length===0?<div style={{fontSize:9,color:'#8297a3',padding:8}}>No nearby signed-in players yet. This rail will populate from realtime presence.</div>:rows.map(item=><article key={item.userId} style={card}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          {item.avatarUrl?<img src={item.avatarUrl} alt="" width="36" height="36" style={{borderRadius:'50%',objectFit:'cover',border:item.live?'2px solid #ff6677':'2px solid #5ee6ff'}}/>:<div style={{...avatar,borderColor:item.live?'#ff6677':'#5ee6ff'}}>{initials(item.userId)}</div>}
          <div style={{minWidth:0}}><b style={{fontSize:10}}>{item.displayName||'StreetVerse Player'}</b><div style={{fontSize:8,color:item.live?'#ff8793':'#8fb4c4'}}>{item.live?'🔴 LIVE':item.vehicle?'🚗 '+(item.vehicleType||'RIDING'):'● IN WORLD'} • {distance(item)}m</div></div>
        </div>
        {item.title&&<div style={{fontSize:8,color:'#d3e5ec',marginTop:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>}
        <div style={{display:'grid',gridTemplateColumns:item.live?'repeat(4,1fr)':'repeat(2,1fr)',gap:4,marginTop:7}}>
          <button onClick={()=>wave(item.userId)} style={mini}>👋</button>
          <button onClick={()=>drop(item.userId)} style={mini}>DROP</button>
          {item.live&&<button onClick={()=>watch(item)} style={mini}>WATCH</button>}
          {item.live&&<button onClick={()=>pk(item)} style={mini}>PK</button>}
        </div>
      </article>)}
    </div>

    <div style={hostStrip}>
      <div><b style={{fontSize:9}}>HOST SHIFT</b><div style={{fontSize:8,color:'#9ab0bb'}}>{shift?.active?`${shift.elapsedMinutes} min live • ${Math.round((shift.weeklyMinutes/60)*10)/10}/${shift.weeklyTargetHours}h week`:'Turn LIVE into a real creator schedule.'}</div></div>
      <button onClick={()=>dispatchEvent(new CustomEvent(shift?.active?'tryamm:creator-host-shift-stop':'tryamm:live-open',{detail:{source:'online-rail'}}))} style={hostButton}>{shift?.active?'END SHIFT':'GO LIVE'}</button>
    </div>
  </aside>
}

const pill:React.CSSProperties={position:'fixed',left:'max(8px,env(safe-area-inset-left))',top:'calc(env(safe-area-inset-top, 0px) + 66px)',zIndex:39930,minHeight:36,padding:'0 9px',borderRadius:999,border:'1px solid #45dff266',background:'rgba(4,16,25,.88)',color:'#fff',font:'950 8px system-ui',boxShadow:'0 5px 18px #0007',touchAction:'manipulation'}
const panel:React.CSSProperties={position:'fixed',left:8,right:8,top:'calc(env(safe-area-inset-top, 0px) + 58px)',zIndex:39930,maxHeight:'36dvh',padding:9,borderRadius:15,border:'1px solid #47cce666',background:'rgba(4,12,20,.95)',color:'#fff',boxShadow:'0 12px 42px #000a',backdropFilter:'blur(10px)',fontFamily:'system-ui'}
const card:React.CSSProperties={minWidth:178,maxWidth:178,scrollSnapAlign:'start',padding:8,borderRadius:12,border:'1px solid #26475a',background:'#071722'}
const avatar:React.CSSProperties={width:36,height:36,flex:'0 0 36px',borderRadius:'50%',display:'grid',placeItems:'center',border:'2px solid #5ee6ff',background:'#0b2635',fontSize:10,fontWeight:950}
const close:React.CSSProperties={width:30,height:30,borderRadius:9,border:'1px solid #ffffff33',background:'#111a22',color:'#fff',fontSize:18}
const mini:React.CSSProperties={minHeight:30,padding:'4px 5px',borderRadius:8,border:'1px solid #31566b',background:'#0b2230',color:'#fff',fontSize:7,fontWeight:950,touchAction:'manipulation'}
const hostStrip:React.CSSProperties={display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,marginTop:6,padding:8,borderRadius:10,border:'1px solid #634a9277',background:'linear-gradient(90deg,#120d20,#071824)'}
const hostButton:React.CSSProperties={minHeight:34,padding:'0 9px',borderRadius:9,border:'1px solid #ff5e7e88',background:'#2a0d18',color:'#fff',fontSize:8,fontWeight:950,touchAction:'manipulation'}