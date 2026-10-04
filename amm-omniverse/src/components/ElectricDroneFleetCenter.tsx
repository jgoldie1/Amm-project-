import {useState} from 'react'
import {ELECTRIC_FLEET_FLOW} from '../logistics/electricFleetNetwork'
import {DRONE_SWARM_FLOW} from '../logistics/droneSwarmNetwork'

export default function ElectricDroneFleetCenter(){
 const [tab,setTab]=useState<'ev'|'drone'>('ev')
 const [status,setStatus]=useState('Electric fleet + drone network ready for planning. Real charging/provider/flight actions remain externally verified.')
 return <section style={panel}>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button style={button} onClick={()=>setTab('ev')}>ELECTRIC TRUCKS</button><button style={button} onClick={()=>setTab('drone')}>DELIVERY DRONES + SWARMS</button></div>
  {tab==='ev'&&<div style={{marginTop:12}}><h2>Electric Transportation Fleet</h2><p style={copy}>Electric delivery vans, box trucks, straight trucks, tractors, yard tractors, shuttles and buses can share charging, route-energy, maintenance and dispatch logic.</p><div style={{display:'grid',gap:6}}>{ELECTRIC_FLEET_FLOW.map((x,i)=><div key={x} style={step}><b>{String(i+1).padStart(2,'0')}</b> • {x}</div>)}</div></div>}
  {tab==='drone'&&<div style={{marginTop:12}}><h2>Delivery Drones + Swarm Operations</h2><p style={copy}>One mission planner can coordinate package delivery, medical delivery, warehouse scans, mapping, inspection, media and emergency-support swarms. Real flights require an approved provider, weather/airspace checks and human oversight.</p><div style={{display:'grid',gap:6}}>{DRONE_SWARM_FLOW.map((x,i)=><div key={x} style={step}><b>{String(i+1).padStart(2,'0')}</b> • {x}</div>)}</div><button style={button} onClick={()=>{window.__TRYAMM_EV_DRONE_NETWORK__?.publishSwarmPlan({id:'swarm-'+Date.now(),missionIds:[],droneIds:[],mode:'warehouse-scan',state:'draft',maxSimultaneous:4,humanSupervisorRequired:true,providerConfirmed:false});setStatus('Draft warehouse-scan swarm created. No real drones were dispatched.')}}>CREATE SAFE DEMO SWARM PLAN</button></div>}
  <div role="status" style={{marginTop:10,fontSize:11,color:'#a9c1cf'}}>{status}</div>
 </section>
}
const panel:React.CSSProperties={marginTop:12,background:'#07111ddd',border:'1px solid #20394b',borderRadius:16,padding:14}
const copy:React.CSSProperties={fontSize:11,color:'#9fb4c4',lineHeight:1.6}
const button:React.CSSProperties={minHeight:44,border:'1px solid #4fe3ff77',borderRadius:10,background:'#0b2633',color:'#fff',fontWeight:900,padding:'0 12px'}
const step:React.CSSProperties={padding:8,border:'1px solid #183448',borderRadius:9,background:'#050d16',fontSize:11,color:'#c7d8e2'}