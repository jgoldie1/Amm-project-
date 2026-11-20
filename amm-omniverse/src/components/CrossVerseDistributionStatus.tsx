import {useEffect,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

type Destination={id:string;label:string;configured:boolean;verified:boolean;state:string}
type Status={mode:string;acceptingIngest:boolean;activeRelay:boolean;automatedPublishing:boolean;destinations:Destination[]}
type IngestStatus={enabled:boolean;configured:boolean;readyForOwnerSetup:boolean}
type IngestCredentials={obsServer:string;obsStreamKey:string;roomName:string}
const safeDestination=(d:Destination)=>d.verified?'Verified':d.configured?'Configured only — not tested':'Not configured'

export default function CrossVerseDistributionStatus(){
  const [data,setData]=useState<Status|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const [ingest,setIngest]=useState<IngestStatus|null>(null)
  const [format,setFormat]=useState<'vertical'|'landscape'>('vertical')
  const [consent,setConsent]=useState(false)
  const [credentials,setCredentials]=useState<IngestCredentials|null>(null)
  async function refresh(){
    setBusy(true);setError('')
    try{
      const response=await fetch('/api/live/crossverse-distribution-status',{cache:'no-store'})
      if(!response.ok)throw new Error('Distribution status unavailable')
      const result=await response.json()
      if(!Array.isArray(result.destinations))throw new Error('Invalid server response')
      setData(result)
      const check=await fetch('/api/live/obs-ingress',{cache:'no-store'})
      if(check.ok)setIngest(await check.json())
    }catch(e){setError(e instanceof Error?e.message:'Status unavailable');setData(null)}
    finally{setBusy(false)}
  }

  async function createIngest(){
    if(!ingest?.readyForOwnerSetup||!consent||busy)return
    setBusy(true);setError('');setCredentials(null)
    try{
      const token=await getAccessToken()
      if(!token)throw new Error('Sign in to TRYAMM first')
      const response=await fetch('/api/live/obs-ingress',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
        body:JSON.stringify({format,confirm:'CREATE_PRIVATE_INGEST'})
      })
      const result=await response.json()
      if(!response.ok)throw new Error(String(result.error||'OBS setup failed'))
      if(!result.obsServer||!result.obsStreamKey)throw new Error('OBS credentials not returned')
      setCredentials({obsServer:result.obsServer,obsStreamKey:result.obsStreamKey,roomName:result.roomName})
      setConsent(false)
    }catch(e){setError(e instanceof Error?e.message:'OBS setup failed')}
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
    <div style={{marginTop:14,padding:12,border:'1px solid #355d65',borderRadius:12}}>
      <strong>AUTHORIZED OBS → CROSSVERSE INPUT</strong>
      <p style={{fontSize:12,color:'#bdd0db'}}>LiveKit RTMP input is a private owner action and can incur charges. No public broadcast or external multistream starts here.</p>
      <p style={{fontSize:12}}>{ingest?.readyForOwnerSetup?'Provider configured for private input setup':'Input provisioning disabled until LiveKit and TRYAMM_OBS_INGRESS_ENABLED are configured'}</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button type="button" aria-pressed={format==='vertical'} disabled={busy} style={btn} onClick={()=>setFormat('vertical')}>9:16 input</button>
        <button type="button" aria-pressed={format==='landscape'} disabled={busy} style={btn} onClick={()=>setFormat('landscape')}>16:9 input</button>
      </div>
      <label style={{display:'flex',alignItems:'start',gap:8,fontSize:12,margin:'12px 0'}}>
        <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} disabled={busy||!ingest?.readyForOwnerSetup}/>
        I authorize one private OBS input and understand provider charges may apply.
      </label>
      <button type="button" disabled={!consent||!ingest?.readyForOwnerSetup||busy} style={btn} onClick={()=>void createIngest()}>CREATE PRIVATE OBS INPUT</button>
      {credentials&&<div style={{padding:12,marginTop:12,background:'#10292a',borderRadius:12}}>
        <strong>Private OBS source details — do not share screenshots</strong>
        <p style={{overflowWrap:'anywhere',fontSize:12}}>Server: {credentials.obsServer}</p>
        <p style={{fontSize:12}}>Stream key: <input type="password" readOnly value={credentials.obsStreamKey} autoComplete="off" aria-label="Private OBS source key" style={{maxWidth:'100%',padding:8}}/></p>
        <button type="button" style={btn} onClick={()=>void navigator.clipboard.writeText(credentials.obsStreamKey)}>COPY SOURCE KEY</button>
        <button type="button" style={{...btn,marginLeft:8}} onClick={()=>setCredentials(null)}>HIDE KEY</button>
        <p style={{fontSize:12}}>Live room ID: <code>{credentials.roomName}</code></p>
        <button type="button" style={btn} onClick={()=>void navigator.clipboard.writeText(credentials.roomName)}>COPY LIVE ROOM ID</button>
        <p style={{fontSize:12}}>In OBS Settings → Stream → Custom, enter the server and source key privately. Then open the existing TRYAMM LIVE Center as a viewer and paste this room ID to inspect your OBS feed. No automatic multistream or publishing occurs.</p>
      </div>}
    </div>
    <p style={{fontSize:12,color:'#a9bccc'}}>Keep external destination keys in approved server-side or OBS settings. Verify a private broadcast on every platform before public multistreaming.</p>
  </section>
}
