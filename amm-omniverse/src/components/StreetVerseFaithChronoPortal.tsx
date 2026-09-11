import { useEffect, useState } from 'react'

type ChronoState={active?:boolean;name?:string;scenarioId?:string;runId?:string;checkpoint?:number}
const KEY='tryamm_chrono_experience_v1'

function read():ChronoState{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}

export default function StreetVerseFaithChronoPortal(){
  const [state,setState]=useState<ChronoState>(()=>read())
  useEffect(()=>{
    const refresh=()=>setState(read())
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-enter',{detail:{source:'StreetVerseFaithChronoPortal'}}))
    window.addEventListener('tryamm:chrono-state',refresh)
    window.addEventListener('storage',refresh)
    return()=>{window.removeEventListener('tryamm:chrono-state',refresh);window.removeEventListener('storage',refresh)}
  },[])
  const resumable=Boolean(state.scenarioId||state.runId)
  return <div aria-label="StreetVerse Faith Chrono portal" style={{position:'fixed',right:12,bottom:14,zIndex:17020,display:'grid',gap:7,justifyItems:'end'}}>
    {resumable&&<button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:chrono-resume'))} style={portal}>
      <span style={{fontSize:18}}>⏳</span><span><b>TIME MACHINE</b><br/><small>{state.name||'Resume Faith Chrono'} · checkpoint {state.checkpoint||0}</small></span>
    </button>}
    <button type="button" onClick={()=>{window.location.href='/ethiopian-bible'}} style={faith}>📖 ETHIOPIAN BIBLE · FAITH WORLD</button>
  </div>
}

const portal:React.CSSProperties={display:'flex',gap:9,alignItems:'center',textAlign:'left',border:'1px solid #e5c56aaa',borderRadius:16,padding:'10px 13px',background:'linear-gradient(145deg,#2a210ddd,#0a1118ee)',color:'#fff',fontWeight:900,cursor:'pointer',boxShadow:'0 8px 32px #0009'}
const faith:React.CSSProperties={border:'1px solid #8fdcff77',borderRadius:999,padding:'9px 12px',background:'#081822ee',color:'#fff',fontWeight:950,cursor:'pointer',fontSize:11}
