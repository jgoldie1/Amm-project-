import {useEffect,useRef,useState} from 'react'
import './StreetVerseCinematicMissions.css'

type Scene={location:string;camera:string;speaker:string;dialogue:string}
type Objective={label:string;x:number;z:number}
type Mission={id:string;title:string;district:string;intro:string;scenes:Scene[];objectives:Objective[]}
type Phase='closed'|'select'|'cinematic'|'active'|'complete'
const MISSIONS:Mission[]=[
 {id:'hold-the-block',title:'Hold the Block',district:'Circle Park · Taylor Street',intro:'Meet your crew, secure the neighborhood gateway and build a positive community reputation.',scenes:[
  {location:'EXT. CIRCLE PARK · EARLY EVENING',camera:'AERIAL → STREET LEVEL',speaker:'NARRATOR',dialogue:'Chicago. Every block has a story. Tonight, you write the next chapter.'},
  {location:'EXT. TAYLOR STREET · GUARD GATE',camera:'LOW ANGLE · BJ ARRIVES',speaker:'GATE ATTENDANT',dialogue:'Welcome home, BJ. The neighborhood needs a leader who listens before making a move.'},
  {location:'EXT. COMMUNITY PLAZA',camera:'CLOSE-UP → CREW TWO-SHOT',speaker:'BJ',dialogue:'We keep people safe, support the shops, and earn this block together.'}],
  objectives:[{label:'Reach the Taylor Street guarded entrance',x:0,z:-35},{label:'Meet the neighborhood community crew',x:8,z:-24},{label:'Check in at the district control point',x:16,z:-18}]},
 {id:'business-on-the-block',title:'Business on the Block',district:'West Side · Marketplace',intro:'Discover a storefront, meet its owner and unlock the next community-building story.',scenes:[
  {location:'EXT. WEST SIDE MARKET · DAY',camera:'ESTABLISHING · STOREFRONTS',speaker:'NARRATOR',dialogue:'A neighborhood grows when local businesses can be seen and supported.'},
  {location:'INT. NEIGHBORHOOD SHOP',camera:'OVER-SHOULDER · OWNER',speaker:'SHOP OWNER',dialogue:'I can make great products. Help me make sure customers know we are here.'},
  {location:'EXT. STOREFRONT · SUNSET',camera:'TWO-SHOT · BJ AND OWNER',speaker:'BJ',dialogue:'We can make a business passport, share a Reel and put this shop on the map.'}],
  objectives:[{label:'Visit the West Side business storefront',x:8,z:-24},{label:'Meet the shopkeeper and review the business passport',x:10,z:-20},{label:'Return to the community square',x:16,z:-18}]},
 {id:'first-ride-story',title:'First Ride — Chicago',district:'Taylor Street · First Journey',intro:'A cinematic chapter that leads into the existing vehicle-repair and first-journey gameplay.',scenes:[
  {location:'EXT. TAYLOR STREET · GOLDEN HOUR',camera:'TRACKING SHOT · BJ WALKING',speaker:'NARRATOR',dialogue:'The next opportunity is never far, but getting there can change everything.'},
  {location:'EXT. REPAIR CAR · CURBSIDE',camera:'DETAIL · CAR HOOD',speaker:'MECHANIC',dialogue:'That car needs a careful inspection before anyone drives it.'},
  {location:'EXT. CITY STREET · DRIVER VIEW',camera:'CAMERA FOLLOWS BJ',speaker:'BJ',dialogue:'We fix it right, take the safe route, and meet the guide.'}],
  objectives:[{label:'Find the gold repair-car marker',x:0,z:-35},{label:'Inspect and prepare the car',x:8,z:-24},{label:'Meet the first-journey guide',x:16,z:-18}]},
]
const defaultMission=MISSIONS[0]
export default function StreetVerseCinematicMissions(){
 const [phase,setPhase]=useState<Phase>('closed')
 const [selected,setSelected]=useState<Mission>(defaultMission)
 const [sceneIndex,setSceneIndex]=useState(0)
 const [step,setStep]=useState(0)
 const [notice,setNotice]=useState('')
 const [position,setPosition]=useState<{x:number;z:number}|null>(null)
 const [rehearsed,setRehearsed]=useState(false)
 const activeRef=useRef(false)
 useEffect(()=>{
  const open=(event:Event)=>{
   const detail=(event as CustomEvent<{missionId?:string}>).detail||{}
   const next=MISSIONS.find(m=>m.id===detail.missionId)
   if(next){setSelected(next);setSceneIndex(0);setPhase('cinematic');setStep(0);setNotice('')}
   else setPhase(old=>old==='active'||old==='complete'?old:'select')
  }
  const onPosition=(event:Event)=>{
   const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{}
   if(Number.isFinite(d.x)&&Number.isFinite(d.z))setPosition({x:Number(d.x),z:Number(d.z)})
  }
  window.addEventListener('tryamm:streetverse-cinematic-mission-open',open)
  window.addEventListener('tryamm:streetverse-player-position',onPosition)
  return()=>{window.removeEventListener('tryamm:streetverse-cinematic-mission-open',open);window.removeEventListener('tryamm:streetverse-player-position',onPosition)}
 },[])
 const start=(mission:Mission)=>{setSelected(mission);setSceneIndex(0);setStep(0);setNotice('');setRehearsed(false);setPhase('cinematic')}
 const nextScene=()=>{
  if(sceneIndex<selected.scenes.length-1){setSceneIndex(i=>i+1);return}
  setPhase('active');activeRef.current=true
  const detail={id:selected.id,missionId:selected.id,title:selected.title,objective:selected.objectives[0].label,source:'cinematic-mission-director',scripted:true,verified:false,financialReward:false}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...selected.objectives[0],missionId:selected.id,label:selected.objectives[0].label,source:'cinematic-mission-director'}}))
  window.dispatchEvent(new CustomEvent('tryamm:city-navigation-target',{detail:{type:'mission',missionId:selected.id,label:selected.objectives[0].label,source:'cinematic-mission-director'}}))
  if(selected.id==='first-ride-story')window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-start',{detail:{source:'cinematic-mission-director'}}))
 }
 const objective=selected.objectives[step]
 const distance=objective&&position?Math.hypot(position.x-objective.x,position.z-objective.z):null
 const closeEnough=distance!==null&&distance<=12
 const advance=(storyOnly:boolean)=>{
  if(!storyOnly&&!closeEnough){setNotice('Move closer to the marked location, or use Story Rehearsal to see the script without rewards.');return}
  if(storyOnly)setRehearsed(true)
  const next=step+1
  if(next>=selected.objectives.length){
   setPhase('complete');activeRef.current=false;setNotice('Chapter finished locally. No cash, XP or territory ownership was awarded.')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-cinematic-chapter-finished',{detail:{missionId:selected.id,storyOnly:true,verified:false,financialReward:false}}))
  }else{
   setStep(next);setNotice(storyOnly?'Story rehearsal only · no validated mission reward.':'Waypoint reached · next objective available.')
   window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...selected.objectives[next],missionId:selected.id,label:selected.objectives[next].label,source:'cinematic-mission-director'}}))
  }
 }
 return <>
  <button className="sv-cine-launcher" type="button" aria-label="Open scripted StreetVerse missions" onClick={()=>setPhase(p=>p==='active'||p==='complete'?p:'select')}>🎬 MISSIONS {phase==='active'?'• ACTIVE':''}</button>
  {phase==='select'&&<section role="dialog" aria-modal="true" aria-label="StreetVerse scripted mission selection" className="sv-cine-screen sv-cine-picker"><div className="sv-cine-card"><div className="sv-cine-tag">STREETVERSE · CHICAGO STORY MODE</div><h2>Choose your cinematic mission</h2><p>Each story opens with a fade-to-black scene, scripted dialogue, then visible objectives inside the game.</p><div className="sv-cine-choices">{MISSIONS.map(m=><button key={m.id} type="button" onClick={()=>start(m)}><small>{m.district}</small><strong>{m.title}</strong><span>{m.intro}</span><b>PLAY STORY ↗</b></button>)}</div><button className="sv-cine-secondary" onClick={()=>setPhase('closed')}>RETURN TO GAME</button></div></section>}
  {phase==='cinematic'&&<section key={selected.id+'-'+sceneIndex} role="dialog" aria-modal="true" aria-label="StreetVerse cinematic cutscene" className="sv-cine-screen sv-cine-movie"><div className="sv-cine-letterbox sv-cine-top"/><div className="sv-cine-caption"><small>SCENE {sceneIndex+1} / {selected.scenes.length} · {selected.district}</small><h2>{selected.scenes[sceneIndex].location}</h2><p className="sv-cine-camera">{selected.scenes[sceneIndex].camera}</p><div className="sv-cine-subtitle"><strong>{selected.scenes[sceneIndex].speaker}</strong><p>{selected.scenes[sceneIndex].dialogue}</p></div><div className="sv-cine-actions"><button onClick={nextScene}>{sceneIndex===selected.scenes.length-1?'ENTER MISSION →':'NEXT SCENE →'}</button><button onClick={()=>setPhase('select')}>CHOOSE ANOTHER MISSION</button></div><p className="sv-cine-disclaimer">Interactive scripted cutscene; camera shots and voice acting require approved 3D animation/audio assets.</p></div><div className="sv-cine-letterbox sv-cine-bottom"/></section>}
  {(phase==='active'||phase==='complete')&&<section className="sv-cine-objective" aria-label="StreetVerse scripted mission objective"><header><div><small>{phase==='complete'?'CHAPTER COMPLETE':'MISSION ACTIVE · '+selected.district}</small><h2>{selected.title}</h2></div><button aria-label="Dismiss scripted mission card" onClick={()=>setPhase('closed')}>×</button></header>{phase==='active'?<><p>{step+1}/{selected.objectives.length} · {objective.label}</p><p aria-live="polite">{distance===null?'Searching for game position…':Math.round(distance)+' world units to objective'}{rehearsed?' · rehearsal only':''}</p><div className="sv-cine-actions"><button onClick={()=>advance(false)} disabled={!closeEnough}>INTERACT AT WAYPOINT</button><button onClick={()=>advance(true)}>CONTINUE STORY REHEARSAL</button></div></>:<p>{notice} You can open a new story chapter.</p>}{notice&&phase==='active'&&<p role="status">{notice}</p>}<button className="sv-cine-secondary" onClick={()=>setPhase('select')}>CHOOSE NEXT MISSION</button></section>}
 </>
}
