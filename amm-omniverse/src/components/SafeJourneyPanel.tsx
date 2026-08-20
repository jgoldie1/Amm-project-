import { useEffect, useMemo, useState } from 'react'
import { addSafeCheckin, createSafeJourney, getSafeJourneyDispatch, listMySafeJourneys, markSafeArrival, requestSafeJourneyDispatch, startSafeJourney, subscribeToSafeJourney, type SafeJourney, type SafeJourneyDispatchRequest, type SafeJourneyMode } from '../services/safeJourney'

type Props={open:boolean;onClose:()=>void}

export default function SafeJourneyPanel({open,onClose}:Props){
  const [journeys,setJourneys]=useState<SafeJourney[]>([])
  const [selected,setSelected]=useState<string>('')
  const [dispatch,setDispatch]=useState<SafeJourneyDispatchRequest[]>([])
  const [mode,setMode]=useState<SafeJourneyMode>('walk')
  const [origin,setOrigin]=useState('Current location')
  const [destination,setDestination]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const active=useMemo(()=>journeys.find(j=>j.id===selected)??journeys.find(j=>j.status==='active')??journeys[0], [journeys,selected])

  async function refresh(){
    try{
      const list=await listMySafeJourneys();setJourneys(list)
      const id=selected||list.find(j=>j.status==='active')?.id||list[0]?.id
      if(id){setSelected(id);setDispatch(await getSafeJourneyDispatch(id))}else setDispatch([])
    }catch(err){setMessage(err instanceof Error?err.message:'Unable to load Safe Journey')}
  }

  useEffect(()=>{if(open)void refresh()},[open])
  useEffect(()=>{if(!open||!active?.id)return;return subscribeToSafeJourney(active.id,()=>void refresh())},[open,active?.id])

  async function run(fn:()=>Promise<unknown>,success:string){setBusy(true);setMessage('');try{await fn();setMessage(success);await refresh()}catch(err){setMessage(err instanceof Error?err.message:'Request failed')}finally{setBusy(false)}}

  if(!open)return null
  return <div role="dialog" aria-modal="true" aria-label="Safe Journey" style={{position:'fixed',inset:0,zIndex:10020,background:'rgba(0,0,0,.72)',display:'grid',placeItems:'center',padding:16}}>
    <section style={{width:'min(720px,100%)',maxHeight:'90vh',overflow:'auto',border:'1px solid rgba(79,227,255,.55)',borderRadius:24,background:'rgba(4,5,14,.98)',color:'#fff',boxShadow:'0 0 40px rgba(79,227,255,.18)',padding:20}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><strong style={{fontSize:22}}>🛡 Safe Journey</strong><div style={{opacity:.74,fontSize:13}}>Check-ins, route support and community dispatch. This is not private security or law enforcement.</div></div><button onClick={onClose} aria-label="Close Safe Journey">✕</button></header>

      {!active&&<div style={{marginTop:18,display:'grid',gap:10}}>
        <h3>Start a journey</h3>
        <select value={mode} onChange={e=>setMode(e.target.value as SafeJourneyMode)}><option value="walk">Walk</option><option value="transit">Transit</option><option value="rideshare">Rideshare</option><option value="bike">Bike</option><option value="drive">Drive</option><option value="delivery">Delivery</option><option value="other">Other</option></select>
        <input value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="Starting point" />
        <input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Destination" />
        <button disabled={busy||!destination.trim()} onClick={()=>run(async()=>{const j=await createSafeJourney({mode,origin:{label:origin},destination:{label:destination}});setSelected(j.id);await startSafeJourney(j.id)},'Safe Journey started')}>Start Safe Journey</button>
      </div>}

      {active&&<div style={{marginTop:18,display:'grid',gap:14}}>
        <div style={{padding:14,border:'1px solid rgba(255,255,255,.12)',borderRadius:16}}><div style={{fontSize:12,opacity:.7}}>STATUS</div><strong>{active.status.toUpperCase()}</strong><div style={{marginTop:8}}>To: {String((active.destination as any)?.label??'Destination')}</div></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10}}>
          <button disabled={busy||active.status!=='active'} onClick={()=>run(()=>addSafeCheckin(active.id,'ok'),"You're checked in as OK")}>I'm OK</button>
          <button disabled={busy||active.status!=='active'} onClick={()=>run(()=>addSafeCheckin(active.id,'delayed'),"Delay recorded")}>I'm delayed</button>
          <button disabled={busy||active.status!=='active'} onClick={()=>run(()=>markSafeArrival(active.id),'Arrival recorded')}>I've arrived</button>
          <button disabled={busy} onClick={()=>run(()=>requestSafeJourneyDispatch({journeyId:active.id,severity:'assist',requestType:'route_support',details:'User requested Safe Journey route support'}),'Route-support request sent')}>Request route support</button>
          <button disabled={busy} onClick={()=>run(async()=>{await addSafeCheckin(active.id,'need_help');await requestSafeJourneyDispatch({journeyId:active.id,severity:'urgent',requestType:'incident_support',details:'User requested urgent Safe Journey support'})},'Urgent support request sent')}>I need help</button>
          <button disabled={busy} onClick={()=>run(()=>requestSafeJourneyDispatch({journeyId:active.id,severity:'emergency',requestType:'emergency_escalation',details:'User requested emergency escalation. External emergency services are not contacted automatically by this button unless an approved integration is configured.'}),'Emergency escalation recorded')}>Emergency escalation</button>
        </div>
        {dispatch.length>0&&<div><h3>Dispatch</h3>{dispatch.map(d=><div key={d.id} style={{padding:'10px 0',borderTop:'1px solid rgba(255,255,255,.1)'}}><strong>{d.status.replaceAll('_',' ')}</strong> · {d.severity} · {d.request_type.replaceAll('_',' ')}</div>)}</div>}
      </div>}
      {message&&<p role="status" style={{marginTop:14}}>{message}</p>}
      <p style={{opacity:.65,fontSize:12,marginTop:18}}>Safe Journey supports check-ins, route monitoring, trusted/community assistance and escalation. It does not authorize confrontation, detention, pursuit, weapons use, or impersonation of police/security personnel.</p>
    </section>
  </div>
}
