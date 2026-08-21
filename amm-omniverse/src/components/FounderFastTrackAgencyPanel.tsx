import { useEffect, useState } from 'react'
import { canManageFounderFastTrack, createFounderFastTrackInvite, FOUNDER_FAST_TRACK_PATH, redeemFounderFastTrackInvite } from '../services/founderFastTrack'

export default function FounderFastTrackAgencyPanel(){
 const [isFounder,setIsFounder]=useState(false),[code,setCode]=useState(''),[email,setEmail]=useState(''),[note,setNote]=useState(''),[status,setStatus]=useState('')
 useEffect(()=>{void canManageFounderFastTrack().then(setIsFounder)},[])
 async function redeem(){try{setStatus('Checking invite…');const r=await redeemFounderFastTrackInvite(code);setStatus(`${r.status}: agency waitlist bypass unlocked. ${r.truth}`)}catch(e:any){setStatus(e?.message||'Unable to redeem invite')}}
 async function create(){try{setStatus('Creating VIP invite…');const r:any=await createFounderFastTrackInvite({code,email,note,maxUses:1});setStatus(`VIP invite created: ${r?.code||code.toUpperCase()}`)}catch(e:any){setStatus(e?.message||'Unable to create invite')}}
 return <section style={panel}><h2>👑 Founder Fast-Track Agency</h2><p style={muted}>People personally approved by the founder can skip the normal agency application queue and go directly to agency setup. Identity/business verification, age rules, agency terms, payout/tax checks, Jacobie Vision security and provider/compliance gates still apply.</p><div style={row}><input aria-label="Founder fast-track invite code" value={code} onChange={e=>setCode(e.target.value)} placeholder="ENTER VIP CODE" style={input}/><button onClick={()=>void redeem()} style={button}>REDEEM VIP INVITE</button></div>{isFounder&&<div style={{...card,marginTop:12}}><b>Founder/Admin Invite Creator</b><input aria-label="VIP invite email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Optional email lock" style={input}/><input aria-label="VIP invite note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Private note" style={input}/><button onClick={()=>void create()} style={button}>CREATE FAST-TRACK CODE</button></div>}<p aria-live="polite" style={{...muted,color:status.includes('created')||status.includes('unlocked')?'#7dffb0':'#ffcf66'}}>{status}</p><small>{FOUNDER_FAST_TRACK_PATH}</small></section>
}
const panel={border:'1px solid #6f5b22',borderRadius:18,padding:16,margin:'14px 0',background:'#11100a'} as const
const row={display:'flex',gap:8,flexWrap:'wrap' as const}
const card={border:'1px solid #5a4c25',borderRadius:14,padding:12,display:'grid',gap:8,background:'#17140b'} as const
const muted={color:'#c8c0aa',lineHeight:1.5} as const
const input={flex:'1 1 240px',border:'1px solid #3d4b58',borderRadius:10,padding:'10px 12px',background:'#07111a',color:'#fff'} as const
const button={border:'1px solid #E8B944',borderRadius:10,padding:'10px 13px',background:'#1c1608',color:'#fff',fontWeight:900,cursor:'pointer'} as const
