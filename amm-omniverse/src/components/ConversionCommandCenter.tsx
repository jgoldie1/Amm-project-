import {useMemo,useState} from 'react'
import {CONVERSION_TRUTH,VERTICAL_LANDINGS,VerticalId} from '../conversion/ConversionEngine'
import {CALL_CENTER_POLICY,CALL_CENTER_ROUTE,HARD_ESCAPE_OPTIONS} from '../callcenter/AntiLoopGuardian'

const cyan='#4FE3FF',gold='#E8B944'
export default function ConversionCommandCenter({onClose}:{onClose:()=>void}){
 const [selected,setSelected]=useState<VerticalId>('gameverse')
 const landing=useMemo(()=>VERTICAL_LANDINGS.find(v=>v.id===selected)!,[selected])
 const fire=(action:string)=>window.dispatchEvent(new CustomEvent(action,{detail:{source:'conversion-command-center',vertical:selected}}))
 return <div role="dialog" aria-label="TRYAMM Conversion Command Center" style={{position:'fixed',inset:0,zIndex:12500,overflowY:'auto',background:'radial-gradient(circle at top,#11263b,#04050e 55%,#010205)',color:'#fff',padding:18}}><div style={{maxWidth:1200,margin:'0 auto'}}>
  <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><div><div style={{fontSize:10,color:cyan,fontWeight:950,letterSpacing:3}}>TRYAMM • CONVERSION OS • ANTI-LOOP SUPPORT</div><h1 style={{margin:'6px 0'}}>One platform. Clear doorway for every need.</h1><p style={muted}>Choose the reason someone came to TRYAMM. The landing experience explains that vertical, shows proof, then gives a primary action, secondary action and an always-visible help route.</p></div><button aria-label="Close Conversion Command Center" onClick={onClose} style={close}>×</button></header>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8,marginTop:16}}>{VERTICAL_LANDINGS.map(v=><button key={v.id} onClick={()=>setSelected(v.id)} aria-pressed={selected===v.id} style={{textAlign:'left',padding:12,borderRadius:13,border:selected===v.id?`2px solid ${cyan}`:'1px solid #26384b',background:selected===v.id?'#0b2330':'#09111a',color:'#fff',cursor:'pointer'}}><b>{v.name}</b><div style={{fontSize:10,color:'#8ea0b4',marginTop:5}}>{v.headline}</div></button>)}</div>
  <section style={panel}><div style={{fontSize:10,color:gold,fontWeight:900,letterSpacing:2}}>{landing.name.toUpperCase()}</div><h2 style={{fontSize:'clamp(28px,5vw,52px)',margin:'8px 0'}}>{landing.headline}</h2><p style={muted}><b style={{color:'#fff'}}>Problem:</b> {landing.problem}</p><p style={muted}><b style={{color:'#fff'}}>TRYAMM promise:</b> {landing.promise}</p><div style={grid}>{landing.benefits.map(x=><article key={x} style={card}><b>✦ {x}</b></article>)}</div><h3>Proof / trust</h3><div style={grid}>{landing.proof.map(x=><article key={x} style={card}><span>{x}</span></article>)}</div><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:18}}><button onClick={()=>fire(landing.primaryCTA.action)} style={primary}>{landing.primaryCTA.label}</button><button onClick={()=>fire(landing.secondaryCTA.action)} style={secondary}>{landing.secondaryCTA.label}</button><button onClick={()=>fire(landing.helpCTA.action)} style={help}>{landing.helpCTA.label}</button></div></section>
  <section style={panel}><h2>AI Call Center Anti-Loop Guardian</h2><p style={muted}>Support is never allowed to keep repeating the same failed path. TRYAMM detects repeated intent/answers, repeated tool failure, long silence, frustration and long unresolved sessions, then changes strategy or escalates.</p><div style={grid}>{HARD_ESCAPE_OPTIONS.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={{...muted,color:'#7dffb0'}}>{CALL_CENTER_ROUTE}</p><p style={{...muted,color:'#ffcf66'}}>Never: {CALL_CENTER_POLICY.neverDo.join(' • ')}</p></section>
  <section style={panel}><h2>Conversion truth</h2><p style={muted}>{CONVERSION_TRUTH}</p></section>
 </div></div>
}
const panel={border:'1px solid #29455d',borderRadius:20,padding:18,marginTop:16,background:'#07111bcc'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:9} as const
const card={border:'1px solid #26394d',borderRadius:13,padding:12,background:'#0a1420'} as const
const muted={color:'#a9b7c8',lineHeight:1.55} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #4a5e73',background:'#0b1320',color:'#fff',fontSize:22} as const
const primary={border:0,borderRadius:12,padding:'12px 16px',background:`linear-gradient(135deg,${cyan},#77a7ff)`,color:'#04111a',fontWeight:950,cursor:'pointer'} as const
const secondary={border:`1px solid ${gold}99`,borderRadius:12,padding:'12px 16px',background:'#241b08',color:'#ffe59c',fontWeight:900,cursor:'pointer'} as const
const help={border:'1px solid #78ffb488',borderRadius:12,padding:'12px 16px',background:'#0b251c',color:'#baffd3',fontWeight:900,cursor:'pointer'} as const
