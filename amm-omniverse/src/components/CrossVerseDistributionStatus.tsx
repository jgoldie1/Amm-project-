import {useEffect,useState} from 'react'

type Destination={id:string;label:string;configured:boolean;verified:boolean;state:string}
type Status={mode:string;acceptingIngest:boolean;activeRelay:boolean;automatedPublishing:boolean;destinations:Destination[]}
const safeDestination=(d:Destination)=>d.verified?'Verified':d.configured?'Configured only — not tested':'Not configured'

export default function CrossVerseDistributionStatus(){
  const [data,setData]=useState<Status|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  async function refresh(){
    setBusy(true);setError('')
    try{
      const response=await fetch('/api/live/crossverse-distribution-status',{cache:'no-store'})
      if(!response.ok)throw new Error('Distribution status unavailable')
      const result=await response.json()
      if(!Array.isArray(result.destinations))throw new Error('Invalid server response')
      setData(result)
    }catch(e){setError(e instanceof Error?e.message:'Status unavailable');setData(null)}
    finally{setBusy(false)}
  }
  useEffect(()=>{void refresh()},[])
  const btn:React.CSSProperties={minHeight:48,borderRadius:12,border:'1px solid #58b6d1',background:'#17475a',color:'#fff',padding:'10px 16px',fontWeight:800}
  return <section aria-label="OBS CrossVerse multistream readiness" style={{marginTop:14,padding:16,border:'1px solid #244156',borderRadius:18,background:'#07111bd9'}}>
    <h2 style={{margin:'0 0 8px'}}>OBS + CROSSVERSE MULTISTREAM</h2>
    <p style={{fontSize:13,color:'#b2c5d0'}}>OBS/Aitum can provide independent horizontal and vertical streams on supported desktop systems. This panel only reports server-side configuration. It does not accept streams, connect external destinations, or publish video.</p>
    <button type="button" style={btn} disabled={busy} onClick={()=>void refresh()}>{busy?'CHECKING…':'CHECK STREAM DESTINATIONS'}</button>
    {error&&<p role="alert">{error}</p>}
    {data&&<div aria-live="polite" style={{marginTop:12}}>
      <p style={{color:'#f0c68a',fontWeight:800}}>Ingest {data.acceptingIngest?'configured':'not active'} · Relay {data.activeRelay?'active':'not active'} · Auto-publishing {data.automatedPublishing?'enabled':'disabled'}</p>
      <div style={{display:'grid',gap:8}}>{data.destinations.map(item=><div key={item.id} style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:10,border:'1px solid #294151',borderRadius:10,padding:10}}>
        <strong>{item.label}</strong><span>{safeDestination(item)}</span>
      </div>)}</div>
    </div>}
    <p style={{fontSize:12,color:'#a9bccc'}}>Recommended: keep streaming keys in approved server-side or OBS settings, enable platform permissions individually, and verify a private test broadcast for every destination before public multistreaming.</p>
  </section>
}
