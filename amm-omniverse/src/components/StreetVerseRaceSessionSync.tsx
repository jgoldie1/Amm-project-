import { useEffect, useMemo, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '../services/supabaseClient'

type RacePacket={type:'start'|'checkpoint'|'finish'|'cancel';userId:string;raceId:string;label:string;checkpoint:number;total:number;timeMs?:number;at:string}
type Envelope={payload?:RacePacket}
type RacerState=RacePacket & {updated:number}

const CHANNEL='streetverse:chicago:district-01:race'
const RACE_ID='chicago-circuit-01'

export default function StreetVerseRaceSessionSync(){
  const [status,setStatus]=useState<'SIGNED_OUT'|'CONNECTING'|'LIVE'|'ERROR'>('CONNECTING')
  const [selfId,setSelfId]=useState('')
  const [racers,setRacers]=useState<Record<string,RacerState>>({})
  const [local,setLocal]=useState<RacerState|null>(null)

  useEffect(()=>{
    const sb=getSupabaseClient()
    if(!sb){setStatus('ERROR');return}
    let channel:RealtimeChannel|null=null
    let userId=''
    let cancelled=false
    const send=(p:RacePacket)=>{if(channel)void channel.send({type:'broadcast',event:'race-session',payload:p})}
    const upsert=(p:RacePacket)=>setRacers(prev=>({...prev,[p.userId]:{...p,updated:Date.now()}}))

    const start=async()=>{
      const {data:{session}}=await sb.auth.getSession()
      if(cancelled)return
      userId=session?.user?.id||''
      setSelfId(userId)
      if(!userId){setStatus('SIGNED_OUT');return}
      channel=sb.channel(CHANNEL,{config:{broadcast:{self:false,ack:false}}})
      channel.on('broadcast',{event:'race-session'},(e:Envelope)=>{
        const p=e.payload
        if(!p?.userId||p.userId===userId||p.raceId!==RACE_ID)return
        if(p.type==='cancel')setRacers(prev=>{const next={...prev};delete next[p.userId];return next})
        else upsert(p)
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-race-peer-state',{detail:p}))
      }).subscribe(s=>{if(s==='SUBSCRIBED')setStatus('LIVE');else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT')setStatus('ERROR')})
    }

    const onMissionStart=(e:Event)=>{
      const d=(e as CustomEvent<{id?:string;label?:string;checkpoints?:number}>).detail||{}
      if(!userId||d.id!==RACE_ID)return
      const p:RacePacket={type:'start',userId,raceId:RACE_ID,label:String(d.label||'Chicago Circuit 01'),checkpoint:0,total:Number(d.checkpoints||4),at:new Date().toISOString()}
      const state={...p,updated:Date.now()};setLocal(state);upsert(p);send(p)
    }
    const onCheckpoint=(e:Event)=>{
      const d=(e as CustomEvent<{checkpoint?:number;total?:number}>).detail||{}
      if(!userId||!local)return
      const p:RacePacket={type:'checkpoint',userId,raceId:RACE_ID,label:'Chicago Circuit 01',checkpoint:Number(d.checkpoint||0),total:Number(d.total||4),at:new Date().toISOString()}
      const state={...p,updated:Date.now()};setLocal(state);upsert(p);send(p)
    }
    const onComplete=(e:Event)=>{
      const d=(e as CustomEvent<{id?:string;timeMs?:number}>).detail||{}
      if(!userId||d.id!==RACE_ID)return
      const p:RacePacket={type:'finish',userId,raceId:RACE_ID,label:'Chicago Circuit 01',checkpoint:4,total:4,timeMs:Number(d.timeMs||0),at:new Date().toISOString()}
      const state={...p,updated:Date.now()};setLocal(state);upsert(p);send(p)
    }
    const onClear=()=>{
      if(!userId||!local)return
      send({type:'cancel',userId,raceId:RACE_ID,label:'Chicago Circuit 01',checkpoint:local.checkpoint,total:local.total,at:new Date().toISOString()})
      setLocal(null);setRacers(prev=>{const next={...prev};delete next[userId];return next})
    }

    addEventListener('tryamm:streetverse-mission-start',onMissionStart)
    addEventListener('tryamm:streetverse-race-checkpoint',onCheckpoint)
    addEventListener('tryamm:streetverse-mission-complete',onComplete)
    addEventListener('tryamm:streetverse-race-target-clear',onClear)
    void start()
    const prune=setInterval(()=>setRacers(prev=>Object.fromEntries(Object.entries(prev).filter(([,r])=>Date.now()-r.updated<30000))),5000)
    return()=>{
      cancelled=true;clearInterval(prune)
      removeEventListener('tryamm:streetverse-mission-start',onMissionStart)
      removeEventListener('tryamm:streetverse-race-checkpoint',onCheckpoint)
      removeEventListener('tryamm:streetverse-mission-complete',onComplete)
      removeEventListener('tryamm:streetverse-race-target-clear',onClear)
      if(channel)void sb.removeChannel(channel)
    }
  },[local])

  const board=useMemo(()=>Object.values(racers).sort((a,b)=>{
    const af=a.type==='finish'?1000+a.total:a.checkpoint,bf=b.type==='finish'?1000+b.total:b.checkpoint
    if(bf!==af)return bf-af
    if(a.type==='finish'&&b.type==='finish')return Number(a.timeMs||Infinity)-Number(b.timeMs||Infinity)
    return a.updated-b.updated
  }).slice(0,5),[racers])

  if(status==='SIGNED_OUT'||(!board.length&&status==='LIVE'))return null
  return <aside aria-label="StreetVerse shared race session" style={{position:'fixed',right:12,top:420,zIndex:16993,width:230,padding:'9px 10px',borderRadius:13,background:'rgba(10,8,20,.93)',border:'1px solid #ffd65a66',color:'#fff',fontFamily:'monospace',boxShadow:'0 10px 28px #0008'}}>
    <div style={{fontSize:8,fontWeight:950,letterSpacing:1.1,color:'#ffe47a'}}>SHARED RACE • {status}</div>
    <div style={{fontSize:10,fontWeight:950,marginTop:4}}>CHICAGO CIRCUIT 01</div>
    <div style={{display:'grid',gap:4,marginTop:6}}>{board.map((r,i)=><div key={r.userId} style={{display:'grid',gridTemplateColumns:'18px 1fr auto',gap:5,alignItems:'center',fontSize:8,padding:'4px 5px',borderRadius:8,background:'rgba(255,255,255,.05)'}}><b>{i+1}</b><span>{r.userId===selfId?'YOU':`P-${r.userId.slice(0,4).toUpperCase()}`}</span><b>{r.type==='finish'?formatMs(r.timeMs||0):`CP ${Math.min(r.checkpoint+1,r.total)}/${r.total}`}</b></div>)}</div>
  </aside>
}

function formatMs(ms:number){const s=Math.max(0,ms)/1000;const m=Math.floor(s/60);return `${m}:${(s-m*60).toFixed(1).padStart(4,'0')}`}
