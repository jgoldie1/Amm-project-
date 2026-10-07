import {useEffect,useMemo,useRef,useState} from 'react'

type MissionId='school-day'|'fire-response'|'ems-crash'|'traffic-safety'|'heritage-walk'|'campus-link'|'pilsen-arts'
type MissionState={id:MissionId;title:string;stage:number;startedAt:number;complete:boolean}

const MISSIONS={
  'school-day':{title:'Jefferson School Day',steps:['Go to Thomas Jefferson School','Complete any classroom activity','Enter the gym and start basketball','Finish the school-day route']},
  'fire-response':{title:'West Side Fire Response',steps:['Report to the fire scene','Wait for fire truck and firefighters','Complete rescue/fire objectives','Clear the incident']},
  'ems-crash':{title:'Roosevelt Crash Response',steps:['Report to the crash','Wait for ambulance and paramedics','Complete rescue objectives','Clear the incident']},
  'traffic-safety':{title:'Taylor/Roosevelt Traffic Safety',steps:['Report to traffic-control point','Wait for police unit','Set safe traffic control','Clear the intersection']},
  'heritage-walk':{title:'Roosevelt Heritage Walk',steps:['Reach St. Ignatius gameplay landmark','Continue to Holy Family gameplay landmark','Record the two-stop neighborhood memory','Complete the heritage walk']},
  'campus-link':{title:'UIC Campus Link',steps:['Reach the UIC Near West gateway','Check in at the campus anchor','Connect the campus to the West Side route','Complete the campus link']},
  'pilsen-arts':{title:'Pilsen Arts Walk',steps:['Reach the Pilsen mural corridor','Check in at the arts block','Capture a Reel-ready neighborhood moment','Complete the arts walk']},
} as const

const TARGETS={
  school:{x:-46,z:48},
  fire:{x:24,z:46},
  crash:{x:16,z:-18},
  traffic:{x:0,z:-48},
  ignatius:{x:42,z:8},
  holyFamily:{x:66,z:10},
  uic:{x:46,z:-22},
  pilsenArts:{x:-48,z:-54},
} as const

