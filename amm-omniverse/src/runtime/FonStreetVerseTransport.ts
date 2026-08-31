import type { RealtimeChannel } from '@supabase/supabase-js'
import { getAccessToken, getAuthenticatedUserId, getSupabaseClient } from '../services/supabaseClient'

export type FonControllerPacket={
  version:1
  senderId:string
  seq:number
  sentAt:number
  x:number
  y:number
  buttons:Record<string,boolean>
}

export type FonTransportStatus={
  connected:boolean
  role:'controller'|'receiver'|null
  sessionId:string|null
  userId:string|null
  latencyMs:number
  reason?:string
}

const now=()=>typeof performance!=='undefined'?performance.now():Date.now()
const clamp=(v:number)=>Math.max(-1,Math.min(1,Number.isFinite(v)?v:0))

class FonStreetVerseTransport{
  private channel:RealtimeChannel|null=null
  private role:'controller'|'receiver'|null=null
  private sessionId:string|null=null
  private userId:string|null=null
  private senderId='fon-'+Math.random().toString(36).slice(2,10)
  private seq=0
  private lastRxSeq=new Map<string,number>()
  private latencyMs=0
  private heartbeat:number|undefined

  private emitStatus(extra:Partial<FonTransportStatus>={}){
    if(typeof window==='undefined')return
    const detail:FonTransportStatus={
      connected:Boolean(this.channel),role:this.role,sessionId:this.sessionId,userId:this.userId,latencyMs:Math.round(this.latencyMs),...extra
    }
    window.dispatchEvent(new CustomEvent('tryamm:fon-controller-status',{detail}))
  }

  async connect(sessionId:string,role:'controller'|'receiver'){
    await this.disconnect('reconnect')
    const sb=getSupabaseClient()
    const [token,userId]=await Promise.all([getAccessToken(),getAuthenticatedUserId()])
    if(!sb||!token||!userId)throw new Error('Holo FON pairing requires configured Supabase and an authenticated user.')
    const cleanSession=sessionId.trim().replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64)
    if(cleanSession.length<6)throw new Error('Pairing session must be at least 6 characters.')

    this.role=role
    this.sessionId=cleanSession
    this.userId=userId
    sb.realtime.setAuth(token)
    const topic=`fon-streetverse:${userId}:${cleanSession}`
    const channel=sb.channel(topic,{config:{private:true,broadcast:{ack:true,self:false}}})
    this.channel=channel

    channel.on('broadcast',{event:'controller-input'},({payload})=>{
      if(this.role!=='receiver')return
      const p=payload as Partial<FonControllerPacket>
      if(p.version!==1||typeof p.senderId!=='string'||typeof p.seq!=='number'||typeof p.sentAt!=='number')return
      if(typeof p.x!=='number'||typeof p.y!=='number'||!p.buttons||typeof p.buttons!=='object')return
      const previous=this.lastRxSeq.get(p.senderId)??0
      if(p.seq<=previous)return
      this.lastRxSeq.set(p.senderId,p.seq)
      const latency=Math.max(0,now()-p.sentAt)
      this.latencyMs=this.latencyMs?this.latencyMs*.82+latency*.18:latency
      if(latency>1500)return
      window.dispatchEvent(new CustomEvent('tryamm:remote-controller-input',{detail:{
        x:clamp(p.x),y:clamp(p.y),buttons:p.buttons,seq:p.seq,sentAt:p.sentAt,senderId:p.senderId,transport:'supabase-realtime'
      }}))
      this.emitStatus({connected:true})
    })

    await new Promise<void>((resolve,reject)=>{
      let settled=false
      const timeout=window.setTimeout(()=>{
        if(settled)return
        settled=true
        reject(new Error('Holo FON pairing timed out.'))
      },8000)
      channel.subscribe((status)=>{
        if(settled)return
        if(status==='SUBSCRIBED'){
          settled=true
          window.clearTimeout(timeout)
          resolve()
        }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
          settled=true
          window.clearTimeout(timeout)
          reject(new Error(`Holo FON realtime channel ${status.toLowerCase()}.`))
        }
      })
    })

    this.heartbeat=window.setInterval(()=>this.emitStatus({connected:true}),2500)
    this.emitStatus({connected:true})
  }

  async send(input:{x?:number;y?:number;buttons?:Record<string,boolean>}){
    if(!this.channel||this.role!=='controller')throw new Error('Holo FON controller is not paired.')
    const packet:FonControllerPacket={
      version:1,senderId:this.senderId,seq:++this.seq,sentAt:now(),x:clamp(Number(input.x)||0),y:clamp(Number(input.y)||0),buttons:input.buttons??{}
    }
    const result=await this.channel.send({type:'broadcast',event:'controller-input',payload:packet})
    if(result!=='ok')throw new Error(`Holo FON input send failed: ${String(result)}`)
  }

  async disconnect(reason='manual'){
    if(this.heartbeat!==undefined&&typeof window!=='undefined')window.clearInterval(this.heartbeat)
    this.heartbeat=undefined
    const current=this.channel
    this.channel=null
    if(current)await current.unsubscribe()
    this.lastRxSeq.clear()
    this.seq=0
    this.emitStatus({connected:false,reason})
    this.role=null
    this.sessionId=null
    this.userId=null
  }

  get status():FonTransportStatus{
    return{connected:Boolean(this.channel),role:this.role,sessionId:this.sessionId,userId:this.userId,latencyMs:Math.round(this.latencyMs)}
  }
}

let singleton:FonStreetVerseTransport|null=null
export function getFonStreetVerseTransport(){
  if(!singleton)singleton=new FonStreetVerseTransport()
  return singleton
}

export function installFonStreetVerseTransport(){
  if(typeof window==='undefined')return null
  const transport=getFonStreetVerseTransport()
  ;(window as any).__fonStreetVerse={
    pairController:(sessionId:string)=>transport.connect(sessionId,'controller'),
    pairReceiver:(sessionId:string)=>transport.connect(sessionId,'receiver'),
    send:(input:{x?:number;y?:number;buttons?:Record<string,boolean>})=>transport.send(input),
    disconnect:()=>transport.disconnect(),
    status:()=>transport.status,
    note:'Cross-device Holo FON transport over an authenticated Supabase private Realtime channel. Realtime authorization policies must allow the signed-in user to join the private topic.'
  }
  return transport
}
