import { useEffect, useMemo, useState } from 'react'
import { getSessionUser, isSupabaseConfigured } from '../game/auth/googleAuth'
import {
  addDeliveryEvent,
  approveJarvisRequest,
  authorizeSandboxPayment,
  createBusiness,
  createMarketplaceOrder,
  listAuditEvidence,
  listDeliveryEvents,
  loadPassport,
  requestJarvisApproval,
  savePassport,
  type JourneyBusiness,
  type JourneyOrder,
} from '../coreJourney/coreJourneyService'

type StepState = 'idle' | 'working' | 'done' | 'error'

export default function CoreJourneyLauncher() {
  const [open, setOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('My TRYAMM Business')
  const [business, setBusiness] = useState<JourneyBusiness | null>(null)
  const [order, setOrder] = useState<JourneyOrder | null>(null)
  const [approvalId, setApprovalId] = useState<string | null>(null)
  const [deliveryEvents, setDeliveryEvents] = useState<any[]>([])
  const [audit, setAudit] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [states, setStates] = useState<Record<string, StepState>>({})

  useEffect(() => {
    getSessionUser().then((u) => setUserName(u?.provider === 'mock' ? null : u?.name ?? null))
  }, [open])

  const configured = isSupabaseConfigured()
  const ready = configured && Boolean(userName)
  const doneCount = useMemo(() => Object.values(states).filter((s) => s === 'done').length, [states])

  async function run(key: string, task: () => Promise<void>) {
    setStates((s) => ({ ...s, [key]: 'working' }))
    setMessage('')
    try {
      await task()
      setStates((s) => ({ ...s, [key]: 'done' }))
    } catch (e: any) {
      setStates((s) => ({ ...s, [key]: 'error' }))
      setMessage(e?.message ?? String(e))
    }
  }

  const pill = (key: string) => {
    const s = states[key] ?? 'idle'
    const label = s === 'done' ? '✓ DONE' : s === 'working' ? '… WORKING' : s === 'error' ? '! ERROR' : 'READY'
    const color = s === 'done' ? '#63ffb3' : s === 'error' ? '#ff6b7d' : s === 'working' ? '#e8b944' : '#718096'
    return <span style={{ color, fontSize: 9, fontWeight: 900 }}>{label}</span>
  }

  return <>
    <button
      type="button"
      aria-label="Open secure core journey"
      onClick={() => setOpen(true)}
      style={{position:'fixed',right:12,bottom:176,zIndex:9000,border:'1px solid #4fe3ff77',borderRadius:999,padding:'9px 13px',background:'linear-gradient(135deg,#09222b,#111328)',color:'#4fe3ff',fontFamily:'monospace',fontWeight:900,fontSize:10,cursor:'pointer',boxShadow:'0 8px 24px #0008'}}
    >CORE JOURNEY</button>

    {open && <div role="dialog" aria-modal="true" aria-label="TRYAMM secure core journey" style={{position:'fixed',inset:0,zIndex:12000,background:'#02050bea',overflowY:'auto',fontFamily:'monospace',color:'#fff'}}>
      <div style={{maxWidth:760,margin:'0 auto',padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:14}}>
          <div>
            <div style={{color:'#4fe3ff',fontSize:10,letterSpacing:3,fontWeight:900}}>TRYAMM SECURE JOURNEY</div>
            <h2 style={{margin:'6px 0',fontSize:24}}>One real account → one persistent platform</h2>
            <div style={{fontSize:11,color:'#8a9bad'}}>Completed steps this session: {doneCount}/8</div>
          </div>
          <button onClick={()=>setOpen(false)} aria-label="Close" style={{width:40,height:40,borderRadius:'50%',border:'1px solid #394557',background:'#0c1420',color:'#fff',cursor:'pointer'}}>×</button>
        </div>

        <div style={{padding:12,borderRadius:14,border:`1px solid ${ready?'#3cff9c66':'#ffb84a66'}`,background:'#07101a',marginBottom:14,fontSize:11,lineHeight:1.6}}>
          <b>{ready ? `Authenticated as ${userName}` : 'Production authentication required'}</b><br/>
          Supabase: {configured ? 'configured' : 'not configured'} · Real session: {userName ? 'yes' : 'no/guest'}<br/>
          {!ready && 'Sign in with a real Google/Apple/email account before running persistence, order, payment, or audit steps.'}
        </div>

        {message && <div role="alert" style={{padding:11,border:'1px solid #ff6b7d88',background:'#2a0c13',borderRadius:12,color:'#ffd1d7',marginBottom:12,fontSize:11}}>{message}</div>}

        <JourneyStep n="1" title="Authenticated Passport save/reload" status={pill('passport')} disabled={!ready} onClick={()=>run('passport', async()=>{
          await savePassport({ displayName:userName ?? undefined, goals:['build','earn','serve'], accessibility:{ followsAccount:true }, learning:{ passport:'active' } })
          const reloaded = await loadPassport()
          if (!reloaded?.displayName) throw new Error('Passport did not reload from persistent storage.')
        })}/>

        <div style={{display:'flex',gap:8,margin:'8px 0 0 48px'}}>
          <input aria-label="Business name" value={businessName} onChange={e=>setBusinessName(e.target.value)} style={{flex:1,minWidth:0,padding:10,borderRadius:9,border:'1px solid #24364a',background:'#050b13',color:'#fff'}}/>
        </div>
        <JourneyStep n="2" title="Authenticated Business creation" status={pill('business')} disabled={!ready} onClick={()=>run('business', async()=>{
          const b = await createBusiness(businessName,{ source:'core-journey', jarvis:'enabled', companyTwin:'planned' }); setBusiness(b)
        })}/>

        <JourneyStep n="3" title="Marketplace order" status={pill('order')} disabled={!ready || !business} onClick={()=>run('order', async()=>{
          const o=await createMarketplaceOrder({businessId:business?.id,totalMinor:2499,payload:{item:'TRYAMM Launch Kit',quantity:1,fulfillment:'holo_delivery'}});setOrder(o)
        })}/>

        <JourneyStep n="4" title="JARVIS approval firewall" status={pill('approval')} disabled={!ready || !order} onClick={()=>run('approval', async()=>{
          const r=await requestJarvisApproval('authorize_sandbox_checkout',{orderId:order?.id,totalMinor:order?.totalMinor});setApprovalId(r.id);await approveJarvisRequest(r.id)
        })}/>

        <JourneyStep n="5" title="Payment sandbox" status={pill('payment')} disabled={!ready || !order || !approvalId} onClick={()=>run('payment', async()=>{
          if(!order) throw new Error('Order missing'); await authorizeSandboxPayment(order)
        })}/>

        <JourneyStep n="6" title="Holo Delivery tracking" status={pill('delivery')} disabled={!ready || !order} onClick={()=>run('delivery', async()=>{
          if(!order) throw new Error('Order missing')
          await addDeliveryEvent(order.id,'confirmed','Order confirmed',28)
          await addDeliveryEvent(order.id,'in_transit','Courier is on the way',12)
          const events=await listDeliveryEvents(order.id);setDeliveryEvents(events)
          if(events.length<2) throw new Error('Delivery events did not persist.')
        })}/>

        <JourneyStep n="7" title="Audit evidence" status={pill('audit')} disabled={!ready} onClick={()=>run('audit', async()=>{
          const rows=await listAuditEvidence();setAudit(rows); if(rows.length<1) throw new Error('No audit evidence found.')
        })}/>

        <JourneyStep n="8" title="Reload evidence" status={pill('reload')} disabled={!ready || !order} onClick={()=>run('reload', async()=>{
          const p=await loadPassport(); const events=order?await listDeliveryEvents(order.id):[]; const a=await listAuditEvidence();
          if(!p || !events.length || !a.length) throw new Error('Persistent reload check failed.'); setDeliveryEvents(events);setAudit(a)
        })}/>

        {(business||order) && <div style={{marginTop:14,padding:12,border:'1px solid #173047',borderRadius:14,background:'#060d16',fontSize:10,lineHeight:1.7,color:'#a8b6c8'}}>
          <b style={{color:'#fff'}}>Evidence snapshot</b><br/>
          Business: {business?.name ?? '—'} {business?.id ? `· ${business.id.slice(0,8)}…` : ''}<br/>
          Order: {order?.id ? `${order.id.slice(0,8)}…` : '—'} · ${(order?.totalMinor ?? 0)/100} {order?.currency ?? ''}<br/>
          Delivery events: {deliveryEvents.length} · Audit events loaded: {audit.length}
        </div>}
      </div>
    </div>}
  </>
}

function JourneyStep({n,title,status,disabled,onClick}:{n:string;title:string;status:React.ReactNode;disabled:boolean;onClick:()=>void}){
  return <button disabled={disabled} onClick={onClick} style={{width:'100%',marginTop:8,display:'grid',gridTemplateColumns:'34px 1fr auto',alignItems:'center',gap:10,textAlign:'left',padding:12,borderRadius:12,border:'1px solid #182b3e',background:disabled?'#07090d':'#07111c',color:disabled?'#4c5664':'#fff',cursor:disabled?'not-allowed':'pointer'}}>
    <span style={{width:30,height:30,borderRadius:'50%',display:'grid',placeItems:'center',background:'#0e2733',color:'#4fe3ff',fontWeight:900}}>{n}</span>
    <span style={{fontSize:11,fontWeight:900}}>{title}</span>{status}
  </button>
}
