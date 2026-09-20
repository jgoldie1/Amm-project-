import {useEffect,useState} from 'react'
import {STREETVERSE_RP_CHOICE_MODEL} from '../config/streetverseChicagoRpGameplay'

type Hand='left'|'right'
type Choice='A'|'B'|'C'

export default function StreetVerseOneHandRpController(){
 const [hand,setHand]=useState<Hand>(()=>localStorage.getItem('tryamm.rp.hand')==='left'?'left':'right')
 const [choiceOpen,setChoiceOpen]=useState(false)
 const [title,setTitle]=useState('Choose your route')

 useEffect(()=>{
  const open=(event:Event)=>{const d=(event as CustomEvent).detail||{};setTitle(String(d.title||'Choose your route'));setChoiceOpen(true)}
  window.addEventListener('tryamm:rp-choice-open',open)
  return()=>window.removeEventListener('tryamm:rp-choice-open',open)
 },[])

 const choose=(choice:Choice)=>{
  const route=STREETVERSE_RP_CHOICE_MODEL[choice]
  window.dispatchEvent(new CustomEvent('tryamm:rp-choice-selected',{detail:{choice,label:route.label,at:new Date().toISOString()}}))
  setChoiceOpen(false)
 }

 const action=(id:string)=>window.dispatchEvent(new CustomEvent('tryamm:rp-onehand-action',{detail:{action:id,hand,at:new Date().toISOString()}}))
 const side=hand==='right'?{right:12}:{left:12}

 return <>
  <div aria-label="One hand RP controls" style={{position:'fixed',...side,bottom:82,zIndex:17020,display:'grid',gap:7}}>
   {['INTERACT','MISSION','PHONE','VEHICLE','EMOTE','CAMERA'].map(id=><button key={id} onClick={()=>action(id)} style={{minWidth:86,minHeight:52,borderRadius:14,border:'1px solid #59e7ff88',background:'#071b25eF',color:'#fff',fontWeight:950,fontSize:10}}>{id}</button>)}
   <button onClick={()=>{const next=hand==='right'?'left':'right';setHand(next);localStorage.setItem('tryamm.rp.hand',next)}} style={{minHeight:52,borderRadius:14,border:'1px solid #e8b94488',background:'#211907ef',color:'#ffe49b',fontWeight:950,fontSize:10}}>MOVE TO {hand==='right'?'LEFT':'RIGHT'}</button>
  </div>
  {choiceOpen&&<div role="dialog" aria-label="RP mission choice" style={{position:'fixed',left:'50%',bottom:20,transform:'translateX(-50%)',zIndex:17030,width:'min(92vw,620px)',padding:14,borderRadius:18,background:'#030914f5',border:'1px solid #4fe3ff77',color:'#fff'}}>
   <div style={{fontWeight:1000,fontSize:17}}>{title}</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginTop:10}}>
    {(['A','B','C'] as Choice[]).map(c=>{const r=STREETVERSE_RP_CHOICE_MODEL[c];return <button key={c} onClick={()=>choose(c)} style={{minHeight:96,padding:10,borderRadius:14,border:'1px solid #4fe3ff66',background:'#0a1723',color:'#fff',textAlign:'left'}}><b style={{fontSize:22}}>{c}</b><div style={{fontWeight:950,marginTop:4}}>{r.label}</div><div style={{fontSize:10,opacity:.75,marginTop:4}}>{r.description}</div></button>})}
   </div>
  </div>}
 </>
}
