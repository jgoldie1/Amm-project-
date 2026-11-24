import {useEffect,useState} from 'react'
import {PIN_REQUEST,PIN_RESULT,pinOrigin} from '../runtime/StreetVerseMapPin'

export function StreetVerseBuildingPin({area}:{area:string}){
 const origin=pinOrigin(area)
 const [point,setPoint]=useState(origin.lat+', '+origin.lon)
 const [asset,setAsset]=useState(''),[yaw,setYaw]=useState('0'),[scale,setScale]=useState('1')
 const [status,setStatus]=useState('')
 useEffect(()=>{
  const result=(e:Event)=>setStatus((e as CustomEvent<string>).detail)
  window.addEventListener(PIN_RESULT,result)
  return ()=>window.removeEventListener(PIN_RESULT,result)
 },[])
 return <details><summary style={{minHeight:44}}>Place a building on the Chicago map</summary>
 <form style={{display:'grid',gap:8}} onSubmit={e=>{
  e.preventDefault()
  const parts=point.split(',').map(p=>p.trim())
  if(parts.length!==2||parts.some(p=>!p||!Number.isFinite(Number(p)))){setStatus('Enter latitude, longitude.');return}
  setStatus('Loading the selected building…')
  const unhandled=window.dispatchEvent(new CustomEvent(PIN_REQUEST,{cancelable:true,detail:{area,lat:Number(parts[0]),lon:Number(parts[1]),assetId:asset.trim(),yaw:Number(yaw),scale:Number(scale)}}))
  if(unhandled)setStatus('Open the Chicago 3D scene to place the building.')
 }}>
 <small>{area?'Neighborhood reference point':'1111 S Laflin · approximate street address'} · paste a nearby map pin or use this reference.</small>
 <fieldset><legend>Choose a nearby pin · north is up</legend>
 <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
 {['NW','N','NE','W','Center','E','SW','S','SE'].map((direction,i)=>{
  const lat=origin.lat+(1-Math.floor(i/3))*15/111320
  const lon=origin.lon+(i%3-1)*15/(111320*Math.cos(origin.lat*Math.PI/180))
  const value=lat.toFixed(7)+', '+lon.toFixed(7)
  return <button type="button" key={direction} aria-label={'Select '+direction+' pin'} aria-pressed={point===value} style={{minHeight:44}} onClick={()=>setPoint(value)}>{direction}</button>
 })}
 </div><small>Each step is 15 metres. You can also enter exact coordinates below.</small></fieldset>
 <label>Latitude, longitude <input required value={point} onChange={e=>setPoint(e.target.value)}/></label>
 <label>Published Chicago model ID <input value={asset} placeholder="Blank uses the recovered brick module" onChange={e=>setAsset(e.target.value)}/></label>
 <label>Clockwise rotation (degrees) <input required type="number" step="any" value={yaw} onChange={e=>setYaw(e.target.value)}/></label>
 <label>Model scale <input required type="number" min=".001" max="50" step="any" value={scale} onChange={e=>setScale(e.target.value)}/></label>
 <button style={{minHeight:48}}>Place building at this pin</button><output aria-live="polite">{status}</output>
 </form></details>
}
