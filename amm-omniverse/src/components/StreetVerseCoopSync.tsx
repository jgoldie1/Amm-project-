import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '../services/supabaseClient'

type CoopEvent={type:'join'|'leave'|'progress'|'complete';userId:string;eventId:string;label?:string;progress?:number;at:string}
type Envelope={payload?:CoopEvent}

const CHANNEL='streetverse:chicago:district-01:coop'

export default function StreetVerseCoopSync(){
  const [status,setStatus]=useState<'SIGNED_OUT'|'CONNECTING'|'LIVE'|'ERROR'>('CONNECTING')
  const [eventLabel,setEventLabel]=useState('NO SHARED EVENT')
  const [teammates,setTeammates]=useState(0)
  const [progress,setProgress]=useState(0)

  useEffect(()=>{
    const sb=getSupabaseClient()
    if(!sb){setStatus('ERROR');return}
    let channel:RealtimeChannel|null=null
    let userId=''
    let cancelled=false
    const members=new Map<string,CoopEvent>()
    let activeEventId=''

    const emitState=()=>{
      const sameEvent=Array.from(members.values()).filter(m=>m.eventId===activeEventId&&m.type!=='leave')
      setTeammates(sameEvent.length)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-coop-state',{detail:{eventId:activeEventId,label:eventLabel,teammates:sameEvent.length,progress,status:'LIVE'}}))
    }
    const send=(payload:CoopEvent)=>{if(channel)void channel.send({type:'broadcast',event:'coop-state',payload})}

    const start=async()=>{
      const {data:{session}}=await sb.auth.getSession()
      if(cancelled)return
      userId=session?.user?.id||''
      if(!userId){setStatus('SIGNED_OUT');return}
      channel=sb.channel(CHANNEL,{config:{broadcast:{self:false,ack:false}}})
      channel.on('broadcast',{event:'coop-state'},(event:Envelope)=>{
        const p=event.payload
        if(!p?.userId||p.userId===userId)return
        if(p.type==='leave'){members.delete(p.userId)}else{members.set(p.userId,p)}
        if(!activeEventId&&p.eventId){activeEventId=p.eventId;setEventLabel(p.label||p.eventId.toUpperCase())}
        if(p.eventId===activeEventId&&Number.isFinite(Number(p.progress)))setProgress(v=>Math.max(v,Number(p.progress||0)))
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-coop-peer',{detail:p}))
        emitState()
      }).subscribe(state=>{if(state==='SUBSCRIBED')setStatus('LIVE');else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT')setStatus('ERROR')})
    }

    const onJoin=(event:Event)=>{
      const d=(event as CustomEvent<{id?:string;label?:string}>).detail||{}
      if(!userId||!d.id)return
      activeEventId=String(d.id);setEventLabel(String(d.label||d.id).toUpperCase());setProgress(0)
      const payload:CoopEvent={type:'join',userId,eventId:activeEventId,label:d.label,progress:0,at:new Date().toISOString()}
      members.set(userId,payload);send(payload);emitState()
    }
    const onLeave=(event:Event)=>{
      const d=(event as CustomEvent<{id?:string}>).detail||{}
      if(!userId||!activeEventId)return
      send({type:'leave',userId,eventId:String(d.id||activeEventId),progress,at:new Date().toISOString()})
      members.clear();activeEventId='';setEventLabel('NO SHARED EVENT');setTeammates(0);setProgress(0)
    }
    const onProgress=(event:Event)=>{
      const d=(event as CustomEvent<{id?:string;progress?:number}>).detail||{}
      if(!userId||!activeEventId)return
      const next=Math.max(0,Math.min(100,Number(d.progress||0)));setProgress(next)
      send({type:'progress',userId,eventId:activeEventId,label:eventLabel,progress:next,at:new Date().toISOString()})
    }
    const onComplete=(event:Event)=>{
      const d=(event as CustomEvent<{id?:string}>).detail||{}
      if(!userId||!activeEventId)return
      setProgress(100);send({type:'complete',userId,eventId:String(d.id||activeEventId),label:eventLabel,progress:100,at:new Date().toISOString()})
    }

    addEventListener('tryamm:streetverse-world-event-join',onJoin)
    addEventListener('tryamm:streetverse-world-event-leave',onLeave)
    addEventListener('tryamm:streetverse-coop-progress',onProgress)
    addEventListener('tryamm:streetverse-mission-complete',onComplete)
    void start()
    return()=>{
      cancelled=true
      removeEventListener('tryamm:streetverse-world-event-join',onJoin)
      removeEventListener('tryamm:streetverse-world-event-leave',onLeave)
      removeEventListener('tryamm:streetverse-coop-progress',onProgress)
      removeEventListener('tryamm:streetverse-mission-complete',onComplete)
      if(channel)void sb.removeChannel(channel)
    }
  },[])

  return <div aria-live="polite" style={{position:'fixed',right:12,top:316,zIndex:16993,width:230,padding:'9px 10px',borderRadius:13,background:'rgba(4,15,27,.92)',border:'1px solid #59f0ff66',color:'#eaffff',fontFamily:'monospace',boxShadow:'0 10px 28px #0008',pointerEvents:'none'}}>
    <div style={{fontSize:8,fontWeight:950,letterSpacing:1.2,color:'#68f3ff'}}>CO-OP SYNC • {status}</div>
    <div style={{fontSize:11,fontWeight:950,marginTop:4}}>{eventLabel}</div>
    <div style={{fontSize:8,opacity:.8,marginTop:4}}>{teammates} TEAMMATE{teammates===1?'':'S'} • {Math.round(progress)}% SHARED PROGRESS</div>
  </div>
}
