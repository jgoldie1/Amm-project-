import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '../services/supabaseClient'

type CountdownPayload={userId:string;raceId:string;startAt:number;sentAt:string}
const CHANNEL='streetverse:chicago:district-01:race-countdown'
const RACE_ID='chicago-circuit-01'

export default function StreetVerseRaceCountdownSync(){
  const [status,setStatus]=useState<'SIGNED_OUT'|'CONNECTING'|'LIVE'|'ERROR'>('CONNECTING')
  const [count,setCount]=useState<number|null>(null)
  const [armed,setArmed]=useState(false)
  const channelRef=useRef<RealtimeChannel|null>(null)
  const userRef=useRef('')
  const timerRef=useRef<number|undefined>(undefined)

  useEffect(()=>{
    const sb=getSupabaseClient(); if(!sb){setStatus('ERROR');return}
    let channel:RealtimeChannel|null=null,cancelled=false
    const start=async()=>{
      const {data:{session}}=await sb.auth.getSession(); if(cancelled)return
      const userId=session?.user?.id||''; userRef.current=userId
      if(!userId){setStatus('SIGNED_OUT');return}
      channel=sb.channel(CHANNEL,{config:{broadcast:{self:true,ack:false}}}); channelRef.current=channel
      channel.on('broadcast',{event:'race-countdown'},(event)=>{const p=(event as {payload?:CountdownPayload}).payload;if(!p||p.raceId!==RACE_ID)return;armCountdown(p.startAt)})
        .subscribe(s=>{if(s==='SUBSCRIBED')setStatus('LIVE');else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT')setStatus('ERROR')})
    }
    void start()
    return()=>{cancelled=true;if(timerRef.current)clearInterval(timerRef.current);if(channel)void sb.removeChannel(channel);channelRef.current=null}
  },[])

  const armCountdown=(startAt:number)=>{
    if(timerRef.current)clearInterval(timerRef.current)
    setArmed(true)
    let fired=false
    const tick=()=>{
      const ms=startAt-Date.now()
      if(ms<=0){setCount(0);setArmed(false);if(!fired){fired=true;dispatchEvent(new CustomEvent('tryamm:streetverse-drive-mission-start-request',{detail:{source:'shared-countdown',raceId:RACE_ID,startAt}}));dispatchEvent(new CustomEvent('tryamm:streetverse-shared-race-go',{detail:{raceId:RACE_ID,startAt}}))}if(timerRef.current)clearInterval(timerRef.current);setTimeout(()=>setCount(null),900);return}
      setCount(Math.max(1,Math.ceil(ms/1000)))
    }
    tick();timerRef.current=window.setInterval(tick,80)
  }

  const launch=()=>{
    const channel=channelRef.current,userId=userRef.current
    if(!channel||!userId||status!=='LIVE'||armed)return
    const startAt=Date.now()+4000
    const payload:CountdownPayload={userId,raceId:RACE_ID,startAt,sentAt:new Date().toISOString()}
    void channel.send({type:'broadcast',event:'race-countdown',payload})
  }

  return <div style={{position:'fixed',right:12,top:442,zIndex:16993,width:230,padding:'9px 10px',borderRadius:13,background:'rgba(19,9,3,.92)',border:'1px solid #ffb34f66',color:'#fff7df',fontFamily:'monospace',boxShadow:'0 10px 28px #0008'}}>
    <div style={{fontSize:8,fontWeight:950,letterSpacing:1.2,color:'#ffc56b'}}>SHARED RACE START • {status}</div>
    <div style={{fontSize:18,fontWeight:1000,marginTop:4}}>{count===0?'GO!':count!==null?count:'READY GRID'}</div>
    <button disabled={status!=='LIVE'||armed} onClick={launch} style={{marginTop:7,width:'100%',minHeight:34,borderRadius:999,border:'1px solid #ffc56b88',background:'#17120c',color:'#fff',fontSize:9,fontWeight:950,opacity:status==='LIVE'&&!armed?1:.45,cursor:status==='LIVE'&&!armed?'pointer':'default'}}>SYNC 3-2-1-GO</button>
  </div>
}
