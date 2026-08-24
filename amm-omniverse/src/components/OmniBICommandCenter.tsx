import { useEffect, useMemo, useState } from 'react'
import type { NiaSourceDefinition, SemanticMetric } from '../runtime/NiaSourceRuntime'

type NiaState={sources:NiaSourceDefinition[];metrics:SemanticMetric[]}

const card:React.CSSProperties={background:'rgba(3,8,22,.9)',border:'1px solid rgba(79,227,255,.25)',borderRadius:12,padding:12}
const btn:React.CSSProperties={background:'rgba(79,227,255,.12)',border:'1px solid rgba(79,227,255,.4)',color:'#baf7ff',borderRadius:8,padding:'7px 10px',cursor:'pointer'}

export default function OmniBICommandCenter(){
  const [open,setOpen]=useState(false)
  const [state,setState]=useState<NiaState>({sources:[],metrics:[]})
  const [query,setQuery]=useState('What changed across TRYAMM today?')
  const [answer,setAnswer]=useState('')

  useEffect(()=>{
    const onState=(event:Event)=>setState((event as CustomEvent<NiaState>).detail||{sources:[],metrics:[]})
    const onOpen=()=>{setOpen(true);window.dispatchEvent(new CustomEvent('tryamm:niasource-request'))}
    window.addEventListener('tryamm:niasource-state',onState)
    window.addEventListener('tryamm:omnibi-open',onOpen)
    window.dispatchEvent(new CustomEvent('tryamm:niasource-request'))
    return()=>{window.removeEventListener('tryamm:niasource-state',onState);window.removeEventListener('tryamm:omnibi-open',onOpen)}
  },[])

  const summary=useMemo(()=>{
    const connected=state.sources.filter(s=>s.status==='connected').length
    const degraded=state.sources.filter(s=>s.status==='degraded').length
    return {connected,degraded,total:state.sources.length,metrics:state.metrics.length}
  },[state])

  const ask=()=>{
    const q=query.trim();if(!q)return
    const relevant=state.metrics.slice(0,4).map(m=>m.label).join(', ')
    const providers=state.sources.map(s=>`${s.label}:${s.status}`).join(' · ')
    setAnswer(`OmniBI is ready to answer this through HoloGPT once a live model provider is active. Current governed context: ${summary.connected}/${summary.total} sources connected; ${summary.degraded} degraded; semantic metrics include ${relevant||'none yet'}. Source health: ${providers||'no sources registered'}.`)
    window.dispatchEvent(new CustomEvent('tryamm:omnibi-query',{detail:{query:q,sourceIds:state.sources.map(s=>s.id),metricIds:state.metrics.map(m=>m.id)}}))
  }

  if(!open)return <button onClick={()=>setOpen(true)} style={{position:'fixed',right:18,bottom:170,zIndex:9998,...btn}}>📊 OmniBI AI</button>

  return <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.72)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
    <div style={{width:'min(1100px,96vw)',maxHeight:'90vh',overflow:'auto',background:'#04050e',border:'1px solid rgba(232,185,68,.45)',borderRadius:16,padding:16,color:'white',fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:14}}>
        <div><div style={{fontSize:22,fontWeight:900}}>OmniBI AI Command Center</div><div style={{fontSize:12,color:'#8edfff'}}>Powered by NiaSource semantic intelligence</div></div>
        <button onClick={()=>setOpen(false)} style={btn}>Close</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,marginBottom:14}}>
        {[['Connected Sources',summary.connected],['Degraded',summary.degraded],['Semantic Metrics',summary.metrics],['Total Sources',summary.total]].map(([label,value])=><div key={String(label)} style={card}><div style={{fontSize:11,color:'#8ea3b7'}}>{label}</div><div style={{fontSize:24,fontWeight:900}}>{value}</div></div>)}
      </div>
      <div style={{...card,marginBottom:14}}>
        <div style={{fontWeight:800,marginBottom:8}}>Ask TRYAMM in plain language</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')ask()}} style={{flex:1,minWidth:260,background:'#080c17',border:'1px solid #263851',color:'white',borderRadius:8,padding:10}}/><button onClick={ask} style={btn}>Analyze</button></div>
        {answer&&<div style={{marginTop:10,fontSize:13,lineHeight:1.5,color:'#d8e9f5'}}>{answer}</div>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:10}}>
        {state.sources.map(source=><div key={source.id} style={card}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><strong>{source.label}</strong><span style={{fontSize:11,color:source.status==='connected'?'#7dffab':'#ffd36a'}}>{source.status.toUpperCase()}</span></div><div style={{fontSize:12,color:'#9fb2c4',margin:'6px 0'}}>{source.description}</div><div style={{fontSize:11,color:'#73dfff'}}>Metrics: {source.metrics.join(', ')}</div><div style={{fontSize:11,color:'#aaa',marginTop:4}}>Dimensions: {source.dimensions.join(', ')}</div></div>)}
      </div>
    </div>
  </div>
}
