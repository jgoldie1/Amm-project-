import { useEffect, useState } from 'react'
import { askStubbsAI, getOmniNetStatus, searchOmniNet, type OmniNetMode, type OmniNetResult } from '../services/omninet'
import HolographicInternetSpace from './HolographicInternetSpace'

export default function HoloSearchCenter({ onClose }:{ onClose:()=>void }) {
  const [query,setQuery]=useState('')
  const [mode,setMode]=useState<OmniNetMode>('hybrid')
  const [results,setResults]=useState<OmniNetResult[]>([])
  const [answer,setAnswer]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [webReady,setWebReady]=useState<boolean|null>(null)
  const [spatial,setSpatial]=useState(false)
  const modes: Array<[OmniNetMode,string]> = [['hybrid','AI + Web'],['omninet','OmniNet'],['web','Web'],['news','News'],['videos','Video'],['images','Images']]

  useEffect(()=>{getOmniNetStatus().then(s=>setWebReady(Boolean(s.publicWebProvider))).catch(()=>setWebReady(false))},[])

  async function runSearch() {
    const q=query.trim(); if(!q) return
    setBusy(true); setError(''); setAnswer('')
    try {
      const found=await searchOmniNet(q,mode,10)
      setResults(found.results)
      if(mode==='hybrid') {
        const ai=await askStubbsAI(q,'hybrid')
        setAnswer(ai.answer)
        if(!found.results.length&&ai.sources?.length) setResults(ai.sources)
      }
    } catch(e:any){setError(e?.message||'Search failed')} finally {setBusy(false)}
  }

  return <>
    <div role="dialog" aria-modal="true" aria-label="Holo Search" style={{position:'fixed',inset:0,zIndex:12500,background:'linear-gradient(180deg,#020713,#07101c)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
      <header style={{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:16,background:'#020713e8',borderBottom:'1px solid #24445a',backdropFilter:'blur(12px)'}}>
        <div><div style={{fontSize:11,color:'#79efff',letterSpacing:2}}>OMNINET™</div><h1 style={{margin:'2px 0'}}>Holo Search</h1><div style={{fontSize:12,opacity:.7}}>Your index + public internet + Stubbs AI. Sources stay visible.</div></div>
        <button onClick={onClose} aria-label="Close Holo Search" style={close}>×</button>
      </header>
      <main style={{maxWidth:980,margin:'0 auto',padding:18,display:'grid',gap:14}}>
        <section style={panel}>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>{modes.map(([id,label])=><button key={id} onClick={()=>setMode(id)} style={{...chip,borderColor:mode===id?'#55eaff':'#39475d',color:mode===id?'#91f7ff':'#d9e0ea'}}>{label}</button>)}<button onClick={()=>setSpatial(true)} style={{...chip,borderColor:'#e8b944',color:'#ffe493'}}>◈ SPATIAL INTERNET</button></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8}}><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')runSearch()}} placeholder="Search OmniNet and the public web..." style={input}/><button onClick={runSearch} disabled={busy} style={primary}>{busy?'SEARCHING…':'SEARCH'}</button></div>
          <div style={{marginTop:9,fontSize:12,opacity:.7}}>Own index: ready · Public web: {webReady===null?'checking…':webReady?'connected':'API key not configured'} · AI is optional</div>
          {error&&<div role="alert" style={{marginTop:10,color:'#ff9a9a'}}>{error}</div>}
        </section>

        {answer&&<section style={{...panel,borderColor:'#7657a8'}}><div style={{fontSize:11,color:'#cba5ff',fontWeight:900}}>STUBBS AI SYNTHESIS</div><p style={{lineHeight:1.65,whiteSpace:'pre-wrap'}}>{answer}</p><div style={{fontSize:11,opacity:.6}}>You can ignore this answer and use the raw source results below.</div></section>}

        <section style={{display:'grid',gap:10}}>{results.map((r,i)=><article key={r.id||`${r.url}-${i}`} style={panel}>
          <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'start'}}><div style={{fontSize:11,color:r.source==='omninet'?'#ffd66b':'#7eeaff',fontWeight:900}}>{r.source==='omninet'?'OMNINET':'PUBLIC WEB'}{r.sourceType?` · ${r.sourceType.toUpperCase()}`:''}</div>{r.publishedAt&&<time style={{fontSize:11,opacity:.55}}>{r.publishedAt}</time>}</div>
          <h3 style={{margin:'7px 0'}}>{r.title}</h3>
          {r.description&&<p style={{margin:'6px 0 12px',opacity:.75,lineHeight:1.5}}>{r.description}</p>}
          {r.url?<a href={r.url} target="_blank" rel="noreferrer" style={{color:'#7eeaff',fontWeight:800}}>OPEN ORIGINAL SOURCE ↗</a>:<span style={{fontSize:12,opacity:.55}}>Indexed OmniNet record</span>}
        </article>)}</section>
      </main>
    </div>
    {spatial&&<HolographicInternetSpace results={results} onExit={()=>setSpatial(false)}/>} 
  </>
}

const panel:React.CSSProperties={padding:16,border:'1px solid #2c4055',borderRadius:18,background:'#07101dcc'}
const input:React.CSSProperties={minWidth:0,padding:'13px 14px',borderRadius:12,border:'1px solid #40556b',background:'#0a1625',color:'#fff',fontSize:16}
const primary:React.CSSProperties={padding:'0 18px',borderRadius:12,border:'1px solid #4fe3ff',background:'#0b4050',color:'#fff',fontWeight:900}
const chip:React.CSSProperties={padding:'8px 11px',borderRadius:999,border:'1px solid',background:'#0b1421',fontWeight:800}
const close:React.CSSProperties={width:46,height:46,borderRadius:13,border:'1px solid #465a70',background:'#101a28',color:'#fff',fontSize:27}
