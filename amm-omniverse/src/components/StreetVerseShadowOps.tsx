import {useEffect,useMemo,useState} from 'react'

type Decision='A'|'B'|'C'|'D'
type Op={id:string;title:string;briefing:string;objective:string;location:string;cover:string;loadout:string[];choices:Record<Decision,{label:string;detail:string;effect:string}>}
const OPS:Op[]=[
 {id:'shadow-loop',title:'Shadow Protocol • Night Extraction',briefing:'Benny has an encrypted Business Passport key moving through the Loop. Recover it, preserve evidence and extract without exposing the operation.',objective:'Recover the encrypted key and reach extraction.',location:'Chicago • Loop',cover:'Event production contractor',loadout:['Holo Fon scanner','Sparrow route overlay','disguise credential','evidence vault'],choices:{
  A:{label:'INFILTRATE',detail:'Enter through the service route and complete the objective directly.',effect:'stealth'},
  B:{label:'SURVEIL',detail:'Observe movement patterns first, tag the objective and choose the safest opening.',effect:'intelligence'},
  C:{label:'UNDERCOVER',detail:'Use the cover identity, dialogue and relationships to gain legitimate access.',effect:'social-intel'},
  D:{label:'BLACK FILE',detail:'Use a discovered secret route, Benny clue or prior world-memory unlock.',effect:'secret'}
 }},
 {id:'anomaly-desk',title:'Anomaly Desk • Unknown Signal',briefing:'A fictional unexplained signal has appeared inside StreetVerse. Determine whether it is a hoax, hidden event, Holo anomaly or story-world contact.',objective:'Identify the signal source and secure the fictional evidence.',location:'Chicago • Classified Story Zone',cover:'Municipal technology inspector',loadout:['Holo spectrum prop','Omni translator','evidence recorder','portal marker'],choices:{
  A:{label:'TRACE',detail:'Follow the signal immediately and secure the source.',effect:'trace'},
  B:{label:'ANALYZE',detail:'Collect clues and compare the fictional signal pattern before approaching.',effect:'analysis'},
  C:{label:'CONTACT',detail:'Attempt dialogue or negotiation with the story-world source.',effect:'contact'},
  D:{label:'MIB FILE',detail:'Open the secret anomaly route when unlocked by Easter eggs or earlier decisions.',effect:'anomaly-secret'}
 }}
]

export default function StreetVerseShadowOps(){
 const [open,setOpen]=useState(false),[index,setIndex]=useState(0),[choice,setChoice]=useState<Decision|null>(null),[phase,setPhase]=useState<'briefing'|'deployed'>('briefing')
 const op=OPS[index]
 const selected=useMemo(()=>choice?op.choices[choice]:null,[choice,op])
 useEffect(()=>{const show=()=>setOpen(true);addEventListener('tryamm:shadow-ops-open',show);return()=>removeEventListener('tryamm:shadow-ops-open',show)},[])
 const deploy=()=>{if(!choice)return;setPhase('deployed');dispatchEvent(new CustomEvent('tryamm:streetverse-mission-choice',{detail:{missionId:op.id,choice,label:selected?.label,approach:selected?.detail,worldEffect:selected?.effect,missionFamily:'shadow-ops'}}));dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{id:op.id,label:op.title,type:'INTELLIGENCE',choice,approach:selected?.detail,worldEffect:selected?.effect,objective:op.objective,location:op.location}}));dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{missionId:op.id,speaker:'Benny',text:op.briefing,objective:op.objective}}));dispatchEvent(new CustomEvent('tryamm:city-navigation-target',{detail:{type:'shadow-operation',missionId:op.id,location:op.location}}))}
 if(!open)return <button onClick={()=>setOpen(true)} style={launcher}>🕶 SHADOW OPS</button>
 return <aside aria-label="StreetVerse Shadow Operations" style={panel}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><div><div style={{fontSize:9,fontWeight:950,color:'#8de9ff',letterSpacing:1.4}}>STREETVERSE INTELLIGENCE • FICTIONAL OPERATIONS</div><strong>{op.title}</strong></div><button onClick={()=>setOpen(false)} style={close}>×</button></div>
 <p style={{fontSize:11,lineHeight:1.45,opacity:.82}}>{op.briefing}</p><div style={{fontSize:10}}><b>OBJECTIVE:</b> {op.objective}<br/><b>LOCATION:</b> {op.location}<br/><b>COVER:</b> {op.cover}</div>
 <div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:8}}>{op.loadout.map(x=><span key={x} style={chip}>{x}</span>)}</div>
 <div style={{marginTop:10,fontSize:9,fontWeight:950,color:'#ffd36b'}}>DECISION SOURCE • A / B / C / D</div><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginTop:5}}>{(['A','B','C','D'] as Decision[]).map(id=><button key={id} disabled={phase==='deployed'} onClick={()=>setChoice(id)} style={{...button,background:choice===id?'#174a5e':'#101923'}}><b>{id}</b><br/><span style={{fontSize:8}}>{op.choices[id].label}</span></button>)}</div>
 {selected&&<div style={{marginTop:8,padding:8,border:'1px solid #35506b',borderRadius:9,fontSize:10}}>{selected.detail}</div>}
 <div style={{display:'flex',gap:6,marginTop:9}}><button disabled={!choice||phase==='deployed'} onClick={deploy} style={button}>{phase==='deployed'?'DEPLOYED':'DEPLOY'}</button><button onClick={()=>{setIndex((index+1)%OPS.length);setChoice(null);setPhase('briefing')}} style={button}>NEXT FILE</button></div>
 <div style={{marginTop:8,fontSize:9,opacity:.58}}>Original fictional spy/anomaly gameplay. No real agency affiliation, real surveillance access or operational intelligence capability is implied.</div></aside>
}
const launcher:React.CSSProperties={position:'fixed',right:12,bottom:72,zIndex:9004,minHeight:44,padding:'0 12px',borderRadius:12,border:'1px solid #8de9ff66',background:'#07131de8',color:'#fff',fontWeight:900}
const panel:React.CSSProperties={position:'fixed',right:12,top:84,zIndex:17030,width:'min(360px,calc(100vw - 24px))',padding:12,borderRadius:16,background:'#050b12f2',border:'1px solid #8de9ff55',color:'#fff',fontFamily:'system-ui',boxShadow:'0 18px 50px #0009'}
const close:React.CSSProperties={width:34,height:34,borderRadius:999,border:'1px solid #ffffff33',background:'#111827',color:'#fff',fontSize:18}
const chip:React.CSSProperties={fontSize:8,padding:'4px 6px',borderRadius:999,border:'1px solid #35506b',background:'#0b1722'}
const button:React.CSSProperties={minHeight:40,padding:'0 8px',borderRadius:9,border:'1px solid #5bdcff55',background:'#101923',color:'#fff',fontSize:9,fontWeight:900}
