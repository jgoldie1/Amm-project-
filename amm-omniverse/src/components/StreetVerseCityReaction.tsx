import {useEffect,useState} from 'react'

type YieldState={active:boolean;kind?:string;x?:number;z?:number}
export default function StreetVerseCityReaction(){
 const [state,setState]=useState<YieldState>({active:false})
 useEffect(()=>{
  const onYield=(e:Event)=>{const d=(e as CustomEvent<YieldState>).detail||{active:false};setState(d);window.dispatchEvent(new CustomEvent('tryamm:streetverse-traffic-reaction',{detail:{active:!!d.active,kind:d.kind||'emergency',x:Number(d.x||0),z:Number(d.z||0),speedMultiplier:d.active?.28:1,pullAside:d.active,crossTrafficRed:d.active}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-pedestrian-reaction',{detail:{active:!!d.active,kind:d.kind||'emergency',x:Number(d.x||0),z:Number(d.z||0),radius:d.active?22:0,action:d.active?'pause-step-back':'resume'}}))}
  const onPreempt=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.active)window.dispatchEvent(new CustomEvent('tryamm:streetverse-signal-override',{detail:{active:true,crossTraffic:'red',priorityLane:'emergency',kind:d.emergency||'emergency'}}));else window.dispatchEvent(new CustomEvent('tryamm:streetverse-signal-override',{detail:{active:false}}))}
  addEventListener('tryamm:streetverse-world-yield',onYield);addEventListener('tryamm:streetverse-traffic-preemption',onPreempt)
  return()=>{removeEventListener('tryamm:streetverse-world-yield',onYield);removeEventListener('tryamm:streetverse-traffic-preemption',onPreempt)}
 },[])
 if(!state.active)return null
 return <div style={{position:'fixed',left:'50%',top:72,transform:'translateX(-50%)',zIndex:16978,pointerEvents:'none',padding:'6px 10px',borderRadius:999,background:'#130b0be8',border:'1px solid #ff565666',color:'#fff',font:'900 9px system-ui',letterSpacing:.7}}>CITY REACTION ACTIVE • TRAFFIC YIELD • PEDESTRIANS CLEAR • CROSS TRAFFIC RED</div>
}
