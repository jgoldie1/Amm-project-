import {useEffect,useMemo,useRef,useState} from 'react'
import StreetVerseReelRecorder from './StreetVerseReelRecorder'
import HoloMobilityLauncher from './HoloMobilityLauncher'

type Phase='idle'|'repair'|'drive'|'npc'|'ready'|'complete'

export default function StreetVerseMobileProofDock(){
  const [open,setOpen]=useState(true)
  const [reelOpen,setReelOpen]=useState(false)
  const [phase,setPhase]=useState<Phase>('idle')
  const [repairStep,setRepairStep]=useState(0)
  const [repaired,setRepaired]=useState(false)
  const [inVehicle,setInVehicle]=useState(false)
  const [doorsOpen,setDoorsOpen]=useState(false)
  const [doorOpenedOnce,setDoorOpenedOnce]=useState(false)
  const [enteredOnce,setEnteredOnce]=useState(false)
  const [droveOnce,setDroveOnce]=useState(false)
  const distanceDrivenRef=useRef(0)
  const lastDrivePositionRef=useRef<{x:number;z:number}|null>(null)
  const [exitedOnce,setExitedOnce]=useState(false)
  const [npcInteracted,setNpcInteracted]=useState(false)
  const [npcDialogueOpen,setNpcDialogueOpen]=useState(false)
  const [reward,setReward]=useState('')
  const missionId='iphone-first-journey'
  const repairLabels=['OPEN HOOD','FIX ENGINE','CLOSE HOOD']

  useEffect(()=>{
    const onVehicle=(event:Event)=>{
      const d=(event as CustomEvent<{entered?:boolean}>).detail||{}
      if(d.entered===true){lastDrivePositionRef.current=null;setInVehicle(true);setEnteredOnce(true);setPhase('drive')}
      if(d.entered===false){setInVehicle(false);setExitedOnce(true);setPhase('npc')}
    }
    const onRepair=(event:Event)=>{
      const d=(event as CustomEvent<{vehicleId?:string}>).detail||{}
      if(String(d.vehicleId||'')==='first-repair-car'){setRepaired(true);setRepairStep(3);setPhase('drive')}
    }
    const onContext=(event:Event)=>{
      const d=(event as CustomEvent<{kind?:string;action?:string;npcId?:string;source?:string}>).detail||{}
      if(d.npcId==='first-journey-guide'&&(d.source==='mobile-safe-world'||d.source==='streetverse-mobile-world')&&(d.kind==='talk'||String(d.action||'').toUpperCase()==='TALK')&&droveOnce&&exitedOnce&&!inVehicle){setNpcDialogueOpen(true);setPhase('npc')}
    }
    const onDrive=(event:Event)=>{
      const d=(event as CustomEvent<{speed?:number;entered?:boolean;vehicle?:boolean;mobileSafeMode?:boolean;controlledVehicleId?:string;source?:string;x?:number;z?:number}>).detail||{}
      if(!((d.mobileSafeMode===true&&d.controlledVehicleId==='safe-starter-car')||(d.mobileSafeMode===false&&d.controlledVehicleId==='first-repair-car'&&d.source==='streetverse-mobile-world'))||d.entered!==true)return
      const x=Number(d.x),z=Number(d.z)
      if(!Number.isFinite(x)||!Number.isFinite(z))return
      const last=lastDrivePositionRef.current
      if(last&&Number(d.speed||0)>0){
        const delta=Math.hypot(x-last.x,z-last.z)
        if(delta>0&&delta<10){
          distanceDrivenRef.current+=delta
          if(distanceDrivenRef.current>=8)setDroveOnce(true)
        }
      }
      lastDrivePositionRef.current={x,z}
    }
    const onReward=(event:Event)=>{
      const d=(event as CustomEvent<{id?:string;amountCredits?:number;balance?:number}>).detail||{}
      if(d.id==='first-journey')setReward(`+${Number(d.amountCredits||0)} DEMO CREDITS • BALANCE ${Number(d.balance||0)}`)
    }
    window.addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
    window.addEventListener('tryamm:streetverse-vehicle-repaired',onRepair)
    window.addEventListener('tryamm:streetverse-context-interaction',onContext)
    window.addEventListener('tryamm:streetverse-mobile-reward-recorded',onReward)
    window.addEventListener('tryamm:streetverse-drive-telemetry',onDrive)
    return()=>{
      window.removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
      window.removeEventListener('tryamm:streetverse-vehicle-repaired',onRepair)
      window.removeEventListener('tryamm:streetverse-context-interaction',onContext)
      window.removeEventListener('tryamm:streetverse-mobile-reward-recorded',onReward)
      window.removeEventListener('tryamm:streetverse-drive-telemetry',onDrive)
    }
  },[droveOnce,exitedOnce,inVehicle])

  const ready=repaired&&doorOpenedOnce&&enteredOnce&&droveOnce&&exitedOnce&&npcInteracted
  const status=useMemo(()=>{
    if(phase==='idle')return'PRESS START MISSION'
    if(!repaired)return`REPAIR • ${repairLabels[Math.min(repairStep,2)]}`
    if(!doorOpenedOnce)return'OPEN THE CAR DOOR'
    if(!enteredOnce)return'ENTER THE REPAIRED CAR'
    if(inVehicle)return droveOnce?'DRIVE RECORDED • EXIT VEHICLE':'DRIVE AT LEAST 8 METERS BEFORE EXITING'
    if(!droveOnce)return'DRIVE THE CAR TO COUNT THE JOURNEY'
    if(!exitedOnce)return'EXIT VEHICLE'
    if(!npcInteracted)return'WALK TO A PERSON / GUIDE • TAP INTERACT NPC'
    if(phase==='complete')return'MISSION COMPLETE • REEL READY'
    return'COMPLETE MISSION'
  },[phase,repaired,doorOpenedOnce,enteredOnce,droveOnce,inVehicle,exitedOnce,npcInteracted,repairStep])

  const startMission=()=>{
    setPhase('repair');setRepairStep(0);setRepaired(false);setInVehicle(false);setDoorsOpen(false);setDoorOpenedOnce(false);setEnteredOnce(false);setDroveOnce(false);distanceDrivenRef.current=0;lastDrivePositionRef.current=null;setExitedOnce(false);setNpcInteracted(false);setNpcDialogueOpen(false);setReward('');setOpen(true)
    const detail={id:missionId,missionId,title:'FIRST RIDE • REPAIR & DRIVE',objective:'Follow the gold beacon to the orange Repair Mission Car. Repair it, enter, drive, exit, interact with a Chicago NPC, then complete the mission.',source:'iphone-proof-dock',waypoint:{x:-8,z:50,label:'Repair Mission Car'}}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-start',{detail}))
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'FIRST RIDE started • follow the gold beacon to the orange repair car'}}))
  }

  const repair=()=>{
    if(repaired)return
    const next=Math.min(3,repairStep+1);setRepairStep(next)
    const completed=repairLabels[repairStep]||'REPAIR'
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-repair-step',{detail:{vehicleId:'first-repair-car',step:next,label:completed,source:'iphone-proof-dock'}}))
    if(next>=3){
      setRepaired(true);setPhase('drive')
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-repaired',{detail:{vehicleId:'first-repair-car',repairKitId:'starter-repair-kit',source:'iphone-proof-dock'}}))
      window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Repair complete • ENTER VEHICLE'}}))
    }
  }

  const toggleDoors=()=>{const next=!doorsOpen;setDoorsOpen(next);if(next)setDoorOpenedOnce(true);window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-door',{detail:{vehicleId:'first-repair-car',open:next,source:'iphone-proof-dock'}}))}
  const toggleVehicle=()=>{if(!inVehicle&&!doorOpenedOnce)return;window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:!inVehicle,source:'iphone-proof-dock'}}))}
  const interactNpc=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-input',{detail:{move:{x:0,y:0},interact:true,source:'iphone-proof-dock'}}))
    // Request nearby NPC context; do not grant completion until a real TALK context is supplied.
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-interaction-request',{detail:{missionId,source:'iphone-proof-dock'}}))
  }
  const chooseDialogue=(choice:'help'|'directions')=>{
    if(!npcDialogueOpen||!droveOnce||!exitedOnce)return
    setNpcDialogueOpen(false);setNpcInteracted(true);setPhase('ready')
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-dialogue-choice',{detail:{missionId,npcId:'first-journey-guide',choice,source:'iphone-proof-dock',completed:true}}))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-conversation-open',{detail:{missionId,npcId:'first-journey-guide',choice,source:'iphone-proof-dock'}}))
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:choice==='help'?'Guide: Thanks for helping out. Complete your mission.':'Guide: Taylor Street is ahead. Complete your mission.'}}))
  }
  const openRideShare=()=>window.dispatchEvent(new CustomEvent('tryamm:holo-mobility-open',{detail:{source:'iphone-proof-dock'}}))
  const openFaith=()=>{window.location.href='/faithverse#reader'}
  const complete=()=>{
    if(!ready)return
    setPhase('complete')
    const detail={id:missionId,missionId,label:'First Ride • Repair & Drive',title:'First Ride • Repair & Drive',source:'iphone-proof-dock',mobileLite:true,verified:true,xp:500,rewardCredits:75,steps:{repaired,doorOpenedOnce,enteredOnce,droveOnce,exitedOnce,npcInteracted}}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail}))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-complete',{detail}))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-xp-award',{detail:{missionId,amount:500,source:'iphone-proof-dock'}}))
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'MISSION COMPLETE • +500 XP • reward receipt recording • REEL unlocked'}}))
    setReelOpen(true)
  }

  const btn:React.CSSProperties={minHeight:48,borderRadius:13,border:'1px solid #4fe3ff88',background:'#071722ee',color:'#fff',font:'900 10px system-ui',padding:'8px 10px',touchAction:'manipulation'}
  return <>
    <button aria-label="Open StreetVerse iPhone action dock" onClick={()=>setOpen(v=>!v)} style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'max(14px,env(safe-area-inset-bottom))',zIndex:43000,minWidth:142,height:48,borderRadius:24,border:'2px solid #ffd75e',background:'#211800ee',color:'#fff',font:'950 11px system-ui',boxShadow:'0 0 18px #ffd75e55',touchAction:'manipulation'}}>ACTIONS • {phase==='idle'?'START':phase==='complete'?'DONE':'MISSION'}</button>
    {open&&<section aria-label="StreetVerse iPhone mission actions" style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'max(70px,calc(env(safe-area-inset-bottom) + 70px))',zIndex:42990,width:'min(94vw,430px)',padding:11,borderRadius:18,border:'1px solid #4fe3ff88',background:'#030b12f4',color:'#fff',boxShadow:'0 20px 60px #000d'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div><b style={{fontSize:12}}>IPHONE FIRST JOURNEY</b><div style={{fontSize:9,color:'#ffd75e',marginTop:3}}>{status}</div></div><button onClick={()=>setOpen(false)} style={{...btn,minWidth:44}}>×</button></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginTop:9}}>
        {phase==='idle'?<button onClick={startMission} style={{...btn,gridColumn:'1 / -1',borderColor:'#8effb7'}}>START MISSION</button>:<>
          {!repaired&&<button onClick={repair} style={{...btn,borderColor:'#ffd75e'}}>{repairLabels[Math.min(repairStep,2)]}</button>}
          {repaired&&<button onClick={toggleDoors} style={{...btn,borderColor:'#ffd75e'}}>{doorsOpen?'CLOSE DOORS':'OPEN DOORS'}</button>}
          {repaired&&<button disabled={!inVehicle&&!doorOpenedOnce} onClick={toggleVehicle} style={{...btn,borderColor:'#7be9ff',opacity:inVehicle||doorOpenedOnce?1:.45}}>{inVehicle?'EXIT VEHICLE':'ENTER VEHICLE'}</button>}
          <button onClick={interactNpc} disabled={!droveOnce||!exitedOnce||inVehicle} style={{...btn,opacity:droveOnce&&exitedOnce&&!inVehicle?1:.45}}>INTERACT NPC</button>
          <button onClick={openRideShare} style={btn}>RIDE SHARE</button>
          <button onClick={()=>setReelOpen(true)} style={btn}>REEL</button>
          <button onClick={openFaith} style={btn}>FAITH BIBLE</button>
          <button disabled={!ready||phase==='complete'} onClick={complete} style={{...btn,gridColumn:'1 / -1',opacity:ready&&phase!=='complete'?1:.45,borderColor:'#8effb7'}}>COMPLETE MISSION</button>
        </>}
      </div>
      {npcDialogueOpen&&droveOnce&&exitedOnce&&!inVehicle&&<section aria-label="Chicago NPC conversation" style={{border:'1px solid #85e9ff',borderRadius:12,padding:9,marginTop:8,background:'#092333'}}>
        <b style={{fontSize:12}}>CHICAGO GUIDE</b>
        <p style={{fontSize:12,margin:'6px 0'}}>Welcome to Taylor Street. What can I help you with?</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={()=>chooseDialogue('help')} style={btn}>I finished the repair. What next?</button>
          <button onClick={()=>chooseDialogue('directions')} style={btn}>Which way is the mission marker?</button>
        </div>
      </section>}
      {phase!=='idle'&&<div style={{fontSize:9,lineHeight:1.45,color:'#9eb0bf',marginTop:8}}>✓ repair {repaired?'DONE':'WAIT'} • ✓ door {doorOpenedOnce?'DONE':'WAIT'} • ✓ enter {enteredOnce?'DONE':'WAIT'} • ✓ drive {droveOnce?'DONE':'WAIT'} • ✓ exit {exitedOnce?'DONE':'WAIT'} • ✓ NPC {npcInteracted?'DONE':'WAIT'}{reward&&<><br/><span style={{color:'#8fffc1',fontWeight:950}}>{reward}</span></>}</div>}
    </section>}
    <HoloMobilityLauncher launcher={false}/>
    <StreetVerseReelRecorder open={reelOpen} onClose={()=>setReelOpen(false)} context={{source:'iphone-proof-dock',missionId,missionLabel:'First Ride • Repair & Drive',verified:phase==='complete',rewardStatus:phase==='complete'?'verified':'pending'}}/>
  </>
}