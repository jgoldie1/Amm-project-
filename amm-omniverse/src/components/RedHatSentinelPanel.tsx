import {useEffect,useState} from 'react'
import {getRedHatSummary,type RedHatSummary} from '../services/redHatSentinel'

const box:React.CSSProperties={border:'1px solid #ff465d55',background:'#15070b',borderRadius:14,padding:14}
const pill:React.CSSProperties={display:'inline-block',padding:'5px 8px',borderRadius:999,border:'1px solid #ff465d44',fontSize:10,margin:'3px 4px 0 0'}

export default function RedHatSentinelPanel(){
  const [summary,setSummary]=useState<RedHatSummary|null>(null)
  const [message,setMessage]=useState('Loading defensive telemetry…')

  useEffect(()=>{
    let active=true
    getRedHatSummary().then(result=>{
      if(!active)return
      setSummary(result)
      setMessage('')
    }).catch(error=>{
      if(active)setMessage(error instanceof Error?error.message:'Could not load Red Hat Sentinel.')
    })
    return()=>{active=false}
  },[])

  return <article style={box}>
    <div style={{fontSize:10,letterSpacing:2.2,color:'#ff667a',fontWeight:950}}>RED HAT SENTINEL • DEFENSIVE ONLY</div>
    <h3 style={{margin:'7px 0'}}>Suspicious / bad-actor probe tracker</h3>
    <p style={{fontSize:11,lineHeight:1.55,color:'#cbb8bd'}}>Canary routes and suspicious request patterns are correlated with privacy-minimized fingerprints. A signal is an indicator, not proof that a person is malicious. Raw IP addresses, passwords, tokens, cookies and raw exploit payloads are not shown or retained by this dashboard.</p>
    {message&&<div role="status" style={{fontSize:11,color:'#e7b8bf'}}>{message}</div>}
    {summary&&<>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginTop:10}}>
        <div style={box}><b>{summary.events}</b><div style={{fontSize:9,opacity:.68}}>24H EVENTS</div></div>
        <div style={box}><b>{summary.highRisk}</b><div style={{fontSize:9,opacity:.68}}>HIGH RISK</div></div>
        <div style={box}><b>{summary.canaryContacts}</b><div style={{fontSize:9,opacity:.68}}>CANARY HITS</div></div>
      </div>
      <div style={{marginTop:10}}>
        <b style={{fontSize:11}}>Signals</b>
        <div>{Object.entries(summary.signals).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,count])=><span key={name} style={pill}>{name}: {count}</span>)}</div>
      </div>
      <div style={{marginTop:10}}>
        <b style={{fontSize:11}}>Scanner classes</b>
        <div>{Object.entries(summary.userAgentClasses).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count])=><span key={name} style={pill}>{name}: {count}</span>)}</div>
      </div>
      <div style={{fontSize:9,opacity:.58,marginTop:10}}>{summary.note}</div>
    </>}
  </article>
}