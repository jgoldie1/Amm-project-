import {useEffect,useMemo,useState} from 'react'

type Player={userId:string;displayName?:string;avatarUrl?:string;x:number;z:number;vehicle?:boolean;vehicleType?:string;live?:boolean;streamRoom?:string;creatorMode?:boolean}
type PresenceEvent={players?:Player[];online?:number}

const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join('')||'SV'

export default function StreetVerseNowDrawer(){
 const [players,setPlayers]=useState<Player[]>([])
 const [online,setOnline]=useState(0)
 const [open,setOpen]=useState(false)
 const [liveReady,setLiveReady]=useState<boolean|null>(null)

 useEffect(()=>{
  const onPresence=(event:Event)=>{const d=(event as CustomEvent<PresenceEvent>).detail||{};setPlayers(Array.isArray(d.players)?d.players:[]);setOnline(Number(d.online||0))}
  const onOpen=()=>setOpen(true)
  addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
  addEventListener('tryamm:streetverse-now-open',onOpen)
  fetch('/api/live/status',{cache:'no-store'}).then(r=>r.json()).then(body=>setLiveReady(Boolean(body?.readyForPublic))).catch(()=>setLiveReady(false))
  return()=>{removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:streetverse-now-open',onOpen)}
 },[])

 const ranked=useMemo(()=>[...players].sort((a,b)=>Number(Boolean(b.live))-Number(Boolean(a.live))||Number(Boolean(b.creatorMode))-Number(Boolean(a.creatorMode))||String(a.displayName||a.userId).localeCompare(String(b.displayName||b.userId))),[players])
 const liveCount=ranked.filter(p=>p.live).length

 const watch=(p:Player)=>{if(p.live&&p.streamRoom){location.href='/live?room='+encodeURIComponent(p.streamRoom)+'&from=streetverse';return}dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId:p.userId,action:'drop-request'}}));setOpen(false)}
 const wave=(p:Player)=>dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId:p.userId,action:'wave'}}))
 const invite=(p:Player,kind:'pk'|'cohost')=>{dispatchEvent(new CustomEvent('tryamm:streetverse-live-invite-request',{detail:{toUserId:p.userId,kind,source:'streetverse-now'}}));if(p.live&&p.streamRoom)location.href='/live?room='+encodeURIComponent(p.streamRoom)+'&from=streetverse&invite='+kind}
 const goLive=()=>{if(liveReady)location.href='/live?from=streetverse&role=host';else setOpen(true)}

 if(!open)return <button aria-label="Open StreetVerse Now" onClick={()=>setOpen(true)} style={pill}>● NOW {online||1}{liveCount?` • ${liveCount} LIVE`:''}</button>

 return <aside aria-label="StreetVerse Now" style={panel}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
   <div><div style={{fontSize:8,letterSpacing:2,color:'#7be9ff',fontWeight:950}}>STREETVERSE NOW</div><b>WHO'S ONLINE • {online||1}</b></div>
   <div style={{display:'flex',gap:5}}><button onClick={goLive} style={{...btn,borderColor:'#ff4b6e88'}}>🔴 GO LIVE</button><button onClick={()=>setOpen(false)} aria-label="Close StreetVerse Now" style={close}>×</button></div>
  </div>
  {liveReady===false&&<div style={gate}>LIVE discovery is ready, but production camera/mic still needs the LiveKit provider credentials before public broadcasting can start.</div>}
  <div style={{display:'flex',gap:8,overflowX:'auto',scrollSnapType:'x mandatory',padding:'10px 1px 3px'}}>
   {ranked.length===0&&<div style={empty}>No other signed-in players are in this district yet. Your profile becomes discoverable here when you join StreetVerse.</div>}
   {ranked.map(p=>{const name=String(p.displayName||'StreetVerse Player');return <article key={p.userId} style={card}>
    <div style={{position:'relative',width:54,height:54,margin:'0 auto'}}>{p.avatarUrl?<img src={p.avatarUrl} alt="" width={54} height={54} style={{width:54,height:54,borderRadius:'50%',objectFit:'cover',border:p.live?'3px solid #ff3e63':'2px solid #65eaff'}}/>:<div style={{...avatar,borderColor:p.live?'#ff3e63':'#65eaff'}}>{initials(name)}</div>}{p.live&&<span style={live}>LIVE</span>}</div>
    <div style={{marginTop:7,fontSize:9,fontWeight:950,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</div>
    <div style={{fontSize:8,color:'#8da6b2',marginTop:2}}>{p.live?'STREAMING':p.vehicle?'DRIVING':p.creatorMode?'CREATING':'IN WORLD'}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4,marginTop:7}}><button onClick={()=>wave(p)} style={mini}>👋</button><button onClick={()=>watch(p)} style={{...mini,borderColor:p.live?'#ff4b6e88':'#5fe9ff77'}}>{p.live?'WATCH':'MEET'}</button>{p.live&&<><button onClick={()=>invite(p,'pk')} style={mini}>⚔ PK</button><button onClick={()=>invite(p,'cohost')} style={mini}>🎙 COHOST</button></>}</div>
   </article>})}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginTop:8}}><button onClick={()=>location.href='/reels'} style={btn}>▶ REELS</button><button onClick={()=>location.href='/live'} style={btn}>● LIVE</button><button onClick={()=>dispatchEvent(new CustomEvent('tryamm:mini-panel-open',{detail:{tab:'social',source:'streetverse-now'}}))} style={btn}>👥 SOCIAL</button></div>
 </aside>
}

