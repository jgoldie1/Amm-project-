import { useEffect,useState } from 'react'
import { getSupabaseClient } from '../services/supabaseClient'

type Link={id:string;child_user_id:string;relationship:string;status:string}
type Alert={id:string;child_user_id:string;alert_type:string;severity:string;summary:string;created_at:string;resolved_at:string|null}
type PanelRequest={id:string;room_name:string;requester_user_id:string;status:string;camera_ready:boolean;mic_ready:boolean;created_at:string}

export default function GuardianCommandCenter(){
  const [signedIn,setSignedIn]=useState<boolean|null>(null)
  const [links,setLinks]=useState<Link[]>([])
  const [alerts,setAlerts]=useState<Alert[]>([])
  const [panel,setPanel]=useState<PanelRequest[]>([])
  const [message,setMessage]=useState('Loading family safety status…')

  useEffect(()=>{void load()},[])
  async function load(){
    const sb=getSupabaseClient(); if(!sb){setSignedIn(false);setMessage('Supabase is not configured on this build.');return}
    const {data:{session}}=await sb.auth.getSession(); if(!session){setSignedIn(false);setMessage('Sign in to manage linked family accounts.');return}
    setSignedIn(true)
    const [familyRes,alertRes,panelRes]=await Promise.all([
      sb.from('guardian_family_links').select('id,child_user_id,relationship,status').order('created_at',{ascending:false}),
      sb.from('guardian_alerts').select('id,child_user_id,alert_type,severity,summary,created_at,resolved_at').is('resolved_at',null).order('created_at',{ascending:false}).limit(25),
      sb.from('live_panel_requests').select('id,room_name,requester_user_id,status,camera_ready,mic_ready,created_at').in('status',['waiting','approved','on_stage']).order('created_at',{ascending:false}).limit(25),
    ])
    setLinks((familyRes.data||[]) as Link[]);setAlerts((alertRes.data||[]) as Alert[]);setPanel((panelRes.data||[]) as PanelRequest[])
    const errors=[familyRes.error?.message,alertRes.error?.message,panelRes.error?.message].filter(Boolean)
    setMessage(errors.length?`Some safety data could not load: ${errors.join(' • ')}`:'Family safety data is connected to Supabase.')
  }

  const cards=[
    ['Children / linked accounts',links.length,'Guardian relationships and account links'],
    ['LIVE panel requests',panel.length,'Waiting, approved and on-stage requests'],
    ['AI / moderator alerts',alerts.length,'Open safety alerts needing guardian attention'],
    ['Location privacy','OFF by default','Child location sharing requires explicit guardian control'],
    ['Gifts & purchases','GUARDIAN CONTROL','Money/gift permissions belong to the child safety profile'],
    ['Allowed hours','QUIET HOURS','Per-child quiet-hour windows are supported by the backend'],
  ]

  return <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#050913,#0b1322 52%,#05070b)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'24px 16px 100px'}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><a href='/' style={{color:'#9edcff',fontWeight:900,textDecoration:'none'}}>← TRYAMM HOME</a><a href='/live' style={{color:'#fff',padding:'10px 13px',border:'1px solid #ff6b87',borderRadius:999,textDecoration:'none',fontWeight:900}}>● OPEN LIVE CENTER</a></div>
      <section style={{marginTop:20,padding:'24px 20px',border:'1px solid #40516a',borderRadius:24,background:'#0b1421df'}}>
        <div style={{fontSize:11,letterSpacing:2.2,fontWeight:950,color:'#79e6c4'}}>TRYAMM FAMILY & YOUTH SAFETY</div>
        <h1 style={{fontSize:'clamp(34px,7vw,68px)',lineHeight:1,margin:'9px 0'}}>Guardian Command Center</h1>
        <p style={{maxWidth:850,color:'#c9d5e5',fontSize:16,lineHeight:1.55}}>One control center for linked child/teen accounts, LIVE activity, panel requests, gifts/purchases, reports, devices, privacy, quiet hours, content lanes and AI/human-moderator alerts.</p>
        <div role='status' aria-live='polite' style={{marginTop:14,padding:12,borderRadius:14,background:'#07111d',border:'1px solid #2a4560',color:signedIn===false?'#ffd18a':'#a9f2d4',fontWeight:800}}>{message}</div>
      </section>

      <section aria-label='Guardian safety overview' style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginTop:16}}>{cards.map(([title,value,desc])=><article key={String(title)} style={{padding:17,border:'1px solid #27384d',borderRadius:18,background:'#08111c'}}><div style={{fontSize:11,color:'#8da6c1',fontWeight:900}}>{title}</div><div style={{fontSize:26,fontWeight:950,margin:'7px 0'}}>{value}</div><div style={{fontSize:12,color:'#aebdd0',lineHeight:1.45}}>{desc}</div></article>)}</section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:14,marginTop:16}}>
        <article style={{padding:18,border:'1px solid #334c63',borderRadius:20,background:'#0a1420'}}><h2 style={{marginTop:0}}>Linked children</h2>{links.length?links.map(x=><div key={x.id} style={{padding:'10px 0',borderTop:'1px solid #243243'}}><b>{x.relationship}</b><div style={{fontSize:12,color:'#aab9ca'}}>Account {x.child_user_id.slice(0,8)}… • {x.status}</div></div>):<p style={{color:'#91a3b7'}}>No linked child account is visible to this signed-in guardian yet.</p>}</article>
        <article style={{padding:18,border:'1px solid #334c63',borderRadius:20,background:'#0a1420'}}><h2 style={{marginTop:0}}>Holding room / panel</h2>{panel.length?panel.map(x=><div key={x.id} style={{padding:'10px 0',borderTop:'1px solid #243243'}}><b>{x.room_name}</b><div style={{fontSize:12,color:'#aab9ca'}}>{x.status} • camera {x.camera_ready?'✓':'—'} • mic {x.mic_ready?'✓':'—'}</div></div>):<p style={{color:'#91a3b7'}}>No active panel requests are visible to this account.</p>}</article>
        <article style={{padding:18,border:'1px solid #334c63',borderRadius:20,background:'#0a1420'}}><h2 style={{marginTop:0}}>AI + moderator alerts</h2>{alerts.length?alerts.map(x=><div key={x.id} style={{padding:'10px 0',borderTop:'1px solid #243243'}}><b>{x.severity.toUpperCase()} • {x.alert_type}</b><div style={{fontSize:12,color:'#aab9ca'}}>{x.summary}</div></div>):<p style={{color:'#91a3b7'}}>No unresolved guardian alerts are visible.</p>}</article>
      </section>

      <section style={{marginTop:16,padding:18,border:'1px solid #5c4f2e',borderRadius:20,background:'#171207'}}><h2 style={{marginTop:0}}>All-ages safety rules</h2><p style={{color:'#dfd4b7',lineHeight:1.55}}>AI can flag, translate, caption and assist moderators, but youth LIVE and high-risk reports still require human oversight. Unknown adults should not get unrestricted private contact or automatic panel access to minors. Location sharing stays off unless explicitly enabled by the guardian.</p></section>
    </div>
  </main>
}
