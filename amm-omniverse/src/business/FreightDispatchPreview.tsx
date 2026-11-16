import {useState, type FormEvent} from 'react'
import './FreightDispatchPreview.css'
const equipment=['Dry van','Reefer','Flatbed','Step deck','Lowboy','Dump truck','Box truck']
const statuses=['Available','Assigned','Picked up','Delivered'] as const
type Status=typeof statuses[number]
type Load={id:string;origin:string;destination:string;equipment:string;weight:number;rate:number;driver:string;status:Status}
const seed:Load[]=[
 {id:'DEMO-001',origin:'Chicago, IL',destination:'Indianapolis, IN',equipment:'Dry van',weight:22000,rate:650,driver:'',status:'Available'},
 {id:'DEMO-002',origin:'Gary, IN',destination:'Milwaukee, WI',equipment:'Flatbed',weight:30000,rate:800,driver:'',status:'Available'},
 {id:'DEMO-003',origin:'Joliet, IL',destination:'Peoria, IL',equipment:'Lowboy',weight:38000,rate:1100,driver:'',status:'Available'},
]
export default function FreightDispatchPreview(){
 const [loads,setLoads]=useState<Load[]>(()=>seed.map(x=>({...x})))
 const [filter,setFilter]=useState('All equipment'),[query,setQuery]=useState(''),[message,setMessage]=useState('')
 const update=(id:string,change:Partial<Load>)=>setLoads(rows=>rows.map(row=>row.id===id?{...row,...change}:row))
 function add(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const data=new FormData(form)
  const origin=String(data.get('origin')||'').trim(),destination=String(data.get('destination')||'').trim()
  if(!origin||!destination){setMessage('Enter both pickup and destination cities.');return}
  setLoads(rows=>[...rows,{id:'DEMO-'+crypto.randomUUID().slice(0,8),origin,destination,equipment:String(data.get('equipment')),weight:Number(data.get('weight')),rate:Number(data.get('rate')),driver:'',status:'Available'}]);form.reset();setMessage('Sample load added in this tab only. Clear filters if it is hidden.')
 }
 const visible=loads.filter(l=>(filter==='All equipment'||l.equipment===filter)&&`${l.origin} ${l.destination}`.toLowerCase().includes(query.toLowerCase()))
 return <section className="freight-workspace" id="load-board" aria-label="Sample load board and dispatcher">
  <p className="full-kicker">FREIGHT WORKSPACE · INTERACTIVE DEMO</p><h2>Load board & dispatcher</h2>
  <p>Try posting a load, assigning a sample driver and tracking delivery stages. All listings, prices and drivers are fictional. Changes stay in this tab and disappear on refresh. No shipment is booked, dispatched or paid.</p>
  <div className="freight-toolbar"><label>Search route<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="City or state"/></label><label>Equipment filter<select value={filter} onChange={e=>setFilter(e.target.value)}><option>All equipment</option>{equipment.map(x=><option key={x}>{x}</option>)}</select></label><span>{visible.length} of {loads.length} sample loads</span></div>
  <div className="freight-loads">{visible.map(l=><article key={l.id}><small>{l.id} · {l.status}</small><h3>{l.origin} → {l.destination}</h3><p>{l.equipment} · {l.weight.toLocaleString()} lb</p><strong>${l.rate.toLocaleString()} illustrative load rate</strong>
  <label>Sample driver for {l.id}<select value={l.driver} disabled={l.status==='Picked up'||l.status==='Delivered'} onChange={e=>{update(l.id,{driver:e.target.value,status:e.target.value?'Assigned':'Available'});setMessage(e.target.value?'Sample assignment saved in this tab.':'Sample assignment removed.')}}><option value="">Unassigned</option><option>Sample driver A</option><option>Sample driver B</option></select></label>
  <p>Dispatch stage: {l.status}</p>{l.status!=='Delivered'&&<button disabled={!l.driver} onClick={()=>{const next=statuses[statuses.indexOf(l.status)+1];if(next){update(l.id,{status:next});setMessage('Sample stage updated to '+next+'. No live dispatch sent.')}}}>{l.status==='Available'?'Assign a driver first':l.status==='Assigned'?'Mark sample picked up':'Mark sample delivered'}</button>}
  </article>)}</div>{!visible.length&&<p>No sample loads match. Try another route or equipment type.</p>}
  <details><summary>Add a sample load</summary><form onSubmit={add}><label>Pickup city<input name="origin" required maxLength={80}/></label><label>Destination city<input name="destination" required maxLength={80}/></label><label>Equipment<select name="equipment">{equipment.map(x=><option key={x}>{x}</option>)}</select></label><label>Weight (lb)<input name="weight" type="number" required min="1" max="200000" step="1"/></label><label>Illustrative rate (USD)<input name="rate" type="number" required min="1" max="100000" step="0.01"/></label><button>Add sample load</button></form></details>
  <p role="status" aria-live="polite">{message}</p><p><strong>Before live operations:</strong> connect an authorized load feed or shipper intake, verified carrier and driver records, equipment capacity checks, scheduling and driver availability, shared order storage, shipment documents and confirmed payment records. This demo does not verify any of those requirements.</p>
 </section>
}
