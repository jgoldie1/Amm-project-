import { useEffect, useRef, useState } from 'react'

type VehicleInput={throttle:number;brake:number;steer:number;horn:boolean;exit?:boolean}

export default function StreetVerseTouchDriveControls(){
  const [vehicle,setVehicle]=useState(false)
  const [steer,setSteer]=useState(0)
  const throttleRef=useRef(false),brakeRef=useRef(false),hornRef=useRef(false),steerRef=useRef(0)
  const baseRef=useRef<HTMLDivElement|null>(null)

  const emit=(exit=false)=>window.dispatchEvent(new CustomEvent<VehicleInput>('tryamm:streetverse-vehicle-input',{detail:{throttle:throttleRef.current?1:0,brake:brakeRef.current?1:0,steer:steerRef.current,horn:hornRef.current,exit}}))

  useEffect(()=>{steerRef.current=steer;emit()},[steer])
  useEffect(()=>{const onVehicle=(e:Event)=>{const entered=Boolean((e as CustomEvent<{entered?:boolean}>).detail?.entered);setVehicle(entered);if(!entered){throttleRef.current=false;brakeRef.current=false;hornRef.current=false;steerRef.current=0;setSteer(0);emit()}};window.addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);return()=>window.removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)},[])
  useEffect(()=>{const release=()=>{throttleRef.current=false;brakeRef.current=false;hornRef.current=false;steerRef.current=0;setSteer(0);emit()};window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release()});return()=>{window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);window.removeEventListener('blur',release)}},[])

  const move=(clientX:number)=>{
    const el=baseRef.current;if(!el)return
    const r=el.getBoundingClientRect();const center=r.left+r.width/2;const next=Math.max(-1,Math.min(1,(clientX-center)/(r.width*.36)));steerRef.current=next;setSteer(next)
  }
  const resetSteer=()=>{steerRef.current=0;setSteer(0);emit()}
  const hold=(ref:React.MutableRefObject<boolean>,value:boolean)=>{ref.current=value;if(value&&navigator.vibrate)try{navigator.vibrate(12)}catch{};emit()}

  if(!vehicle)return null
  return <div aria-label="StreetVerse touch driving controls" style={{position:'fixed',left:8,right:8,bottom:'max(72px, env(safe-area-inset-bottom))',zIndex:16997,display:'flex',justifyContent:'space-between',alignItems:'end',gap:10,pointerEvents:'none',fontFamily:'system-ui,sans-serif',userSelect:'none',WebkitUserSelect:'none'}}>
    <div ref={baseRef} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);move(e.clientX)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e.clientX)}} onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{};resetSteer()}} onPointerCancel={resetSteer} style={{pointerEvents:'auto',width:'min(38vw,152px)',height:82,borderRadius:44,background:'#071725dd',border:'1px solid #4fe3ff77',position:'relative',touchAction:'none'}}>
      <div style={{position:'absolute',left:`calc(50% + ${steer*42}px - 25px)`,top:15,width:50,height:50,borderRadius:'50%',background:'#d9fbff',border:'3px solid #57ddff',boxShadow:'0 6px 18px #0008',transition:Math.abs(steer)<.01?'left .12s ease':'none'}}/>
      <span style={{position:'absolute',left:10,bottom:5,fontSize:8,fontWeight:900,color:'#8fd8e8'}}>STEER</span>
    </div>
    <div style={{pointerEvents:'auto',display:'grid',gridTemplateColumns:'repeat(2,minmax(62px,74px))',gap:8}}>
      <Hold label="BRAKE" down={()=>hold(brakeRef,true)} up={()=>hold(brakeRef,false)} />
      <Hold label="GAS" down={()=>hold(throttleRef,true)} up={()=>hold(throttleRef,false)} primary />
      <Hold label="HORN" down={()=>hold(hornRef,true)} up={()=>hold(hornRef,false)} />
      <button aria-label="Exit vehicle" onClick={()=>emit(true)} style={btn('#ffcf6b')}>EXIT</button>
    </div>
  </div>
}

function Hold({label,down,up,primary=false}:{label:string;down:()=>void;up:()=>void;primary?:boolean}){return <button aria-label={label} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);down()}} onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{};up()}} onPointerCancel={up} style={btn(primary?'#8effb7':'#b9d5e6')}>{label}</button>}
const btn=(color:string):React.CSSProperties=>({minHeight:58,borderRadius:16,border:'1px solid #4d7088',background:'#081622ee',color,fontSize:11,fontWeight:950,touchAction:'none',WebkitTapHighlightColor:'transparent'})
