import {useEffect,useState} from 'react'
import {citySnapshot,nextCityTick} from '../runtime/StreetVerseLivingCityDirector'
const button={minHeight:46,padding:'9px 12px',borderRadius:8,border:'1px solid #85dbe7',background:'#17485b',color:'#fff'}
export default function StreetVerseLivingCityDirectorHUD(){
 const [open,setOpen]=useState(false),[tick,setTick]=useState(0),[era,setEra]=useState('present')
 useEffect(()=>{const onEra=(e:Event)=>{const d=(e as CustomEvent<{era?:string}>).detail;if(d?.era)setEra(d.era)};window.addEventListener('tryamm:streetverse-chrono-era',onEra);return()=>window.removeEventListener('tryamm:streetverse-chrono-era',onEra)},[])
 const city=citySnapshot(tick,era)
 return <aside data-streetverse-living-city-director="simulation" style={{position:'fixed',right:8,bottom:90,zIndex:43985,maxWidth:'min(330px,calc(100vw - 16px))',maxHeight:'45dvh',overflow:'auto',padding:8,borderRadius:10,background:'rgba(9,26,42,.96)',color:'white',font:'12px system-ui'}}>
  <button style={button} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🌆 LIVING CITY DIRECTOR</button>
  {open&&<div style={{display:'grid',gap:8,marginTop:8}}>
   <strong>Day {city.day+1} • {String(city.hour).padStart(2,'0')}:00 • {city.era}</strong>
   <div>Simulated residents: {city.actors.length} • Delivery requests: {city.deliveryDemand.length}</div>
   {Object.entries(city.footTraffic).map(([id,count])=><div key={id}>{id}: {count} shopping NPCs</div>)}
   <button style={button} onClick={()=>setTick(nextCityTick)}>ADVANCE CITY TIME</button>
   <div aria-live="polite">{city.actors.slice(0,5).map(a=>a.id+' '+a.activity).join(' • ')}</div>
   <small>Deterministic activity simulation. NPC pathfinding, actual customer purchases, multiplayer and production operations are not connected.</small>
  </div>}
 </aside>
}
