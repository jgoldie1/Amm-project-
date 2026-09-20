import {useEffect,useMemo,useState} from 'react'
import {STREETVERSE_CHICAGO_MARTIAL_STYLES,STREETVERSE_MARTIAL_ARTS_RULES,type StreetVerseMartialAction,type StreetVerseMartialStyleId} from '../config/streetverseChicagoMartialArtsStyles'

const KEY='tryamm.streetverse.martial-style.v1'

export default function StreetVerseMartialArtsStyleSelector(){
  const [open,setOpen]=useState(false)
  const [styleId,setStyleId]=useState<StreetVerseMartialStyleId>(()=>(localStorage.getItem(KEY) as StreetVerseMartialStyleId)||'neutral-dojo')
  const [stamina,setStamina]=useState(100)
  const [meter,setMeter]=useState(0)
  const [last,setLast]=useState<StreetVerseMartialAction[]>([])
  const style=STREETVERSE_CHICAGO_MARTIAL_STYLES[styleId]
  const actions=useMemo(()=>STREETVERSE_MARTIAL_ARTS_RULES.controls,[styleId])

  useEffect(()=>{
    const show=()=>setOpen(true)
    window.addEventListener('tryamm:open-martial-arts',show)
    window.addEventListener('tryamm:history-campaign-enter',show)
    return()=>{window.removeEventListener('tryamm:open-martial-arts',show);window.removeEventListener('tryamm:history-campaign-enter',show)}
  },[])

  const select=(id:StreetVerseMartialStyleId)=>{
    setStyleId(id);localStorage.setItem(KEY,id);setLast([]);setMeter(0);setStamina(100)
    window.dispatchEvent(new CustomEvent('tryamm:martial-style-selected',{detail:{styleId:id,label:STREETVERSE_CHICAGO_MARTIAL_STYLES[id].label}}))
  }

  const act=(action:StreetVerseMartialAction)=>{
    const cost=action==='BURST'?16:action==='STEP'?8:action==='COUNTER'?7:action==='FLOW'?5:action==='GUARD'?3:-14
    const nextStamina=Math.max(0,Math.min(100,stamina-cost))
    const history=[...last.slice(-2),action]
    const bias=Number(style.actionBias[action]||1)
    let bonus=Math.max(2,Math.round(4*bias))
    for(const move of style.signatureGameMoves){
      const tail=history.slice(-move.input.length)
      if(tail.join('|')===move.input.join('|')){bonus+=18;window.dispatchEvent(new CustomEvent('tryamm:martial-signature',{detail:{styleId,move}}))}
    }
    setStamina(nextStamina);setLast(history);setMeter(m=>Math.min(100,m+bonus))
    window.dispatchEvent(new CustomEvent('tryamm:martial-action',{detail:{styleId,action,bias,stamina:nextStamina,meter:Math.min(100,meter+bonus),nonlethal:true}}))
  }

  if(!open)return <button aria-label="Open Chicago martial arts" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:340,zIndex:17025,width:48,height:48,borderRadius:'50%',border:'1px solid #d8b85b88',background:'#101412ef',color:'#fff',fontWeight:950}}>🥋</button>

  return <div role="dialog" aria-label="Chicago martial arts style selector" style={{position:'fixed',right:12,bottom:90,zIndex:17040,width:'min(94vw,430px)',maxHeight:'72vh',overflow:'auto',padding:14,border:'1px solid #52655a',borderRadius:18,background:'#050b08f5',color:'#fff',boxShadow:'0 20px 60px #000d'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
      <div><div style={{fontSize:10,letterSpacing:1.7,color:'#d8b85b',fontWeight:950}}>CHICAGO DOJO WARS • GAME RECONSTRUCTION</div><h3 style={{margin:'5px 0'}}>{style.label}</h3></div>
      <button onClick={()=>setOpen(false)} style={{width:42,height:42,borderRadius:12}}>×</button>
    </div>
    <p style={{fontSize:11,opacity:.72,lineHeight:1.45}}>{style.historyNote}</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
      {(Object.keys(STREETVERSE_CHICAGO_MARTIAL_STYLES) as StreetVerseMartialStyleId[]).map(id=><button key={id} onClick={()=>select(id)} style={{minHeight:62,borderRadius:11,border:id===styleId?'2px solid #d8b85b':'1px solid #405049',background:'#0c1712',color:'#fff',fontSize:9,fontWeight:900}}>{STREETVERSE_CHICAGO_MARTIAL_STYLES[id].label}</button>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:12}}>
      {actions.map(action=><button key={action} onClick={()=>act(action)} disabled={stamina<=0&&action!=='RECOVER'} style={{minHeight:58,borderRadius:13,border:'1px solid #54715f',background:action==='BURST'?'#24120e':'#0b1b12',color:'#fff',fontWeight:1000}}>{action}</button>)}
    </div>
    <div style={{marginTop:11,fontSize:11}}>STAMINA {stamina}% • STYLE {meter}%</div>
    <div style={{height:8,borderRadius:99,background:'#1a231e',overflow:'hidden',marginTop:5}}><div style={{height:'100%',width:`${meter}%`,background:'#d8b85b'}}/></div>
    <div style={{marginTop:10,fontSize:10,opacity:.62}}>One-hand game controls • nonlethal scoring • no real-world target/anatomy or weapon instruction.</div>
  </div>
}
