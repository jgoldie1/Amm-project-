import {useMemo,useState} from 'react'
import {buildQuantumSeoPlan,QUANTUM_SEO_VALUE} from '../services/quantumSeo'
import {BACK_CHANNEL_FLOW,BACK_CHANNEL_VALUE} from '../services/backChannel'

export default function QuantumGrowthCenter(){
 const [businessId,setBusinessId]=useState('demo-business')
 const [domain,setDomain]=useState('')
 const plan=useMemo(()=>buildQuantumSeoPlan({businessId,domain,hasAnalytics:true,hasBusinessProfile:true,hasProducts:true,hasVideo:true,multilingual:true}),[businessId,domain])
 return <section style={panel}><h2>Quantum SEO + Back Channel</h2><p style={copy}>{QUANTUM_SEO_VALUE}</p>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><input value={businessId} onChange={e=>setBusinessId(e.target.value)} placeholder='Business ID' style={input}/><input value={domain} onChange={e=>setDomain(e.target.value)} placeholder='business.com' style={input}/></div>
  <div style={{marginTop:10,fontWeight:950}}>Quantum SEO readiness: {plan.score}%</div><div style={{display:'grid',gap:6,marginTop:8}}>{plan.tasks.map(t=><div key={t.id} style={step}><b>{t.status.toUpperCase()}</b> • {t.title}</div>)}</div>
  <h3 style={{marginTop:16}}>Back Channel</h3><p style={copy}>{BACK_CHANNEL_VALUE}</p><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{BACK_CHANNEL_FLOW.map((x,i)=><span key={x} style={chip}>{i+1}. {x}</span>)}</div>
 </section>
}
const panel:React.CSSProperties={marginTop:12,background:'#07111ddd',border:'1px solid #20394b',borderRadius:16,padding:14}
const copy:React.CSSProperties={fontSize:11,color:'#a9bdca',lineHeight:1.6}
const input:React.CSSProperties={background:'#091722',border:'1px solid #29485c',borderRadius:9,padding:10,color:'#fff'}
const step:React.CSSProperties={padding:8,border:'1px solid #183448',borderRadius:9,background:'#050d16',fontSize:10,color:'#c7d8e2'}
const chip:React.CSSProperties={padding:'5px 7px',borderRadius:999,border:'1px solid #315267',background:'#0a1924',fontSize:9,color:'#d7edf7'}