const pill:React.CSSProperties={position:'fixed',right:8,top:'calc(env(safe-area-inset-top,0px) + 68px)',zIndex:17130,minHeight:38,padding:'0 10px',borderRadius:999,border:'1px solid #65eaff66',background:'#061722e8',color:'#fff',font:'950 9px system-ui',boxShadow:'0 6px 20px #0008',touchAction:'manipulation'}
const panel:React.CSSProperties={position:'fixed',left:8,right:8,top:'calc(env(safe-area-inset-top,0px) + 58px)',zIndex:17130,padding:9,borderRadius:15,border:'1px solid #3e7084',background:'#041019f5',color:'#fff',boxShadow:'0 14px 40px #000c',backdropFilter:'blur(10px)',fontFamily:'system-ui',maxHeight:'56dvh',overflowY:'auto'}
const card:React.CSSProperties={scrollSnapAlign:'start',minWidth:116,maxWidth:116,padding:8,borderRadius:13,border:'1px solid #294454',background:'#07151e',textAlign:'center'}
const avatar:React.CSSProperties={width:54,height:54,borderRadius:'50%',display:'grid',placeItems:'center',border:'2px solid #65eaff',background:'radial-gradient(circle,#18394a,#0b1119)',fontSize:15,fontWeight:1000}
const live:React.CSSProperties={position:'absolute',left:'50%',bottom:-3,transform:'translateX(-50%)',padding:'2px 5px',borderRadius:999,background:'#f32251',color:'#fff',fontSize:6,fontWeight:1000,letterSpacing:.8}
const btn:React.CSSProperties={minHeight:38,padding:'6px 8px',borderRadius:9,border:'1px solid #365766',background:'#0a202b',color:'#fff',fontSize:8,fontWeight:950,touchAction:'manipulation'}
const mini:React.CSSProperties={minHeight:30,padding:'3px 5px',borderRadius:8,border:'1px solid #395666',background:'#0a202b',color:'#fff',fontSize:7,fontWeight:950,touchAction:'manipulation'}
const close:React.CSSProperties={width:34,height:34,borderRadius:9,border:'1px solid #ffffff33',background:'#111b23',color:'#fff',fontSize:18}
const gate:React.CSSProperties={marginTop:8,padding:8,borderRadius:10,border:'1px solid #f0bd5666',background:'#291d08',color:'#ffe1a1',fontSize:9,lineHeight:1.45}
const empty:React.CSSProperties={minWidth:220,padding:10,borderRadius:12,border:'1px solid #294454',background:'#07151e',fontSize:10,color:'#91a9b5'}