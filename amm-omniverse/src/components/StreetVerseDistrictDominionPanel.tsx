import {useState,type CSSProperties} from 'react'
import{
 DISTRICTS,BUILDS,MISSIONS,createDominion,loadDominion,saveDominion,
 playMission,buildCity,selectDistrict,dominionMetrics,type DominionState,
 type DistrictId,type BuildId,type MissionId,
} from '../runtime/StreetVerseDistrictDominionEngine'

const button:CSSProperties={minHeight:52,border:'1px solid #74dccc',background:'#122b37',
 color:'#effff8',fontWeight:800,fontSize:14,borderRadius:13,padding:'12px 14px',
 cursor:'pointer',textAlign:'left'}
const panel:CSSProperties={background:'#0a1425',border:'1px solid #35576a',
 borderRadius:17,padding:14,boxShadow:'0 10px 28px #0005'}
const muted:CSSProperties={fontSize:12,lineHeight:1.6,color:'#b9cbd6'}
const percent=(x:number)=>String(Math.round(x))+'%'
const buildingSites=[
 {x:133,y:167},{x:254,y:139},{x:360,y:187},{x:460,y:122},
 {x:208,y:252},{x:425,y:250},
]
const buildingVisuals={
 park:{color:'#3bba89',roof:'#a4f2bc',floors:0},
 studio:{color:'#8b67d4',roof:'#e6bfff',floors:3},
 housing:{color:'#cb8e60',roof:'#efd4a8',floors:4},
 transit:{color:'#5186cf',roof:'#bbe7ff',floors:2},
 market:{color:'#d5ac56',roof:'#f6da89',floors:2},
 clinic:{color:'#4dbbb6',roof:'#c0fff2',floors:3},
} as const

/** 2.5D miniature uses a single SVG, not another WebGL context.
 * Districts change palette; buildings appear when the player builds them. */
