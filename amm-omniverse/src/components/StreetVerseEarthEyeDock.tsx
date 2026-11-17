import {lazy,Suspense,useEffect,useState} from 'react'
const StreetVerseEarthEyeMap=lazy(()=>import('./StreetVerseEarthEyeMap'))
import {EARTH_EYE_CITIES,type EarthEyeAction,type EarthEyeReceipt} from '../runtime/StreetVerseEarthEyeDirector'
const button:React.CSSProperties={minHeight:46,padding:'7px 10px',border:'1px solid #76dbf3',borderRadius:10,color:'#f0fbff',background:'#0c3145',font:'700 12px system-ui',touchAction:'manipulation'}
/** Optional light-weight, read-only God Eye-style original Earth and Time Machine controller. */
export default function StreetVerseEarthEyeDock(){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState('chicago')
 const [result,setResult]=useState<EarthEyeReceipt|null>(null)
 const [mapOpen,setMapOpen]=useState(false)
 useEffect(()=>{
  const onResult=(e:Event)=>setResult((e as CustomEvent<EarthEyeReceipt>).detail)
  window.addEventListener('tryamm:streetverse-earth-eye-result',onResult)
  return()=>window.removeEventListener('tryamm:streetverse-earth-eye-result',onResult)
 },[])
 const issue=(action:EarthEyeAction)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-earth-eye-command',{detail:{cityId:selected,action}}))
 return <aside aria-label="StreetVerse Earth Eye" style={{position:'fixed',top:'calc(env(safe-area-inset-top) + 200px)',right:10,zIndex:14973,maxWidth:'min(295px,calc(100vw - 24px))'}}>
  <button type="button" style={button} aria-expanded={open} onClick={()=>setOpen(value=>!value)}>🌐 EARTH EYE</button>
  {open&&<section style={{display:'grid',gap:8,marginTop:5,padding:12,borderRadius:12,background:'rgba(5,21,33,.97)',border:'1px solid #76dbf3',color:'white',fontFamily:'system-ui',maxHeight:'55dvh',overflowY:'auto'}}>
   <strong>Earth • Mycelium • Time Machine</strong>
   <label htmlFor="sv-earth-eye-city">Select a city</label>
   <select id="sv-earth-eye-city" value={selected} onChange={e=>{setSelected(e.target.value);setResult(null)}} style={{minHeight:44,padding:8,background:'#0c3145',color:'#fff',border:'1px solid #76dbf3',borderRadius:8}}>
    {EARTH_EYE_CITIES.map(city=><option key={city.id} value={city.id}>{city.label} — {city.region}</option>)}
   </select>
   <button style={button} aria-expanded={mapOpen} onClick={()=>setMapOpen(v=>!v)}>{mapOpen?'HIDE GLOBE PREVIEW':'VIEW FIVE-CITY GLOBE'}</button>
   {mapOpen&&<Suspense fallback={<small>Loading the bundled MapLibre preview…</small>}><StreetVerseEarthEyeMap selected={selected} onSelect={id=>{setSelected(id);setResult(null)}}/></Suspense>}
   <button style={button} onClick={()=>issue('inspect')}>INSPECT CITY</button>
   <button style={button} onClick={()=>issue('time-preview')}>TIME MACHINE PLAN</button>
   <button style={button} onClick={()=>issue('tile-export-plan')}>MAP TILE PLAN</button>
   <small aria-live="polite">{result?result.notes.join(' '):'Read-only preview. No satellite feed, tracking, automatic teleport or production build.'}</small>
   <button style={button} onClick={()=>setOpen(false)}>CLOSE</button>
  </section>}
 </aside>
}
