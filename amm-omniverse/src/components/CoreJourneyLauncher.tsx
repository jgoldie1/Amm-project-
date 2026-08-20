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
  loadBusinessDashboard,
  loadPassport,
  requestJarvisApproval,
  savePassport,
  stopJourneySubscription,
  subscribeJourney,
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
  const [dashboard, setDashboard] = useState<any>(null)
  const [realtimeStatus, setRealtimeStatus] = useState('not connected')
  const [message, setMessage] = useState('')
  const [states, setStates] = useState<Record<string, StepState>>({})

  useEffect(() => {
    getSessionUser().then((u) => setUserName(u?.provider === 'mock' ? null : u?.name ?? null))
  }, [open])

  useEffect(() => {
    if (!order?.id) return
    let active = true
    let channel: Awaited<ReturnType<typeof subscribeJourney>> | undefined
    subscribeJourney(order.id, {
      onOrder: (next) => {
        if (!active) return
        setOrder((current) => current ? { ...current, status: next.status } : current)
      },
      onDeliveryEvent: (event) => {
        if (!active) return
        setDeliveryEvents((current) => current.some((row) => row.id === event.id) ? current : [...current, event])
      },
      onStatus: (status) => active && setRealtimeStatus(status),
    }).then((next) => { channel = next }).catch((error) => {
      if (active) setRealtimeStatus(`error: ${error instanceof Error ? error.message : String(error)}`)
    })
    return () => {
      active = false
      if (channel) void stopJourneySubscription(channel)
    }
  }, [order?.id])

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
            <div style={{fontSize:11,color:'#8a9bad'}}>Completed steps this session: {doneCount}/9 · Realtime: {realtimeStatus}</div>
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

        <JourneyStep n="5" title="Server-authoritative sandbox Money Engine" status={pill('payment')} disabled={!ready || !order || !approvalId} onClick={()=>run('payment', async()=>{
          if(!order || !approvalId) throw new Error('Order or approval missing'); await authorizeSandboxPayment(order, approvalId)
        })}/>

        <JourneyStep n="6" title="Realtime Holo Delivery → delivered" status={pill('delivery')} disabled={!ready || !order || states.payment !== 'done'} onClick={()=>run('delivery', async()=>{
          if(!order) throw new Error('Order missing')
          const path = [
            ['confirmed','Order confirmed',28],
            ['courier_assigned','Courier assigned',22],
            ['picked_up','Package picked up',16],
            ['in_transit','Courier is on the way',12],
            ['arriving','Courier is arriving',3],
            ['delivered','Delivered successfully',0],
          ] as const
          for (const [state,label,eta] of path) await addDeliveryEvent(order.id,state,label,eta)
          const events=await listDeliveryEvents(order.id);setDeliveryEvents(events)
          if(events.length<path.length || events.at(-1)?.state!=='delivered') throw new Error('Complete delivery journey did not persist.')
        })}/>

        <JourneyStep n="7" title="Business dashboard aggregation" status={pill('dashboard')} disabled={!ready || states.delivery !== 'done'} onClick={()=>run('dashboard', async()=>{
          const d=await loadBusinessDashboard();setDashboard(d)
          if(!business || !order) throw new Error('Business or order missing.')
          if(!d.businesses.some((row:any)=>row.id===business.id)) throw new Error('Business missing from dashboard aggregation.')
          if(!d.recentOrders.some((row:any)=>row.id===order.id)) throw new Error('Order missing from dashboard aggregation.')
          if(d.totals.deliveredOrders<1) throw new Error('Delivered order was not aggregated.')
        })}/>

        <JourneyStep n="8" title="Persisted audit evidence" status={pill('audit')} disabled={!ready || states.dashboard !== 'done'} onClick={()=>run('audit', async()=>{
          const rows=await listAuditEvidence(50);setAudit(rows)
          if(rows.length<1) throw new Error('No audit evidence found.')
          if(order && !rows.some((row:any)=>row.target_id===order.id)) throw new Error('Order audit evidence was not found.')
        })}/>

        <JourneyStep n="9" title="Reload persistent evidence" status={pill('reload')} disabled={!ready || !order || states.audit !== 'done'} onClick={()=>run('reload', async()=>{
          const p=await loadPassport(); const events=order?await listDeliveryEvents(order.id):[]; const a=await listAuditEvidence(50); const d=await loadBusinessDashboard()
          if(!p || events.at(-1)?.state!=='delivered' || !a.length || !d.recentOrders.some((row:any)=>row.id===order?.id)) throw new Error('Persistent reload check failed.')
          setDeliveryEvents(events);setAudit(a);setDashboard(d)
        })}/>

        {(business||order) && <div style={{marginTop:14,padding:12,border:'1px solid #173047',borderRadius:14,background:'#060d16',fontSize:10,lineHeight:1.7,color:'#a8b6c8'}}>
          <b style={{color:'#fff'}}>Evidence snapshot</b><br/>
          Business: {business?.name ?? '—'} {business?.id ? `· ${business.id.slice(0,8)}…` : ''}<br/>
          Order: {order?.id ? `${order.id.slice(0,8)}…` : '—'} · {(order?.totalMinor ?? 0)/100} {order?.currency ?? ''} · status {order?.status ?? '—'}<br/>
          Delivery events: {deliveryEvents.length} · Audit events loaded: {audit.length}<br/>
          Dashboard: {dashboard ? `${dashboard.totals.orders} orders · ${dashboard.totals.deliveredOrders} delivered · $${(dashboard.totals.sandboxPaidMinor/100).toFixed(2)} sandbox recorded` : 'not loaded'}
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