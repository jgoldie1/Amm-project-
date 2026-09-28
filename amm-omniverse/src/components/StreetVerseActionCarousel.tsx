import {useEffect,useMemo,useState} from 'react'

type SortMode='smart'|'nearby'|'mission'|'price'|'owned'
type ActionId='quick'|'use'|'give'|'buy'|'sell'|'trade'|'pickup'|'drop'|'inspect'|'repair'|'open'|'enter'|'fuel'|'upgrade'|'customize'|'work'|'mission'|'call'|'dance'|'wave'|'tip'|'live'|'reel'
type Context={kind?:string;vehicleId?:string;npcId?:string;label?:string;broken?:boolean;repairKit?:boolean;drivable?:boolean;price?:number;owned?:boolean;missionId?:string}

const ACTIONS:Array<{id:ActionId;icon:string;label:string;tone:string}>=[
 {id:'quick',icon:'⚡',label:'QUICK',tone:'#ffe66d'},{id:'use',icon:'🧰',label:'USE',tone:'#67e8f9'},{id:'give',icon:'🤝',label:'GIVE',tone:'#c4b5fd'},
 {id:'buy',icon:'🛒',label:'BUY',tone:'#86efac'},{id:'sell',icon:'💰',label:'SELL',tone:'#fde68a'},{id:'trade',icon:'🔄',label:'TRADE',tone:'#93c5fd'},
 {id:'pickup',icon:'🎒',label:'PICK UP',tone:'#f9a8d4'},{id:'drop',icon:'📦',label:'DROP',tone:'#d8b4fe'},{id:'inspect',icon:'🔍',label:'INSPECT',tone:'#a5f3fc'},
 {id:'repair',icon:'🔧',label:'REPAIR',tone:'#fb923c'},{id:'open',icon:'🚪',label:'OPEN',tone:'#fca5a5'},{id:'enter',icon:'🚗',label:'ENTER',tone:'#60a5fa'},
 {id:'fuel',icon:'⛽',label:'FUEL',tone:'#fcd34d'},{id:'upgrade',icon:'⬆️',label:'UPGRADE',tone:'#a7f3d0'},{id:'customize',icon:'🎨',label:'CUSTOMIZE',tone:'#f0abfc'},
 {id:'work',icon:'💼',label:'WORK',tone:'#bfdbfe'},{id:'mission',icon:'📍',label:'MISSION',tone:'#fda4af'},{id:'call',icon:'📱',label:'CALL',tone:'#ddd6fe'},{id:'dance',icon:'💃',label:'DANCE',tone:'#f9a8d4'},{id:'wave',icon:'👋',label:'WAVE',tone:'#a7f3d0'},{id:'tip',icon:'🪙',label:'TIP',tone:'#fde68a'},
 {id:'live',icon:'🔴',label:'LIVE',tone:'#f87171'},{id:'reel',icon:'🎥',label:'REEL',tone:'#e879f9'},
]

function relevant(ctx:Context){
 if(ctx.kind==='npc'||ctx.npcId)return ['quick','wave','dance','tip','give','mission','live','reel'] as ActionId[]
 if(ctx.kind==='vehicle'||ctx.vehicleId){
  return ctx.broken
   ? ['quick','inspect','open','use','repair','buy','mission','live','reel'] as ActionId[]
   : ['quick','enter','open','inspect','fuel','upgrade','customize','buy','sell','live','reel'] as ActionId[]
 }
 return ACTIONS.map(a=>a.id)
}

