import { useMemo, useState } from 'react'
import {
  REPORT_REASON_LABELS,
  blockUser,
  muteUser,
  submitMisconductReport,
  type ModerationReason,
  type ModerationTarget,
} from '../services/moderation'

type Props={
  open:boolean
  onClose:()=>void
  targetType:ModerationTarget
  targetId:string
  targetLabel?:string
  reportedUserId?:string|null
  roomName?:string
  messageIds?:string[]
  mediaRefs?:string[]
  context?:Record<string,unknown>
  onBlocked?:()=>void
  onMuted?:()=>void
}

export default function SafetyActionSheet(props:Props){
  const [mode,setMode]=useState<'menu'|'report'>('menu')
  const [reason,setReason]=useState<ModerationReason>('harassment')
  const [details,setDetails]=useState('')
  const [busy,setBusy]=useState(false)
  const [notice,setNotice]=useState('')
  const reasons=useMemo(()=>Object.entries(REPORT_REASON_LABELS) as [ModerationReason,string][],[])
  if(!props.open)return null

  async function run(action:()=>Promise<unknown>,success:string){
    setBusy(true);setNotice('')
    try{await action();setNotice(success)}catch(error){setNotice(error instanceof Error?error.message:'Action failed')}finally{setBusy(false)}
  }

  async function report(){
    await run(()=>submitMisconductReport({
      targetType:props.targetType,targetId:props.targetId,reportedUserId:props.reportedUserId||null,
      reason,details,roomName:props.roomName,messageIds:props.messageIds,mediaRefs:props.mediaRefs,context:props.context,
    }),'Report submitted for review. Available context will be preserved with the case.')
  }

  const canRelationship=Boolean(props.reportedUserId)
  return <div role="dialog" aria-modal="true" aria-label="Safety actions" style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(0,0,0,.68)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
    <div style={{width:'min(680px,100%)',maxHeight:'88vh',overflowY:'auto',borderRadius:'22px 22px 0 0',background:'#070912',border:'1px solid rgba(79,227,255,.35)',padding:20,color:'#fff',boxShadow:'0 -16px 50px rgba(0,0,0,.5)'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
        <div><div style={{fontWeight:800,fontSize:20}}>Safety</div><div style={{opacity:.72,fontSize:13}}>{props.targetLabel||'Content or account'}</div></div>
        <button onClick={props.onClose} aria-label="Close safety actions" style={buttonStyle}>✕</button>
      </div>

      {mode==='menu'?<div style={{display:'grid',gap:10,marginTop:18}}>
        <button disabled={busy} onClick={()=>setMode('report')} style={dangerStyle}>⚑ Report / Flag Misconduct</button>
        {canRelationship&&<button disabled={busy} onClick={()=>void run(()=>blockUser(props.reportedUserId!,'user safety action').then(()=>props.onBlocked?.()),'User blocked. Their content and contact should be hidden where blocking is enforced.')} style={dangerStyle}>⛔ Block User</button>}
        {canRelationship&&<button disabled={busy} onClick={()=>void run(()=>muteUser(props.reportedUserId!,'user safety action').then(()=>props.onMuted?.()),'User muted. Their audio/content should be suppressed where muting is enforced.')} style={buttonStyle}>🔇 Mute User</button>}
        <div style={{fontSize:12,opacity:.7,lineHeight:1.5}}>Reporting is different from blocking or muting. Reports enter the moderation queue. Blocking/muting is your personal safety control.</div>
      </div>:<div style={{marginTop:18,display:'grid',gap:12}}>
        <label style={{fontWeight:700}}>Why are you reporting this?</label>
        <select value={reason} onChange={e=>setReason(e.target.value as ModerationReason)} style={fieldStyle}>
          {reasons.map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
        <label style={{fontWeight:700}}>What happened? <span style={{fontWeight:400,opacity:.65}}>(optional)</span></label>
        <textarea value={details} onChange={e=>setDetails(e.target.value.slice(0,4000))} rows={5} placeholder="Describe what happened. Don't include passwords or financial credentials." style={fieldStyle}/>
        <div style={{fontSize:12,opacity:.72,lineHeight:1.5}}>TRYAMM may preserve up to a 120-second context window where technically available. Serious safety cases are prioritized and significant enforcement should receive human review with an appeal path.</div>
        <div style={{display:'flex',gap:10}}>
          <button disabled={busy} onClick={()=>setMode('menu')} style={buttonStyle}>Back</button>
          <button disabled={busy} onClick={()=>void report()} style={dangerStyle}>{busy?'Submitting…':'Submit Report'}</button>
        </div>
      </div>}
      {notice&&<div role="status" style={{marginTop:14,padding:12,borderRadius:12,background:'rgba(79,227,255,.08)',border:'1px solid rgba(79,227,255,.28)',fontSize:13}}>{notice}</div>}
    </div>
  </div>
}

const buttonStyle:React.CSSProperties={border:'1px solid rgba(255,255,255,.18)',background:'#111522',color:'#fff',borderRadius:12,padding:'12px 14px',fontWeight:700,cursor:'pointer',textAlign:'left'}
const dangerStyle:React.CSSProperties={...buttonStyle,border:'1px solid rgba(255,92,92,.45)',background:'rgba(255,62,62,.12)'}
const fieldStyle:React.CSSProperties={width:'100%',boxSizing:'border-box',background:'#0d111d',color:'#fff',border:'1px solid rgba(255,255,255,.16)',borderRadius:12,padding:12,font: 'inherit'}
