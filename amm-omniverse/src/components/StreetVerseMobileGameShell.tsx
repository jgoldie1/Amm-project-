import {useEffect,useRef,useState} from 'react'

type Props={onClose:()=>void}
type Dir='up'|'down'|'left'|'right'
type ControlMode='one-hand'|'two-hand'
type Hand='left'|'right'
type MissionChoice='A'|'B'|'C'|'D'
type MissionSpecialUnlock={missionId?:string;kind?:string;label:string;description:string;source?:string;unlockedAt?:string}
type MissionPrompt={missionId?:string;title:string;objective?:string;routes?:Partial<Record<MissionChoice,string>>;specialRoute?:MissionSpecialUnlock}
type FameSnapshot={fame:number;rank:string;fanbase:number;viralScore:number;momentum:number}

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
 const [mode,setMode]=useState<ControlMode>('one-hand')
 const [hand,setHand]=useState<Hand>('right')
 const [activeMission,setActiveMission]=useState<MissionPrompt>({title:'Choose your StreetVerse route'})
 const [choicePrompt,setChoicePrompt]=useState<MissionPrompt>({title:'Choose your StreetVerse route'})
 const [choiceOpen,setChoiceOpen]=useState(false)
 const [specialUnlock,setSpecialUnlock]=useState<MissionSpecialUnlock|null>(null)
 const [fame,setFame]=useState<FameSnapshot>(()=>readFameSnapshot())
 const active=useRef<Record<Dir,boolean>>({up:false,down:false,left:false,right:false})
 const emit=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-input',{detail:{throttle:active.current.up?1:0,brake:active.current.down?1:0,steer:active.current.left?-1:active.current.right?1:0,horn:false,exit:false,source:'mobile-game-shell'}}))
 const set=(direction:Dir,pressed:boolean)=>{active.current[direction]=pressed;emit()}
 const release=()=>{active.current={up:false,down:false,left:false,right:false};emit()}
 useEffect(()=>{
  setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')||Math.min(window.innerWidth,window.innerHeight)<=600)
  try{const saved=localStorage.getItem(MODE_KEY);if(saved==='one-hand'||saved==='two-hand')setMode(saved);const savedHand=localStorage.getItem(HAND_KEY);if(savedHand==='left'||savedHand==='right')setHand(savedHand)}catch{}
  const stop=()=>release()
  const rememberMission=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const missionId=String(d.missionId||d.id||d.eventId||'')||undefined;const title=String(d.title||d.label||d.mission||'Active StreetVerse mission');const objective=String(d.objective||'')||undefined;const routes=d.routes&&typeof d.routes==='object'?d.routes as Partial<Record<MissionChoice,string>>:undefined;setActiveMission({missionId,title,objective,routes})}
  const openChoice=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const missionId=String(d.missionId||d.campaignId||d.id||'')||undefined;const title=String(d.title||d.label||'Choose your StreetVerse route');const objective=String(d.objective||'')||undefined;const routes=d.routes&&typeof d.routes==='object'?d.routes as Partial<Record<MissionChoice,string>>:undefined;const eventSpecial=d.specialRoute&&typeof d.specialRoute==='object'?d.specialRoute as MissionSpecialUnlock:undefined;const contextual=specialUnlock&&(!specialUnlock.missionId||specialUnlock.missionId==='session-active'||specialUnlock.missionId===missionId)?specialUnlock:undefined;setChoicePrompt({missionId,title,objective,routes,specialRoute:eventSpecial||contextual});setChoiceOpen(true)}
  const onSpecialUnlock=(event:Event)=>{const d=(event as CustomEvent<MissionSpecialUnlock>).detail;if(!d?.label||!d?.description)return;setSpecialUnlock(d);window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:`Special mission route unlocked: ${d.label}`}}))}
  const onFame=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};setFame({fame:Number(d.fame||0),rank:String(d.rank||'Unknown'),fanbase:Number(d.fanbase||0),viralScore:Number(d.viralScore||0),momentum:Number(d.momentum||0)})}
  window.addEventListener('blur',stop);window.addEventListener('pointercancel',stop);document.addEventListener('visibilitychange',stop)
  const missionContextEvents=['tryamm:streetverse-mission-start','tryamm:chicago-activity-start','tryamm:streetverse-checkpoint','tryamm:streetverse-mobile-mission-zone','tryamm:mission:discovered','tryamm:justice-mission-start','tryamm:time-machine-enter'] as const
  missionContextEvents.forEach(name=>window.addEventListener(name,rememberMission))
  window.addEventListener('tryamm:rp-choice-open',openChoice);window.addEventListener('tryamm:mission-choice-open',openChoice);window.addEventListener('tryamm:mission:special-route-unlocked',onSpecialUnlock);window.addEventListener('tryamm:streetverse-special-route-unlock',onSpecialUnlock);window.addEventListener('tryamm:streetverse-fame-state',onFame)
  return()=>{window.removeEventListener('blur',stop);window.removeEventListener('pointercancel',stop);document.removeEventListener('visibilitychange',stop);missionContextEvents.forEach(name=>window.removeEventListener(name,rememberMission));window.removeEventListener('tryamm:rp-choice-open',openChoice);window.removeEventListener('tryamm:mission-choice-open',openChoice);window.removeEventListener('tryamm:mission:special-route-unlocked',onSpecialUnlock);window.removeEventListener('tryamm:streetverse-special-route-unlock',onSpecialUnlock);window.removeEventListener('tryamm:streetverse-fame-state',onFame)}
 },[])
 if(!mobile)return null
 const changeMode=(next:ControlMode)=>{release();setMode(next);try{localStorage.setItem(MODE_KEY,next)}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:next}}))}
 const changeHand=()=>{const next:Hand=hand==='left'?'right':'left';release();setHand(next);try{localStorage.setItem(HAND_KEY,next)}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-one-hand-side',{detail:{hand:next,source:'mobile-game-shell'}}))}
 const control=(label:string,direction:Dir)=><button aria-label={`StreetVerse ${direction}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);set(direction,true)}} onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{};set(direction,false)}} onPointerCancel={()=>set(direction,false)} onPointerLeave={e=>{if(e.buttons===0)set(direction,false)}} style={{width:56,height:52,borderRadius:15,border:'2px solid #7be9ff',background:'#020914ee',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none',boxShadow:'0 0 14px #00d9ff66'}}>{label}</button>
 const action=()=>{if(navigator.vibrate)try{navigator.vibrate(12)}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-action',{detail:{source:'mobile-game-shell',mode,hand}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{source:'mobile-game-shell',mode,hand}}))}
 const camera=(direction:'left'|'right')=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-camera-input',{detail:{direction,source:'mobile-game-shell'}}))
 const openHolo=(liveMode:'live'|'pk')=>{release();window.dispatchEvent(new CustomEvent('tryamm:streetverse-holo-livepk',{detail:{mode:liveMode,source:'streetverse-mobile-game-shell',preserveWorld:true}}));if(navigator.vibrate)try{navigator.vibrate(16)}catch{}}
 const openMissionChoice=()=>{const contextual=specialUnlock&&(!specialUnlock.missionId||specialUnlock.missionId==='session-active'||specialUnlock.missionId===activeMission.missionId)?specialUnlock:undefined;const prompt={...activeMission,title:activeMission.title||'Choose your StreetVerse route',specialRoute:contextual};setChoicePrompt(prompt);setChoiceOpen(true);window.dispatchEvent(new CustomEvent('tryamm:mission-choice-opened',{detail:{...prompt,mode,hand,source:'mobile-game-shell'}}))}
 const chooseMissionRoute=(choice:MissionChoice)=>{const model=CHOICE_MODEL[choice];const special=choice==='D'?choicePrompt.specialRoute:undefined;if(choice==='D'&&!special)return;const routeDescription=choicePrompt.routes?.[choice]||special?.description||model.description;const detail={choice,label:special?.label||model.label,routeDescription,missionId:choicePrompt.missionId,title:choicePrompt.title,objective:choicePrompt.objective,mode,hand,source:'mobile-game-shell',specialUnlocked:choice==='D'?Boolean(special):undefined,unlockKind:special?.kind,unlockSource:special?.source};window.dispatchEvent(new CustomEvent('tryamm:rp-choice-selected',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-route-selected',{detail}));if(choice==='D')setSpecialUnlock(null);if(navigator.vibrate)try{navigator.vibrate(18)}catch{};setChoiceOpen(false)}
 const bottom='max(16px,env(safe-area-inset-bottom))'
 const selectedSide=hand==='left'?{left:'max(12px,env(safe-area-inset-left))'}:{right:'max(12px,env(safe-area-inset-right))'}
 const movementSide=mode==='one-hand'?selectedSide:{left:'max(12px,env(safe-area-inset-left))'}
 const actionSide=mode==='one-hand'?selectedSide:{right:'max(14px,env(safe-area-inset-right))'}
 return <div data-streetverse-mobile-shell="v4" data-control-mode={mode} data-one-hand-side={hand} style={{position:'fixed',inset:0,zIndex:32000,pointerEvents:'none',fontFamily:'system-ui',userSelect:'none',WebkitUserSelect:'none'}}>
  <div style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',left:'max(10px,env(safe-area-inset-left))',display:'flex',gap:6,pointerEvents:'auto',flexWrap:'wrap',maxWidth:'calc(100vw - 70px)'}}>
   <button aria-pressed={mode==='one-hand'} onClick={()=>changeMode('one-hand')} style={modeButton(mode==='one-hand')}>1 HAND</button>
   <button aria-pressed={mode==='two-hand'} onClick={()=>changeMode('two-hand')} style={modeButton(mode==='two-hand')}>2 HAND</button>
   {mode==='one-hand'&&<button aria-label="Switch one hand side" onClick={changeHand} style={{...modeButton(true),borderColor:'#8effb7'}}>{hand.toUpperCase()} HAND</button>}
   <div aria-label={`StreetVerse fame rank ${fame.rank}`} style={{minHeight:44,padding:'5px 9px',borderRadius:12,border:'1px solid #ff74c888',background:'#220a1eee',display:'grid',alignContent:'center',lineHeight:1.05}}><b style={{fontSize:9,color:'#ff9fda'}}>FAME • {fame.rank.toUpperCase()}</b><span style={{fontSize:8,color:'#fff',opacity:.78}}>{fame.fame} • {fame.fanbase.toLocaleString()} FANS</span></div>
  </div>
  <button onClick={onClose} aria-label="Exit StreetVerse" style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',right:'max(10px,env(safe-area-inset-right))',width:44,height:44,borderRadius:22,border:'1px solid #567',background:'#07131fee',color:'#fff',fontSize:20,pointerEvents:'auto'}}>×</button>
  <div aria-label="StreetVerse Holographic LIVE and PK controls" style={{position:'absolute',top:'max(60px,calc(env(safe-area-inset-top) + 60px))',right:'max(10px,env(safe-area-inset-right))',display:'grid',gap:7,pointerEvents:'auto'}}>
   <button aria-label="Open Holographic LIVE from StreetVerse" onClick={()=>openHolo('live')} style={{...modeButton(true),minWidth:92,borderColor:'#ff6b87'}}>● HOLO LIVE</button>
   <button aria-label="Open Holographic PK Battle from StreetVerse" onClick={()=>openHolo('pk')} style={{...modeButton(true),minWidth:92,borderColor:'#ff74c8'}}>⚔ PK BATTLE</button>
  </div>
  <div aria-label="StreetVerse movement controls" style={{position:'absolute',...movementSide,bottom,display:'grid',gridTemplateColumns:'56px 56px 56px',gap:6,pointerEvents:'auto'}}>
   <span/>{control('↑','up')}<span/>{control('←','left')}{control('↓','down')}{control('→','right')}
  </div>
  {mode==='two-hand'&&<div aria-label="StreetVerse camera controls" style={{position:'absolute',right:'max(14px,env(safe-area-inset-right))',bottom:'max(164px,calc(env(safe-area-inset-bottom) + 164px))',display:'flex',gap:8,pointerEvents:'auto'}}>
   <button aria-label="Look left" onClick={()=>camera('left')} style={secondaryButton}>↶</button>
   <button aria-label="Look right" onClick={()=>camera('right')} style={secondaryButton}>↷</button>
  </div>}
  <button aria-label="StreetVerse mission choices" onClick={openMissionChoice} style={{position:'absolute',...actionSide,bottom:mode==='one-hand'?'max(244px,calc(env(safe-area-inset-bottom) + 244px))':'max(98px,calc(env(safe-area-inset-bottom) + 98px))',minWidth:104,height:54,borderRadius:27,border:'2px solid #8effb7',background:'#082a18ee',color:'#fff',fontWeight:900,pointerEvents:'auto',touchAction:'manipulation'}}>MISSION</button>
  <button aria-label="StreetVerse smart action" onClick={action} style={{position:'absolute',...actionSide,bottom:mode==='one-hand'?'max(178px,calc(env(safe-area-inset-bottom) + 178px))':'max(28px,env(safe-area-inset-bottom))',minWidth:104,height:58,borderRadius:29,border:'2px solid #ffd65a',background:'#221900ee',color:'#fff',fontWeight:900,pointerEvents:'auto',touchAction:'manipulation'}}>ACTION</button>
  {choiceOpen&&<section role="dialog" aria-modal="true" aria-label="StreetVerse mission route choice" style={{position:'absolute',left:'50%',bottom:'max(314px,calc(env(safe-area-inset-bottom) + 314px))',transform:'translateX(-50%)',width:'min(94vw,420px)',padding:12,borderRadius:18,border:'1px solid #4fe3ff99',background:'#030914f5',color:'#fff',pointerEvents:'auto',boxShadow:'0 18px 60px #000d'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'start'}}><div><b>{choicePrompt.title}</b>{choicePrompt.objective&&<div style={{fontSize:11,opacity:.75,marginTop:4}}>{choicePrompt.objective}</div>}</div><button aria-label="Close mission choices" onClick={()=>setChoiceOpen(false)} style={{width:38,height:38,borderRadius:19,border:'1px solid #567',background:'#111925',color:'#fff'}}>×</button></div>
   <div style={{display:'grid',gridTemplateColumns:choicePrompt.specialRoute?'repeat(2,minmax(0,1fr))':'repeat(3,minmax(0,1fr))',gap:7,marginTop:10}}>
    {(Object.keys(CHOICE_MODEL) as MissionChoice[]).filter(choice=>choice!=='D'||Boolean(choicePrompt.specialRoute||choicePrompt.routes?.D)).map(choice=>{const route=CHOICE_MODEL[choice];const special=choice==='D'?choicePrompt.specialRoute:undefined;return <button key={choice} onClick={()=>chooseMissionRoute(choice)} style={{minHeight:96,padding:9,borderRadius:13,border:choice==='D'?'1px solid #ff74c8aa':'1px solid #4fe3ff66',background:choice==='D'?'#281020':'#0a1723',color:'#fff',textAlign:'left',touchAction:'manipulation'}}><b style={{fontSize:22}}>{choice}</b><div style={{fontSize:10,fontWeight:950,marginTop:4}}>{special?.label||route.label}</div><div style={{fontSize:9,opacity:.72,marginTop:4,lineHeight:1.25}}>{choicePrompt.routes?.[choice]||special?.description||route.description}</div>{choice==='D'&&<div style={{fontSize:8,color:'#ff9fda',fontWeight:900,marginTop:5}}>EARNED • CONTEXTUAL</div>}</button>})}
   </div>
  </section>}
 </div>
}

const modeButton=(active:boolean)=>({minHeight:44,padding:'0 10px',borderRadius:12,border:`1px solid ${active?'#ffd65a':'#456'}`,background:active?'#221900ee':'#07131fee',color:'#fff',fontSize:10,fontWeight:900,touchAction:'manipulation'} as const)
const secondaryButton={width:52,height:48,borderRadius:16,border:'1px solid #7be9ff',background:'#020914dd',color:'#fff',fontSize:22,fontWeight:900,touchAction:'manipulation'} as const