export default function StreetVerseActionCarousel(){
 const [ctx,setCtx]=useState<Context>({})
 const [sort,setSort]=useState<SortMode>('smart')
 const [page,setPage]=useState(0)
 useEffect(()=>{
  const onContext=(event:Event)=>{setCtx((event as CustomEvent<Context>).detail||{});setPage(0)}
  const onBreakdown=(event:Event)=>{const d=(event as CustomEvent<Context>).detail||{};setCtx({...d,kind:'vehicle',broken:true,drivable:false});setPage(0)}
  const onRepaired=(event:Event)=>{const d=(event as CustomEvent<Context>).detail||{};setCtx(current=>current.vehicleId===d.vehicleId?{...current,broken:false,drivable:true,repairKit:false}:current)}
  addEventListener('tryamm:streetverse-interaction-context',onContext)
  addEventListener('tryamm:streetverse-vehicle-breakdown',onBreakdown)
  addEventListener('tryamm:streetverse-vehicle-repaired',onRepaired)
  return()=>{removeEventListener('tryamm:streetverse-interaction-context',onContext);removeEventListener('tryamm:streetverse-vehicle-breakdown',onBreakdown);removeEventListener('tryamm:streetverse-vehicle-repaired',onRepaired)}
 },[])
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
  if(id==='live'){dispatchEvent(new CustomEvent('tryamm:streetverse-live-mission-request',{detail:{...ctx,source:'action-carousel'}}));return}
  if(id==='reel'){dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{...ctx,source:'action-carousel',missionId:ctx.missionId||''}}));return}
  if(id==='tip'&&ctx.npcId){dispatchEvent(new CustomEvent('tryamm:streetverse-npc-tip-request',{detail:{npcId:ctx.npcId,label:ctx.label,source:'action-carousel',serverAuthoritative:true}}));return}
  if((id==='dance'||id==='wave')&&ctx.npcId){dispatchEvent(new CustomEvent('tryamm:streetverse-context-action',{detail:{action:id,...ctx,source:'action-carousel'}}));return}
  if(id==='enter'&&ctx.broken){dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-denied',{detail:{vehicleId,reason:'repair-required'}}));return}
  if(['inspect','open','use','repair'].includes(id)&&vehicleId){
   const action=id==='open'?'open-hood':id==='use'?'use-repair-kit':id
   dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-repair-action',{detail:{vehicleId,action,repairKitId:id==='use'&&ctx.repairKit?'repair-kit':''}}))
  }
  dispatchEvent(new CustomEvent('tryamm:streetverse-context-action',{detail:{action:id,...ctx,sort}}))
 }
 return <div aria-label="StreetVerse action carousel" style={{position:'fixed',left:'50%',bottom:'calc(env(safe-area-inset-bottom, 0px) + 74px)',transform:'translateX(-50%)',zIndex:39950,width:'min(94vw,620px)',padding:'10px',borderRadius:22,background:'linear-gradient(180deg,rgba(12,19,35,.84),rgba(3,7,18,.94))',backdropFilter:'blur(12px)',boxShadow:'0 18px 55px #000b, inset 0 1px #ffffff22',border:'1px solid #67e8f955',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:8}}>
   <div><div style={{fontSize:9,fontWeight:950,letterSpacing:1.4,color:'#67e8f9'}}>HOLO ACTIONS</div><div style={{fontSize:11,fontWeight:900}}>{ctx.label||'WORLD INTERACTION'}{ctx.broken?' • REPAIR REQUIRED':''}</div></div>
   <label style={{fontSize:8,fontWeight:900,color:'#cbd5e1'}}>SORT <select aria-label="Sort actions" value={sort} onChange={e=>{setSort(e.target.value as SortMode);setPage(0)}} style={{marginLeft:5,borderRadius:999,padding:'5px 7px',background:'#101827',color:'#fff',border:'1px solid #ffffff33',fontSize:9,fontWeight:900}}><option value="smart">SMART</option><option value="nearby">NEARBY</option><option value="mission">MISSION</option><option value="price">PRICE</option><option value="owned">OWNED</option></select></label>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'28px repeat(5,minmax(0,1fr)) 28px',gap:5,alignItems:'stretch'}}>
   <button aria-label="Previous actions" onClick={()=>setPage(p=>(p-1+pages)%pages)} style={nav}>‹</button>
   {visible.map((a,i)=><button key={a.id} onClick={()=>act(a.id)} style={{minHeight:i===2?62:56,borderRadius:14,border:`1px solid ${a.tone}88`,background:`linear-gradient(145deg,${a.tone}25,#0b1220dd)`,boxShadow:i===2?`0 0 20px ${a.tone}35`:'inset 0 1px #ffffff18',color:'#fff',fontSize:8,fontWeight:950,padding:'5px 2px'}}><span style={{display:'block',fontSize:i===2?20:17,filter:'drop-shadow(0 3px 5px #0008)'}}>{a.icon}</span>{a.label}</button>)}
   {Array.from({length:Math.max(0,5-visible.length)}).map((_,i)=><span key={`blank-${i}`}/>)}
   <button aria-label="Next actions" onClick={()=>setPage(p=>(p+1)%pages)} style={nav}>›</button>
  </div>
  <div style={{marginTop:6,textAlign:'center',fontSize:8,color:'#94a3b8'}}>SWIPE/ARROWS • {page%pages+1}/{pages} • SORT changes what StreetVerse puts first, not what you own.</div>
 </div>
}
const nav:React.CSSProperties={border:'1px solid #67e8f944',borderRadius:12,background:'#0b1220dd',color:'#fff',fontSize:22,fontWeight:900}
