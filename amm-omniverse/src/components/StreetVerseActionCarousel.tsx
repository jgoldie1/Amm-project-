import {useEffect,useMemo,useState} from 'react'
import StreetVerseRPActionSearch from './StreetVerseRPActionSearch'
import StreetVerseRPOmnibar from './StreetVerseRPOmnibar'
import {loadCareerMission,startCareerMission,advanceCareerMission,advanceCareerMissionForEvent,resetCareerMission,getCareerMissionProgress,getCareerScene,INVESTIGATION_CHOICES,resolveInvestigationChoice,saveInvestigationChoice,loadInvestigationChoice,type InvestigationChoice,type CareerMission,type CareerId} from '../runtime/StreetVerseCareerMissionPrototype'

type SortMode='smart'|'nearby'|'mission'|'price'|'owned'
type ActionId='quick'|'use'|'give'|'buy'|'sell'|'trade'|'pickup'|'drop'|'inspect'|'diagnose'|'repair'|'verify'|'open'|'enter'|'fuel'|'upgrade'|'customize'|'work'|'mission'|'call'|'dance'|'wave'|'tip'|'live'|'reel'|'equipment'|'health'|'armor'|'inventory'|'emergency'|'pocket'
type Context={kind?:string;vehicleId?:string;npcId?:string;label?:string;broken?:boolean;repairKit?:boolean;drivable?:boolean;price?:number;owned?:boolean;missionId?:string}

const ACTIONS:Array<{id:ActionId;icon:string;label:string;tone:string}>=[
 {id:'quick',icon:'⚡',label:'QUICK',tone:'#ffe66d'},{id:'use',icon:'🧰',label:'USE',tone:'#67e8f9'},{id:'give',icon:'🤝',label:'GIVE',tone:'#c4b5fd'},
 {id:'buy',icon:'🛒',label:'BUY',tone:'#86efac'},{id:'sell',icon:'💰',label:'SELL',tone:'#fde68a'},{id:'trade',icon:'🔄',label:'TRADE',tone:'#93c5fd'},
 {id:'pickup',icon:'🎒',label:'PICK UP',tone:'#f9a8d4'},{id:'drop',icon:'📦',label:'DROP',tone:'#d8b4fe'},{id:'inspect',icon:'🔍',label:'INSPECT',tone:'#a5f3fc'},
 {id:'diagnose',icon:'🧪',label:'DIAGNOSE',tone:'#f0abfc'},{id:'repair',icon:'🔧',label:'REPAIR',tone:'#fb923c'},{id:'verify',icon:'✅',label:'VERIFY',tone:'#86efac'},{id:'open',icon:'🚪',label:'OPEN',tone:'#fca5a5'},{id:'enter',icon:'🚗',label:'ENTER',tone:'#60a5fa'},
 {id:'fuel',icon:'⛽',label:'FUEL',tone:'#fcd34d'},{id:'upgrade',icon:'⬆️',label:'UPGRADE',tone:'#a7f3d0'},{id:'customize',icon:'🎨',label:'CUSTOMIZE',tone:'#f0abfc'},
 {id:'work',icon:'💼',label:'WORK',tone:'#bfdbfe'},{id:'mission',icon:'📍',label:'MISSION',tone:'#fda4af'},{id:'call',icon:'📱',label:'CALL',tone:'#ddd6fe'},{id:'dance',icon:'💃',label:'DANCE',tone:'#f9a8d4'},{id:'wave',icon:'👋',label:'WAVE',tone:'#a7f3d0'},{id:'tip',icon:'🪙',label:'TIP',tone:'#fde68a'},
 {id:'pocket',icon:'🌀',label:'POCKET',tone:'#c4b5fd'},
 {id:'equipment',icon:'🎯',label:'GEAR',tone:'#fca5a5'},{id:'health',icon:'❤️',label:'HEALTH',tone:'#86efac'},{id:'armor',icon:'🛡️',label:'ARMOR',tone:'#93c5fd'},{id:'inventory',icon:'🎒',label:'BAG',tone:'#c4b5fd'},{id:'emergency',icon:'🚑',label:'HELP',tone:'#fda4af'},
 {id:'live',icon:'🔴',label:'LIVE',tone:'#f87171'},{id:'reel',icon:'🎥',label:'REEL',tone:'#e879f9'},
]

