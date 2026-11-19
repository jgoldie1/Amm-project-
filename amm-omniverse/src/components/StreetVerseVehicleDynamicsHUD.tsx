import {useEffect,useRef,useState,type CSSProperties,type PointerEvent} from 'react'
import {createVehicleState,stepVehicle,safeVehicleTelemetry,type VehicleKind,type VehicleGear,type VehicleSurface,type VehicleState} from '../runtime/StreetVerseVehicleDynamics.mjs'

type Controls={throttle:number;brake:number;steer:number;gear:VehicleGear;parkingBrake:boolean;surface:VehicleSurface}
const initial:Controls={throttle:0,brake:0,steer:0,gear:'P',parkingBrake:false,surface:'dry'}
const btn:CSSProperties={minHeight:56,minWidth:58,padding:'10px 14px',borderRadius:12,border:'1px solid #8fbcc5',color:'#fff',background:'#163b53',fontWeight:800,fontSize:16,touchAction:'none',cursor:'pointer'}
const clamp=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,x))
export default function StreetVerseVehicleDynamicsHUD(){
 const [expanded,setExpanded]=useState(false)
 const [kind,setKind]=useState<VehicleKind>('car')
 const [vehicle,setVehicle]=useState<VehicleState>(()=>createVehicleState('car'))
 const [surface,setSurface]=useState<VehicleSurface>('dry')
 const [notice,setNotice]=useState('Driving simulator: independent handling tests, not verified traffic collision or finished Rapier wheel contact.')
 const stateRef=useRef<VehicleState>(vehicle),controlRef=useRef<Controls>({...initial}),raf=useRef(0)
 const setControls=(patch:Partial<Controls>)=>{controlRef.current={...controlRef.current,...patch}}
 const reset=(k:VehicleKind)=>{stateRef.current=createVehicleState(k);setVehicle(stateRef.current);setKind(k);setControls({...initial,surface})}
 const shift=(g:VehicleGear)=>{
  if(Math.abs(stateRef.current.speed)>.5&&g!==stateRef.current.gear&&(g==='P'||g==='R'||stateRef.current.gear==='R'&&g==='D')){setNotice('Stop before switching into park, reverse or drive from reverse.');return}
  setControls({gear:g});window.dispatchEvent(new CustomEvent('tryamm:streetverse-transmission',{detail:{gear:g,parkingBrake:controlRef.current.parkingBrake,source:'streetverse-dynamics-test'}}))
 }
 const stop=()=>{setControls({throttle:0,brake:0,steer:0,parkingBrake:true});setNotice('Parking brake engaged.')}
 useEffect(()=>{
  if(!expanded)return
  let disposed=false,last=performance.now(),acc=0,uiAt=last
  const frame=(now:number)=>{
   if(disposed)return
   raf.current=requestAnimationFrame(frame)
   const dt=clamp((now-last)/1000,0,.1);last=now
   if(document.visibilityState==='hidden'){acc=0;setControls({throttle:0,brake:0,steer:0});return}
   acc+=dt
   while(acc>=1/60){stateRef.current=stepVehicle(stateRef.current,controlRef.current,1/60);acc-=1/60}
   if(now-uiAt>=100){uiAt=now;setVehicle({...stateRef.current})}
  }
  raf.current=requestAnimationFrame(frame)
  return()=>{disposed=true;cancelAnimationFrame(raf.current);setControls({throttle:0,brake:0,steer:0})}
 },[expanded])
 const hold=(patch:Partial<Controls>)=>({
  onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);setControls(patch)},
  onPointerUp:(e:PointerEvent<HTMLButtonElement>)=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);setControls({throttle:0,brake:0,steer:0})},
  onPointerCancel:()=>setControls({throttle:0,brake:0,steer:0}),
  onLostPointerCapture:()=>setControls({throttle:0,brake:0,steer:0})
 })
 if(!expanded)return <button aria-label="Open StreetVerse car and motorcycle handling test" style={{...btn,position:'fixed',right:8,bottom:'calc(env(safe-area-inset-bottom) + 70px)',zIndex:57000}} onClick={()=>setExpanded(true)}>CAR / BIKE PHYSICS</button>
 const telemetry=safeVehicleTelemetry(vehicle)
 return <section role="dialog" aria-modal="true" aria-label="StreetVerse car and motorcycle driving simulator" style={{position:'fixed',inset:0,zIndex:2147483580,overflowY:'auto',color:'#fff',background:'#091828f5',padding:'max(16px,env(safe-area-inset-top)) 14px max(32px,env(safe-area-inset-bottom))'}}>
  <div style={{maxWidth:680,margin:'0 auto',display:'grid',gap:12}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><h2 style={{fontSize:23,margin:0}}>StreetVerse Vehicle Physics Test</h2><button style={btn} onClick={()=>{stop();setExpanded(false)}}>CLOSE</button></header>
   <p style={{fontSize:13,lineHeight:1.6,margin:0}}>Original car and motorcycle steering, acceleration, braking, reverse, transmission, tire grip and bike lean. One-hand press-and-hold controls, local simulation only. The main 3D world still needs wheel, tire contact and collision integration.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}><button aria-pressed={kind==='car'} onClick={()=>reset('car')} style={{...btn,background:kind==='car'?'#38694b':'#163b53'}}>CAR</button><button aria-pressed={kind==='motorcycle'} onClick={()=>reset('motorcycle')} style={{...btn,background:kind==='motorcycle'?'#38694b':'#163b53'}}>MOTORCYCLE</button></div>
   <div style={{padding:17,border:'1px solid #7199ad',borderRadius:15,textAlign:'center',background:'#153446'}}><strong style={{fontSize:44}}>{telemetry.speedKmh} km/h</strong><p style={{margin:'5px 0'}}>Gear {telemetry.gear} · {telemetry.surface} road · {kind==='motorcycle'?'Lean '+Math.round(telemetry.leanRadians*180/Math.PI)+'°':'Steering '+Math.round(vehicle.steering*100)+'%'}</p><svg viewBox="0 0 360 140" width="100%" role="img" aria-label="Top-down local simulated vehicle driving heading and position"><rect width="360" height="140" rx="10" fill="#153b41"/><path d="M0 70H360" stroke="#f0daa1" strokeWidth="3" strokeDasharray="20 12"/><g transform={`translate(${180+Math.sin(vehicle.heading)*Math.min(125,vehicle.distance*1.5)} ${70+Math.cos(vehicle.heading)*Math.min(40,vehicle.distance*.5)}) rotate(${vehicle.heading*180/Math.PI})`}><rect x="-12" y="-24" width="24" height="48" rx="7" fill={kind==='car'?'#bfe7ef':'#f1dc9a'} /><rect x="-9" y="-9" width="18" height="12" fill="#233d57"/></g></svg></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:6}}>{(['P','R','N','D'] as VehicleGear[]).map(g=><button key={g} style={{...btn,background:vehicle.gear===g?'#41624b':'#163b53'}} aria-pressed={vehicle.gear===g} onClick={()=>shift(g)}>{g}</button>)}</div>
   <label htmlFor="streetverse-road-grip">Road surface</label><select id="streetverse-road-grip" style={btn} value={surface} onChange={e=>{const val=e.target.value as VehicleSurface;setSurface(val);setControls({surface:val})}}>{(['dry','wet','gravel'] as VehicleSurface[]).map(s=><option key={s}>{s}</option>)}</select>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}><button {...hold({steer:-1})} style={btn}>◀ STEER LEFT</button><button {...hold({steer:1})} style={btn}>STEER RIGHT ▶</button><button {...hold({throttle:1})} style={{...btn,background:'#285e48'}}>HOLD ACCELERATE</button><button {...hold({brake:1})} style={{...btn,background:'#74413b'}}>HOLD BRAKE</button></div>
   <button style={{...btn,background:vehicle.parkingBrake?'#724b35':'#2a5164'}} onClick={()=>{const next=!controlRef.current.parkingBrake;setControls({parkingBrake:next,throttle:0});setNotice(next?'Parking brake engaged':'Parking brake released')}}>{vehicle.parkingBrake?'RELEASE PARKING BRAKE':'ENGAGE PARKING BRAKE'}</button>
   <button style={btn} onClick={()=>reset(kind)}>RESET VEHICLE</button>
   <p role="status" aria-live="polite" style={{padding:12,borderRadius:12,background:'#263949',lineHeight:1.5}}>{notice}</p>
   <p style={{fontSize:12,color:'#c3d4df',margin:0}}>Prototype only. This simulation does not demonstrate wheel raycasts, suspension, road collision, seat animation, real transmission hardware, network replication or native DLSS 5 support.</p>
  </div>
 </section>
}
