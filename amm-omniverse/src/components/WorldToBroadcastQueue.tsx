import {useEffect,useState} from 'react'
import {installStreetVerseBroadcastConvergenceRuntime,type WorldBroadcastCandidate} from '../runtime/StreetVerseBroadcastConvergenceRuntime'

export default function WorldToBroadcastQueue(){
 const [rows,setRows]=useState<WorldBroadcastCandidate[]>([])
 useEffect(()=>{
  const dispose=installStreetVerseBroadcastConvergenceRuntime()
  const onState=(event:Event)=>setRows((event as CustomEvent<{queue?:WorldBroadcastCandidate[]}>).detail?.queue||[])
  addEventListener('tryamm:world-to-broadcast-state',onState)
  dispatchEvent(new Event('tryamm:world-to-broadcast-request'))
  return()=>{removeEventListener('tryamm:world-to-broadcast-state',onState);dispose()}
 },[])
 return <section style={panel}><div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div><div style={eyebrow}>WORLD → BROADCAST</div><b>StreetVerse Story Desk</b></div><span style={{fontSize:9,color:'#8fe9ff'}}>{rows.length} CANDIDATES</span></div><p style={muted}>Missions, creator LIVE sessions, business openings, Reels and SportsVerse events can become TV segments without rebuilding the show from scratch.</p><div style={{display:'grid',gap:6,maxHeight:260,overflowY:'auto'}}>{rows.length===0&&<div style={empty}>Nothing queued yet. Complete a mission, go LIVE, publish a Reel, open a business or finish a SportsVerse event.</div>}{rows.slice(0,12).map(row=><div key={row.id} style={item}><div style={{minWidth:0,flex:1}}><b style={{fontSize:10}}>{row.title}</b><div style={{fontSize:8,color:'#86a2af'}}>{row.kind.replaceAll('-',' ')} • {new Date(row.createdAt).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</div></div><button onClick={()=>dispatchEvent(new CustomEvent('tryamm:world-to-broadcast-load',{detail:{id:row.id}}))} style={button}>LOAD</button></div>)}</div></section>
}

const panel:React.CSSProperties={marginTop:12,padding:11,borderRadius:14,border:'1px solid #31677b',background:'#06121b',color:'#fff'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:2,color:'#65ebff',fontWeight:950}
const muted:React.CSSProperties={fontSize:9,color:'#89a2ae',lineHeight:1.45}
const empty:React.CSSProperties={padding:9,borderRadius:9,border:'1px dashed #345464',fontSize:9,color:'#7e98a5'}
const item:React.CSSProperties={display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:9,border:'1px solid #254654',background:'#081923'}
const button:React.CSSProperties={minHeight:34,padding:'5px 9px',borderRadius:8,border:'1px solid #4a879d',background:'#0a2937',color:'#fff',fontSize:8,fontWeight:950}