function DistrictArtwork({state}:{state:DominionState}){
 const district=state.districts.find(d=>d.id===state.district)!
 const accent=DISTRICTS.find(d=>d.id===state.district)?.color||'#81ffca'
 const planted:BuildId[]=district.buildings
 const base:BuildId[]=['housing','market','studio','park','transit','clinic']
 return <svg role="img" aria-label={'Illustrated Chicago district concept: '+district.title+' with '+planted.length+' completed community builds'}
  viewBox="0 0 600 345" preserveAspectRatio="xMidYMid meet"
  style={{width:'100%',display:'block',borderRadius:15,background:'#071426',maxHeight:320}}>
  <defs>
   <linearGradient id="dd-sky" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#273e62"/><stop offset="1" stopColor="#50708b"/></linearGradient>
   <linearGradient id="dd-ground" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#25495c"/><stop offset="1" stopColor="#112333"/></linearGradient>
   <filter id="dd-shadow"><feGaussianBlur stdDeviation="5"/></filter>
   <linearGradient id="dd-glow"><stop stopColor="#ffffff" stopOpacity=".7"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></linearGradient>
  </defs>
  <rect width="600" height="345" fill="url(#dd-sky)"/>
  <path d="M0 160 L49 133 70 152 90 120 120 143 143 101 177 129 197 117 230 149 262 118 296 146 327 108 355 150 382 125 420 155 461 111 500 148 541 126 579 150 600 143 V345 H0Z" fill="#14263b" opacity=".7"/>
  <path d="M0 213 L300 103 600 214 302 339Z" fill="url(#dd-ground)" stroke={accent} strokeWidth="1.8"/>
  <path d="M52 235 L302 143 552 237 303 329Z" fill="#a0a8a1" opacity=".34"/>
  <path d="M270 113 L332 113 480 304 424 315Z" fill="#171d2b"/>
  <path d="M119 285 L169 305 488 180 444 163Z" fill="#171d2b"/>
  <path d="M302 149 L450 300 M151 295 L464 172" stroke="#f5e4a5" strokeWidth="2.8" strokeDasharray="16 12"/>
  {buildingSites.map((p,i)=>{
   const type=planted[i]||base[i]
   const style=buildingVisuals[type]
   const height=(planted[i]?24:13)+style.floors*(planted[i]?12:7)
   const x=p.x,y=p.y
   const alpha=planted[i]?1:.5
   const roofWidth=type==='park'?38:52
   return <g key={i} opacity={alpha}>
    <ellipse cx={x+18} cy={y+14} rx={roofWidth*.92} ry="14" fill="#000" opacity=".30" filter="url(#dd-shadow)"/>
    {type==='park'?<g>
     <ellipse cx={x+8} cy={y} rx="34" ry="16" fill="#2d7a5b"/>
     {[[-10,-7],[6,-15],[20,-6]].map(([dx,dy],t)=><g key={t}>
      <path d={'M'+(x+dx)+' '+(y+dy)+'v19'} stroke="#765840" strokeWidth="4"/>
      <circle cx={x+dx} cy={y+dy} r="11" fill="#65d09d"/><circle cx={x+dx-3} cy={y+dy-3} r="5" fill="#a2ebac" opacity=".7"/>
     </g>)}
    </g>:<g>
     <path d={'M'+(x-roofWidth/2)+' '+(y-height)+'l24 -11 '+roofWidth+' 14 -24 11Z'} fill={style.roof}/>
     <path d={'M'+(x-roofWidth/2)+' '+(y-height)+'v'+height+' l24 12 V'+(y-height-11)+'Z'} fill={style.color}/>
     <path d={'M'+(x-roofWidth/2+24)+' '+(y-height-11)+'v'+(height+12)+' l'+(roofWidth-24)+' -12 V'+(y-height+3)+'Z'} fill="#142033" opacity=".66"/>
     {Array.from({length:style.floors},(_,j)=><g key={j}>
      <rect x={x-roofWidth/2+5} y={y-height+9+j*11} width="9" height="7" fill="#fcdfab" opacity=".85"/>
      <rect x={x-roofWidth/2+30} y={y-height+6+j*11} width="8" height="6" fill="#7ac9e7" opacity=".8"/>
     </g>)}
    </g>}
   </g>
  })}
  <g transform="translate(330 239)">
   <path d="M-17 4L-7 -7 20 -7 30 4 20 12 -10 12Z" fill="#192337"/>
   <path d="M-14 3L-5 -4 17 -4 25 3Z" fill="#8adff0"/>
   <circle cx="-6" cy="11" r="5" fill="#05080e" stroke="#adc5d2"/><circle cx="19" cy="11" r="5" fill="#05080e" stroke="#adc5d2"/>
  </g>
  <circle cx="310" cy="172" r="26" fill={accent} opacity=".13"/>
  <circle cx="310" cy="172" r="13" fill="none" stroke={accent} strokeWidth="2"/>
  <path d="M310 148 V196 M286 172 H334" stroke={accent} opacity=".6"/>
  <text x="18" y="28" fill="#f7ffff" fontSize="18" fontWeight="900">STREETVERSE • DISTRICT DOMINION</text>
  <text x="19" y="49" fill={accent} fontSize="12" fontWeight="750">{district.title.toUpperCase()} · ORIGINAL CITY ART</text>
  <text x="19" y="322" fill="#ffffff" fontSize="11" fontWeight="750">2.5D BUILD PREVIEW · THE MAIN STREETVERSE GAME IS STILL 3D</text>
 </svg>
}

