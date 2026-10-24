import {useEffect,useState} from 'react'
import {getLivePanel,sendLivePanelAction,type LivePanelSnapshot,type LiveRole} from '../services/live'
type Props={roomName:string;role:LiveRole;connected:boolean;youthViewerOnly:boolean;onJoinApproved:()=>void}
const button:React.CSSProperties={minHeight:44,padding:'9px 12px',borderRadius:12,border:'1px solid #70e2df88',background:'#133247',color:'#fff',fontWeight:800,cursor:'pointer'}
export default function LivePanelControls({roomName,role,connected,youthViewerOnly,onJoinApproved}:Props){
 const [panel,setPanel]=useState<LivePanelSnapshot|null>(null)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function refresh(){
  try{setPanel(await getLivePanel(roomName));setError('')}
  catch(e){setError((e as Error).message||'Guest stage unavailable')}
 }
 useEffect(()=>{
  if(!connected||youthViewerOnly)return
  let active=true
  const read=async()=>{try{const p=await getLivePanel(roomName);if(active)setPanel(p)}catch(e){if(active)setError((e as Error).message||'Panel unavailable')}}
  void read()
  const interval=window.setInterval(()=>void read(),15000)
  return()=>{active=false;window.clearInterval(interval)}
 },[roomName,connected,youthViewerOnly])
 async function action(kind:'request_panel'|'approve'|'reject'|'remove',requestId?:string){
  setBusy(true)
  try{await sendLivePanelAction(roomName,kind,requestId);await refresh()}
  catch(e){setError((e as Error).message||'Guest request not completed')}
  finally{setBusy(false)}
 }
 if(!connected)return null
 const requests=panel?.requests||[],waiting=requests.filter(x=>x.status==='waiting'),stage=requests.filter(x=>x.status==='on_stage')
 const mine=stage[0]||requests[0]
 return <section aria-label="LIVE multi-guest panel" style={{marginTop:12,padding:12,border:'1px solid #50d6fb66',borderRadius:15,background:'#08182d',color:'#fff'}}>
  <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:8}}>
   <strong>🎙️ LIVE GUEST STAGE</strong><button type="button" style={button} disabled={busy} onClick={()=>void refresh()}>REFRESH</button>
  </div>
  <p style={{fontSize:11,opacity:.78}}>Camera access requires verified host approval. No purchases or PK earnings occur here.</p>
  {youthViewerOnly?<p>Youth viewer camera publishing remains disabled.</p>:
  role==='host'?<div style={{display:'grid',gap:8}}>
   <small>Waiting: {waiting.length} · On stage: {stage.length} · Maximum: {panel?.room?.max_panelists??'—'} including host</small>
   {waiting.length===0&&<small>No pending guests. Share the viewer link so someone can request stage.</small>}
   {waiting.map(req=><div key={req.id} style={{padding:8,border:'1px solid #51789177',borderRadius:12}}>
     <strong>{req.display_name||'Guest'}</strong>
     {req.guardian_approval_required&&!req.guardian_approved_at&&<p style={{fontSize:11}}>Guardian approval still needed.</p>}
     <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:7}}>
      <button type="button" style={button} disabled={busy||Boolean(req.guardian_approval_required&&!req.guardian_approved_at)} onClick={()=>void action('approve',req.id)}>APPROVE STAGE</button>
      <button type="button" style={button} disabled={busy} onClick={()=>void action('reject',req.id)}>REJECT</button>
     </div>
   </div>)}
   {stage.map(req=><div key={req.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
    <span>{req.display_name||'Guest'} · Seat {req.stage_position||'—'}</span>
    <button type="button" style={button} disabled={busy} onClick={()=>void action('remove',req.id)}>REMOVE GUEST</button>
   </div>)}
  </div>:role==='guest'?<p style={{fontSize:12,color:'#9bf1c7'}}>Host-approved guest camera is publishing. The host may revoke this access.</p>:
  <div style={{display:'grid',gap:7}}>
   {!mine&&<button type="button" style={button} disabled={busy} onClick={()=>void action('request_panel')}>REQUEST TO JOIN THE STAGE</button>}
   {mine?.status==='waiting'&&<p style={{fontSize:12}}>Waiting for host approval. Tap REFRESH to check.</p>}
   {mine?.status==='on_stage'&&(!mine.guardian_approval_required||mine.guardian_approved_at)&&
     <button type="button" style={{...button,background:'#16523b'}} onClick={onJoinApproved}>✓ APPROVED — SWITCH TO GUEST CAMERA</button>}
   {mine?.status==='on_stage'&&mine.guardian_approval_required&&!mine.guardian_approved_at&&<p style={{fontSize:12}}>Guardian approval is required before camera access.</p>}
   {mine&&['rejected','removed'].includes(mine.status)&&<p style={{fontSize:12}}>Request {mine.status}. You can continue watching.</p>}
   <small>Switching to guest briefly leaves the viewer connection. Tap JOIN AS APPROVED GUEST to reconnect.</small>
  </div>}
  {error&&<p role="alert" style={{color:'#ffdda9',fontSize:12}}>{error}</p>}
 </section>
}