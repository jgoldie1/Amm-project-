import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '../services/supabaseClient'

type PartyPing={userId:string;kind:'crew-call'|'portal-rally';x:number;z:number;label:string;sentAt:string}
type PlayerPosition={x?:number;z?:number}

const CHANNEL='streetverse:party:district-01'

export default function StreetVersePartyBeacon(){
  const [status,setStatus]=useState<'SIGNED_OUT'|'CONNECTING'|'LIVE'|'ERROR'>('CONNECTING')
  const [lastPing,setLastPing]=useState<PartyPing|null>(null)
  const channelRef=useRef<RealtimeChannel|null>(null)
  const userIdRef=useRef('')
  const posRef=useRef({x:0,z:54})

  useEffect(()=>{
    const sb=getSupabaseClient()
    if(!sb){setStatus('ERROR');return}
    let channel:RealtimeChannel|null=null
    let cancelled=false

    const onPosition=(event:Event)=>{
      const d=(event as CustomEvent<PlayerPosition>).detail||{}
      if(Number.isFinite(Number(d.x)))posRef.current.x=Number(d.x)
      if(Number.isFinite(Number(d.z)))posRef.current.z=Number(d.z)
    }
    addEventListener('tryamm:streetverse-player-position',onPosition)

    void (async()=>{
      const {data:{session}}=await sb.auth.getSession()
      if(cancelled)return
      const userId=session?.user?.id||''
      userIdRef.current=userId
      if(!userId){setStatus('SIGNED_OUT');return}
      channel=sb.channel(CHANNEL,{config:{broadcast:{ack:false,self:false}}})
      channelRef.current=channel
      channel.on('broadcast',{event:'party-ping'},payload=>{
        const ping=payload.payload as PartyPing
        if(!ping||ping.userId===userId)return
        setLastPing(ping)
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-party-ping',{detail:ping}))
      }).subscribe(state=>{
        if(state==='SUBSCRIBED')setStatus('LIVE')
        else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT')setStatus('ERROR')
      })
    })()

    return()=>{
      cancelled=true
      removeEventListener('tryamm:streetverse-player-position',onPosition)
      if(channel)void sb.removeChannel(channel)
      channelRef.current=null
    }
  },[])

  const send=(kind:PartyPing['kind'],label:string)=>{
    const channel=channelRef.current,userId=userIdRef.current
    if(!channel||!userId||status!=='LIVE')return
    const ping:PartyPing={userId,kind,x:posRef.current.x,z:posRef.current.z,label,sentAt:new Date().toISOString()}
    void channel.send({type:'broadcast',event:'party-ping',payload:ping})
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-party-ping',{detail:{...ping,self:true}}))
    setLastPing(ping)
  }

  if(status==='SIGNED_OUT')return null
  return <div style={{position:'fixed',right:12,top:118,zIndex:16993,width:190,padding:10,borderRadius:14,background:'rgba(4,10,22,.88)',border:'1px solid rgba(120,188,255,.35)',color:'#fff',fontFamily:'system-ui',boxShadow:'0 8px 24px rgba(0,0,0,.28)'}}>
    <div style={{fontSize:10,fontWeight:950,letterSpacing:.7}}>SHARED WORLD • {status}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
      <button onClick={()=>send('crew-call','CREW CALL')} disabled={status!=='LIVE'} style={{padding:'8px 6px',borderRadius:9,border:'1px solid #5ac8ff88',background:'#09273a',color:'#dff7ff',fontSize:9,fontWeight:900}}>CALL CREW</button>
      <button onClick={()=>send('portal-rally','PORTAL RALLY')} disabled={status!=='LIVE'} style={{padding:'8px 6px',borderRadius:9,border:'1px solid #b57cff88',background:'#28153a',color:'#f1e4ff',fontSize:9,fontWeight:900}}>PORTAL RALLY</button>
    </div>
    {lastPing&&<div style={{marginTop:7,fontSize:9,opacity:.82,lineHeight:1.35}}>{lastPing.kind==='crew-call'?'Crew beacon':'Portal rally'} at {Math.round(lastPing.x)}, {Math.round(lastPing.z)}</div>}
  </div>
}