function relevant(ctx:Context){
 if(ctx.kind==='npc'||ctx.npcId)return ['quick','wave','dance','tip','give','mission','live','reel'] as ActionId[]
 if(ctx.kind==='vehicle'||ctx.vehicleId){
  return ctx.broken
   ? ['quick','inspect','open','diagnose','use','repair','verify','mission','live','reel'] as ActionId[]
   : ['quick','enter','open','inspect','fuel','upgrade','customize','buy','sell','live','reel'] as ActionId[]
 }
 return ACTIONS.map(a=>a.id)
}

export default function StreetVerseActionCarousel(){
 const mobile=typeof window!=='undefined'&&window.matchMedia('(max-width: 700px)').matches
 const [ctx,setCtx]=useState<Context>({})
 const [sort,setSort]=useState<SortMode>('smart')
 const [page,setPage]=useState(0)
 const startInRP=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('open')==='rp'
 const [open,setOpen]=useState(()=>!mobile||startInRP)
 // On phones, gameplay keeps the carousel collapsed until the player asks for it.
 const [rpOpen,setRpOpen]=useState(startInRP)
 const [gameplayPanel,setGameplayPanel]=useState<string|null>(null)
 const [livingWorldOpen,setLivingWorldOpen]=useState(false)
 const [careerPath,setCareerPath]=useState<string|null>(null)
 const [careerGuide,setCareerGuide]=useState(false)
 const [careerMission,setCareerMission]=useState<CareerMission|null>(()=>loadCareerMission())
 const [investigationOutcome,setInvestigationOutcome]=useState<string|null>(()=>{const mission=loadCareerMission();if(!mission||mission.stage!==3)return null;const choice=loadInvestigationChoice(mission.career);return choice?resolveInvestigationChoice(choice):null})
 useEffect(()=>{
  const names=['tryamm:streetverse-career-briefing-confirmed','tryamm:streetverse-career-npc-interaction-confirmed','tryamm:streetverse-career-evidence-confirmed']
  const onProgress=(event:Event)=>{
   const detail=(event as CustomEvent<{career?:CareerId}>).detail
   if(!detail?.career)return
   setCareerMission(previous=>previous&&previous.career===detail.career?advanceCareerMissionForEvent(previous,event.type):previous)
  }
  names.forEach(name=>window.addEventListener(name,onProgress))
  return()=>names.forEach(name=>window.removeEventListener(name,onProgress))
 },[])
 const [rpgState,setRpgState]=useState<{level?:number;xp?:number;activeQuestIds?:string[]}|null>(null)
 useEffect(()=>{
  const onRpg=(event:Event)=>setRpgState((event as CustomEvent<{level?:number;xp?:number;activeQuestIds?:string[]}>).detail||null)
  const onRpOpen=()=>{setOpen(true);setRpOpen(true)}
  window.addEventListener('tryamm:rpg-state',onRpg)
  window.addEventListener('tryamm:streetverse-rp-open',onRpOpen)
  const request=()=>window.dispatchEvent(new Event('tryamm:rpg-state-request'))
  request()
  const timer=window.setTimeout(request,800)
  return()=>{window.clearTimeout(timer);window.removeEventListener('tryamm:rpg-state',onRpg);window.removeEventListener('tryamm:streetverse-rp-open',onRpOpen)}
 },[])
 useEffect(()=>{
  const onContext=(event:Event)=>{setCtx((event as CustomEvent<Context>).detail||{});setPage(0);if(!mobile)setOpen(true)}
  const onBreakdown=(event:Event)=>{const d=(event as CustomEvent<Context>).detail||{};setCtx({...d,kind:'vehicle',broken:true,drivable:false});setPage(0);if(!mobile)setOpen(true)}
  const onRepaired=(event:Event)=>{const d=(event as CustomEvent<Context>).detail||{};setCtx(current=>current.vehicleId===d.vehicleId?{...current,broken:false,drivable:true,repairKit:false}:current)}
  const onOpen=()=>{setOpen(true);setRpOpen(false)}
  const onClose=()=>{setOpen(false);setRpOpen(false);setGameplayPanel(null)}
  const onToggle=()=>{setOpen(v=>!v);setRpOpen(false)}
  const onMove=(event:Event)=>{
   if(!mobile)return
   const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
   // Idle player-position telemetry must not close the RP menu while reading.
   if(event.type==='tryamm:streetverse-player-position'&&Number(detail.speed||0)<0.1)return
   if(event.type==='tryamm:streetverse-vehicle-input'&&Number(detail.throttle||0)===0&&Number(detail.steer||0)===0)return
   setOpen(false);setRpOpen(false)
  }
  const onVehicleInteract=(event:Event)=>{const d=(event as CustomEvent<Context>).detail||{};setCtx(current=>({...current,...d,kind:'vehicle'}));setPage(0);if(!mobile)setOpen(true)}
  addEventListener('tryamm:streetverse-interaction-context',onContext)
  addEventListener('tryamm:streetverse-vehicle-breakdown',onBreakdown)
  addEventListener('tryamm:streetverse-vehicle-repaired',onRepaired)
  addEventListener('tryamm:streetverse-actions-open',onOpen)
  addEventListener('tryamm:streetverse-actions-toggle',onToggle)
  addEventListener('tryamm:streetverse-actions-close',onClose)
  addEventListener('tryamm:streetverse-play-focus',onClose)
  addEventListener('tryamm:streetverse-player-position',onMove)
  addEventListener('tryamm:streetverse-vehicle-input',onMove)
  addEventListener('tryamm:streetverse-vehicle-interact',onVehicleInteract)
  return()=>{removeEventListener('tryamm:streetverse-interaction-context',onContext);removeEventListener('tryamm:streetverse-vehicle-breakdown',onBreakdown);removeEventListener('tryamm:streetverse-vehicle-repaired',onRepaired);removeEventListener('tryamm:streetverse-actions-open',onOpen);removeEventListener('tryamm:streetverse-actions-toggle',onToggle);removeEventListener('tryamm:streetverse-actions-close',onClose);removeEventListener('tryamm:streetverse-play-focus',onClose);removeEventListener('tryamm:streetverse-player-position',onMove);removeEventListener('tryamm:streetverse-vehicle-input',onMove);removeEventListener('tryamm:streetverse-vehicle-interact',onVehicleInteract)}
 },[mobile])
 const items=useMemo(()=>{
  const ids=relevant(ctx)
  const list=ACTIONS.filter(a=>ids.includes(a.id))
  if(sort==='price')return [...list].sort((a,b)=>(a.id==='buy'?0:1)-(b.id==='buy'?0:1))
  if(sort==='owned')return [...list].sort((a,b)=>(['use','drop','sell'].includes(a.id)?0:1)-(['use','drop','sell'].includes(b.id)?0:1))
  if(sort==='mission')return [...list].sort((a,b)=>(['mission','repair','inspect'].includes(a.id)?0:1)-(['mission','repair','inspect'].includes(b.id)?0:1))
  if(sort==='nearby')return [...list].sort((a,b)=>(['quick','pickup','open','enter','inspect'].includes(a.id)?0:1)-(['quick','pickup','open','enter','inspect'].includes(b.id)?0:1))
  return list
 },[ctx,sort])
 const pages=Math.max(1,Math.ceil(items.length/5))
 const visible=items.slice((page%pages)*5,(page%pages)*5+5)
 const act=(id:ActionId)=>{
  const vehicleId=ctx.vehicleId
  if(id==='pocket'){
   setGameplayPanel('pocket')
   dispatchEvent(new CustomEvent('tryamm:streetverse-pocket-dimension-open',{detail:{source:'action-carousel',context:ctx}}));
   dispatchEvent(new CustomEvent('tryamm:streetverse-quick-menu-request',{detail:{item:'POCKET DIMENSION',source:'action-carousel'}}));
   return
  }
  if(['equipment','health','armor','inventory','emergency'].includes(id)){
   setGameplayPanel(id)
   dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-panel-request',{detail:{panel:id,source:'action-carousel',context:ctx}}));return
  }
  if(id==='quick'){
   const next=ctx.broken?(ctx.repairKit?'repair':'inspect'):(ctx.drivable?'enter':'mission')
   act(next);return
  }
  if(id==='live'){dispatchEvent(new CustomEvent('tryamm:streetverse-live-mission-request',{detail:{...ctx,source:'action-carousel'}}));return}
  if(id==='mission'){dispatchEvent(new CustomEvent('tryamm:streetverse-cinematic-mission-open',{detail:{missionId:ctx.missionId,source:'action-carousel'}}));setOpen(false);return}
   if(id==='reel'){dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{...ctx,source:'action-carousel',missionId:ctx.missionId||''}}));return}
  if(id==='tip'&&ctx.npcId){dispatchEvent(new CustomEvent('tryamm:streetverse-npc-tip-request',{detail:{npcId:ctx.npcId,label:ctx.label,source:'action-carousel',serverAuthoritative:true}}));return}
  if((id==='dance'||id==='wave')&&ctx.npcId){dispatchEvent(new CustomEvent('tryamm:streetverse-context-action',{detail:{action:id,...ctx,source:'action-carousel'}}));return}
  if(id==='enter'&&ctx.broken){dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-denied',{detail:{vehicleId,reason:'repair-required'}}));return}
  if(['inspect','open','diagnose','use','repair','verify'].includes(id)&&vehicleId){
   const action=id==='open'?'open-hood':id==='use'?'use-repair-kit':id
   dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-repair-action',{detail:{vehicleId,action,repairKitId:id==='use'&&ctx.repairKit?'repair-kit':''}}))
  }
  dispatchEvent(new CustomEvent('tryamm:streetverse-context-action',{detail:{action:id,...ctx,sort}}))
 }
 if(mobile&&!open)return <div aria-label="StreetVerse in-game action carousel launcher" style={{position:'fixed',right:'max(10px,env(safe-area-inset-right))',bottom:'calc(env(safe-area-inset-bottom, 0px) + 18px)',zIndex:39950}}>
  <button aria-label="Open in-game action carousel" onClick={()=>{setOpen(true);setRpOpen(false)}} style={{minHeight:42,minWidth:92,padding:'0 12px',borderRadius:999,border:`2px solid ${ctx.broken?'#fb923c':'#67e8f9'}`,background:'#061727ed',color:'#fff',font:'900 11px system-ui',boxShadow:'0 5px 18px #0009',touchAction:'manipulation'}}>{ctx.broken?'🔧 REPAIR':'🎮 ACTIONS ›'}</button>
 </div>
  return <div aria-label="StreetVerse action carousel" style={{position:'fixed',left:'50%',bottom:'calc(env(safe-area-inset-bottom, 0px) + 12px)',transform:'translateX(-50%)',zIndex:39950,width:'min(94vw,620px)',maxHeight:mobile?(rpOpen?'62dvh':'42dvh'):'78dvh',overflowY:'auto',padding:'10px',borderRadius:22,background:'linear-gradient(180deg,rgba(12,19,35,.92),rgba(3,7,18,.98))',backdropFilter:'blur(12px)',boxShadow:'0 18px 55px #000b, inset 0 1px #ffffff22',border:'1px solid #67e8f955',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:8}}>
   <div><div style={{fontSize:9,fontWeight:950,letterSpacing:1.4,color:'#67e8f9'}}>HOLO ACTIONS</div><div style={{fontSize:11,fontWeight:900}}>{ctx.label||'WORLD INTERACTION'}{ctx.broken?' • REPAIR REQUIRED':''}</div></div>
   {mobile?<div style={{display:'flex',gap:5}}><button aria-label="Return to gameplay" onClick={()=>{setOpen(false);setRpOpen(false)}} style={playBtn}>🎮 PLAY</button><button aria-label="Close actions" onClick={()=>{setOpen(false);setRpOpen(false)}} style={closeBtn}>×</button></div>:<label style={{fontSize:8,fontWeight:900,color:'#cbd5e1'}}>SORT <select aria-label="Sort actions" value={sort} onChange={e=>{setSort(e.target.value as SortMode);setPage(0)}} style={{marginLeft:5,borderRadius:999,padding:'5px 7px',background:'#101827',color:'#fff',border:'1px solid #ffffff33',fontSize:9,fontWeight:900}}><option value="smart">SMART</option><option value="nearby">NEARBY</option><option value="mission">MISSION</option><option value="price">PRICE</option><option value="owned">OWNED</option></select></label>}
  </div>
  {mobile&&<div style={{display:'flex',gap:5,marginBottom:7}}><select aria-label="Sort actions" value={sort} onChange={e=>{setSort(e.target.value as SortMode);setPage(0)}} style={{flex:1,borderRadius:10,padding:'7px 8px',background:'#101827',color:'#fff',border:'1px solid #ffffff33',fontSize:9,fontWeight:900}}><option value="smart">SMART</option><option value="nearby">NEARBY</option><option value="mission">MISSION</option><option value="price">PRICE</option><option value="owned">OWNED</option></select><button onClick={()=>setRpOpen(v=>!v)} style={toolBtn}>{rpOpen?'HIDE RP':'🎭 RP / GENII'}</button></div>}
  <div style={{display:'grid',gridTemplateColumns:'28px repeat(5,minmax(0,1fr)) 28px',gap:5,alignItems:'stretch'}}>
   <button aria-label="Previous actions" onClick={()=>setPage(p=>(p-1+pages)%pages)} style={nav}>‹</button>
   {visible.map((a,i)=><button key={a.id} onClick={()=>act(a.id)} style={{minHeight:i===2?62:56,borderRadius:14,border:`1px solid ${a.tone}88`,background:`linear-gradient(145deg,${a.tone}25,#0b1220dd)`,boxShadow:i===2?`0 0 20px ${a.tone}35`:'inset 0 1px #ffffff18',color:'#fff',fontSize:8,fontWeight:950,padding:'5px 2px'}}><span style={{display:'block',fontSize:i===2?20:17,filter:'drop-shadow(0 3px 5px #0008)'}}>{a.icon}</span>{a.label}</button>)}
   {Array.from({length:Math.max(0,5-visible.length)}).map((_,i)=><span key={`blank-${i}`}/>)}
   <button aria-label="Next actions" onClick={()=>setPage(p=>(p+1)%pages)} style={nav}>›</button>
  </div>
  {gameplayPanel&&<section role="region" aria-label={`${gameplayPanel} gameplay panel`} style={{marginTop:8,padding:10,border:'1px solid #67e8f955',borderRadius:12,background:'#091725',fontSize:12}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><strong style={{textTransform:'uppercase'}}>{gameplayPanel==='pocket'?'🌀 Pocket Dimension':gameplayPanel}</strong><button aria-label="Close gameplay panel" onClick={()=>setGameplayPanel(null)} style={closeBtn}>×</button></div><p style={{margin:'7px 0',color:'#b9d5e3'}}>{gameplayPanel==='pocket'?'Portal requested. Waiting for the existing Pocket Dimension to open; no inventory transfer has been confirmed.':'Gameplay system requested. Live player statistics and saved equipment are not verified here yet.'}</p></section>}
  {rpOpen&&<div style={{marginTop:8}}><button aria-expanded={livingWorldOpen} aria-controls="streetverse-living-world-guide" onClick={()=>setLivingWorldOpen(v=>!v)} style={{...toolBtn,width:'100%'}}>🌆 LIVING WORLD RPG {livingWorldOpen?'▴':'▾'}</button>{livingWorldOpen&&<div id="streetverse-living-world-guide" style={{marginTop:6,padding:9,border:'1px solid #67e8f955',borderRadius:10,background:'#091725',fontSize:10,color:'#cce5f3'}}><strong>STREETVERSE ROLEPLAY PATHS</strong><p>Choose a fictional career path. Selecting a path requests a mission category; it does not grant real-world authority or confirm a mission has started.</p><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:6}}>{[{id:'agent-007',label:'🕵️ 007 AGENT'},{id:'mib',label:'👽 MIB / HOLO'},{id:'law-enforcement',label:'🚓 LAW ENFORCEMENT'},{id:'government',label:'🏛️ GOVERNMENT'},{id:'cia',label:'🛰️ CIA (FICTIONAL)'},{id:'fbi',label:'🗂️ FBI (FICTIONAL)'}].map(path=><button key={path.id} aria-pressed={careerPath===path.id} onClick={()=>{setCareerPath(path.id);dispatchEvent(new CustomEvent('tryamm:streetverse-rpg-career-request',{detail:{career:path.id,source:'living-world-rpg'}}))}} style={{...toolBtn,minHeight:40,borderColor:careerPath===path.id?'#67e8f9':'#9d6bff66'}}>{path.label}</button>)}</div>{careerPath&&<div style={{marginTop:7}}><button style={toolBtn} onClick={()=>{setInvestigationOutcome(null);setCareerMission(startCareerMission(careerPath as CareerId))}}>START LOCAL CAREER DEMO</button></div>}{careerMission&&<div role="status" style={{marginTop:7,padding:8,border:'1px solid #67e8f955',borderRadius:9}}><strong>{getCareerMissionProgress(careerMission).title} — {getCareerMissionProgress(careerMission).completed}/{getCareerMissionProgress(careerMission).total}</strong><p>{getCareerMissionProgress(careerMission).finished?'Local demo complete. No XP or server rewards awarded.':getCareerMissionProgress(careerMission).nextObjective}</p>{careerMission.stage<3&&<div style={{display:'grid',gap:6}}>
 <p>{getCareerScene(careerMission.career,careerMission.stage)}</p>
 <button style={toolBtn} onClick={()=>setCareerMission(advanceCareerMission(careerMission))}>{careerMission.stage===0?'📋 ACCEPT CASE BRIEFING':careerMission.stage===1?'💬 INTERVIEW WITNESS':'🔎 REVIEW CASE EVIDENCE'}</button>
 </div>} <button style={toolBtn} onClick={()=>{resetCareerMission();setCareerMission(null);setInvestigationOutcome(null)}}>RESET LOCAL DEMO</button><p>Interactive story prototype: scripted witness and case evidence; no 3D NPC, XP or server save.</p>{careerMission.stage===3&&<div><strong>FICTIONAL CASE DECISION</strong><div style={{display:'grid',gap:5,marginTop:5}}>{(Object.keys(INVESTIGATION_CHOICES) as InvestigationChoice[]).map(choice=><button key={choice} style={toolBtn} onClick={()=>{saveInvestigationChoice(careerMission.career,choice);setInvestigationOutcome(resolveInvestigationChoice(choice))}}>{INVESTIGATION_CHOICES[choice].label}</button>)}</div>{investigationOutcome&&<p role="status">{investigationOutcome} (Preview only; no persistent world effects.)</p>}</div>}</div>}{careerPath&&<div role="status"><p>{careerPath.toUpperCase()} requested. Career eligibility, story missions and persistence require runtime verification.</p><button style={toolBtn} aria-expanded={careerGuide} onClick={()=>setCareerGuide(v=>!v)}>MISSION BRIEF {careerGuide?'▴':'▾'}</button>{careerGuide&&<p>Start by speaking to a mission NPC, collecting evidence or completing a service objective. Confirm that the 3D world responds before expecting XP or saved rewards. This brief is guidance, not an active quest.</p>}</div>}<p>NPC memory, faction reputation and persistent consequences still require end-to-end verification.</p></div>}</div>}
  {rpOpen&&<div style={{marginTop:7,padding:8,border:'1px solid #a78bfa55',borderRadius:10,background:'#170e24',fontSize:10,color:'#ddd6fe'}}><strong>🌙 OMNIVERSE AFTER DARK</strong><p style={{margin:'5px 0'}}>Separate mature-audience story experience. Access is controlled by the existing After Dark audience and consent checks.</p><button style={toolBtn} onClick={()=>dispatchEvent(new Event('tryamm:open-after-dark-alpha'))}>REQUEST AFTER DARK ENTRY</button></div>}
  {rpOpen&&<div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}><button onClick={()=>dispatchEvent(new Event('tryamm:rpg-state-request'))} style={toolBtn}>↻ REFRESH RPG</button><button onClick={()=>dispatchEvent(new CustomEvent('tryamm:streetverse-pocket-dimension-open',{detail:{source:'rp-rpg-carousel'}}))} style={toolBtn}>🌀 POCKET</button><button onClick={()=>dispatchEvent(new CustomEvent('tryamm:streetverse-cinematic-mission-open',{detail:{source:'rp-rpg-carousel'}}))} style={toolBtn}>📍 MISSIONS</button></div>}
  {(!mobile||rpOpen)&&<><div aria-label="StreetVerse RPG progression" role="status" style={{marginTop:8,padding:8,border:"1px solid #7ce5ff44",borderRadius:10,color:"#b4efff",fontSize:10,fontWeight:900}}>{rpgState?`RPG LEVEL ${rpgState.level||1} • XP ${rpgState.xp||0} • ACTIVE QUESTS ${rpgState.activeQuestIds?.length||0}`:"RPG progression loading…"}</div><StreetVerseRPActionSearch compact/><StreetVerseRPOmnibar compact/></>}
  <div style={{marginTop:6,textAlign:'center',fontSize:8,color:'#94a3b8'}}>{mobile?'TAP PLAY TO CLEAR SCREEN • ':''}SWIPE/ARROWS • {page%pages+1}/{pages} • SORT changes what StreetVerse puts first, not what you own.</div>
 </div>
}
const nav:React.CSSProperties={border:'1px solid #67e8f944',borderRadius:12,background:'#0b1220dd',color:'#fff',fontSize:22,fontWeight:900}

const playBtn:React.CSSProperties={minHeight:34,padding:'0 9px',borderRadius:9,border:'1px solid #8effb777',background:'#0a2d20',color:'#fff',fontSize:9,fontWeight:950,touchAction:'manipulation'}
const closeBtn:React.CSSProperties={width:34,height:34,borderRadius:9,border:'1px solid #ffffff44',background:'#141b25',color:'#fff',fontSize:20,fontWeight:950,touchAction:'manipulation'}
const toolBtn:React.CSSProperties={minHeight:34,padding:'0 9px',borderRadius:9,border:'1px solid #9d6bff66',background:'#171027',color:'#fff',fontSize:9,fontWeight:950,touchAction:'manipulation'}
