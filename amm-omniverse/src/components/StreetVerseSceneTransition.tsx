import {useEffect,useState} from 'react'

type Phase='opening'|'active'|'closing'
export default function StreetVerseSceneTransition({onClose}:{onClose:()=>void}){
 const [phase,setPhase]=useState<Phase>('opening')
 useEffect(()=>{
  const openTimer=setTimeout(()=>{setPhase('active');window.dispatchEvent(new CustomEvent('tryamm:streetverse-scene-opened',{detail:{scene:'streetverse',state:'active'}}))},520)
  const requestClose=()=>{
   if(phase==='closing')return
   setPhase('closing')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-scene-closing',{detail:{scene:'streetverse'}}))
   setTimeout(()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-scene-closed',{detail:{scene:'streetverse',preserveState:true}}));onClose()},430)
  }
  const onRequest=()=>requestClose()
  addEventListener('tryamm:streetverse-request-close',onRequest)
  return()=>{clearTimeout(openTimer);removeEventListener('tryamm:streetverse-request-close',onRequest)}
 },[onClose,phase])
 const blocking=phase!=='active'
 return <>
  {blocking&&<div aria-hidden="true" style={{position:'fixed',inset:0,zIndex:18050,pointerEvents:'auto',background:phase==='opening'?'linear-gradient(180deg,#02050b 0%,#07101d 70%,#0d2030 100%)':'#02050b',opacity:phase==='opening'?0:1,animation:phase==='opening'?'streetverseSceneOpen .52s ease-out forwards':'streetverseSceneClose .43s ease-in forwards'}}/>}
  <style>{`@keyframes streetverseSceneOpen{0%{opacity:1;transform:scale(1.015);filter:blur(7px)}70%{opacity:.18;filter:blur(1px)}100%{opacity:0;transform:scale(1);filter:blur(0)}}@keyframes streetverseSceneClose{0%{opacity:0;filter:blur(0)}100%{opacity:1;filter:blur(4px)}}`}</style>
 </>
}
