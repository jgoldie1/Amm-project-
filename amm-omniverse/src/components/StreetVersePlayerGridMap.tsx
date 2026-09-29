import {useEffect,useMemo,useState} from 'react'
import {CHICAGO_WORLD_MAX,CHICAGO_WORLD_MIN,nearestChicagoPlace,worldToChicagoGridCell} from '../data/StreetVerseChicagoGrid'

type RemotePlayer={userId:string;x:number;z:number;vehicle?:boolean;vehicleType?:string}
type PresenceDetail={players?:RemotePlayer[]}
type Action={fromUserId:string;toUserId:string;action:'drop-request'|'drop-accept'|'drop-decline';sentAt:string;x?:number;z?:number}

const pct=(v:number)=>Math.max(3,Math.min(97,((v-CHICAGO_WORLD_MIN)/(CHICAGO_WORLD_MAX-CHICAGO_WORLD_MIN))*100))

export default function StreetVersePlayerGridMap(){
 const [open,setOpen]=useState(false)
 const [players,setPlayers]=useState<RemotePlayer[]>([])
 const [local,setLocal]=useState({x:0,z:54})
 const [incoming,setIncoming]=useState<Action|null>(null)
 const [notice,setNotice]=useState('')
 useEffect(()=>{
  const onPresence=(e:Event)=>setPlayers(((e as CustomEvent<PresenceDetail>).detail?.players||[]).slice(0,24))
  const onPosition=(e:Event)=>{const d=(e as CustomEvent<{x?:number;z?:number}>).detail||{};if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))setLocal({x:Number(d.x),z:Number(d.z)})}
  const onAction=(e:Event)=>{const d=(e as CustomEvent<Action>).detail;if(!d)return;if(d.action==='drop-request'){setIncoming(d);setOpen(true);setNotice(`PLAYER ${d.fromUserId.slice(0,4).toUpperCase()} wants to drop into your area.`)}else if(d.action==='drop-accept'&&Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z))){window.dispatchEvent(new CustomEvent('tryamm:streetverse-drop-to-player',{detail:{userId:d.fromUserId,x:Number(d.x),z:Number(d.z),consent:true}}));setNotice('Drop-in accepted • moving you near the player.');setOpen(false)}else if(d.action==='drop-decline'){setNotice('Drop-in request declined.')}}
  addEventListener('tryamm:streetverse-multiplayer-presence',onPresence);addEventListener('tryamm:streetverse-player-position',onPosition);addEventListener('tryamm:streetverse-player-action-received',onAction)
  return()=>{removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:streetverse-player-position',onPosition);removeEventListener('tryamm:streetverse-player-action-received',onAction)}
 },[])
 const nearest=useMemo(()=>players.map(p=>({...p,distance:Math.hypot(p.x-local.x,p.z-local.z),cell:worldToChicagoGridCell(p.x,p.z),place:nearestChicagoPlace(p.x,p.z)})).sort((a,b)=>a.distance-b.distance),[players,local])
 const send=(toUserId:string,action:Action['action'])=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId,action}}))
 const respond=(accept:boolean)=>{if(!incoming)return;send(incoming.fromUserId,accept?'drop-accept':'drop-decline');setNotice(accept?'Drop-in approved.':'Drop-in declined.');setIncoming(null)}
 return <>
  <button aria-expanded={open} aria-label="Open StreetVerse player grid" onClick={()=>setOpen(v=>!v)} style={{position:'fixed',left:12,top:108,zIndex:42050,minWidth:76,minHeight:44,borderRadius:12,border:'1px solid #70ffb088',background:'#071b1ddd',color:'#dffff0',font:'950 9px system-ui'}}>🗺 GRID</button>
  {open&&<section aria-label="Chicago player grid" style={{position:'fixed',left:10,right:10,top:158,zIndex:42060,maxHeight:'62vh',overflow:'auto',padding:12,borderRadius:18,background:'#041017f5',border:'1px solid #70ffb077',color:'#fff',fontFamily:'system-ui',boxShadow:'0 18px 50px #000d'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div><b>CHICAGO GRID • {worldToChicagoGridCell(local.x,local.z)}</b><div style={{fontSize:10,opacity:.72}}>{nearestChicagoPlace(local.x,local.z)?.label}</div></div><button onClick={()=>setOpen(false)} aria-label="Close player grid" style={smallBtn}>×</button></div>
   <div style={{position:'relative',height:220,marginTop:10,border:'1px solid #31545a',borderRadius:14,background:'linear-gradient(#0a2027,#07151c)',overflow:'hidden'}}>
    {Array.from({length:4}).map((_,i)=><span key={'v'+i} style={{position:'absolute',left:`${(i+1)*20}%`,top:0,bottom:0,width:1,background:'#28444b'}}/>)}{Array.from({length:4}).map((_,i)=><span key={'h'+i} style={{position:'absolute',top:`${(i+1)*20}%`,left:0,right:0,height:1,background:'#28444b'}}/>)}
    <span title="You" style={{position:'absolute',left:`${pct(local.x)}%`,top:`${100-pct(local.z)}%`,width:14,height:14,borderRadius:99,transform:'translate(-50%,-50%)',background:'#ffd85f',border:'2px solid #fff',boxShadow:'0 0 12px #ffd85f'}}/>
    {nearest.map(p=><button key={p.userId} title={`Player ${p.userId.slice(0,4)} • ${p.cell}`} onClick={()=>{send(p.userId,'drop-request');setNotice(`Drop-in request sent to PLAYER ${p.userId.slice(0,4).toUpperCase()}.`)}} style={{position:'absolute',left:`${pct(p.x)}%`,top:`${100-pct(p.z)}%`,width:16,height:16,borderRadius:99,transform:'translate(-50%,-50%)',background:'#64e8ff',border:'2px solid #dffaff',padding:0}}/> )}
   </div>
   <div style={{display:'grid',gap:6,marginTop:10}}>{nearest.slice(0,8).map(p=><div key={p.userId} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,alignItems:'center',padding:'8px 9px',borderRadius:11,background:'#0a1b22'}}><div><b style={{fontSize:11}}>PLAYER {p.userId.slice(0,4).toUpperCase()} • {p.cell}</b><div style={{fontSize:9,opacity:.7}}>{p.place.label} • {Math.round(p.distance)}m • {p.vehicle?'IN VEHICLE':'ON FOOT'}</div></div><button onClick={()=>{send(p.userId,'drop-request');setNotice('Drop-in request sent.')}} style={smallBtn}>DROP TO</button></div>)}</div>
   {incoming&&<div style={{marginTop:10,padding:10,borderRadius:12,background:'#241a09',border:'1px solid #ffd85f77'}}><b>DROP-IN REQUEST</b><div style={{fontSize:10,margin:'5px 0'}}>PLAYER {incoming.fromUserId.slice(0,4).toUpperCase()} wants to join your area.</div><div style={{display:'flex',gap:7}}><button onClick={()=>respond(true)} style={smallBtn}>ACCEPT</button><button onClick={()=>respond(false)} style={smallBtn}>DECLINE</button></div></div>}
   {notice&&<div role="status" style={{fontSize:10,marginTop:9,color:'#bfffd8'}}>{notice}</div>}
  </section>}
 </>
}
const smallBtn:React.CSSProperties={minHeight:38,borderRadius:10,border:'1px solid #69dfe488',background:'#0a2027',color:'#fff',fontWeight:900,padding:'0 10px'}
