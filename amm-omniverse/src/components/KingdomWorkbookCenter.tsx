import {useMemo,useState} from 'react'
import SetApartPassportReceipts from './SetApartPassportReceipts'
import {KINGDOM_WORKBOOK_IDENTITY,KINGDOM_WORKBOOK_PHASES,KINGDOM_WORKBOOK_PROMPTS} from '../data/KingdomWorkbookRegistry'

const KEY='tryamm.kingdom-workbook.v1'
type Stored={completed?:number[];journal?:string;prayer?:string;covenant?:string;remembrance?:string}
function read():Stored{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function save(v:Stored){try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}}

export default function KingdomWorkbookCenter(){
 const initial=read()
 const [completed,setCompleted]=useState<number[]>(()=>Array.isArray(initial.completed)?initial.completed:[])
 const [journal,setJournal]=useState(initial.journal||'')
 const [prayer,setPrayer]=useState(initial.prayer||'')
 const [covenant,setCovenant]=useState(initial.covenant||'')
 const [remembrance,setRemembrance]=useState(initial.remembrance||'')
 const [status,setStatus]=useState('Private workbook drafts stay on this device.')
 const done=new Set(completed)
 const percent=Math.round(done.size/KINGDOM_WORKBOOK_IDENTITY.journeySteps*100)
 const persist=(patch:Partial<Stored>)=>{const next={completed,journal,prayer,covenant,remembrance,...patch};save(next);setStatus('Saved privately on this device.')}
 const toggle=(n:number)=>{const next=done.has(n)?completed.filter(x=>x!==n):[...completed,n].sort((a,b)=>a-b);setCompleted(next);persist({completed:next})}
 const steps=useMemo(()=>Array.from({length:KINGDOM_WORKBOOK_IDENTITY.journeySteps},(_,i)=>i+1),[])
 return <main style={{minHeight:'100dvh',background:'radial-gradient(circle at top,#31220d,#0d0b08 42%,#030404)',color:'#fff',fontFamily:'system-ui'}}>
  <div style={{maxWidth:1080,margin:'0 auto',padding:'20px 14px 90px'}}>
   <nav style={{display:'flex',gap:7,flexWrap:'wrap'}}><a href='/kingdom-of-yahisrael' style={pill}>👑 YAHISRAEL</a><a href='/faithverse' style={pill}>📖 FAITHVERSE</a><a href='/kingdoms-press' style={pill}>📝 KINGDOMS PRESS</a></nav>
   <header style={{padding:'36px 0 18px'}}><div style={{fontSize:10,letterSpacing:2.6,color:'#e8b944',fontWeight:950}}>KINGDOM OF YAHISRAEL • JUDAH</div><h1 style={{fontSize:'clamp(44px,8vw,84px)',lineHeight:.9,margin:'8px 0'}}>THE KINGDOM<br/>WORKBOOK</h1><div style={{fontSize:20,color:'#4fe3ff',fontWeight:950}}>{KINGDOM_WORKBOOK_IDENTITY.subtitle}</div><p style={muted}>A recovered 66-step discipleship and Kingdom-living journey through Scripture, identity, faith, stewardship, leadership, family covenant and legacy.</p></header>
   <section style={{...card,borderColor:'#82691f'}}><div style={eyebrow}>66-STEP JOURNEY</div><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'end',marginTop:7}}><div><b style={{fontSize:24}}>{done.size} / 66</b><div style={muted}>{percent}% complete</div></div><div style={{flex:1,maxWidth:420,height:10,borderRadius:999,background:'#1c1a14',overflow:'hidden'}}><div style={{width:`${percent}%`,height:'100%',background:'linear-gradient(90deg,#e8b944,#4fe3ff)'}}/></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:8,marginTop:12}}>{KINGDOM_WORKBOOK_PHASES.map(phase=><div key={phase.id} style={{...card,background:'#0b0a07'}}><div style={eyebrow}>{phase.label}</div><p style={muted}>{phase.focus}</p><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>{steps.filter(n=>n>=phase.from&&n<=phase.to).map(n=><button key={n} onClick={()=>toggle(n)} aria-pressed={done.has(n)} style={{minHeight:36,borderRadius:8,border:`1px solid ${done.has(n)?'#78ffb4':'#4a4130'}`,background:done.has(n)?'#0d2c1c':'#17130b',color:'#fff',fontWeight:900}}>{n}</button>)}</div></div>)}</div>
   </section>

   <section style={{...card,marginTop:12}}><div style={eyebrow}>DAILY REFLECTION</div><div style={{display:'grid',gap:6,marginTop:8}}>{KINGDOM_WORKBOOK_PROMPTS.map(x=><div key={x} style={{padding:8,borderRadius:9,background:'#0a0e12',fontSize:10,color:'#cad2d7'}}>• {x}</div>)}</div><textarea value={journal} onChange={e=>setJournal(e.target.value)} onBlur={()=>persist({journal})} placeholder='Private journal / study reflection…' style={area}/></section>

   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10,marginTop:12}}>
    <div style={card}><div style={eyebrow}>PRIVATE PRAYER DRAFT</div><p style={muted}>Saved only on this device by default.</p><textarea value={prayer} onChange={e=>setPrayer(e.target.value)} onBlur={()=>persist({prayer})} style={area}/></div>
    <div style={card}><div style={eyebrow}>FAMILY COVENANT / LEGACY</div><p style={muted}>Family commitments, values, teaching goals and what should be passed forward.</p><textarea value={covenant} onChange={e=>setCovenant(e.target.value)} onBlur={()=>persist({covenant})} style={area}/></div>
   </section>

   <section style={{...card,marginTop:12,borderColor:'#5d6947'}}><div style={eyebrow}>BOOK OF REMEMBRANCE</div><p style={muted}>Your personal remembrance notes below stay local. Approved Set Apart receipts are a separate private, server-protected record and remain read-only here.</p><textarea value={remembrance} onChange={e=>setRemembrance(e.target.value)} onBlur={()=>persist({remembrance})} placeholder='What should be remembered: testimony, service, lessons, family milestones, answered prayer, commitments…' style={area}/><SetApartPassportReceipts/></section>

   <section style={{...card,marginTop:12}}><div style={eyebrow}>NEXT PATHS</div><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:8}}><a href='/faithverse' style={pill}>CONTINUE SCRIPTURE STUDY</a><a href='/kingdom' style={pill}>ENTER KINGDOM DISTRICT</a><a href='/kingdoms-press' style={pill}>PUBLISH THROUGH KINGDOMS PRESS</a></div></section>
   <div role='status' style={{fontSize:9,color:'#b9c5cc',marginTop:9}}>{status}</div>
  </div>
 </main>
}
const card:React.CSSProperties={padding:14,border:'1px solid #51462d',borderRadius:16,background:'#110f09d9'}
const muted:React.CSSProperties={fontSize:11,color:'#d3c8aa',lineHeight:1.6}
const eyebrow:React.CSSProperties={fontSize:9,letterSpacing:1.6,color:'#e8b944',fontWeight:950}
const pill:React.CSSProperties={display:'inline-flex',alignItems:'center',minHeight:38,padding:'0 10px',border:'1px solid #715c2e',borderRadius:999,background:'#181208',color:'#fff',fontSize:8,fontWeight:900,textDecoration:'none'}
const area:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:110,marginTop:8,borderRadius:11,border:'1px solid #5e5133',background:'#080806',color:'#fff',padding:10,fontSize:14,resize:'vertical'}