export default function StreetVerseWestSideMissionDirector(){
  const [open,setOpen]=useState(false)
  const [mission,setMission]=useState<MissionState|null>(null)
  const [position,setPosition]=useState({x:0,z:0})
  const [note,setNote]=useState('')
  const stageRef=useRef(0)

  useEffect(()=>{
    const onOpen=()=>setOpen(true)
    const onPosition=(event:Event)=>{const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{};if(Number.isFinite(Number(d.x))&&Number.isFinite(Number(d.z)))setPosition({x:Number(d.x),z:Number(d.z)})}
    const onClass=()=>advance('CLASS COMPLETE')
    const onSchoolRoom=(event:Event)=>{const d=(event as CustomEvent<{roomId?:string}>).detail||{};if(mission?.id==='school-day'&&stageRef.current===2&&d.roomId==='gym')finish('SCHOOL DAY COMPLETE • GYM REACHED')}
    const onUnit=(event:Event)=>{const d=(event as CustomEvent<{kind?:string}>).detail||{};const kind=String(d.kind||'');if(mission?.id==='fire-response'&&stageRef.current===1&&kind==='fire')advance('FIRE UNIT ON SCENE');if(mission?.id==='ems-crash'&&stageRef.current===1&&kind==='ambulance')advance('EMS ON SCENE');if(mission?.id==='traffic-safety'&&stageRef.current===1&&kind==='police')advance('POLICE ON SCENE')}
    const onResolved=(event:Event)=>{const d=(event as CustomEvent<{kind?:string}>).detail||{};if(mission?.id==='fire-response'&&stageRef.current>=2&&String(d.kind||'').includes('fire'))finish('FIRE INCIDENT CLEARED');if(mission?.id==='ems-crash'&&stageRef.current>=2)finish('EMS INCIDENT CLEARED')}
    const onRescueResolved=(event:Event)=>{const d=(event as CustomEvent<{kind?:string}>).detail||{};if(mission?.id==='fire-response'&&String(d.kind||'').includes('fire'))finish('FIRE RESCUE COMPLETE');if(mission?.id==='ems-crash'&&String(d.kind||'').includes('car-wreck'))finish('CRASH RESCUE COMPLETE')}
    addEventListener('tryamm:west-side-missions-open',onOpen)
    addEventListener('tryamm:streetverse-player-position',onPosition)
    addEventListener('tryamm:streetverse-school-class-complete',onClass)
    addEventListener('tryamm:school-room-enter',onSchoolRoom)
    addEventListener('tryamm:streetverse-emergency-unit-arrived',onUnit)
    addEventListener('tryamm:streetverse-emergency-resolved',onResolved)
    addEventListener('tryamm:streetverse-rescue-incident-resolved',onRescueResolved)
    return()=>{
      removeEventListener('tryamm:west-side-missions-open',onOpen);removeEventListener('tryamm:streetverse-player-position',onPosition);removeEventListener('tryamm:streetverse-school-class-complete',onClass);removeEventListener('tryamm:school-room-enter',onSchoolRoom);removeEventListener('tryamm:streetverse-emergency-unit-arrived',onUnit);removeEventListener('tryamm:streetverse-emergency-resolved',onResolved);removeEventListener('tryamm:streetverse-rescue-incident-resolved',onRescueResolved)
    }
  },[mission?.id])

  const details=useMemo(()=>mission?MISSIONS[mission.id]:null,[mission])
  const missionTarget=(id:MissionId,stage=stageRef.current)=>{
    if(id==='school-day')return TARGETS.school
    if(id==='fire-response')return TARGETS.fire
    if(id==='ems-crash')return TARGETS.crash
    if(id==='traffic-safety')return TARGETS.traffic
    if(id==='heritage-walk')return stage<=0?TARGETS.ignatius:TARGETS.holyFamily
    if(id==='campus-link')return TARGETS.uic
    return TARGETS.pilsenArts
  }
  function setStage(stage:number,message:string){stageRef.current=stage;setMission(current=>current?{...current,stage}:current);setNote(message);window.dispatchEvent(new CustomEvent('tryamm:west-side-mission-stage',{detail:{missionId:mission?.id,stage,message,source:'west-side-mission-director'}}))}
  function advance(message:string){setStage(Math.min(3,stageRef.current+1),message)}
  function finish(message:string){
    stageRef.current=3;setMission(current=>current?{...current,stage:3,complete:true}:current);setNote(message)
    window.dispatchEvent(new CustomEvent('tryamm:west-side-mission-complete',{detail:{missionId:mission?.id,title:details?.title,xp:300,rewardStatus:'pending',verified:false,source:'west-side-mission-director'}}))
  }

  const start=(id:MissionId)=>{
    const next={id,title:MISSIONS[id].title,stage:0,startedAt:Date.now(),complete:false};stageRef.current=0;setMission(next);setOpen(false);setNote('MISSION STARTED')
    if(id==='school-day'){
      window.dispatchEvent(new CustomEvent('tryamm:school-route-request',{detail:{campusId:'thomas-jefferson-legacy-campus',source:'west-side-mission-director'}}))
    }else if(id==='fire-response'){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-rescue-incident-start',{detail:{kind:'structure-fire',x:TARGETS.fire.x,z:TARGETS.fire.z,source:'west-side-mission-director'}}))
      window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...TARGETS.fire,label:'FIRE RESPONSE'}}))
    }else if(id==='ems-crash'){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-rescue-incident-start',{detail:{kind:'car-wreck',x:TARGETS.crash.x,z:TARGETS.crash.z,source:'west-side-mission-director'}}))
      window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...TARGETS.crash,label:'CRASH RESPONSE'}}))
    }else if(id==='traffic-safety'){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-response',{detail:{kind:'police',x:TARGETS.traffic.x,z:TARGETS.traffic.z,severity:1,reason:'traffic safety detail',source:'west-side-mission-director',gameplayOnly:true}}))
      window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...TARGETS.traffic,label:'TRAFFIC SAFETY'}}))
    }else if(id==='heritage-walk'){
      window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...TARGETS.ignatius,label:'ST. IGNATIUS LANDMARK'}}))
    }else if(id==='campus-link'){
      window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...TARGETS.uic,label:'UIC CAMPUS GATEWAY'}}))
    }else{
      window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...TARGETS.pilsenArts,label:'PILSEN ARTS CORRIDOR'}}))
    }
    window.dispatchEvent(new CustomEvent('tryamm:west-side-mission-start',{detail:{...next,source:'west-side-mission-director'}}))
  }

  useEffect(()=>{
    if(!mission||mission.complete)return
    const target=missionTarget(mission.id)
    const dist=Math.hypot(position.x-target.x,position.z-target.z)
    if(dist>=11)return
    if(mission.id==='heritage-walk'){
      if(stageRef.current===0){advance('ST. IGNATIUS LANDMARK REACHED');window.dispatchEvent(new CustomEvent('tryamm:west-side-route-marker',{detail:{...TARGETS.holyFamily,label:'HOLY FAMILY LANDMARK'}}));return}
      if(stageRef.current===1){setStage(2,'HOLY FAMILY LANDMARK REACHED');window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'west-side-heritage-walk',source:'west-side-mission-director'}}));finish('ROOSEVELT HERITAGE WALK COMPLETE');return}
    }
    if(mission.id==='campus-link'&&stageRef.current===0){setStage(2,'UIC CAMPUS GATEWAY REACHED');window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'uic-campus-link',source:'west-side-mission-director'}}));finish('UIC CAMPUS LINK COMPLETE');return}
    if(mission.id==='pilsen-arts'&&stageRef.current===0){setStage(2,'PILSEN ARTS CORRIDOR REACHED');window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'pilsen-arts-walk',source:'west-side-mission-director'}}));finish('PILSEN ARTS WALK COMPLETE');return}
    if(stageRef.current===0)advance('ARRIVED AT OBJECTIVE')
  },[position.x,position.z,mission?.id,mission?.complete])

  const routeToMission=()=>{
    if(!mission)return
    const target=missionTarget(mission.id)
    window.dispatchEvent(new CustomEvent('tryamm:west-side-route-request',{detail:{missionId:mission.id,...target,source:'west-side-mission-director'}}))
  }

  const trafficAction=()=>{
    if(mission?.id!=='traffic-safety'||mission.complete)return
    if(stageRef.current===2){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-roadblock-request',{detail:{kind:'police',x:TARGETS.traffic.x,z:TARGETS.traffic.z,radius:18,level:1,reason:'traffic-safety-mission'}}))
      finish('TRAFFIC CONTROL COMPLETE')
    }
  }

  return <>
    {open&&<div role="dialog" aria-modal="true" aria-label="West Side missions" style={backdrop}>
      <section style={panel}>
        <div style={{fontSize:10,letterSpacing:2,color:'#9de8ff',fontWeight:950}}>STREETVERSE • CIRCLE PARK / WEST SIDE</div>
        <h2 style={{margin:'6px 0'}}>Neighborhood Missions</h2>
        <p style={{fontSize:12,lineHeight:1.5,color:'#bdc9d1'}}>Use the school, fire, EMS and community-safety systems already built into the neighborhood. These are gameplay missions, not real emergency instructions.</p>
        <div style={{display:'grid',gap:8}}>
          <button style={button} onClick={()=>start('school-day')}>🏫 JEFFERSON SCHOOL DAY</button>
          <button style={button} onClick={()=>start('fire-response')}>🚒 WEST SIDE FIRE RESPONSE</button>
          <button style={button} onClick={()=>start('ems-crash')}>🚑 ROOSEVELT CRASH RESPONSE</button>
          <button style={button} onClick={()=>start('traffic-safety')}>🚓 TAYLOR / ROOSEVELT TRAFFIC SAFETY</button>
          <button style={button} onClick={()=>start('heritage-walk')}>⛪ ROOSEVELT HERITAGE WALK</button>
          <button style={button} onClick={()=>start('campus-link')}>🎓 UIC CAMPUS LINK</button>
          <button style={button} onClick={()=>start('pilsen-arts')}>🎨 PILSEN ARTS WALK</button>
          <button style={{...button,borderColor:'#4a6170'}} onClick={()=>setOpen(false)}>CLOSE</button>
        </div>
      </section>
    </div>}
    {mission&&<section aria-live="polite" style={{position:'fixed',left:'50%',transform:'translateX(-50%)',top:'calc(env(safe-area-inset-top,0px) + 118px)',zIndex:41018,width:'min(88vw,420px)',border:'1px solid #74dfff88',borderRadius:14,background:'#06121de8',padding:'8px 10px',color:'#fff',fontFamily:'system-ui',pointerEvents:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
        <div><div style={{fontSize:8,color:'#8ee7ff',fontWeight:950}}>WEST SIDE MISSION</div><b style={{fontSize:11}}>{mission.title}</b></div>
        <button aria-label="Close mission card" onClick={()=>setMission(null)} style={{minWidth:36,minHeight:36,borderRadius:10,border:'1px solid #365469',background:'#0b1a25',color:'#fff'}}>×</button>
      </div>
      <div style={{fontSize:9,color:'#b9c8d1',marginTop:5}}>{mission.complete?'✓ COMPLETE':details?.steps[mission.stage]||'MISSION ACTIVE'}{note?' • '+note:''}</div>
      {!mission.complete&&<button onClick={routeToMission} style={{...button,minHeight:40,marginTop:7,width:'100%',borderColor:'#68d7ff'}}>🧭 ROUTE ME TO OBJECTIVE</button>}
      {mission.id==='traffic-safety'&&!mission.complete&&mission.stage===2&&<button onClick={trafficAction} style={{...button,minHeight:42,marginTop:7,width:'100%'}}>SET SAFE TRAFFIC CONTROL</button>}
      {mission.complete&&<div style={{fontSize:8,color:'#9effbc',marginTop:5}}>300 XP pending server verification • choose another neighborhood mission from the quick menu.</div>}
    </section>}
  </>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:47250,display:'grid',placeItems:'center',padding:14,background:'rgba(3,7,11,.84)',backdropFilter:'blur(5px)'}
const panel:React.CSSProperties={width:'min(94vw,540px)',maxHeight:'88dvh',overflowY:'auto',border:'1px solid #6dcfff66',borderRadius:20,background:'#0a1219f8',color:'#fff',padding:16,fontFamily:'system-ui',boxShadow:'0 24px 80px #000d'}
const button:React.CSSProperties={minHeight:50,borderRadius:12,border:'1px solid #35657f',background:'#081923',color:'#fff',fontWeight:950,padding:'10px 12px',textAlign:'left',touchAction:'manipulation'}
