import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '../services/supabaseClient'

type PlayerPosition={x?:number;z?:number;vehicle?:boolean;vehicleType?:string;ride?:{id?:string;label?:string}}
type PresencePayload={userId:string;x:number;z:number;heading:number;vehicle:boolean;vehicleType:string;rideId?:string;rideLabel?:string;updatedAt:string}
type PresenceState=Record<string,PresencePayload[]>
type MotionEnvelope={payload?:PresencePayload}
type PlayerAction={fromUserId:string;toUserId:string;action:'wave'|'crew-invite'|'race-challenge';sentAt:string}
type ActionEnvelope={payload?:PlayerAction}

const CHANNEL='streetverse:chicago:district-01'
const clamp=(n:number)=>Math.max(-88,Math.min(88,Number.isFinite(n)?n:0))

export default function StreetVerseRealtimePresence(){
  const [online,setOnline]=useState(0)
  const [state,setState]=useState<'SIGNED_OUT'|'CONNECTING'|'LIVE'|'ERROR'>('CONNECTING')
  const channelRef=useRef<RealtimeChannel|null>(null)
  const latestRef=useRef<PresencePayload|null>(null)
  const lastBroadcastRef=useRef(0)

  useEffect(()=>{
    const sb=getSupabaseClient()
    if(!sb){setState('ERROR');return}
    let cancelled=false
    let channel:RealtimeChannel|null=null
    let localUserId=''
    const peers=new Map<string,PresencePayload>()

    const emitPlayers=()=>{
      const players=Array.from(peers.values()).filter(p=>p.userId!==localUserId&&Number.isFinite(Number(p.x))&&Number.isFinite(Number(p.z)))
      setOnline(players.length+1)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-multiplayer-presence',{detail:{channel:CHANNEL,players,online:players.length+1}}))
    }
    const syncPresence=(presence:PresenceState)=>{
      const activeIds=new Set<string>()
      Object.values(presence).flat().forEach(p=>{if(p?.userId&&p.userId!==localUserId){activeIds.add(p.userId);if(!peers.has(p.userId))peers.set(p.userId,p)}})
      for(const id of peers.keys())if(!activeIds.has(id))peers.delete(id)
      emitPlayers()
    }
    const sendMotion=(next:PresencePayload)=>{
      const active=channelRef.current
      if(!active)return
      void active.send({type:'broadcast',event:'player-motion',payload:next})
    }
    const sendAction=(action:PlayerAction)=>{
      const active=channelRef.current
      if(!active)return
      void active.send({type:'broadcast',event:'player-action',payload:action})
    }

    const start=async()=>{
      const {data:{session}}=await sb.auth.getSession()
      const userId=session?.user?.id
      if(cancelled)return
      if(!userId){setState('SIGNED_OUT');setOnline(0);window.dispatchEvent(new CustomEvent('tryamm:streetverse-multiplayer-status',{detail:{state:'SIGNED_OUT',online:0}}));return}
      localUserId=userId
      channel=sb.channel(CHANNEL,{config:{presence:{key:userId},broadcast:{self:false,ack:false}}})
      channelRef.current=channel
      channel
        .on('presence',{event:'sync'},()=>syncPresence(channel!.presenceState() as unknown as PresenceState))
        .on('presence',{event:'join'},()=>syncPresence(channel!.presenceState() as unknown as PresenceState))
        .on('presence',{event:'leave'},()=>syncPresence(channel!.presenceState() as unknown as PresenceState))
        .on('broadcast',{event:'player-motion'},(event:MotionEnvelope)=>{
          const p=event?.payload
          if(!p?.userId||p.userId===localUserId)return
          peers.set(p.userId,p)
          emitPlayers()
        })
        .on('broadcast',{event:'player-action'},(event:ActionEnvelope)=>{
          const action=event?.payload
          if(!action?.fromUserId||action.fromUserId===localUserId||action.toUserId!==localUserId)return
          window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-received',{detail:action}))
        })
        .subscribe(async status=>{
          if(cancelled)return
          if(status==='SUBSCRIBED'){
            setState('LIVE')
            const initial:PresencePayload={userId,x:0,z:54,heading:0,vehicle:false,vehicleType:'foot',updatedAt:new Date().toISOString()}
            latestRef.current=initial
            await channel!.track(initial)
            window.dispatchEvent(new CustomEvent('tryamm:streetverse-multiplayer-status',{detail:{state:'LIVE',online:1,transport:'broadcast+presence'}}))
          }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
            setState('ERROR')
            window.dispatchEvent(new CustomEvent('tryamm:streetverse-multiplayer-status',{detail:{state:'ERROR',online:0}}))
          }
        })
    }

    const onPosition=(event:Event)=>{
      const detail=(event as CustomEvent<PlayerPosition>).detail||{}
      const current=latestRef.current
      if(!current||!channelRef.current)return
      const now=performance.now()
      const x=clamp(Number(detail.x)),z=clamp(Number(detail.z))
      const dx=x-current.x,dz=z-current.z
      const heading=Math.hypot(dx,dz)>.03?Math.atan2(-dz,dx):current.heading
      const next:PresencePayload={...current,x,z,heading,vehicle:Boolean(detail.vehicle),vehicleType:String(detail.vehicleType||current.vehicleType||'foot'),rideId:detail.ride?.id,rideLabel:detail.ride?.label,updatedAt:new Date().toISOString()}
      latestRef.current=next
      if(now-lastBroadcastRef.current<80)return
      lastBroadcastRef.current=now
      sendMotion(next)
    }
    const onVehicle=(event:Event)=>{
      const detail=(event as CustomEvent<PlayerPosition>).detail||{}
      const current=latestRef.current
      if(!current||!channelRef.current)return
      const next:PresencePayload={...current,vehicle:Boolean((detail as any).entered),vehicleType:String(detail.vehicleType||((detail as any).entered?'car':'foot')),rideId:detail.ride?.id,rideLabel:detail.ride?.label,updatedAt:new Date().toISOString()}
      latestRef.current=next
      sendMotion(next)
      void channelRef.current.track(next)
    }
    const onPlayerAction=(event:Event)=>{
      const detail=(event as CustomEvent<{toUserId?:string;action?:PlayerAction['action']}>).detail||{}
      if(!localUserId||!detail.toUserId||!detail.action)return
      sendAction({fromUserId:localUserId,toUserId:String(detail.toUserId),action:detail.action,sentAt:new Date().toISOString()})
    }
    addEventListener('tryamm:streetverse-player-position',onPosition)
    addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
    addEventListener('tryamm:streetverse-player-action-send',onPlayerAction)
    void start()
    return()=>{
      cancelled=true
      removeEventListener('tryamm:streetverse-player-position',onPosition)
      removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
      removeEventListener('tryamm:streetverse-player-action-send',onPlayerAction)
      peers.clear()
      if(channel){void channel.untrack();void sb.removeChannel(channel)}
      channelRef.current=null
    }
  },[])

  return <div aria-live="polite" style={{position:'fixed',left:12,top:72,zIndex:16994,padding:'7px 10px',borderRadius:999,background:'#04131ddd',border:`1px solid ${state==='LIVE'?'#70ffb077':'#5f718077'}`,color:state==='LIVE'?'#bfffd8':'#bfd0d8',fontFamily:'monospace',fontSize:9,fontWeight:950,letterSpacing:.5,pointerEvents:'none'}}>
    MULTIPLAYER • {state==='LIVE'?`${online} ONLINE • LOW-LATENCY`:state==='SIGNED_OUT'?'SIGN IN TO JOIN':state}
  </div>
}
