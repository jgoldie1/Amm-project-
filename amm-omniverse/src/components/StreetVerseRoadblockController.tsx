import {useEffect,useState} from 'react'

type RoadblockState={active:boolean;agency?:string;x:number;z:number;radius:number;level:number;reason?:string}
const idle:RoadblockState={active:false,x:0,z:0,radius:0,level:0}

export default function StreetVerseRoadblockController(){
 const [state,setState]=useState<RoadblockState>(idle)
 useEffect(()=>{
  const apply=(detail:any,source:string)=>{
   const active=detail?.active!==false
   const level=Math.max(1,Math.min(5,Number(detail?.level||detail?.severity||2)))
   const radius=Math.max(14,Math.min(42,Number(detail?.radius||18+level*4)))
   const next:RoadblockState={active,agency:String(detail?.agency||detail?.kind||'POLICE').toUpperCase(),x:Number(detail?.x||0),z:Number(detail?.z||0),radius:active?radius:0,level:active?level:0,reason:String(detail?.reason||source)}
   setState(next)
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-traffic-reaction',{detail:{active:next.active,kind:next.agency,x:next.x,z:next.z,speedMultiplier:next.active?(next.level>=4?.08:.18):1,pullAside:next.active,crossTrafficRed:next.active,roadblock:true,perimeterRadius:next.radius}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-pedestrian-reaction',{detail:{active:next.active,kind:next.agency,x:next.x,z:next.z,radius:next.radius,action:next.active?'clear-perimeter':'resume'}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-signal-override',{detail:{active:next.active,crossTraffic:next.active?'red':'normal',priorityLane:next.active?'response':'normal',kind:next.agency,roadblock:true}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-roadblock-state',{detail:next}))
  }
  const onRoadblock=(e:Event)=>apply((e as CustomEvent<any>).detail||{},'roadblock')
  const onPerimeter=(e:Event)=>apply((e as CustomEvent<any>).detail||{},'perimeter')
  const clear=()=>apply({active:false},'clear')
  addEventListener('tryamm:streetverse-roadblock-request',onRoadblock)
  addEventListener('tryamm:streetverse-scene-perimeter',onPerimeter)
  addEventListener('tryamm:streetverse-incident-cleared',clear)
  addEventListener('tryamm:streetverse-emergency-resolved',clear)
  return()=>{removeEventListener('tryamm:streetverse-roadblock-request',onRoadblock);removeEventListener('tryamm:streetverse-scene-perimeter',onPerimeter);removeEventListener('tryamm:streetverse-incident-cleared',clear);removeEventListener('tryamm:streetverse-emergency-resolved',clear)}
 },[])
 if(!state.active)return null
 return <div style={{position:'fixed',left:'50%',top:104,transform:'translateX(-50%)',zIndex:16982,pointerEvents:'none',padding:'7px 11px',borderRadius:999,background:'rgba(7,10,16,.92)',border:'1px solid #ffb34f77',color:'#fff',font:'900 9px system-ui',letterSpacing:.7,boxShadow:'0 8px 28px #0008'}}>ROADBLOCK • {state.agency} • LEVEL {state.level} • {Math.round(state.radius)}m PERIMETER • TRAFFIC HELD</div>
}
