import { useEffect, useState } from 'react'
import { acceptInvite, createAgency, generateAgencyInvite, getMyAgencies, getMyAttribution } from '../services/creatorAgency'

type Platform='tiktok'|'bigo'|'twitch'|'youtube'|'instagram'|'facebook'|'kick'|'other'
const platforms:Platform[]=['tiktok','bigo','twitch','youtube','instagram','facebook','kick','other']

export default function AgencyGrowthConsole(){
 const [inviteCode,setInviteCode]=useState('')
 const [agencyName,setAgencyName]=useState('')
 const [source,setSource]=useState<Platform>('tiktok')
 const [newCode,setNewCode]=useState('')
 const [agencyId,setAgencyId]=useState('')
 const [status,setStatus]=useState('Sign in to create/join agencies and persist invite attribution.')
 const [agencies,setAgencies]=useState<any[]>([])
 const [attribution,setAttribution]=useState<any>(null)
 const [busy,setBusy]=useState(false)
 async function refresh(){try{const [a,t]=await Promise.all([getMyAgencies(),getMyAttribution()]);setAgencies(a);setAttribution(t);if(a.length&&!agencyId)setAgencyId(a[0].agency_id)}catch(e:any){setStatus(e?.message||'Sign in required')}}
 useEffect(()=>{void refresh()},[])
 async function run(fn:()=>Promise<any>,success:string){setBusy(true);try{await fn();setStatus(success);await refresh()}catch(e:any){setStatus(e?.message||'Action failed')}finally{setBusy(false)}}
 return <section aria-label="Agency Growth Console" style={panel}>
  <h2 style={{marginTop:0}}>🚀 Agency Growth Console</h2>
  <p style={muted}>Bring creators from TikTok, BIGO LIVE, Twitch, YouTube, Instagram, Facebook, Kick or other sources with consent-based invite codes. Attribution and agency relationships are stored server-side.</p>
  <div style={grid}>
   <article style={card}><h3>Join with invite code</h3><input aria-label="Creator invite code" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} placeholder="ENTER CODE" style={input}/><button disabled={busy||!inviteCode.trim()} onClick={()=>run(()=>acceptInvite({code:inviteCode}),'Invite accepted and first-touch attribution saved.')} style={button}>ACCEPT INVITE</button></article>
   <article style={card}><h3>Start an agency</h3><input aria-label="Agency name" value={agencyName} onChange={e=>setAgencyName(e.target.value)} placeholder="Agency name" style={input}/><button disabled={busy||!agencyName.trim()} onClick={()=>run(async()=>{const a=await createAgency({name:agencyName});setAgencyId(a.id)},'Agency created. You are the owner.')} style={button}>START AN AGENCY</button></article>
   <article style={card}><h3>Create recruiting code</h3><select aria-label="Invite source platform" value={source} onChange={e=>setSource(e.target.value as Platform)} style={input}>{platforms.map(p=><option key={p} value={p}>{p.toUpperCase()}</option>)}</select><input aria-label="New agency invite code" value={newCode} onChange={e=>setNewCode(e.target.value)} placeholder="YOURAGENCY2026" style={input}/><button disabled={busy||!newCode.trim()} onClick={()=>run(()=>generateAgencyInvite({agencyId:agencyId||undefined,code:newCode,source}),`Invite code ${newCode.toUpperCase()} created.`)} style={button}>GENERATE INVITE</button></article>
  </div>
  <div style={{...card,marginTop:10}}><b>Persistent relationship status</b><p style={muted}>{status}</p>{attribution&&<p style={muted}>First-touch source: <b>{attribution.source_platform}</b> • code: <b>{attribution.tryamm_creator_invites?.code||'saved'}</b></p>}<p style={muted}>Agency memberships: {agencies.length||0}</p>{agencies.map((a:any)=><div key={a.id} style={{fontSize:12,marginTop:4}}>{a.tryamm_agencies?.name||a.agency_id} • {a.role} • {a.status}</div>)}</div>
 </section>
}
const panel={border:'1px solid #2b536f',borderRadius:18,padding:16,margin:'14px 0',background:'#07131f'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10} as const
const card={border:'1px solid #26394d',borderRadius:14,padding:13,background:'#0a1420',display:'grid',gap:8} as const
const muted={color:'#a9b7c8',lineHeight:1.5} as const
const input={padding:'10px 12px',borderRadius:10,border:'1px solid #37516a',background:'#050b12',color:'#fff'} as const
const button={padding:'10px 12px',borderRadius:10,border:'1px solid #4FE3FF88',background:'#102c3a',color:'#fff',fontWeight:900,cursor:'pointer'} as const
