import {useEffect,useState} from 'react'
import {evaluateCafeSenseLiveStatus,cafeFoodSenseExample,type CafeSenseLiveReport} from '../runtime/AICafeSenseLiveStatusRuntime'

function detect(){return {hasCanvas:typeof HTMLCanvasElement!=='undefined',hasAudio:typeof AudioContext!=='undefined'||'webkitAudioContext'in window,hasVibration:typeof navigator.vibrate==='function'}}
export default function AICafeSenseLivePanel(){
 const [report,setReport]=useState<CafeSenseLiveReport>(()=>evaluateCafeSenseLiveStatus({hasCanvas:false,hasAudio:false,hasVibration:false}))
 const [notice,setNotice]=useState('')
 const refresh=async()=>{
  const device=detect()
  setReport(evaluateCafeSenseLiveStatus(device))
  const controller=new AbortController()
  const deadline=window.setTimeout(()=>controller.abort(),6500)
  try{
   const response=await fetch('/api/live/status',{cache:'no-store',signal:controller.signal})
   if(!response.ok)throw Error('LIVE endpoint HTTP '+response.status)
   const data=await response.json()
   setReport(evaluateCafeSenseLiveStatus({...device,liveStatus:data}))
   setNotice(data?.configured===true?'LiveKit server configuration reported. A real two-device stream is still required.':'LiveKit provider credentials are not configured in this deployment.')
  }catch{
   setReport(evaluateCafeSenseLiveStatus({...device,requestFailed:true}))
   setNotice('Could not verify LIVE configuration; no broadcasting connection is claimed.')
  }finally{clearTimeout(deadline)}
 }
 useEffect(()=>{void refresh()},[])
 const food=cafeFoodSenseExample()
 const button:React.CSSProperties={minHeight:46,padding:'9px 14px',background:'#17343d',border:'1px solid #6ed6e1',borderRadius:9,color:'#fff',fontSize:13,fontWeight:850}
 return <section aria-label="AI Cafe 5 senses and creator livestream verification" style={{padding:14,borderRadius:14,background:'#0c1d28',color:'#e1f8ff',marginTop:14,border:'1px solid #63b1b655',fontFamily:'system-ui',lineHeight:1.5}}>
  <h3 style={{margin:'0 0 5px'}}>5-Senses AGI + StreetVerse LIVE Lab</h3>
  <p style={{fontSize:12,margin:'0 0 10px'}}>A hands-on capability checker. Source code and linked social accounts are not proof that live broadcasting is running.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:8}}>
   {([['Sight',report.fiveSenses.visual],['Hearing',report.fiveSenses.audio],['Touch / haptics',report.fiveSenses.haptic],['Smell descriptions',report.fiveSenses.smell],['Taste descriptions',report.fiveSenses.taste]] as const).map(([name,value])=><div key={name} style={{background:'#142e37',borderRadius:9,padding:10,fontSize:12}}><strong>{name}</strong><div style={{color:value==='device-supported'?'#96ead0':'#f1d394',marginTop:3}}>{value.replaceAll('-',' ')}</div></div>)}
  </div>
  <p style={{fontSize:12,color:'#b5d7db'}}>Example: {food.label} — aroma: {food.smellCue}; flavor: {food.tasteCue}. Descriptive software only; no physical scent or flavor is generated.</p>
  <strong>Streaming readiness</strong>
  <div style={{display:'grid',gap:7,margin:'8px 0'}}>
    <div style={{fontSize:12}}>LiveKit: <b>{report.livekit.status.toUpperCase()}</b> · two-device stream: <b>NOT VERIFIED</b></div>
    {report.destinations.map(destination=><div key={destination.platform} style={{fontSize:12,padding:'8px 10px',border:'1px solid #3b5b68',borderRadius:9,background:'#0d252e'}}>{destination.label}: <b>{destination.verifiedBroadcast?'LIVE VERIFIED':destination.connected?'PROVIDER CONFIGURED — NO LIVE PROOF':'LIVE CONNECTION NOT VERIFIED'}</b></div>)}
  </div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button style={button} onClick={()=>void refresh()}>CHECK LIVE CONNECTIONS</button>
    <button style={button} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt:'JARVIS Deluxe, walk me through a safe five-sense StreetVerse Café scene, with captions and a separate LiveKit/TikTok/BIGO two-device broadcast verification checklist. Distinguish simulated experiences from actual device and provider connections.'}}))}>ASK JARVIS ABOUT LIVE</button>
  </div>
  {notice&&<p role="status" style={{fontSize:12,color:'#ffe4a6'}}>{notice}</p>}
  <p style={{fontSize:11,color:'#91b1b9'}}>TikTok posting access can exist without TikTok LIVE ingest privileges. BIGO streaming must be proven separately. No automatic gift transfers, payments, or external broadcast start.</p>
 </section>
}
