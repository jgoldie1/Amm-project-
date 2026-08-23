import { useMemo, useState } from 'react'
import { marketAllows, recommendConnectivity, safeFailoverPolicy, type ConnectivityNeed } from '../services/connectivityOrchestrator'
import type { Market, Provider } from '../services/tryammConnect'

export default function ConnectivityOptimizerPanel({providers,markets}:{providers:Provider[];markets:Market[]}){
 const [marketCode,setMarketCode]=useState(markets[0]?.market_code??'US')
 const [need,setNeed]=useState<ConnectivityNeed>('data')
 const market=markets.find(x=>x.market_code===marketCode)
 const recommendations=useMemo(()=>recommendConnectivity(providers,market,need),[providers,market,need])
 const policy=safeFailoverPolicy(need)
 const box:React.CSSProperties={background:'#07131d',border:'1px solid #21415a',borderRadius:14,padding:13}
 const select:React.CSSProperties={padding:9,borderRadius:8,background:'#04101a',color:'#fff',border:'1px solid #294a58'}
 return <section style={{...box,marginTop:14}} aria-label="Quantum Network optimizer">
  <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><div><h3 style={{margin:'0 0 4px'}}>Quantum Network Optimizer</h3><div style={{fontSize:10,color:'#8fa6b4'}}>Ranks only known provider candidates; it never provisions a carrier or changes a regulated service by itself.</div></div><span style={{fontSize:9,color:policy.automatic?'#78ffb4':'#e8b944'}}>{policy.automatic?'LOW-RISK AUTO-FAILOVER':'APPROVAL GATED'}</span></div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}><select value={marketCode} onChange={e=>setMarketCode(e.target.value)} style={select}>{markets.map(m=><option key={m.market_code} value={m.market_code}>{m.market_name}</option>)}</select><select value={need} onChange={e=>setNeed(e.target.value as ConnectivityNeed)} style={select}>{['voice','data','esim','wifi','fixed-wireless','satellite'].map(x=><option key={x}>{x}</option>)}</select></div>
  <div style={{fontSize:10,color:marketAllows(market,need)?'#78ffb4':'#ffcf73',marginTop:10}}>Market gate: {marketAllows(market,need)?'eligible in readiness registry':'not yet approved/available'}</div>
  <div style={{fontSize:10,color:'#9eb0bb',marginTop:6}}>{policy.guardrail}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8,marginTop:10}}>{recommendations.slice(0,4).map(r=><div key={r.provider.provider_key} style={{border:'1px solid #183041',borderRadius:10,padding:10,background:'#041019'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>{r.provider.name}</b><span style={{color:'#4fe3ff',fontSize:9}}>score {r.score}</span></div><div style={{fontSize:9,color:'#8fa6b4',marginTop:5}}>{r.reasons.join(' • ')||'No verified capability evidence yet'}</div><div style={{fontSize:9,color:r.automatic?'#78ffb4':'#e8b944',marginTop:6}}>{r.automatic?'automatic low-risk path allowed':'provider/approval gate remains'}</div></div>)}</div>
 </section>
}
