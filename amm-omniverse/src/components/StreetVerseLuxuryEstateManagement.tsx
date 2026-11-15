import {useEffect,useState} from 'react'
export const LUXURY_ESTATE_CONFIG={
 lateasia:{id:'lateasia',name:"LaTeasia's Tampa Mansion",city:'Tampa',bedrooms:12,bathrooms:14,ensuites:12,powderRooms:2,housekeepers:4,butlers:2,estateManagers:1,chefs:1,security:2},
 jacobie:{id:'jacobie',name:"Jacobie's Chicago Gold Coast Mansion",city:'Chicago',bedrooms:12,bathrooms:14,ensuites:12,powderRooms:2,housekeepers:4,butlers:2,estateManagers:1,chefs:1,security:2}
} as const
export type EstateId=keyof typeof LUXURY_ESTATE_CONFIG
const KEY='streetverse:luxury-estates:v1'
type EstateStatus={maintenance:number;cleanliness:number;staffOnDuty:boolean;eventBooked:boolean}
const defaults:Record<EstateId,EstateStatus>={lateasia:{maintenance:95,cleanliness:95,staffOnDuty:true,eventBooked:false},jacobie:{maintenance:95,cleanliness:95,staffOnDuty:true,eventBooked:false}}
function load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');return raw&&raw.lateasia&&raw.jacobie?raw as Record<EstateId,EstateStatus>:defaults}catch{return defaults}}
export function StreetVerseLuxuryEstateManagement(){
 const [open,setOpen]=useState(false)
 const [estate,setEstate]=useState<EstateId>('lateasia')
 const [status,setStatus]=useState<Record<EstateId,EstateStatus>>(load)
 const [notice,setNotice]=useState('Manage fictional staff, maintenance and events.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(status))}catch{}},[status])
 const update=(patch:Partial<EstateStatus>,msg:string)=>{setStatus(s=>({...s,[estate]:{...s[estate],...patch}}));setNotice(msg)}
 const config=LUXURY_ESTATE_CONFIG[estate],current=status[estate]
 const btn={width:'100%',minHeight:48,padding:8,borderRadius:8,fontSize:14} as const
 return <section aria-label="Luxury estate management" style={{position:'absolute',right:12,top:430,zIndex:42,width:'min(290px,65vw)',background:'rgba(28,24,42,.96)',color:'white',padding:10,borderRadius:12,border:'1px solid #d7c186'}}>
  <button type="button" style={btn} onClick={()=>setOpen(v=>!v)}>{open?'CLOSE':'OPEN'} ESTATE MANAGER</button>
  {open&&<div style={{display:'grid',gap:7,fontSize:13}}>
   <label htmlFor="estate-select">Property</label>
   <select id="estate-select" style={btn} value={estate} onChange={e=>setEstate(e.target.value as EstateId)}><option value="lateasia">LaTeasia · Tampa</option><option value="jacobie">Jacobie · Chicago Gold Coast</option></select>
   <strong>{config.name}</strong>
   <div>{config.bedrooms} bedrooms · {config.bathrooms} bathrooms ({config.ensuites} en-suite, {config.powderRooms} powder rooms)</div>
   <div>Housekeepers: {config.housekeepers} · Butlers: {config.butlers} · Estate manager: {config.estateManagers} · Chef: {config.chefs} · Security: {config.security}</div>
   <div>Maintenance: {current.maintenance}/100 · Cleanliness: {current.cleanliness}/100</div>
   <button type="button" style={btn} onClick={()=>update({staffOnDuty:!current.staffOnDuty},current.staffOnDuty?'Staff off duty.':'Staff on duty.')}>{current.staffOnDuty?'END':'START'} STAFF SHIFT</button>
   <button type="button" style={btn} onClick={()=>update({cleanliness:100},'Fictional housekeeping service completed.')}>HOUSEKEEPING</button>
   <button type="button" style={btn} onClick={()=>update({maintenance:100},'Fictional property maintenance completed.')}>MAINTENANCE</button>
   <button type="button" style={btn} onClick={()=>update({eventBooked:!current.eventBooked},current.eventBooked?'Event canceled.':'Private RP event scheduled.')}>{current.eventBooked?'CANCEL':'SCHEDULE'} ESTATE EVENT</button>
   <div role="status" aria-live="polite">{notice}</div>
   <small>Prototype estate simulation: no real employees, wages, property ownership, bookings or payments.</small>
  </div>}
 </section>
}
