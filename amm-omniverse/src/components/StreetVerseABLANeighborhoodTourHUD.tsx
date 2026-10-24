import {useEffect,useRef,useState} from 'react'
import {ABLA_TOUR_STOPS,advanceABLATour,createABLATour,loadABLATour,nextABLATourStop,saveABLATour,startABLATour,type ABLATourState} from '../runtime/StreetVerseABLANeighborhoodTour'

/** Mounted only in the real mobile 3D world; never over the HTML recovery city. */
export default function StreetVerseABLANeighborhoodTourHUD(){
 const [tour,setTour]=useState<ABLATourState>(loadABLATour)
 const current=useRef(tour)
 const [expanded,setExpanded]=useState(true)
 const [distance,setDistance]=useState<number|null>(null)
 const lastDistanceUpdate=useRef(0)
 useEffect(()=>{
  const onStart=()=>{
   const next=saveABLATour(startABLATour())
   current.current=next;setTour(next);setExpanded(true);setDistance(null)
   window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'ABLA neighborhood tour started. Follow the first checkpoint at 1111 South Laflin.'}}))
  }
  const onPosition=(event:Event)=>{
   const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{}
   const x=Number(d.x),z=Number(d.z)
   if(!Number.isFinite(x)||!Number.isFinite(z))return
   const before=current.current,stop=nextABLATourStop(before)
   if(!stop)return
   const next=advanceABLATour(before,x,z)
   if(next!==before){
    saveABLATour(next);current.current=next;setTour(next);setDistance(null)
    const announced=next.status==='complete'?'ABLA neighborhood trail complete. Your five local checkpoints are saved on this device.':ABLA_TOUR_STOPS[next.nextIndex].title+' is your next stop.'
    window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:announced}}))
   }else if(performance.now()-lastDistanceUpdate.current>350){
    lastDistanceUpdate.current=performance.now()
    setDistance(Math.round(Math.hypot(x-stop.x,z-stop.z)))
   }
  }
  window.addEventListener('tryamm:abla-neighborhood-tour-start',onStart)
  window.addEventListener('tryamm:streetverse-player-position',onPosition)
  return()=>{
   window.removeEventListener('tryamm:abla-neighborhood-tour-start',onStart)
   window.removeEventListener('tryamm:streetverse-player-position',onPosition)
  }
 },[])
 if(tour.status==='idle')return null
 const stop=nextABLATourStop(tour)
 const btnStyle={minHeight:44,borderRadius:11,border:'1px solid #84e9d2',background:'#104b46',color:'#fff',fontWeight:900,padding:'7px 11px'} as const
 const travel=()=>{
  if(!stop)return
  window.dispatchEvent(new CustomEvent('tryamm:west-side-route-request',{detail:{x:stop.x,z:stop.z,missionId:stop.id,source:'abla-neighborhood-tour-accessible-fast-travel'}}))
 }
 const dismiss=()=>{
  const reset=saveABLATour(createABLATour())
  current.current=reset;setTour(reset);setDistance(null)
 }
 return <aside data-streetverse-abla-tour="true" aria-label="Circle Park and ABLA neighborhood tour"
  style={{position:'fixed',top:'calc(env(safe-area-inset-top) + 163px)',left:'max(9px,env(safe-area-inset-left))',width:'min(282px,calc(100vw - 18px))',zIndex:17600,background:'#051522ec',color:'#fff',border:'1px solid #5bc4ae',borderRadius:15,boxShadow:'0 12px 24px #0009',fontFamily:'system-ui,sans-serif',pointerEvents:'auto',overflow:'hidden'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'9px 10px'}}>
   <strong style={{fontSize:12,color:'#a5fbe3'}}>ABLA TRAIL • {tour.nextIndex}/{ABLA_TOUR_STOPS.length}</strong>
   <button aria-label={expanded?'Minimize neighborhood tour':'Expand neighborhood tour'} onClick={()=>setExpanded(v=>!v)}
    style={{...btnStyle,minWidth:44,padding:'6px'}}>{expanded?'−':'+'}</button>
  </div>
  {expanded&&<div style={{padding:'0 10px 11px',fontSize:12,lineHeight:1.45}}>
   {stop?<><div style={{fontWeight:900,fontSize:14}}>{stop.title}</div>
     <p style={{margin:'6px 0'}}>{stop.chapter}</p>
     <div aria-live="polite" style={{fontWeight:800,color:'#d6f5ff',marginBottom:9}}>{distance===null?'Move around the 3D world to locate the next stop.':distance+' game-world units to checkpoint'}</div>
     <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
      <button onClick={travel} style={btnStyle} aria-label="Accessible fast travel to next ABLA checkpoint">GO TO STOP</button>
      <button onClick={dismiss} style={{...btnStyle,background:'#14222d',borderColor:'#6e8190'}}>END TOUR</button>
     </div></>:<><p role="status">Neighborhood explored! All five fictional local checkpoints are saved on this device.</p>
     <p style={{color:'#bdd6db'}}>No real money, property rights or online ranking is awarded.</p>
     <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
      <button onClick={()=>{const next=saveABLATour(startABLATour());current.current=next;setTour(next);setDistance(null)}} style={btnStyle}>REPLAY</button>
      <button onClick={dismiss} style={{...btnStyle,background:'#14222d',borderColor:'#6e8190'}}>CLOSE</button>
     </div></>}
  </div>}
 </aside>
}
