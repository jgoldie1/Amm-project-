import {useEffect,useMemo,useState} from 'react'

type Pos={x?:number;z?:number}
type Step={speaker:string;text:string;objective:string;x:number;z:number}
type Mission={id:string;title:string;lane:'CELEBRITY BOSS'|'RAPPER';xp:number;steps:Step[]}

const MISSIONS:Mission[]=[
 {id:'celebrity-boss-01',title:'Celebrity Boss: The Headliner',lane:'CELEBRITY BOSS',xp:420,steps:[
  {speaker:'Bennie',text:'Big arrival in the city. Keep the route clean, get the headliner to soundcheck, and make the moment worth clipping.',objective:'Meet the headliner convoy',x:34,z:-8},
  {speaker:'Nova Crown',text:'I do not need a red carpet. I need a flawless entrance, a live crowd, and a Reel people replay tomorrow.',objective:'Escort Nova Crown to the venue',x:-34,z:34},
  {speaker:'Tour Manager',text:'Soundcheck is late. Get the production crate from the studio before doors open.',objective:'Collect the production crate',x:-42,z:-30},
  {speaker:'Nova Crown',text:'That is how you run a city. Give the crowd one clean finish and we are live.',objective:'Reach the performance stage',x:38,z:38}]},
 {id:'rapper-studio-01',title:'Rapper Mission: Studio Pressure',lane:'RAPPER',xp:300,steps:[
  {speaker:'Bennie',text:'Studio session just went hot. The artist needs the beat pack, the engineer, and a clean take before the deadline.',objective:'Report to Aniyah 64 Track Studio',x:-42,z:-30},
  {speaker:'Kilo Verse',text:'I got the hook. Bring the beat pack and keep the room focused. No wasted bars tonight.',objective:'Pick up the beat pack',x:10,z:-18},
  {speaker:'Engineer Rae',text:'Levels are set. Get back in the booth zone and lock the final take.',objective:'Return for the final take',x:-42,z:-30}]},
 {id:'rapper-city-02',title:'Rapper Mission: City Rollout',lane:'RAPPER',xp:360,steps:[
  {speaker:'Bennie',text:'The single is finished. Now turn the whole city into the rollout.',objective:'Meet the artist at the Riverwalk',x:28,z:-12},
  {speaker:'Jett South',text:'One verse, three locations, no dead energy. We shoot it moving.',objective:'Shoot the downtown Reel moment',x:20,z:28},
  {speaker:'Jett South',text:'Now take it to the neighborhood. I want the business stop in the video too.',objective:'Hit the West Side business stop',x:-72,z:10},
  {speaker:'Bennie',text:'Rollout complete. Push the final moment to Reels and close the mission.',objective:'Finish at the creator stage',x:38,z:38}]}
]

export default function StreetVerseCelebrityRapperMissions(){
 const [pos,setPos]=useState({x:0,z:0}),[mission,setMission]=useState<Mission|null>(null),[step,setStep]=useState(0),[open,setOpen]=useState(false)
 useEffect(()=>{const fn=(e:Event)=>{const d=(e as CustomEvent<Pos>).detail||{};setPos({x:Number(d.x||0),z:Number(d.z||0)})};addEventListener('tryamm:streetverse-player-position',fn);return()=>removeEventListener('tryamm:streetverse-player-position',fn)},[])
 const current=mission?.steps[step],distance=current?Math.hypot(pos.x-current.x,pos.z-current.z):999
 const nearest=useMemo(()=>MISSIONS.map(m=>({...m,d:Math.hypot(pos.x-m.steps[0].x,pos.z-m.steps[0].z)})).sort((a,b)=>a.d-b.d)[0],[pos])
 const start=(m:Mission)=>{setMission(m);setStep(0);setOpen(true);dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:m.id,label:m.title,financialReward:false,lane:m.lane}}))}
 const advance=()=>{if(!mission||!current||distance>10)return;if(step<mission.steps.length-1){setStep(step+1);dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{missionId:mission.id,speaker:current.speaker,text:current.text,step}}))}else{dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:mission.id,label:mission.title,xp:mission.xp,financialReward:false,lane:mission.lane}}));dispatchEvent(new CustomEvent('tryamm:streetverse-reel-moment',{detail:{missionId:mission.id,title:mission.title}}));setMission(null);setStep(0)}}
 return <div style={{position:'fixed',left:12,top:330,zIndex:16996,fontFamily:'system-ui',color:'#fff'}}>
  {!mission&&!open&&<button onClick={()=>setOpen(true)} style={btn('#ff74c8')}>🎤 STAR MISSIONS</button>}
  {open&&!mission&&<div style={panel}><b>🎤 CELEBRITY + RAPPER MISSIONS</b><div style={{opacity:.72,fontSize:11,margin:'5px 0 8px'}}>Dialogue missions • original in-world stars</div>{MISSIONS.map(m=><button key={m.id} onClick={()=>start(m)} style={{...btn(m.lane==='CELEBRITY BOSS'?'#ffd36b':'#77e7ff'),display:'block',width:'100%',marginTop:6,textAlign:'left'}}>{m.title} • {m.xp} XP</button>)}<button onClick={()=>setOpen(false)} style={{...btn('#ddd'),marginTop:8}}>CLOSE</button></div>}
  {mission&&current&&<div style={panel}><b>{mission.title}</b><div style={{fontSize:11,opacity:.7,marginTop:3}}>STEP {step+1}/{mission.steps.length} • {Math.round(distance)}m</div><div style={{marginTop:8,fontWeight:900,color:'#ffd36b'}}>{current.speaker}</div><div style={{fontSize:12,lineHeight:1.35,marginTop:3}}>{current.text}</div><div style={{fontSize:11,marginTop:8,opacity:.8}}>OBJECTIVE: {current.objective}</div><button disabled={distance>10} onClick={advance} style={{...btn(distance<=10?'#88ffad':'#777'),marginTop:9,width:'100%'}}>{distance<=10?(step===mission.steps.length-1?'COMPLETE MISSION':'CONTINUE DIALOGUE'):'GO TO OBJECTIVE'}</button></div>}
 </div>
}
const panel:React.CSSProperties={width:300,padding:12,borderRadius:14,background:'rgba(10,7,20,.94)',border:'1px solid #ff74c866',boxShadow:'0 12px 34px #0009'}
const btn=(color:string):React.CSSProperties=>({minHeight:40,padding:'8px 11px',borderRadius:10,border:'1px solid #ffffff33',background:'#111827ee',color,fontWeight:900,fontSize:11,cursor:'pointer'})
