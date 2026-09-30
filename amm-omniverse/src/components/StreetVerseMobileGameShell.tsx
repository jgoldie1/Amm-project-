import {useEffect,useRef,useState} from 'react'
import {StreetVerseOneHandController} from '../runtime/StreetVerseOneHandController'
import {DEFAULT_ONE_HAND_PROFILE,resolveOneHandMode} from '../runtime/OneHandGameplayAccessibility'

type Props={onClose:()=>void}
type Dir='up'|'down'|'left'|'right'
type ControlMode='one-hand'|'two-hand'
type Hand='left'|'right'
type MissionChoice='A'|'B'|'C'|'D'
type MissionSpecialUnlock={missionId?:string;kind?:string;label:string;description:string;source?:string;unlockedAt?:string}
type MissionPrompt={missionId?:string;title:string;objective?:string;routes?:Partial<Record<MissionChoice,string>>;specialRoute?:MissionSpecialUnlock}
type FameSnapshot={fame:number;rank:string;fanbase:number;viralScore:number;momentum:number}
type FirstJourneyPhase='idle'|'active'|'ready'|'complete'
type RepairContext={vehicleId:string;label:string}
type RepairRuntimeAction='inspect'|'open-hood'|'diagnose'|'use-repair-kit'|'repair'|'verify'
const REPAIR_TAP_ACTIONS:ReadonlyArray<ReadonlyArray<{action:RepairRuntimeAction;repairKitId?:string}>>=[
 [{action:'inspect'},{action:'open-hood'}],
 [{action:'diagnose'},{action:'use-repair-kit',repairKitId:'starter-repair-kit'},{action:'repair'}],
 [{action:'verify'}],
]

const MODE_KEY='tryamm:streetverse-control-mode'
const HAND_KEY='tryamm:streetverse-one-hand-side'
const FAME_KEY='tryamm.streetverse.fame.v1'
const CHOICE_MODEL={
 A:{label:'ACTION',description:'Physical gameplay, driving, rescue, timed objective or high-energy route.'},
 B:{label:'BUILD / BUSINESS',description:'Commerce, negotiation, repair, delivery, ownership, team or community route.'},
 C:{label:'LEARN / TEST',description:'Lesson, investigation, puzzle, skill test, certification or knowledge route.'},
 D:{label:'SPECIAL / EARNED',description:'A contextual route unlocked by fame, skill, relationship, item, business, education, reputation, faith, or discovered information.'},
} as const

function readFameSnapshot():FameSnapshot{
 try{
  const parsed=JSON.parse(localStorage.getItem(FAME_KEY)||'null')
  return {fame:Number(parsed?.fame||0),rank:String(parsed?.rank||'Unknown'),fanbase:Number(parsed?.fanbase||0),viralScore:Number(parsed?.viralScore||0),momentum:Number(parsed?.momentum||0)}
 }catch{return{fame:0,rank:'Unknown',fanbase:0,viralScore:0,momentum:0}}
}

