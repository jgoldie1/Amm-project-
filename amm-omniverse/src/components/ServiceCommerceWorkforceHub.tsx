import {useState} from 'react'
import {HOLO_COMMERCE_SURFACES,RIDE_DELIVERY_CONTRACT,SERVICE_COMMERCE_WORKFORCE_OS,SERVICE_GROWTH_LOOP,WORKFORCE_TAX_TRUTH} from '../services/ServiceCommerceWorkforceOS'
const cyan='#4FE3FF',gold='#E8B944'
const roles=['rider','driver','food-delivery-courier','restaurant-owner','marketplace-vendor','advertiser','ministry-worker','employee','student','educator','agency-member','dealer','franchise-operator']
export default function ServiceCommerceWorkforceHub(){
 const [open,setOpen]=useState(false),[role,setRole]=useState('rider')
 return <><button onClick={()=>setOpen(true)} style={launcher}>🧭 SERVICES • WORK • COMMERCE</button>{open&&<div role="dialog" aria-label="TRYAMM Services Work Commerce" style={overlay}><div style={wrap}>
 <header style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{color:cyan,fontWeight:900,letterSpacing:2,fontSize:11}}>ONE TRYAMM ID • MANY VERIFIED ROLES</div><h1>Services + Work + Commerce</h1><p style={muted}>{SERVICE_COMMERCE_WORKFORCE_OS.identityRule}</p></div><button onClick={()=>setOpen(false)} style={close}>×</button></header>
 <section style={panel}><h2>Start / add a role</h2><select value={role} onChange={e=>setRole(e.target.value)} style={input}>{roles.map(r=><option key={r}>{r}</option>)}</select><div style={flow}>{SERVICE_COMMERCE_WORKFORCE_OS.commonSteps.join(' → ')}</div><button style={primary}>START {role.toUpperCase()} ONBOARDING</button><p style={muted}>Activation remains blocked until the role-specific verification/provider/regulatory gates are actually satisfied.</p></section>
 <section style={panel}><h2>Ride + Food Delivery</h2><p style={muted}>{RIDE_DELIVERY_CONTRACT.ride}</p><p style={muted}>{RIDE_DELIVERY_CONTRACT.food}</p><small>{RIDE_DELIVERY_CONTRACT.hardRules.join(' • ')}</small></section>
 <section style={panel}><h2>Holo Commerce</h2><div style={grid}>{Object.values(HOLO_COMMERCE_SURFACES).map(x=><article key={x.name} style={card}><b style={{color:gold}}>{x.name}</b><p style={muted}>{x.capabilities.join(' • ')}</p></article>)}</div></section>
 <section style={panel}><h2>Ministry + Employees + Education</h2><div style={grid}><article style={card}><b>Ministry onboarding</b><p style={muted}>Organization relationship → role authorization → worker classification → service terms → payroll/tax setup where applicable.</p></article><article style={card}><b>Employee onboarding</b><p style={muted}>Employer relationship → employment/tax forms through authorized workflow → payroll profile → direct-deposit/provider setup → policy acknowledgments.</p></article><article style={card}><b>Education onboarding</b><p style={muted}>Learning Passport → accessibility → program/course → Student AI → evidence → credential eligibility → opportunity.</p></article></div></section>
 <section style={panel}><h2>Payroll + Tax Readiness</h2><p style={{...muted,color:'#7dffb0'}}>The app can: {WORKFORCE_TAX_TRUTH.canDoNow.join(' • ')}</p><p style={{...muted,color:'#ffcf66'}}>Not live until authorized provider/credentials: {WORKFORCE_TAX_TRUTH.notLiveWithoutProvider.join(' • ')}</p><p style={muted}>Production gates: {WORKFORCE_TAX_TRUTH.productionGates.join(' • ')}</p></section>
 <section style={panel}><h2>Conversion Loop</h2><p style={flow}>{SERVICE_GROWTH_LOOP}</p></section>
 </div></div>}</>
}
const launcher={position:'fixed',right:14,bottom:182,zIndex:11850,border:'1px solid #315879',background:'#07111c',color:'#fff',borderRadius:999,padding:'11px 14px',fontWeight:900} as const
const overlay={position:'fixed',inset:0,zIndex:12500,overflowY:'auto',background:'rgba(1,4,9,.97)',color:'#fff',padding:18} as const
const wrap={maxWidth:1100,margin:'0 auto'} as const
const panel={border:'1px solid #263e55',borderRadius:18,padding:16,margin:'14px 0',background:'#08111b'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10} as const
const card={border:'1px solid #293c50',borderRadius:14,padding:13,background:'#0b1622'} as const
const muted={color:'#a9b7c8',lineHeight:1.55} as const
const flow={color:cyan,lineHeight:1.65,fontWeight:800,margin:'12px 0'} as const
const input={padding:12,borderRadius:10,background:'#0c1825',color:'#fff',border:'1px solid #39536c',minWidth:280} as const
const primary={padding:'12px 16px',borderRadius:12,border:0,background:gold,color:'#111',fontWeight:900} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #4a5e73',background:'#0b1320',color:'#fff',fontSize:22} as const