export default function StreetVerseDistrictDominionPanel({onClose}:{onClose:()=>void}){
 const [state,setState]=useState<DominionState>(()=>loadDominion())
 const [mode,setMode]=useState<'battle'|'build'>('battle')
 const [confirmReset,setConfirmReset]=useState(false)
 const [notice,setNotice]=useState('Local playable season. No multiplayer ranking or real payments.')
 const current=state.districts.find(d=>d.id===state.district)!
 const summary=dominionMetrics(state)
 const apply=(next:DominionState)=>{
  if(next===state){setNotice('This item is already built, or you need more simulation credits.');return}
  setState(saveDominion(next))
  window.dispatchEvent(new CustomEvent('tryamm:district-dominion-local-preview',{
   detail:{district:next.district,influence:next.districts.find(x=>x.id===next.district)?.influence,
    mode:'local-demo',realEconomy:false,authoritative:false}}))
  setNotice(next.history[next.history.length-1]?.message||'District selected.')
 }
 const mission=(id:MissionId)=>{apply(playMission(state,id))}
 const build=(id:BuildId)=>{apply(buildCity(state,id))}
 const reset=()=>{
  try{localStorage.removeItem('tryamm.streetverse.district-dominion.preview.v1')}catch{}
  setState(createDominion());setConfirmReset(false);setNotice('Local season reset. Nothing was deleted from TRYAMM or Supabase.')
 }
 return <div role="dialog" aria-modal="true" aria-label="StreetVerse District Dominion" style={{
  position:'fixed',inset:0,zIndex:45000,background:'#040a14',color:'#fff',overflowY:'auto',
  WebkitOverflowScrolling:'touch',fontFamily:'system-ui,sans-serif'}}>
  <main style={{maxWidth:950,margin:'0 auto',padding:'max(env(safe-area-inset-top), 18px) 14px 100px'}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:12}}>
    <div><div style={{fontSize:11,color:'#8af0d5',fontWeight:900,letterSpacing:1.5}}>STREETVERSE CHICAGO • ORIGINAL GAME MODE</div>
     <h1 style={{fontSize:'clamp(23px,6vw,36px)',margin:'7px 0'}}>District Dominion</h1>
     <p style={{...muted,margin:'3px 0'}}>Open-world turf challenge + city-building strategy</p></div>
    <button aria-label="Close District Dominion and return to 3D StreetVerse" style={{...button,textAlign:'center',flexShrink:0}} onClick={onClose}>✕ CLOSE</button>
   </header>
   <p role="status" aria-live="polite" style={{...muted,border:'1px solid #7dbfad',borderRadius:13,padding:10,margin:'15px 0'}}>
    PREVIEW / FICTIONAL SIMULATION — no real turf ownership, cash, online wins, deliveries or developer-created permits. {notice}
   </p>
   <section aria-label="District selection" style={panel}>
    <h2 style={{fontSize:16,margin:'0 0 10px'}}>1. Select a Chicago mission district</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:8}}>
     {DISTRICTS.map(d=><button key={d.id} aria-pressed={state.district===d.id} onClick={()=>apply(selectDistrict(state,d.id))}
      style={{...button,borderColor:state.district===d.id?d.color:'#406173',background:state.district===d.id?'#174140':'#142435'}}>
      <span style={{display:'block',fontWeight:950}}>{d.title}</span><span style={muted}>{d.region}</span>
     </button>)}
    </div>
   </section>
   <div style={{marginTop:12}}><DistrictArtwork state={state}/></div>
   <section aria-label="District influence meters" style={{...panel,marginTop:12}}>
    <h2 style={{fontSize:16,margin:'0 0 8px'}}>{current.title} • District contest</h2>
    {([['Your crew',current.influence,'#80f2bd'],['AI rival',current.rivalInfluence,'#ffb17a']] as const).map(([name,value,color])=><div key={name} style={{marginBottom:12}}>
     <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}><span>{name}</span><b>{percent(value)}</b></div>
     <div role="progressbar" aria-label={name+' influence'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} style={{height:12,background:'#172838',borderRadius:8,overflow:'hidden'}}>
      <div style={{width:percent(value),background:color,height:'100%',borderRadius:8,transition:'width .3s'}}/>
     </div>
    </div>)}
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
     {[['Influence held',summary.districtsHeld+'/3'],['Credits (demo)',String(state.credits)],['XP (demo)',String(state.xp)]].map(([key,val])=><div key={key} style={{padding:9,background:'#101f31',borderRadius:9,textAlign:'center'}}>
      <div style={{fontSize:19,fontWeight:900}}>{val}</div><div style={{...muted,fontSize:10}}>{key}</div></div>)}
    </div>
    <div style={{...muted,marginTop:10}}>Current owner: <b>{current.owner==='neutral'?'Contested / Neutral':current.owner==='west-side-creators'?'West Side Creators':'Lakefront Legends (AI)'}</b> · City prosperity {current.prosperity}/100 · Resident happiness {current.happiness}/100</div>
   </section>
   <section aria-label="Choose missions or city construction" style={{...panel,marginTop:12}}>
    <div style={{display:'flex',gap:8,marginBottom:12}}>
     <button style={{...button,flex:1,background:mode==='battle'?'#17463e':'#142435'}} onClick={()=>setMode('battle')} aria-pressed={mode==='battle'}>⚔ MISSIONS</button>
     <button style={{...button,flex:1,background:mode==='build'?'#17463e':'#142435'}} onClick={()=>setMode('build')} aria-pressed={mode==='build'}>🏗 BUILD CITY</button>
    </div>
    {mode==='battle'?<>
     <h2 style={{fontSize:16,margin:'0 0 10px'}}>2. Challenge the rival AI crew</h2>
     <p style={muted}>Complete fictional objectives to build influence; AI counterattacks after every third turn. No gift purchases decide the winner.</p>
     <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(195px,1fr))',gap:8}}>
      {MISSIONS.map(m=><button style={{...button,display:'grid',gap:7}} key={m.id} onClick={()=>mission(m.id)}>
       <strong>{m.icon} {m.label}</strong><span style={muted}>{m.description}</span>
       <span style={{color:'#86efc4',fontSize:11}}>+{m.gain} influence · +{m.xp} XP</span>
      </button>)}
     </div>
    </>:<>
     <h2 style={{fontSize:16,margin:'0 0 10px'}}>2. Build your district</h2>
     <p style={muted}>Place original civic buildings in the illustrated district, raising happiness, prosperity and local influence. Everything uses simulation credits, not dollars.</p>
     <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(195px,1fr))',gap:8}}>
      {BUILDS.map(b=><button key={b.id} disabled={current.buildings.includes(b.id)||state.credits<b.cost}
       style={{...button,opacity:current.buildings.includes(b.id)||state.credits<b.cost?.52:1,display:'grid',gap:6}}
       onClick={()=>build(b.id)}>
       <strong>{b.icon} {b.label}</strong><span style={muted}>{b.cost} simulation credits · happiness +{b.happiness} · prosperity +{b.prosperity}</span>
       <span style={{fontSize:11,color:'#86efc4'}}>{current.buildings.includes(b.id)?'BUILT':state.credits<b.cost?'MORE CREDITS NEEDED':'BUILD NOW'}</span>
      </button>)}
     </div>
    </>}
   </section>
   <section style={{...panel,marginTop:12}} aria-label="District activity log">
    <h2 style={{fontSize:16,margin:'0 0 10px'}}>3. Your living-city decisions</h2>
    {state.history.length? <ol style={{paddingLeft:22,margin:'5px 0',fontSize:12,lineHeight:1.75}}>{state.history.slice().reverse().map((e,i)=><li key={i}>{e.message}</li>)}</ol>:<p style={muted}>Choose a mission to begin your first chapter.</p>}
    <p style={muted}>Game data is saved only on this device. Changing devices, clearing browser storage, or signing in elsewhere will not synchronize it. Ranked multiplayer and real business integration require a server-controlled backend.</p>
    {!confirmReset?<button style={{...button,marginTop:9}} onClick={()=>setConfirmReset(true)}>Reset local demonstration…</button>:<div style={{display:'flex',gap:8,marginTop:9,flexWrap:'wrap'}}>
     <button style={{...button,borderColor:'#eaa6a6'}} onClick={reset}>Confirm reset local season</button>
     <button style={button} onClick={()=>setConfirmReset(false)}>Cancel</button>
    </div>}
   </section>
  </main>
 </div>
}
