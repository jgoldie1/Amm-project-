import { useEffect, useRef, useState } from 'react'

type VehicleInput={throttle:number;brake:number;steer:number;horn:boolean;exit?:boolean}

export default function StreetVerseTouchDriveControls(){
  const [vehicle,setVehicle]=useState(false)
  const [steer,setSteer]=useState(0)
  const throttleRef=useRef(false),brakeRef=useRef(false),hornRef=useRef(false)
  const nubRef=useRef<HTMLDivElement|null>(null)
  const baseRef=useRef<HTMLDivElement|null>(null)

  const emit=(exit=false)=>window.dispatchEvent(new CustomEvent<VehicleInput>('tryamm:streetverse-vehicle-input',{detail:{throttle:throttleRef.current?1:0,brake:brakeRef.current?1:0,steer,horn:hornRef.current,exit}}))

  useEffect(()=>{emit()},[steer])
  useEffect(()=>{const onVehicle=(e:Event)=>setVehicle(Boolean((e as CustomEvent<{entered?:boolean}>).detail?.entered));window.addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);return()=>window.removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)},[])

  const move=(clientX:number)=>{
    const el=baseRef.current;if(!el)return
    const r=el.getBoundingClientRect();const center=r.left+r.width/2;const next=Math.max(-1,Math.min(1,(clientX-center)/(r.width*.36)));setSteer(next)
  }
  const resetSteer=()=>setSteer(0)
  const hold=(ref:React.MutableRefObject<boolean>,value:boolean)=>{ref.current=value;emit()}

  if(!vehicle)return null
  return <div aria-label="StreetVerse touch driving controls" style={{position:'fixed',left:12,right:12,bottom:72,zIndex:16997,display:'flex',justifyContent:'space-between',alignItems:'end',gap:12,pointerEvents:'none',fontFamily:'system-ui,sans-serif'}}>
    <div ref={baseRef} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e.clientX)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e.clientX)}} onPointerUp={resetSteer} onPointerCancel={resetSteer} style={{pointerEvents:'auto',width:132,height:74,borderRadius:40,background:'#071725dd',border:'1px solid #4fe3ff77',position:'relative',touchAction:'none'}}>
      <div ref={nubRef} style={{position:'absolute',left:`calc(50% + ${steer*34}px - 24px)`,top:13,width:48,height:48,borderRadius:'50%',background:'#d9fbff',border:'3px solid #57ddff',boxShadow:'0 6px 18px #0008',transition:Math.abs(steer)<.01?'left .12s ease':'none'}}/>
      <span style={{position:'absolute',left:10,bottom:5,fontSize:8,fontWeight:900,color:'#8fd8e8'}}>STEER</span>
    </div>
    <div style={{pointerEvents:'auto',display:'grid',gridTemplateColumns:'repeat(2,68px)',gap:8}}>
      <Hold label="BRAKE" down={()=>hold(brakeRef,true)} up={()=>hold(brakeRef,false)} />
      <Hold label="GAS" down={()=>hold(throttleRef,true)} up={()=>hold(throttleRef,false)} primary />
      <Hold label="HORN" down={()=>hold(hornRef,true)} up={()=>hold(hornRef,false)} />
      <button onClick={()=>emit(true)} style={btn('#ffcf6b')}>EXIT</button>
    </div>
  </div>
}

function Hold({label,down,up,primary=false}:{label:string;down:()=>void;up:()=>void;primary?:boolean}){return <button onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);down()}} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} style={btn(primary?'#8effb7':'#b9d5e6')}>{label}</button>}
const btn=(color:string):React.CSSProperties=>({minHeight:52,borderRadius:16,border:'1px solid #4d7088',background:'#081622ee',color,fontSize:10,fontWeight:950,touchAction:'none'})
