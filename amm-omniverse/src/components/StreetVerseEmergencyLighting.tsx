import {useEffect,useState} from 'react'

type Emergency='police'|'ambulance'|'fire'|null

export default function StreetVerseEmergencyLighting(){
 const [kind,setKind]=useState<Emergency>(null)
 const [flash,setFlash]=useState(false)
 const [preempt,setPreempt]=useState(false)
 useEffect(()=>{
  let stopTimer:number|undefined
  const activate=(next:Exclude<Emergency,null>)=>{setKind(next);setPreempt(true);if(stopTimer)clearTimeout(stopTimer);stopTimer=window.setTimeout(()=>{setKind(null);setPreempt(false)},12000)}
  const onEmergency=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};const raw=String(d.type||d.kind||d.service||'police').toLowerCase();activate(raw.includes('ambul')?'ambulance':raw.includes('fire')?'fire':'police')}
  const onCollision=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(Number(d.impact||d.severity||0)>8)activate('ambulance')}
  const onRace=()=>activate('police')
  addEventListener('tryamm:streetverse-emergency-response',onEmergency);addEventListener('tryamm:streetverse-collision',onCollision);addEventListener('tryamm:streetverse-ai-opponents-start',onRace)
  return()=>{if(stopTimer)clearTimeout(stopTimer);removeEventListener('tryamm:streetverse-emergency-response',onEmergency);removeEventListener('tryamm:streetverse-collision',onCollision);removeEventListener('tryamm:streetverse-ai-opponents-start',onRace)}
 },[])
 useEffect(()=>{if(!kind)return;const t=window.setInterval(()=>setFlash(v=>!v),170);return()=>clearInterval(t)},[kind])
 if(!kind)return null
 const left=kind==='fire'?'#ff2b18':kind==='ambulance'?'#ff2a2a':'#ff2438'
 const right=kind==='fire'?'#ffd43b':kind==='ambulance'?'#ffffff':'#2474ff'
 return <div aria-label={`${kind} emergency lights active`} style={{position:'fixed',inset:0,zIndex:16980,pointerEvents:'none',boxShadow:`inset ${flash?'85px':'25px'} 0 110px ${left}35,inset -${flash?'25px':'85px'} 0 110px ${right}35`,transition:'box-shadow 90ms linear'}}>
  <div style={{position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',display:'flex',gap:4,padding:'4px 6px',borderRadius:8,background:'#05080ddd',border:'1px solid #ffffff33'}}>
   <i style={{width:44,height:10,borderRadius:4,background:flash?left:'#401016',boxShadow:flash?`0 0 24px ${left}`:'none'}}/>
   <i style={{width:44,height:10,borderRadius:4,background:flash?'#162343':right,boxShadow:flash?'none':`0 0 24px ${right}`}}/>
  </div>
  {preempt&&<div style={{position:'absolute',top:34,left:'50%',transform:'translateX(-50%)',padding:'4px 8px',borderRadius:7,background:'#190808dd',border:'1px solid #ff3a3a66',color:'#fff',font:'800 9px system-ui',letterSpacing:.7}}>EMERGENCY PREEMPT • CROSS TRAFFIC RED • CLEAR ROUTE</div>}
 </div>
}