export default function StreetVerseMobileGameShell({onClose}:Props){
 const [mobile,setMobile]=useState(false)
 const [mode,setMode]=useState<ControlMode>('two-hand')
 const [hand,setHand]=useState<Hand>('right')
 const [activeMission,setActiveMission]=useState<MissionPrompt>({title:'Choose your StreetVerse route'})
 const [choicePrompt,setChoicePrompt]=useState<MissionPrompt>({title:'Choose your StreetVerse route'})
 const [choiceOpen,setChoiceOpen]=useState(false)
 const [specialUnlock,setSpecialUnlock]=useState<MissionSpecialUnlock|null>(null)
 const [fame,setFame]=useState<FameSnapshot>(()=>readFameSnapshot())
 const [inVehicle,setInVehicle]=useState(false)
 const [cruise,setCruise]=useState(false)
 const [firstJourneyPhase,setFirstJourneyPhase]=useState<FirstJourneyPhase>('idle')
 const [repairContext,setRepairContext]=useState<RepairContext|null>(null)
 const [repairStep,setRepairStep]=useState(0)
 const [directAnalog,setDirectAnalog]=useState(false)
 const [focusMenuOpen,setFocusMenuOpen]=useState(false)
 const active=useRef<Record<Dir,boolean>>({up:false,down:false,left:false,right:false})
 const vehicleActiveRef=useRef(false)
 const cruiseRef=useRef(false)
 const oneHandController=useRef<StreetVerseOneHandController|null>(null)
 const shellJoystickKnobRef=useRef<HTMLDivElement|null>(null)
 const emit=()=>{
  if(!oneHandController.current){
   oneHandController.current=new StreetVerseOneHandController({
    applyInput:(frame)=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-input',{detail:{...frame,source:'one-hand-controller'}}))},
    setCameraAssist:(enabled)=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-camera-assist',{detail:{enabled,source:'one-hand-controller'}}))},
    setGameSpeed:(scale)=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-game-speed',{detail:{scale,source:'one-hand-controller'}}))},
   })
  }
  if(mode==='one-hand'){
   oneHandController.current.setProfile({...DEFAULT_ONE_HAND_PROFILE,mode:resolveOneHandMode(hand)})
   void oneHandController.current.update({stick:{x:(active.current.right?1:0)-(active.current.left?1:0),y:(active.current.down?1:0)-(active.current.up?1:0)},context:'ON_FOOT'})
  }
  const detail={throttle:(active.current.up||(vehicleActiveRef.current&&cruiseRef.current))?1:0,brake:active.current.down?1:0,steer:active.current.left?-1:active.current.right?1:0,horn:false,exit:false,source:'mobile-game-shell'}
  // Keep the vehicle-input contract for existing worlds and also publish the
  // explicit mobile movement contract so walking does not depend on vehicle semantics.
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-input',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-movement',{detail:{up:active.current.up,down:active.current.down,left:active.current.left,right:active.current.right,source:'mobile-game-shell'}}))
 }
 const set=(direction:Dir,pressed:boolean)=>{active.current[direction]=pressed;emit()}
 const release=()=>{active.current={up:false,down:false,left:false,right:false};emit()}
 useEffect(()=>{
  setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')||Math.min(window.innerWidth,window.innerHeight)<=600)
  try{
   const saved=localStorage.getItem(MODE_KEY)
   const savedHand=localStorage.getItem(HAND_KEY)
   if(savedHand==='left'||savedHand==='right')setHand(savedHand)
   if(saved==='one-hand'&&(savedHand==='left'||savedHand==='right'))setMode('one-hand')
   else if(saved==='two-hand')setMode('two-hand')
  }catch{}
  const stop=()=>release()
  const onVehicleControlled=(event:Event)=>{const d=(event as CustomEvent<{entered?:boolean}>).detail||{};const entered=d.entered===true;vehicleActiveRef.current=entered;setInVehicle(entered);if(entered){let savedOneHand=false;try{savedOneHand=localStorage.getItem(MODE_KEY)==='one-hand'}catch{};if(savedOneHand){cruiseRef.current=true;setCruise(true);active.current.up=false;window.dispatchEvent(new CustomEvent('tryamm:streetverse-cruise',{detail:{active:true,source:'mobile-game-shell-auto-one-hand'}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'ONE-HAND CRUISE AUTO ON • steer with one finger'}}))}}else{cruiseRef.current=false;setCruise(false);active.current.up=false;emit()}}
  const onWorldReady=(event:Event)=>{const d=(event as CustomEvent<{mode?:string;canvas?:boolean;htmlCity?:boolean}>).detail||{};setDirectAnalog(d.mode==='mobile-lite'&&d.canvas===true&&d.htmlCity!==true)}
  const rememberMission=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const missionId=String(d.missionId||d.id||d.eventId||'')||undefined;const title=String(d.title||d.label||d.mission||'Active StreetVerse mission');const objective=String(d.objective||'')||undefined;const routes=d.routes&&typeof d.routes==='object'?d.routes as Partial<Record<MissionChoice,string>>:undefined;setActiveMission({missionId,title,objective,routes})}
  const openChoice=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const missionId=String(d.missionId||d.campaignId||d.id||'')||undefined;const title=String(d.title||d.label||'Choose your StreetVerse route');const objective=String(d.objective||'')||undefined;const routes=d.routes&&typeof d.routes==='object'?d.routes as Partial<Record<MissionChoice,string>>:undefined;const eventSpecial=d.specialRoute&&typeof d.specialRoute==='object'?d.specialRoute as MissionSpecialUnlock:undefined;const contextual=specialUnlock&&(!specialUnlock.missionId||specialUnlock.missionId==='session-active'||specialUnlock.missionId===missionId)?specialUnlock:undefined;setChoicePrompt({missionId,title,objective,routes,specialRoute:eventSpecial||contextual});setChoiceOpen(true)}
  const onSpecialUnlock=(event:Event)=>{const d=(event as CustomEvent<MissionSpecialUnlock>).detail;if(!d?.label||!d?.description)return;setSpecialUnlock(d);window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:`Special mission route unlocked: ${d.label}`}}))}
  const onFame=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};setFame({fame:Number(d.fame||0),rank:String(d.rank||'Unknown'),fanbase:Number(d.fanbase||0),viralScore:Number(d.viralScore||0),momentum:Number(d.momentum||0)})}
  const onFirstJourneyReady=()=>setFirstJourneyPhase('ready')
  const onFirstJourneyComplete=()=>{setFirstJourneyPhase('complete');setRepairContext(null);setRepairStep(3)}
  const onInteractionContext=(event:Event)=>{const d=(event as CustomEvent<{kind?:string;vehicleId?:string;label?:string;broken?:boolean}>).detail||{};if(d.kind==='vehicle'&&d.broken&&d.vehicleId){setRepairContext({vehicleId:String(d.vehicleId),label:String(d.label||'Repair Mission Car')});setRepairStep(step=>Math.min(step,2))}}
  const onVehicleRepaired=(event:Event)=>{const d=(event as CustomEvent<{vehicleId?:string}>).detail||{};if(String(d.vehicleId||'')==='first-repair-car'){setRepairStep(3);window.dispatchEvent(new CustomEvent('tryamm:streetverse-repair-step',{detail:{vehicleId:'first-repair-car',step:3,source:'authoritative-repair-confirmation'}}))}}
  window.addEventListener('blur',stop);window.addEventListener('pointercancel',stop);document.addEventListener('visibilitychange',stop);window.addEventListener('tryamm:streetverse-vehicle-controlled',onVehicleControlled);window.addEventListener('tryamm:streetverse-world-ready',onWorldReady)
  const missionContextEvents=['tryamm:streetverse-mission-start','tryamm:chicago-activity-start','tryamm:streetverse-checkpoint','tryamm:streetverse-mobile-mission-zone','tryamm:mission:discovered','tryamm:justice-mission-start','tryamm:time-machine-enter'] as const
  missionContextEvents.forEach(name=>window.addEventListener(name,rememberMission))
  const syncControlMode=(event:Event)=>{const d=(event as CustomEvent<{mode?:string;hand?:string}>).detail||{};if(d.mode==='one-hand'&&(d.hand==='left'||d.hand==='right')){setHand(d.hand);setMode('one-hand');try{localStorage.setItem(HAND_KEY,d.hand);localStorage.setItem(MODE_KEY,'one-hand')}catch{}}else if(d.mode==='two-hand'){setMode('two-hand');try{localStorage.setItem(MODE_KEY,'two-hand')}catch{}}}
  const syncAccessibility=(event:Event)=>{const d=(event as CustomEvent<{mobility?:string;handedness?:string}>).detail||{};if(d.mobility==='one-hand'){if(d.handedness==='left'||d.handedness==='right'){setHand(d.handedness);setMode('one-hand');try{localStorage.setItem(HAND_KEY,d.handedness);localStorage.setItem(MODE_KEY,'one-hand')}catch{}}else{setMode('two-hand');try{localStorage.setItem(MODE_KEY,'two-hand')}catch{};window.dispatchEvent(new CustomEvent('tryamm:one-hand-side-required',{detail:{source:'passport',reason:'explicit-side-required'}}))}}else if(d.mobility==='standard'){setMode('two-hand');try{localStorage.setItem(MODE_KEY,'two-hand')}catch{}}}
  window.addEventListener('tryamm:rp-choice-open',openChoice);window.addEventListener('tryamm:mission-choice-open',openChoice);window.addEventListener('tryamm:mission:special-route-unlocked',onSpecialUnlock);window.addEventListener('tryamm:streetverse-special-route-unlock',onSpecialUnlock);window.addEventListener('tryamm:streetverse-fame-state',onFame);window.addEventListener('tryamm:accessibility-apply',syncAccessibility);window.addEventListener('tryamm:streetverse-control-mode',syncControlMode);window.addEventListener('tryamm:streetverse-first-journey-ready-to-complete',onFirstJourneyReady);window.addEventListener('tryamm:streetverse-first-journey-complete',onFirstJourneyComplete);window.addEventListener('tryamm:streetverse-interaction-context',onInteractionContext);window.addEventListener('tryamm:streetverse-vehicle-repaired',onVehicleRepaired)
  return()=>{window.removeEventListener('blur',stop);window.removeEventListener('pointercancel',stop);document.removeEventListener('visibilitychange',stop);window.removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicleControlled);window.removeEventListener('tryamm:streetverse-world-ready',onWorldReady);missionContextEvents.forEach(name=>window.removeEventListener(name,rememberMission));window.removeEventListener('tryamm:rp-choice-open',openChoice);window.removeEventListener('tryamm:mission-choice-open',openChoice);window.removeEventListener('tryamm:mission:special-route-unlocked',onSpecialUnlock);window.removeEventListener('tryamm:streetverse-special-route-unlock',onSpecialUnlock);window.removeEventListener('tryamm:streetverse-fame-state',onFame);window.removeEventListener('tryamm:accessibility-apply',syncAccessibility);window.removeEventListener('tryamm:streetverse-control-mode',syncControlMode);window.removeEventListener('tryamm:streetverse-first-journey-ready-to-complete',onFirstJourneyReady);window.removeEventListener('tryamm:streetverse-first-journey-complete',onFirstJourneyComplete);window.removeEventListener('tryamm:streetverse-interaction-context',onInteractionContext);window.removeEventListener('tryamm:streetverse-vehicle-repaired',onVehicleRepaired)}
 },[])
 if(!mobile)return null
 const activateTwoHand=()=>{release();setMode('two-hand');try{localStorage.setItem(MODE_KEY,'two-hand')}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:'two-hand'}}));window.dispatchEvent(new CustomEvent('tryamm:passport-access-save',{detail:{oneHandedMode:false}}))}
 const activateOneHand=(next:Hand)=>{release();setHand(next);setMode('one-hand');try{localStorage.setItem(MODE_KEY,'one-hand');localStorage.setItem(HAND_KEY,next)}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:'one-hand',hand:next}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-one-hand-side',{detail:{hand:next,source:'mobile-game-shell'}}));window.dispatchEvent(new CustomEvent('tryamm:passport-access-save',{detail:{oneHandedMode:true,oneHand:next}}))}
 const control=(label:string,direction:Dir)=><button aria-label={`StreetVerse ${direction}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);set(direction,true)}} onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{};set(direction,false)}} onPointerCancel={()=>set(direction,false)} onPointerLeave={e=>{if(e.buttons===0)set(direction,false)}} style={{width:56,height:52,borderRadius:15,border:'2px solid #7be9ff',background:'#020914ee',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none',boxShadow:'0 0 14px #00d9ff66'}}>{label}</button>
 const shellJoystick=(e:React.PointerEvent<HTMLDivElement>)=>{e.preventDefault();const rect=e.currentTarget.getBoundingClientRect();const x=Math.max(-1,Math.min(1,(e.clientX-(rect.left+rect.width/2))/(rect.width*.36)));const y=Math.max(-1,Math.min(1,(e.clientY-(rect.top+rect.height/2))/(rect.height*.36)));active.current={up:y<-.14,down:y>.14,left:x<-.14,right:x>.14};emit();window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-input',{detail:{move:{x,y},source:'mobile-game-shell-visible-joystick'}}));if(shellJoystickKnobRef.current)shellJoystickKnobRef.current.style.transform=`translate3d(${Math.round(x*30)}px,${Math.round(y*30)}px,0)`}
 const stopShellJoystick=()=>{active.current={up:false,down:false,left:false,right:false};emit();window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-input',{detail:{move:{x:0,y:0},source:'mobile-game-shell-visible-joystick'}}));if(shellJoystickKnobRef.current)shellJoystickKnobRef.current.style.transform='translate3d(0,0,0)'}
 const action=()=>{if(navigator.vibrate)try{navigator.vibrate(12)}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-action',{detail:{source:'mobile-game-shell',mode,hand:mode==='one-hand'?hand:undefined}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{source:'mobile-game-shell',mode,hand:mode==='one-hand'?hand:undefined}}))}
 const toggleCruise=()=>{if(!inVehicle)return;const next=!cruiseRef.current;cruiseRef.current=next;setCruise(next);active.current.up=false;window.dispatchEvent(new CustomEvent('tryamm:streetverse-cruise',{detail:{active:next,source:'mobile-game-shell'}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:next?'ONE-HAND CRUISE ON • steer with one finger':'ONE-HAND CRUISE OFF'}}))}
 const exitVehicle=()=>{cruiseRef.current=false;setCruise(false);active.current.up=false;window.dispatchEvent(new CustomEvent('tryamm:streetverse-cruise',{detail:{active:false,source:'mobile-game-shell-exit'}}));emit();window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:false,source:'mobile-game-shell-exit'}}))}
 const camera=(direction:'left'|'right')=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-camera-input',{detail:{direction,source:'mobile-game-shell'}}))
 const openHolo=(liveMode:'live'|'pk')=>{release();window.dispatchEvent(new CustomEvent('tryamm:streetverse-holo-livepk',{detail:{mode:liveMode,source:'streetverse-mobile-game-shell',preserveWorld:true}}));if(navigator.vibrate)try{navigator.vibrate(16)}catch{}}
 const openMissionChoice=()=>{const contextual=specialUnlock&&(!specialUnlock.missionId||specialUnlock.missionId==='session-active'||specialUnlock.missionId===activeMission.missionId)?specialUnlock:undefined;const prompt={...activeMission,title:activeMission.title||'Choose your StreetVerse route',specialRoute:contextual};setChoicePrompt(prompt);setChoiceOpen(true);window.dispatchEvent(new CustomEvent('tryamm:mission-choice-opened',{detail:{...prompt,mode,hand:mode==='one-hand'?hand:undefined,source:'mobile-game-shell'}}))}
 const chooseMissionRoute=(choice:MissionChoice)=>{const model=CHOICE_MODEL[choice];const special=choice==='D'?choicePrompt.specialRoute:undefined;if(choice==='D'&&!special)return;const routeDescription=choicePrompt.routes?.[choice]||special?.description||model.description;const detail={choice,label:special?.label||model.label,routeDescription,missionId:choicePrompt.missionId,title:choicePrompt.title,objective:choicePrompt.objective,mode,hand:mode==='one-hand'?hand:undefined,source:'mobile-game-shell',specialUnlocked:choice==='D'?Boolean(special):undefined,unlockKind:special?.kind,unlockSource:special?.source};window.dispatchEvent(new CustomEvent('tryamm:rp-choice-selected',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-route-selected',{detail}));if(choice==='D')setSpecialUnlock(null);if(navigator.vibrate)try{navigator.vibrate(18)}catch{};setChoiceOpen(false)}
 const startFirstJourney=()=>{
  release()
  const mission={missionId:'iphone-first-journey',title:'First Ride • Repair, Drive, Meet the Guide',objective:'Follow the gold beacon, repair the orange car, enter and drive it, exit, then talk to the First Journey Guide.'}
  setFirstJourneyPhase('active');setRepairContext({vehicleId:'first-repair-car',label:'Repair Mission Car'});setRepairStep(0);setActiveMission(mission)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-start',{detail:{source:'mobile-game-shell'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{...mission,source:'mobile-game-shell'}}))
  window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'First Ride mission started. Follow the gold beacon to the repair car.'}}))
 }
 const completeFirstJourney=()=>{
  if(firstJourneyPhase!=='ready')return
  const detail={id:'iphone-first-journey',missionId:'iphone-first-journey',title:'First Ride • Repair, Drive, Meet the Guide',label:'First Ride',source:'streetverse-mobile-game-shell',xp:500,rewardStatus:'pending',verified:false}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-complete',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'FIRST RIDE COMPLETE • +500 XP pending verification • Reel ready'}}))
  setFirstJourneyPhase('complete');setActiveMission({missionId:'iphone-first-journey',title:'First Ride complete',objective:'Create a Reel or choose your next StreetVerse mission.'})
 }
 const runRepairStep=()=>{
  if(!repairContext||repairStep>=3)return
  const actions=REPAIR_TAP_ACTIONS[repairStep]||[]
  const next=repairStep+1
  if(next<3){setRepairStep(next);window.dispatchEvent(new CustomEvent('tryamm:streetverse-repair-step',{detail:{vehicleId:repairContext.vehicleId,step:next,source:'mobile-game-shell'}}))}
  for(const item of actions)window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-repair-action',{detail:{vehicleId:repairContext.vehicleId,action:item.action,repairKitId:item.repairKitId,source:'mobile-game-shell-3tap'}}))
  if(next===3)window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'Verifying repair. Driving unlocks only after the repair runtime confirms all six actions.'}}))
  if(navigator.vibrate)try{navigator.vibrate(16)}catch{}
 }
 const openReel=()=>window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-mobile-game-shell',missionId:activeMission.missionId||'',missionLabel:activeMission.title||'StreetVerse Reel',missionSource:'streetverse-mobile',rewardStatus:firstJourneyPhase==='complete'?'pending':'draft',verified:false}}))
 const enterCar=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:true,source:'mobile-game-shell-direct'}}))
 const openRideShare=()=>window.dispatchEvent(new CustomEvent('tryamm:holo-mobility-open',{detail:{source:'streetverse-mobile-game-shell'}}))
 const openBible=()=>{try{localStorage.setItem('tryamm.faith.return','/streetverse')}catch{};window.location.href='/faithverse#reader'}
 const repairLabel=repairStep===0?'OPEN HOOD + INSPECT':repairStep===1?'DIAGNOSE + FIX':repairStep===2?'VERIFY + CLOSE':'REPAIRED ✓'
 const focusActionLabel=inVehicle?'PARK / EXIT':firstJourneyPhase==='idle'?'START MISSION':firstJourneyPhase==='ready'?'COMPLETE MISSION':repairContext&&firstJourneyPhase!=='idle'&&repairStep<3?repairLabel:repairStep>=3&&firstJourneyPhase==='active'?'ENTER CAR':firstJourneyPhase==='complete'?'MAKE REEL':'ACTION'
 const focusAction=()=>{
  if(inVehicle){exitVehicle();return}
  if(firstJourneyPhase==='idle'){startFirstJourney();return}
  if(firstJourneyPhase==='ready'){completeFirstJourney();return}
  if(repairContext&&firstJourneyPhase!=='idle'&&repairStep<3){runRepairStep();return}
  if(repairStep>=3&&firstJourneyPhase==='active'){enterCar();return}
  if(firstJourneyPhase==='complete'){openReel();return}
  action()
 }
 const bottom='max(16px,env(safe-area-inset-bottom))'
 const selectedSide=hand==='left'?{left:'max(12px,env(safe-area-inset-left))'}:{right:'max(12px,env(safe-area-inset-right))'}
 const movementSide=mode==='one-hand'?selectedSide:{left:'max(12px,env(safe-area-inset-left))'}
 const actionSide=mode==='one-hand'?selectedSide:{right:'max(14px,env(safe-area-inset-right))'}
 const actionBottom=mode==='one-hand'?'max(166px,calc(env(safe-area-inset-bottom) + 166px))':'max(28px,env(safe-area-inset-bottom))'
 const menuAction=(run:()=>void)=>{setFocusMenuOpen(false);run()}
 return <><div data-streetverse-mobile-shell="v6-focus" data-focus-hud="true" data-direct-analog={directAnalog?'world':'fallback'} data-control-mode={mode} data-one-hand-side={mode==='one-hand'?hand:'none'} style={{position:'fixed',inset:0,zIndex:52000,pointerEvents:'none',fontFamily:'system-ui',userSelect:'none',WebkitUserSelect:'none'}}>
  <div aria-live="polite" style={{position:'absolute',top:'max(10px,env(safe-area-inset-top))',left:'50%',transform:'translateX(-50%)',maxWidth:'58vw',padding:'7px 11px',borderRadius:999,border:'1px solid #ffd65a66',background:'rgba(4,12,20,.76)',color:'#fff',fontSize:9,fontWeight:900,textAlign:'center',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',pointerEvents:'none',boxShadow:'0 4px 18px #0008'}}>{firstJourneyPhase==='idle'?'STREETVERSE • READY':activeMission.title}</div>
  <button aria-label="Open StreetVerse focus menu" aria-expanded={focusMenuOpen} onClick={()=>setFocusMenuOpen(v=>!v)} style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',right:'max(60px,calc(env(safe-area-inset-right) + 60px))',width:46,height:46,borderRadius:23,border:'2px solid #78ffb4',background:'#071c17ee',color:'#fff',fontSize:25,fontWeight:950,pointerEvents:'auto',boxShadow:'0 0 16px #39ff9a44',touchAction:'manipulation'}}>⋯</button>
  <button onClick={onClose} aria-label="Exit StreetVerse" style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',right:'max(10px,env(safe-area-inset-right))',width:44,height:44,borderRadius:22,border:'1px solid #567',background:'#07131fee',color:'#fff',fontSize:20,pointerEvents:'auto',touchAction:'manipulation'}}>×</button>

  {focusMenuOpen&&<section role="dialog" aria-modal="true" aria-label="StreetVerse focus menu" style={{position:'absolute',top:'max(60px,calc(env(safe-area-inset-top) + 60px))',right:'max(10px,env(safe-area-inset-right))',width:'min(82vw,300px)',maxHeight:'calc(100vh - 86px - env(safe-area-inset-bottom))',overflowY:'auto',padding:10,borderRadius:18,border:'1px solid #69e9ff88',background:'rgba(3,13,22,.97)',boxShadow:'0 18px 50px #000d',pointerEvents:'auto'}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,marginBottom:8}}><div><b style={{fontSize:11,color:'#9ef1ff'}}>FOCUS HUD</b><div style={{fontSize:9,color:'#fff',opacity:.68}}>Extra controls stay here until you need them.</div></div><button aria-label="Close focus menu" onClick={()=>setFocusMenuOpen(false)} style={{width:38,height:38,borderRadius:19,border:'1px solid #567',background:'#111925',color:'#fff',fontSize:18}}>×</button></div>
   <div aria-label={`StreetVerse fame rank ${fame.rank}`} style={{minHeight:42,padding:'6px 9px',borderRadius:12,border:'1px solid #ff74c855',background:'#220a1e99',display:'grid',alignContent:'center',lineHeight:1.05,marginBottom:8}}><b style={{fontSize:9,color:'#ff9fda'}}>FAME • {fame.rank.toUpperCase()}</b><span style={{fontSize:8,color:'#fff',opacity:.78}}>{fame.fame} • {fame.fanbase.toLocaleString()} FANS</span></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:6,marginBottom:8}}>
    <button aria-pressed={mode==='one-hand'&&hand==='left'} onClick={()=>activateOneHand('left')} style={modeButton(mode==='one-hand'&&hand==='left')}>LEFT</button>
    <button aria-pressed={mode==='one-hand'&&hand==='right'} onClick={()=>activateOneHand('right')} style={modeButton(mode==='one-hand'&&hand==='right')}>RIGHT</button>
    <button aria-pressed={mode==='two-hand'} onClick={activateTwoHand} style={modeButton(mode==='two-hand')}>2 HAND</button>
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>
    <button onClick={()=>menuAction(openMissionChoice)} style={quickRailButton('#8effb7')}>MISSION ROUTES</button>
    <button onClick={()=>menuAction(openReel)} style={quickRailButton('#ff8fd9')}>🎬 REEL</button>
    <button onClick={()=>menuAction(openRideShare)} style={quickRailButton('#66e6ff')}>🚕 RIDE</button>
    <button onClick={()=>menuAction(openBible)} style={quickRailButton('#e5c56a')}>📖 BIBLE</button>
    <button onClick={()=>menuAction(()=>openHolo('live'))} style={quickRailButton('#ff6b87')}>● HOLO LIVE</button>
    <button onClick={()=>menuAction(()=>openHolo('pk'))} style={quickRailButton('#ff74c8')}>⚔ PK BATTLE</button>
    <button onClick={()=>menuAction(()=>{release();window.dispatchEvent(new CustomEvent('tryamm:holo-fon-open',{detail:{source:'streetverse-mobile-game-shell',preserveWorld:true}}))})} style={quickRailButton('#69e9ff')}>📱 HOLO FON</button>
    {inVehicle&&<button aria-pressed={cruise} onClick={()=>toggleCruise()} style={quickRailButton(cruise?'#8effb7':'#7be9ff')}>{cruise?'■ STOP CRUISE':'▶ CRUISE'}</button>}
    {mode==='two-hand'&&<button onClick={()=>camera('left')} style={quickRailButton('#7be9ff')}>↶ LOOK LEFT</button>}
    {mode==='two-hand'&&<button onClick={()=>camera('right')} style={quickRailButton('#7be9ff')}>↷ LOOK RIGHT</button>}
    {firstJourneyPhase==='complete'&&<button onClick={()=>menuAction(startFirstJourney)} style={quickRailButton('#8effb7')}>↻ NEW FIRST RIDE</button>}
   </div>
  </section>}

  <div aria-label="StreetVerse focus joystick" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);shellJoystick(e)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))shellJoystick(e)}} onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{};stopShellJoystick()}} onPointerCancel={stopShellJoystick} onLostPointerCapture={stopShellJoystick} style={{position:'absolute',...movementSide,bottom,zIndex:52010,width:132,height:132,borderRadius:'50%',border:'3px solid #7be9ff',background:'rgba(2,12,22,.76)',boxShadow:'0 0 24px #00d9ff77',display:'grid',placeItems:'center',pointerEvents:'auto',touchAction:'none'}}>
   <div ref={shellJoystickKnobRef} aria-hidden="true" style={{width:58,height:58,borderRadius:'50%',background:'linear-gradient(145deg,#baf7ff,#46dfff)',border:'3px solid #effdff',boxShadow:'0 0 18px #63eaffaa',pointerEvents:'none',transition:'transform 35ms linear',willChange:'transform'}}/>
   <span aria-hidden="true" style={{position:'absolute',bottom:-18,left:'50%',transform:'translateX(-50%)',fontSize:8,fontWeight:950,letterSpacing:1.4,color:'#bff8ff',whiteSpace:'nowrap',textShadow:'0 1px 4px #000'}}>MOVE / STEER</span>
  </div>
  <button aria-label={`StreetVerse smart action: ${focusActionLabel}`} onClick={focusAction} style={{position:'absolute',...actionSide,bottom:actionBottom,minWidth:132,maxWidth:176,height:64,padding:'0 14px',borderRadius:32,border:'3px solid #ffd65a',background:'#221900f2',color:'#fff',fontSize:12,fontWeight:950,pointerEvents:'auto',touchAction:'manipulation',boxShadow:'0 0 22px #ffd65a55'}}>{focusActionLabel}</button>

  {choiceOpen&&<section role="dialog" aria-modal="true" aria-label="StreetVerse mission route choice" style={{position:'absolute',left:'50%',bottom:'max(228px,calc(env(safe-area-inset-bottom) + 228px))',transform:'translateX(-50%)',width:'min(92vw,420px)',padding:12,borderRadius:18,border:'1px solid #4fe3ff99',background:'#030914f5',color:'#fff',pointerEvents:'auto',boxShadow:'0 18px 60px #000d'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'start'}}><div><b>{choicePrompt.title}</b>{choicePrompt.objective&&<div style={{fontSize:11,opacity:.75,marginTop:4}}>{choicePrompt.objective}</div>}</div><button aria-label="Close mission choices" onClick={()=>setChoiceOpen(false)} style={{width:38,height:38,borderRadius:19,border:'1px solid #567',background:'#111925',color:'#fff'}}>×</button></div>
   <div style={{display:'grid',gridTemplateColumns:choicePrompt.specialRoute?'repeat(2,minmax(0,1fr))':'repeat(3,minmax(0,1fr))',gap:7,marginTop:10}}>
    {(Object.keys(CHOICE_MODEL) as MissionChoice[]).filter(choice=>choice!=='D'||Boolean(choicePrompt.specialRoute||choicePrompt.routes?.D)).map(choice=>{const route=CHOICE_MODEL[choice];const special=choice==='D'?choicePrompt.specialRoute:undefined;return <button key={choice} onClick={()=>chooseMissionRoute(choice)} style={{minHeight:96,padding:9,borderRadius:13,border:choice==='D'?'1px solid #ff74c8aa':'1px solid #4fe3ff66',background:choice==='D'?'#281020':'#0a1723',color:'#fff',textAlign:'left',touchAction:'manipulation'}}><b style={{fontSize:22}}>{choice}</b><div style={{fontSize:10,fontWeight:950,marginTop:4}}>{special?.label||route.label}</div><div style={{fontSize:9,opacity:.72,marginTop:4,lineHeight:1.25}}>{choicePrompt.routes?.[choice]||special?.description||route.description}</div>{choice==='D'&&<div style={{fontSize:8,color:'#ff9fda',fontWeight:900,marginTop:5}}>EARNED • CONTEXTUAL</div>}</button>})}
   </div>
  </section>}
 </div></>
}

const modeButton=(active:boolean)=>({minHeight:44,padding:'0 10px',borderRadius:12,border:`1px solid ${active?'#ffd65a':'#456'}`,background:active?'#221900ee':'#07131fee',color:'#fff',fontSize:10,fontWeight:900,touchAction:'manipulation'} as const)
const secondaryButton={width:52,height:48,borderRadius:16,border:'1px solid #7be9ff',background:'#020914dd',color:'#fff',fontSize:22,fontWeight:900,touchAction:'manipulation'} as const
const quickRailButton=(color:string)=>({minHeight:44,padding:'8px 11px',borderRadius:12,border:`1px solid ${color}`,background:'#07131fee',color:'#fff',fontSize:9,fontWeight:950,whiteSpace:'nowrap',touchAction:'manipulation'} as const)