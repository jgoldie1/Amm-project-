import {useEffect,useState} from 'react'

export const TAMPA_INSPECT_EVENT='tryamm:tampa-world-builder-inspect'
export const TAMPA_BUILDINGS=[
 {id:'salon',name:'LaTeasia Monroe Beauty House',owner:'LaTeasia Monroe (fictional RP)',residents:0,jobs:3,missions:['Salon assistant','Beauty service'],condition:92,activity:'Beauty appointments',district:'Beauty House Quarter'},
 {id:'academy',name:'Beauty Academy',owner:'Unassigned',residents:0,jobs:2,missions:['Enroll in training'],condition:85,activity:'Training and education',district:'Beauty House Quarter'},
 {id:'boutique',name:'Fashion Boutique',owner:'Unassigned',residents:0,jobs:2,missions:['Stock the shelves'],condition:86,activity:'Retail',district:'Beauty House Quarter'},
 {id:'cafe',name:'Riverwalk Café',owner:'Unassigned',residents:0,jobs:3,missions:['Serve customers'],condition:88,activity:'Food service',district:'Riverwalk Promenade'},
 {id:'photo-studio',name:'Holo Photo Studio',owner:'Unassigned',residents:0,jobs:2,missions:['Create a Holo Reel'],condition:82,activity:'Photography',district:'Holo Entertainment Pier'},
 {id:'restaurant',name:'Tampa Restaurant',owner:'Unassigned',residents:0,jobs:4,missions:['Restaurant delivery'],condition:84,activity:'Dining',district:'Holo Entertainment Pier'},
 {id:'music-venue',name:'Music Venue',owner:'Unassigned',residents:0,jobs:3,missions:['Perform on stage'],condition:83,activity:'Entertainment',district:'Holo Entertainment Pier'},
 {id:'home-001',name:'Residence 001',owner:'Unassigned',residents:0,jobs:0,missions:['Rent a starter room'],condition:90,activity:'Housing',district:'Residential Village'}
] as const
type BuildingId=typeof TAMPA_BUILDINGS[number]['id']
const WEBSITE_PRICE_USD=450
export function StreetVerseTampaWorldBuilderInspector(){
 const [selected,setSelected]=useState<BuildingId>('salon')
 const [open,setOpen]=useState(false)
 const [message,setMessage]=useState('Select a building in the 3D world or choose one here.')
 useEffect(()=>{
  const inspect=(event:Event)=>{
   const id=(event as CustomEvent<{id?:string}>).detail?.id
   if(TAMPA_BUILDINGS.some(b=>b.id===id)){setSelected(id as BuildingId);setOpen(true)}
  }
  window.addEventListener(TAMPA_INSPECT_EVENT,inspect)
  return()=>window.removeEventListener(TAMPA_INSPECT_EVENT,inspect)
 },[])
 const building=TAMPA_BUILDINGS.find(b=>b.id===selected)!
 const requestWebsite=()=>{
  window.dispatchEvent(new CustomEvent('tryamm:website-package-interest',{detail:{package:'Starter Website',priceUSD:WEBSITE_PRICE_USD,source:'tampa-world-builder-inspector',buildingId:selected}}))
  setMessage('Starter website interest prepared. No payment, license, or purchase was processed. A real checkout and fulfillment workflow must be connected.')
 }
 const style={minHeight:48,width:'100%',borderRadius:9,fontWeight:800,fontSize:14,padding:8} as const
 return <section aria-label="Tampa World Builder Inspector" style={{position:'absolute',right:12,top:80,zIndex:38,width:'min(285px,60vw)',padding:10,background:'rgba(19,26,43,.96)',color:'white',border:'1px solid #f1c4d9',borderRadius:12}}>
  <button type="button" style={style} onClick={()=>setOpen(v=>!v)}>{open?'CLOSE':'OPEN'} WORLD BUILDER INSPECTOR</button>
  {open&&<>
   <label htmlFor="tampa-inspector-building" style={{display:'block',marginTop:8,fontSize:13}}>Inspect building</label>
   <select id="tampa-inspector-building" value={selected} onChange={e=>setSelected(e.target.value as BuildingId)} style={{...style,fontWeight:400}}>
    {TAMPA_BUILDINGS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
   </select>
   <div style={{fontSize:13,lineHeight:1.65,margin:'8px 0'}}>
    <strong>{building.name}</strong>
    <div>District: {building.district}</div>
    <div>Owner: {building.owner}</div>
    <div>Residents: {building.residents} · Jobs: {building.jobs}</div>
    <div>Maintenance: {building.condition}/100 (prototype)</div>
    <div>Economy: {building.activity}</div>
    <div>Missions: {building.missions.join(', ')}</div>
   </div>
   <button type="button" style={style} onClick={requestWebsite}>REQUEST $450 STARTER WEBSITE</button>
   <p style={{fontSize:12,margin:'8px 0'}}>A website can support a real business operating alongside its fictional StreetVerse storefront. Website setup is not a government business license. LaTeasia may earn commissions only through an approved, disclosed sales arrangement and actual completed sales.</p>
   <div role="status" aria-live="polite" style={{fontSize:12}}>{message}</div>
  </>}
 </section>
}
