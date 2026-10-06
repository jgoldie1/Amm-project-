import {useEffect,useMemo,useState} from 'react'
import {CHICAGO_77_SLICES} from '../config/streetverseCommunitySlices'
import type {Chicago77MemoryNode} from '../runtime/Chicago77LivingMemoryMeshRuntime'

export default function Chicago77HolographicAtlas(){
 const [nodes,setNodes]=useState<Record<string,Chicago77MemoryNode>>({})
 const [selected,setSelected]=useState('28')
 const current=CHICAGO_77_SLICES.find(x=>x.communityAreaNumber===selected)||CHICAGO_77_SLICES[27]
 const memory=nodes[selected]
 useEffect(()=>{
  const onState=(event:Event)=>setNodes((event as CustomEvent<{nodes?:Record<string,Chicago77MemoryNode>}>).detail?.nodes||{})
  addEventListener('tryamm:chicago77-memory-mesh-state',onState)
  dispatchEvent(new CustomEvent('tryamm:chicago77-memory-mesh-request'))
  return()=>removeEventListener('tryamm:chicago77-memory-mesh-state',onState)
 },[])
 const stats=useMemo(()=>({visited:Object.values(nodes).filter(n=>n.visits>0).length,active:Object.values(nodes).filter(n=>n.memoryScore>0).length}),[nodes])
 const enter=()=>{
  try{localStorage.setItem('tryamm.streetverse.chicago-destination.v2',JSON.stringify({id:'ca-'+selected,type:'community-area',communityAreaNumber:selected,name:current.name,label:current.name,city:'Chicago'}))}catch{}
  window.location.href='/streetverse?safe=1&communityArea='+encodeURIComponent(selected)
 }
 return <div style={page}>
  <style>{'@keyframes c77float{50%{transform:translateY(-6px)}}@keyframes c77pulse{50%{box-shadow:0 0 24px #51e6ff99,inset 0 0 20px #754dff44}}'}</style>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:10,letterSpacing:3,color:'#6cecff',fontWeight:950}}>STREETVERSE CHICAGO • 77 LIVING COMMUNITY AREAS</div><h1 style={{margin:'5px 0'}}>CHICAGO 77 HOLOGRAPHIC ATLAS</h1><div style={{fontSize:11,color:'#9fb6c3'}}>Persistent neighborhood memory • missions • business • creator culture • faith • education • Time Machine</div></div><button onClick={()=>window.location.href='/'} style={button}>CLOSE</button></header>
  <section style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginTop:12}}><div style={stat}><b>77</b><span>COMMUNITIES</span></div><div style={stat}><b>{stats.visited}</b><span>VISITED</span></div><div style={stat}><b>{stats.active}</b><span>MEMORY ACTIVE</span></div></section>
  <section style={hero}><div style={{fontSize:54,animation:'c77float 2.4s ease-in-out infinite'}}>◉</div><div><div style={{fontSize:10,color:'#6cecff'}}>COMMUNITY AREA {current.communityAreaNumber}</div><h2 style={{margin:'4px 0'}}>{current.name}</h2><div style={{fontSize:10,color:'#9fb6c3'}}>STATUS {current.status} • {current.missions.length} mission anchors</div><div style={{fontSize:10,color:'#c7d8e0',marginTop:6}}>Memory {memory?.memoryScore||0}/100 • Living {memory?.livingScore||0}/100 • Era {(memory?.lastEra||'present').toUpperCase()}</div></div><button onClick={enter} style={{...button,borderColor:'#7ff7ff',minHeight:54}}>HOLO FLY IN</button></section>
  <section style={grid}>{CHICAGO_77_SLICES.map(slice=>{const n=nodes[slice.communityAreaNumber];const active=slice.communityAreaNumber===selected;return <button key={slice.communityAreaNumber} onClick={()=>setSelected(slice.communityAreaNumber)} style={{...tile,borderColor:active?'#78efff':(n?.memoryScore||0)>0?'#5e9dff77':'#233c4a',background:active?'linear-gradient(145deg,#12354a,#1c1740)':'#07121b',animation:active?'c77pulse 1.8s ease-in-out infinite':'none'}}><div style={{fontSize:8,color:'#7fa0b0'}}>#{slice.communityAreaNumber}</div><b style={{fontSize:10}}>{slice.name}</b><div style={{fontSize:8,color:'#8ed9ff',marginTop:4}}>MEM {n?.memoryScore||0}</div></button>})}</section>
 </div>
}

const page:React.CSSProperties={position:'fixed',inset:0,zIndex:20000,overflowY:'auto',padding:'max(16px,env(safe-area-inset-top)) 14px 42px',background:'radial-gradient(circle at 50% 0,#0b3b52,#040812 52%,#010203)',color:'#fff',fontFamily:'system-ui'}
const hero:React.CSSProperties={display:'grid',gridTemplateColumns:'auto 1fr auto',gap:14,alignItems:'center',marginTop:12,padding:14,borderRadius:18,border:'1px solid #55dff077',background:'linear-gradient(145deg,#071824ef,#100d22ef)',boxShadow:'0 14px 50px #0009'}
const grid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(108px,1fr))',gap:6,marginTop:12}
const tile:React.CSSProperties={minHeight:72,padding:8,border:'1px solid #233c4a',borderRadius:11,color:'#fff',textAlign:'left',touchAction:'manipulation'}
const button:React.CSSProperties={minHeight:44,padding:'8px 12px',borderRadius:11,border:'1px solid #4e8198',background:'#0b2230',color:'#fff',fontWeight:950}
const stat:React.CSSProperties={display:'grid',placeItems:'center',padding:10,borderRadius:12,border:'1px solid #244a5e',background:'#07131d',fontSize:9,color:'#87a9b8'}