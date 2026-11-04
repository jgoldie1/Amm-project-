import {useEffect,useMemo,useState} from 'react'
import StreetVerseRPActionSearch from './StreetVerseRPActionSearch'
import StreetVerseRPOmnibar from './StreetVerseRPOmnibar'
import {requestOpenWorldTrip,STREETVERSE_DESTINATIONS,STREETVERSE_TRANSIT_MODES,type StreetVerseDestination,type StreetVerseTripMode} from '../runtime/StreetVerseOpenWorldTransitRuntime'

type SortMode='smart'|'nearby'|'mission'|'price'|'owned'
type ActionId='quick'|'use'|'give'|'buy'|'sell'|'trade'|'pickup'|'drop'|'inspect'|'diagnose'|'repair'|'verify'|'open'|'enter'|'fuel'|'upgrade'|'customize'|'work'|'mission'|'call'|'dance'|'wave'|'tip'|'live'|'reel'
type Context={kind?:string;vehicleId?:string;npcId?:string;label?:string;broken?:boolean;repairKit?:boolean;drivable?:boolean;price?:number;owned?:boolean;missionId?:string}

const ACTIONS:Array<{id:ActionId;icon:string;label:string;tone:string}>=[
 {id:'quick',icon:'⚡',label:'QUICK',tone:'#ffe66d'},{id:'use',icon:'🧰',label:'USE',tone:'#67e8f9'},{id:'give',icon:'🤝',label:'GIVE',tone:'#c4b5fd'},
 {id:'buy',icon:'🛒',label:'BUY',tone:'#86efac'},{id:'sell',icon:'💰',label:'SELL',tone:'#fde68a'},{id:'trade',icon:'🔄',label:'TRADE',tone:'#93c5fd'},
 {id:'pickup',icon:'🎒',label:'PICK UP',tone:'#f9a8d4'},{id:'drop',icon:'📦',label:'DROP',tone:'#d8b4fe'},{id:'inspect',icon:'🔍',label:'INSPECT',tone:'#a5f3fc'},
 {id:'diagnose',icon:'🧪',label:'DIAGNOSE',tone:'#f0abfc'},{id:'repair',icon:'🔧',label:'REPAIR',tone:'#fb923c'},{id:'verify',icon:'✅',label:'VERIFY',tone:'#86efac'},{id:'open',icon:'🚪',label:'OPEN',tone:'#fca5a5'},{id:'enter',icon:'🚗',label:'ENTER',tone:'#60a5fa'},
 {id:'fuel',icon:'⛽',label:'FUEL',tone:'#fcd34d'},{id:'upgrade',icon:'⬆️',label:'UPGRADE',tone:'#a7f3d0'},{id:'customize',icon:'🎨',label:'CUSTOMIZE',tone:'#f0abfc'},
 {id:'work',icon:'💼',label:'WORK',tone:'#bfdbfe'},{id:'mission',icon:'📍',label:'MISSION',tone:'#fda4af'},{id:'call',icon:'📱',label:'CALL',tone:'#ddd6fe'},{id:'dance',icon:'💃',label:'DANCE',tone:'#f9a8d4'},{id:'wave',icon:'👋',label:'WAVE',tone:'#a7f3d0'},{id:'tip',icon:'🪙',label:'TIP',tone:'#fde68a'},
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
 const [rpOpen,setRpOpen]=useState(startInRP)
 const [rpgState,setRpgState]=useState<{level?:number;xp?:number;activeQuestIds?:string[]}|null>(null)
 const [entryStatus,setEntryStatus]=useState<'idle'|'requesting'|'entered'|'denied'>('idle')
 const [travelOpen,setTravelOpen]=useState(false)
 const [destination,setDestination]=useState<StreetVerseDestination>('Detroit')
 const [travelMode,setTravelMode]=useState<StreetVerseTripMode>('rideshare')
 const [partySize,setPartySize]=useState(1)
 const [travelStatus,setTravelStatus]=useState('')
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
  const onOpen=()=>setOpen(true)
  const onClose=()=>{setOpen(false);setRpOpen(false)}
  // Movement telemetry must never dismiss an open panel. Players using one-hand
  // controls must be able to read/select an action while moving or driving.
  // Only explicit PLAY, CLOSE or play-focus dismisses the panel.
  const onVehicleInteract=(event:Event)=>{const d=(event as CustomEvent<Context & {entered?:boolean}>).detail||{};if(typeof d.entered==='boolean')return;setCtx(current=>({...current,...d,kind:'vehicle'}));setPage(0);setOpen(true)}
  const onVehicleControlled=(event:Event)=>{const d=(event as CustomEvent<{entered?:boolean}>).detail||{};setEntryStatus(d.entered?'entered':'idle');if(d.entered){setOpen(false);setRpOpen(false)}}
  const onVehicleDenied=()=>{setEntryStatus('denied');setOpen(true)}
  addEventListener('tryamm:streetverse-interaction-context',onContext)
  addEventListener('tryamm:streetverse-vehicle-breakdown',onBreakdown)
  addEventListener('tryamm:streetverse-vehicle-repaired',onRepaired)
  addEventListener('tryamm:streetverse-actions-open',onOpen)
  addEventListener('tryamm:streetverse-actions-close',onClose)
  addEventListener('tryamm:streetverse-play-focus',onClose)
  addEventListener('tryamm:streetverse-vehicle-interact',onVehicleInteract)
  addEventListener('tryamm:streetverse-vehicle-controlled',onVehicleControlled)
  addEventListener('tryamm:streetverse-vehicle-denied',onVehicleDenied)
  return()=>{removeEventListener('tryamm:streetverse-interaction-context',onContext);removeEventListener('tryamm:streetverse-vehicle-breakdown',onBreakdown);removeEventListener('tryamm:streetverse-vehicle-repaired',onRepaired);removeEventListener('tryamm:streetverse-actions-open',onOpen);removeEventListener('tryamm:streetverse-actions-close',onClose);removeEventListener('tryamm:streetverse-play-focus',onClose);removeEventListener('tryamm:streetverse-vehicle-interact',onVehicleInteract);removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicleControlled);removeEventListener('tryamm:streetverse-vehicle-denied',onVehicleDenied)}
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
  if(id==='quick'){
   const next=ctx.broken?(ctx.repairKit?'repair':'inspect'):(ctx.drivable?'enter':'mission')
   act(next);return
  }
  if(id==='call'){setTravelOpen(true);return}
  if(id==='live'){dispatchEvent(new CustomEvent('tryamm:streetverse-live-mission-request',{detail:{...ctx,source:'action-carousel'}}));return}
  if(id==='mission'){dispatchEvent(new CustomEvent('tryamm:streetverse-cinematic-mission-open',{detail:{missionId:ctx.missionId,source:'action-carousel'}}));setOpen(false);return}
   if(id==='reel'){dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{...ctx,source:'action-carousel',missionId:ctx.missionId||''}}));return}
  if(id==='tip'&&ctx.npcId){dispatchEvent(new CustomEvent('tryamm:streetverse-npc-tip-request',{detail:{npcId:ctx.npcId,label:ctx.label,source:'action-carousel',serverAuthoritative:true}}));return}
  if((id==='dance'||id==='wave')&&ctx.npcId){dispatchEvent(new CustomEvent('tryamm:streetverse-context-action',{detail:{action:id,...ctx,source:'action-carousel'}}));return}
  if(id==='enter'){
   if(ctx.broken){dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-denied',{detail:{vehicleId,reason:'repair-required'}}));return}
   setEntryStatus('requesting')
   dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:true,vehicleId,source:'action-carousel'}}))
   // Only the playable world's vehicle-controlled confirmation marks entry successful.
   // Never fake occupancy or mission progression from a button tap.
   return
  }
  if(['inspect','open','diagnose','use','repair','verify'].includes(id)&&vehicleId){
   const action=id==='open'?'open-hood':id==='use'?'use-repair-kit':id
   dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-repair-action',{detail:{vehicleId,action,repairKitId:id==='use'&&ctx.repairKit?'repair-kit':''}}))
  }
  dispatchEvent(new CustomEvent('tryamm:streetverse-context-action',{detail:{action:id,...ctx,sort}}))
 }
 if(mobile&&!open)return <div aria-label="StreetVerse compact action launchers" style={{position:'fixed',right:'max(8px,env(safe-area-inset-right))',bottom:'calc(env(safe-area-inset-bottom, 0px) + 150px)',zIndex:39950,display:'grid',gap:7}}>
  <button aria-label="Open StreetVerse RP RPG emoji and GIF actions" onClick={()=>{setOpen(true);setRpOpen(true)}} style={{minHeight:46,borderRadius:12,border:'2px solid #c4a3ff',background:'#1a0a35ee',color:'#fff',font:'950 11px system-ui',padding:'0 12px'}}>🎭 RP / GIF</button>
  <button
  aria-label={ctx.broken?'Open repair actions':'Open StreetVerse actions'}
  onClick={()=>setOpen(true)}
  style={{minHeight:44,padding:'0 12px',borderRadius:12,border:`2px solid ${ctx.broken?'#fb923c':'#67e8f9'}`,background:'rgba(4,15,24,.92)',color:'#fff',font:'950 10px system-ui',boxShadow:`0 0 20px ${ctx.broken?'#fb923c55':'#67e8f944'}`,touchAction:'manipulation'}}
 >{ctx.broken?'🔧 REPAIR':'⚡ ACTIONS'}</button></div>
  return <div aria-label="StreetVerse action carousel" style={{position:'fixed',left:'50%',bottom:'calc(env(safe-area-inset-bottom, 0px) + 74px)',transform:'translateX(-50%)',zIndex:39950,width:'min(94vw,620px)',maxHeight:mobile?(rpOpen?'62dvh':'42dvh'):'78dvh',overflowY:'auto',padding:'10px',borderRadius:22,background:'linear-gradient(180deg,rgba(12,19,35,.92),rgba(3,7,18,.98))',backdropFilter:'blur(12px)',boxShadow:'0 18px 55px #000b, inset 0 1px #ffffff22',border:'1px solid #67e8f955',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:8}}>
   <div><div style={{fontSize:9,fontWeight:950,letterSpacing:1.4,color:'#67e8f9'}}>HOLO ACTIONS</div><div style={{fontSize:11,fontWeight:900}}>{ctx.label||'WORLD INTERACTION'}{ctx.broken?' • REPAIR REQUIRED':''}</div></div>
   {mobile?<div style={{display:'flex',gap:5}}><button aria-label="Return to gameplay" onClick={()=>{setOpen(false);setRpOpen(false)}} style={playBtn}>🎮 PLAY</button><button aria-label="Close actions" onClick={()=>{setOpen(false);setRpOpen(false)}} style={closeBtn}>×</button></div>:<label style={{fontSize:8,fontWeight:900,color:'#cbd5e1'}}>SORT <select aria-label="Sort actions" value={sort} onChange={e=>{setSort(e.target.value as SortMode);setPage(0)}} style={{marginLeft:5,borderRadius:999,padding:'5px 7px',background:'#101827',color:'#fff',border:'1px solid #ffffff33',fontSize:9,fontWeight:900}}><option value="smart">SMART</option><option value="nearby">NEARBY</option><option value="mission">MISSION</option><option value="price">PRICE</option><option value="owned">OWNED</option></select></label>}
  </div>
  <button aria-label="Open StreetVerse travel and ride share planner" onClick={()=>setTravelOpen(v=>!v)} style={{width:'100%',minHeight:40,marginBottom:7,borderRadius:10,border:'1px solid #86efac88',background:'#0d2b25',color:'#fff',fontWeight:900,touchAction:'manipulation'}}>🚕 RIDE SHARE / BUS / TRAIN / FLY IN {travelOpen?'▲':'▼'}</button>
  {travelOpen&&<div aria-label="Open world transit planner" style={{display:'grid',gap:7,padding:9,marginBottom:8,borderRadius:12,background:'#0b1d2a',border:'1px solid #5acde466'}}>
   <div style={{fontSize:10,fontWeight:900}}>TRAVEL FROM CHICAGO • VIRTUAL GAME WORLD</div>
   <label style={{fontSize:10}}>DESTINATION <select aria-label="Travel destination" value={destination} onChange={e=>setDestination(e.target.value as StreetVerseDestination)} style={travelSelect}>{STREETVERSE_DESTINATIONS.filter(city=>city!=='Chicago').map(city=><option key={city} value={city}>{city}</option>)}</select></label>
   <label style={{fontSize:10}}>TRANSPORT <select aria-label="Travel mode" value={travelMode} onChange={e=>setTravelMode(e.target.value as StreetVerseTripMode)} style={travelSelect}>{STREETVERSE_TRANSIT_MODES.map(mode=><option key={mode} value={mode}>{mode.toUpperCase()}</option>)}</select></label>
   <label style={{fontSize:10}}>TRAVELERS <select aria-label="Travel party size" value={partySize} onChange={e=>setPartySize(Number(e.target.value))} style={travelSelect}>{[1,2,3,4,5,6,12,40].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
   <button onClick={()=>{const plan=requestOpenWorldTrip({from:'Chicago',to:destination,mode:travelMode,partySize});setTravelStatus(plan.waiting? `${plan.boarded} SEATS PLANNED • ${plan.waiting} NEED ANOTHER VEHICLE`:`${plan.boarded} SEATS PLANNED • AWAITING WORLD TRANSFER`)}} style={{minHeight:42,background:'#195b54',border:'1px solid #7cefc5',borderRadius:10,color:'#fff',fontWeight:900}}>PLAN GAME-WORLD TRIP</button>
   <div role="status" aria-live="polite" style={{fontSize:10,color:'#bdebe8'}}>{travelStatus||'Passengers are planned locally; online multiplayer and city transfer require server confirmation.'}</div>
  </div>}
  {(ctx.kind==='vehicle'||ctx.vehicleId)&&<button aria-label={ctx.broken?'Repair car before entering':'Get in the car'} disabled={Boolean(ctx.broken)} onClick={()=>act('enter')} style={{width:'100%',minHeight:48,marginBottom:7,borderRadius:12,border:'2px solid #60a5fa',background:ctx.broken?'#374151':'#153c73',color:'#fff',fontWeight:950,touchAction:'manipulation'}}>{ctx.broken?'🔧 REPAIR REQUIRED BEFORE ENTRY':entryStatus==='requesting'?'🚗 ENTER REQUEST SENT • CHECK GAME':entryStatus==='denied'?'🚫 ENTRY DENIED • MOVE CLOSER':'🚗 GET IN CAR'}</button>}
  {mobile&&<div style={{display:'flex',gap:5,marginBottom:7}}><select aria-label="Sort actions" value={sort} onChange={e=>{setSort(e.target.value as SortMode);setPage(0)}} style={{flex:1,borderRadius:10,padding:'7px 8px',background:'#101827',color:'#fff',border:'1px solid #ffffff33',fontSize:9,fontWeight:900}}><option value="smart">SMART</option><option value="nearby">NEARBY</option><option value="mission">MISSION</option><option value="price">PRICE</option><option value="owned">OWNED</option></select><button onClick={()=>setRpOpen(v=>!v)} style={toolBtn}>{rpOpen?'HIDE RP':'🎭 RP / GENII'}</button></div>}
  <div style={{display:'grid',gridTemplateColumns:'28px repeat(5,minmax(0,1fr)) 28px',gap:5,alignItems:'stretch'}}>
   <button aria-label="Previous actions" onClick={()=>setPage(p=>(p-1+pages)%pages)} style={nav}>‹</button>
   {visible.map((a,i)=><button key={a.id} onClick={()=>act(a.id)} style={{minHeight:i===2?62:56,borderRadius:14,border:`1px solid ${a.tone}88`,background:`linear-gradient(145deg,${a.tone}25,#0b1220dd)`,boxShadow:i===2?`0 0 20px ${a.tone}35`:'inset 0 1px #ffffff18',color:'#fff',fontSize:8,fontWeight:950,padding:'5px 2px'}}><span style={{display:'block',fontSize:i===2?20:17,filter:'drop-shadow(0 3px 5px #0008)'}}>{a.icon}</span>{a.label}</button>)}
   {Array.from({length:Math.max(0,5-visible.length)}).map((_,i)=><span key={`blank-${i}`}/>)}
   <button aria-label="Next actions" onClick={()=>setPage(p=>(p+1)%pages)} style={nav}>›</button>
  </div>
  {(!mobile||rpOpen)&&<><div aria-label="StreetVerse RPG progression" role="status" style={{marginTop:8,padding:8,border:"1px solid #7ce5ff44",borderRadius:10,color:"#b4efff",fontSize:10,fontWeight:900}}>{rpgState?`RPG LEVEL ${rpgState.level||1} • XP ${rpgState.xp||0} • ACTIVE QUESTS ${rpgState.activeQuestIds?.length||0}`:"RPG progression loading…"}</div><StreetVerseRPActionSearch compact/><StreetVerseRPOmnibar compact/></>}
  <div style={{marginTop:6,textAlign:'center',fontSize:8,color:'#94a3b8'}}>{mobile?'TAP PLAY TO CLEAR SCREEN • ':''}SWIPE/ARROWS • {page%pages+1}/{pages} • SORT changes what StreetVerse puts first, not what you own.</div>
 </div>
}
const travelSelect:React.CSSProperties={display:'block',width:'100%',minHeight:38,marginTop:4,borderRadius:9,background:'#142638',border:'1px solid #6b8797',color:'#fff',padding:'4px 8px'}
const nav:React.CSSProperties={border:'1px solid #67e8f944',borderRadius:12,background:'#0b1220dd',color:'#fff',fontSize:22,fontWeight:900}

const playBtn:React.CSSProperties={minHeight:34,padding:'0 9px',borderRadius:9,border:'1px solid #8effb777',background:'#0a2d20',color:'#fff',fontSize:9,fontWeight:950,touchAction:'manipulation'}
const closeBtn:React.CSSProperties={width:34,height:34,borderRadius:9,border:'1px solid #ffffff44',background:'#141b25',color:'#fff',fontSize:20,fontWeight:950,touchAction:'manipulation'}
const toolBtn:React.CSSProperties={minHeight:34,padding:'0 9px',borderRadius:9,border:'1px solid #9d6bff66',background:'#171027',color:'#fff',fontSize:9,fontWeight:950,touchAction:'manipulation'}
