import {useEffect,useMemo,useState} from 'react'
import {GREEN_DRAGON_ANIMAL_STYLES,type AnimalStyleId} from '../config/streetverseAnimalStyles'

const KEY='tryamm.streetverse.animal-style.v1'
type State={active:AnimalStyleId;xp:Record<string,number>;mastered:string[]}

function read():State{
 try{return {...{active:'panther' as AnimalStyleId,xp:{},mastered:[]},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return{active:'panther',xp:{},mastered:[]}}
}

export default function StreetVerseAnimalStyleDirector(){
 const [state,setState]=useState<State>(()=>read())
 const [open,setOpen]=useState(false)
 const active=useMemo(()=>GREEN_DRAGON_ANIMAL_STYLES.find(s=>s.id===state.active)??GREEN_DRAGON_ANIMAL_STYLES[0],[state.active])
 const persist=(next:State)=>{setState(next);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{};window.dispatchEvent(new CustomEvent('tryamm:animal-style-state',{detail:next}))}
 const select=(id:AnimalStyleId)=>{persist({...state,active:id});window.dispatchEvent(new CustomEvent('tryamm:animal-style-selected',{detail:{id,style:GREEN_DRAGON_ANIMAL_STYLES.find(s=>s.id===id)}}))}
 useEffect(()=>{
  const gain=(event:Event)=>{
   const d=(event as CustomEvent<any>).detail||{}
   const amount=Math.max(0,Number(d.xp||25))
   const id=String(d.styleId||state.active) as AnimalStyleId
   if(!GREEN_DRAGON_ANIMAL_STYLES.some(s=>s.id===id))return
   const xp={...state.xp,[id]:(state.xp[id]||0)+amount}
   const mastered=[...new Set([...state.mastered,...(xp[id]>=500?[id]:[])])]
   persist({...state,xp,mastered})
  }
  window.addEventListener('tryamm:animal-style-xp',gain)
  return()=>window.removeEventListener('tryamm:animal-style-xp',gain)
 },[state])
 return <div style={{position:'fixed',left:12,top:84,zIndex:16985,fontFamily:'system-ui'}}>
  <button onClick={()=>setOpen(v=>!v)} style={{minHeight:52,padding:'8px 12px',borderRadius:14,border:'1px solid #72e08c88',background:'#07170def',color:'#fff',fontWeight:950}}>🐉 {active.name.toUpperCase()}</button>
  {open&&<section aria-label="Animal fighting style selector" style={{marginTop:7,width:'min(92vw,430px)',maxHeight:'68vh',overflow:'auto',padding:12,borderRadius:16,background:'#030b07f5',border:'1px solid #477e55',color:'#fff'}}>
   <div style={{fontSize:10,fontWeight:950,letterSpacing:1.3,color:'#8df2a6'}}>GREEN DRAGON ANIMAL STYLE LAB</div>
   <div style={{fontSize:10,opacity:.7,margin:'5px 0 10px'}}>Eight documented Green Dragon animal systems + Dragon as a separately labeled legacy/game reconstruction.</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(125px,1fr))',gap:7}}>
    {GREEN_DRAGON_ANIMAL_STYLES.map(style=><button key={style.id} onClick={()=>select(style.id)} style={{minHeight:72,padding:8,borderRadius:12,border:`1px solid ${style.id===active.id?'#8df2a6':'#31513a'}`,background:style.id===active.id?'#143d20':'#09150d',color:'#fff',textAlign:'left'}}>
      <b>{style.name}</b><div style={{fontSize:9,opacity:.68,marginTop:4}}>{style.gameIdentity}</div><div style={{fontSize:9,color:'#d9bd62',marginTop:3}}>XP {state.xp[style.id]||0}{state.mastered.includes(style.id)?' • MASTERED':''}</div>
    </button>)}
   </div>
   <div style={{marginTop:10,padding:10,borderRadius:12,background:'#0b1710',fontSize:10,lineHeight:1.45}}><b>{active.name}</b><br/>{active.strengths.join(' • ')}<br/><span style={{opacity:.66}}>One-hand: {active.oneHandAssist.join(' • ')}</span></div>
  </section>}
 </div>
}
