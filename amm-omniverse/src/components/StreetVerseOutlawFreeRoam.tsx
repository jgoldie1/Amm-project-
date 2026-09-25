import {useEffect,useMemo,useState} from 'react'

type CrimeKind='vehicle'|'property'|'street'|'crew'
type CrimeEvent={id:string;label:string;kind:CrimeKind;heat:number;xp:number;rep:number;description:string}
const EVENTS:CrimeEvent[]=[
 {id:'boosted-ride',label:'Boosted Ride',kind:'vehicle',heat:1,xp:40,rep:-1,description:'A fictional vehicle-theft encounter inside StreetVerse. Escape, abandon the attempt, return the vehicle, or surrender.'},
 {id:'corner-score',label:'Corner Score',kind:'street',heat:1,xp:35,rep:-1,description:'A fictional street-crime encounter with multiple non-graphic outcomes and escalating city response.'},
 {id:'store-hit',label:'Store Hit',kind:'property',heat:2,xp:70,rep:-2,description:'A fictional property-crime scenario. No real security procedures or real-world tactics are modeled.'},
 {id:'crew-job',label:'Crew Job',kind:'crew',heat:3,xp:110,rep:-3,description:'A higher-risk fictional crew operation with pursuit, surrender, escape, restitution and justice outcomes.'},
]
type Decision='A'|'B'|'C'|'D'
const DECISIONS:Record<Decision,{label:string;effect:string;heatDelta:number;repDelta:number}>={
 A:{label:'RUN',effect:'evade',heatDelta:1,repDelta:-1},
 B:{label:'HIDE',effect:'lay-low',heatDelta:0,repDelta:0},
 C:{label:'MAKE IT RIGHT',effect:'restitution',heatDelta:-1,repDelta:2},
 D:{label:'SURRENDER / DEAL',effect:'justice-path',heatDelta:-2,repDelta:1},
}

export default function StreetVerseOutlawFreeRoam(){
 const [open,setOpen]=useState(false),[heat,setHeat]=useState(0),[active,setActive]=useState<CrimeEvent|null>(null),[choice,setChoice]=useState<Decision|null>(null)
 const level=Math.max(0,Math.min(5,heat))
 const stars='★'.repeat(level)+'☆'.repeat(5-level)
 const status=useMemo(()=>level===0?'CLEAR':level<=2?'LOCAL RESPONSE':level<=4?'CITYWIDE RESPONSE':'MAX HEAT',[level])
 useEffect(()=>{
  const onClear=()=>{setHeat(0);setActive(null);setChoice(null)}
  addEventListener('tryamm:streetverse-incident-cleared',onClear)
  return()=>removeEventListener('tryamm:streetverse-incident-cleared',onClear)
 },[])
 const start=(event:CrimeEvent)=>{
  const next=Math.min(5,Math.max(0,heat+event.heat));setActive(event);setHeat(next);setChoice(null)
  dispatchEvent(new CustomEvent('tryamm:streetverse-crime-event',{detail:{id:event.id,kind:event.kind,heat:next,fictional:true}}))
  dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-response',{detail:{kind:'police',reason:`fictional ${event.kind} incident`,heat:next}}))
  if(next>=3)dispatchEvent(new CustomEvent('tryamm:streetverse-roadblock-state',{detail:{active:true,agency:'POLICE',level:next,radius:18+next*3,reason:'StreetVerse heat response'}}))
 }
 const decide=(id:Decision)=>{
  if(!active)return;const d=DECISIONS[id];setChoice(id);const next=Math.max(0,Math.min(5,heat+d.heatDelta));setHeat(next)
  dispatchEvent(new CustomEvent('tryamm:streetverse-mission-choice',{detail:{missionId:`crime-${active.id}`,choice:id,label:d.label,worldEffect:d.effect,missionFamily:'outlaw-free-roam'}}))
  dispatchEvent(new CustomEvent('tryamm:streetverse-world-reaction',{detail:{missionId:`crime-${active.id}`,choice:id,worldEffect:d.effect,heat:next,reputationDelta:d.repDelta,source:'outlaw-free-roam'}}))
  if(id==='C'||id==='D'){
   dispatchEvent(new CustomEvent('tryamm:streetverse-justice-path',{detail:{kind:id==='C'?'restitution':'surrender',sourceEvent:active.id,heatBefore:heat,heatAfter:next}}))
   if(next===0)dispatchEvent(new CustomEvent('tryamm:streetverse-incident-cleared',{detail:{source:'outlaw-free-roam'}}))
  }
 }
 return <>{!open?<button onClick={()=>setOpen(true)} style={launcher}>☠ OUTLAW</button>:<aside style={panel} aria-label="StreetVerse Outlaw free roam"><div style={{display:'flex',justifyContent:'space-between',gap:8}}><div><div style={{fontSize:9,fontWeight:950,color:'#ffb77b',letterSpacing:1.2}}>STREETVERSE • OUTLAW FREE-ROAM</div><strong>Heat {stars}</strong><div style={{fontSize:9,opacity:.68}}>{status}</div></div><button onClick={()=>setOpen(false)} style={close}>×</button></div>
 <div style={{fontSize:10,lineHeight:1.45,opacity:.78,marginTop:7}}>Optional fictional crime gameplay. Players may ignore it completely. Actions trigger world consequences, law response, justice outcomes and persistent decisions.</div>
 <div style={{display:'grid',gap:6,marginTop:9}}>{EVENTS.map(e=><button key={e.id} onClick={()=>start(e)} style={row}><span><b>{e.label}</b><small>{e.description}</small></span><span>+{e.heat} HEAT</span></button>)}</div>
 {active&&<div style={{marginTop:10,paddingTop:9,borderTop:'1px solid #ffffff18'}}><div style={{fontSize:9,fontWeight:950,color:'#ffd36b'}}>CURRENT INCIDENT • {active.label}</div><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginTop:6}}>{(['A','B','C','D'] as Decision[]).map(id=><button key={id} aria-pressed={choice===id} onClick={()=>decide(id)} style={{...choiceBtn,background:choice===id?'#5b2d19':'#121820'}}><b>{id}</b><br/><span style={{fontSize:8}}>{DECISIONS[id].label}</span></button>)}</div></div>}
 <div style={{fontSize:9,opacity:.55,marginTop:9}}>Game simulation only. No real criminal methods, real targets, restricted layouts, or real-world evasion procedures are modeled.</div></aside>}</>
}
const launcher:React.CSSProperties={position:'fixed',right:12,bottom:122,zIndex:17010,minHeight:44,padding:'0 12px',borderRadius:12,border:'1px solid #ff9f6a66',background:'#1a0d09e8',color:'#fff',fontWeight:900}
const panel:React.CSSProperties={position:'fixed',right:12,bottom:76,zIndex:17030,width:'min(370px,calc(100vw - 24px))',padding:12,borderRadius:16,background:'#0d0807f2',border:'1px solid #ff9f6a55',color:'#fff',fontFamily:'system-ui',boxShadow:'0 18px 50px #0009'}
const close:React.CSSProperties={width:34,height:34,borderRadius:999,border:'1px solid #ffffff33',background:'#16110f',color:'#fff',fontSize:18}
const row:React.CSSProperties={display:'flex',justifyContent:'space-between',gap:8,textAlign:'left',padding:9,borderRadius:10,border:'1px solid #5a392c',background:'#15100e',color:'#fff',fontSize:10}
const choiceBtn:React.CSSProperties={minHeight:44,padding:'4px 6px',borderRadius:9,border:'1px solid #ff9f6a44',color:'#fff',fontSize:9,fontWeight:900}
