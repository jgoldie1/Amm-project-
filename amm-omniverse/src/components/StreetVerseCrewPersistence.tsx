import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../services/supabaseClient'

type PlayerAction={fromUserId:string;toUserId:string;action:'wave'|'crew-invite'|'race-challenge';sentAt:string}
type SendAction={toUserId?:string;action?:string}
type Membership={user_id:string;crew_id:string;crew_name:string;leader_id:string;role:'leader'|'member';joined_at?:string;updated_at?:string}

export default function StreetVerseCrewPersistence(){
  const [userId,setUserId]=useState('')
  const [membership,setMembership]=useState<Membership|null>(null)
  const [invite,setInvite]=useState<PlayerAction|null>(null)
  const [status,setStatus]=useState<'SIGNED_OUT'|'LOADING'|'READY'|'ERROR'>('LOADING')

  useEffect(()=>{
    const sb=getSupabaseClient()
    if(!sb){setStatus('ERROR');return}
    let cancelled=false
    const load=async()=>{
      const {data:{session}}=await sb.auth.getSession()
      if(cancelled)return
      const uid=session?.user?.id||''
      setUserId(uid)
      if(!uid){setStatus('SIGNED_OUT');return}
      const {data,error}=await sb.from('streetverse_crew_membership').select('*').eq('user_id',uid).maybeSingle()
      if(cancelled)return
      if(error){setStatus('ERROR');return}
      setMembership((data as Membership|null)||null);setStatus('READY')
    }
    void load()
    return()=>{cancelled=true}
  },[])

  useEffect(()=>{
    if(!userId)return
    const sb=getSupabaseClient();if(!sb)return
    const onSend=async(event:Event)=>{
      const d=(event as CustomEvent<SendAction>).detail||{}
      if(d.action!=='crew-invite')return
      const row:Membership={user_id:userId,crew_id:userId,crew_name:'STREET CREW',leader_id:userId,role:'leader'}
      const {data,error}=await sb.from('streetverse_crew_membership').upsert(row,{onConflict:'user_id'}).select('*').single()
      if(!error&&data){setMembership(data as Membership);window.dispatchEvent(new CustomEvent('tryamm:streetverse-crew-updated',{detail:data}))}
    }
    const onReceive=(event:Event)=>{
      const d=(event as CustomEvent<PlayerAction>).detail
      if(d?.action==='crew-invite'&&d.toUserId===userId)setInvite(d)
    }
    addEventListener('tryamm:streetverse-player-action-send',onSend)
    addEventListener('tryamm:streetverse-player-action-received',onReceive)
    return()=>{removeEventListener('tryamm:streetverse-player-action-send',onSend);removeEventListener('tryamm:streetverse-player-action-received',onReceive)}
  },[userId])

  const accept=async()=>{
    if(!invite||!userId)return
    const sb=getSupabaseClient();if(!sb)return
    const row:Membership={user_id:userId,crew_id:invite.fromUserId,crew_name:'STREET CREW',leader_id:invite.fromUserId,role:'member'}
    const {data,error}=await sb.from('streetverse_crew_membership').upsert(row,{onConflict:'user_id'}).select('*').single()
    if(error){setStatus('ERROR');return}
    setMembership(data as Membership);setInvite(null);setStatus('READY')
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-crew-updated',{detail:data}))
  }
  const leave=async()=>{
    if(!userId)return
    const sb=getSupabaseClient();if(!sb)return
    const {error}=await sb.from('streetverse_crew_membership').delete().eq('user_id',userId)
    if(error){setStatus('ERROR');return}
    setMembership(null);setInvite(null);window.dispatchEvent(new CustomEvent('tryamm:streetverse-crew-updated',{detail:null}))
  }

  if(status==='SIGNED_OUT')return null
  return <div style={{position:'fixed',right:12,bottom:76,zIndex:16994,width:220,padding:'9px 10px',borderRadius:13,background:'rgba(6,13,24,.92)',border:'1px solid #7dffb566',color:'#effff5',fontFamily:'monospace',boxShadow:'0 10px 28px #0008'}}>
    <div style={{fontSize:8,fontWeight:950,letterSpacing:1.2,color:'#7dffb5'}}>CREW • {status}</div>
    {membership?<><div style={{fontSize:11,fontWeight:950,marginTop:4}}>{membership.crew_name}</div><div style={{fontSize:8,opacity:.8,marginTop:3}}>{membership.role.toUpperCase()} • CREW {membership.crew_id.slice(0,4).toUpperCase()}</div><button onClick={leave} style={btn}>LEAVE CREW</button></>:<div style={{fontSize:8,opacity:.76,marginTop:4}}>No saved crew yet. Invite a nearby player or accept an incoming crew invite.</div>}
    {invite&&<div style={{marginTop:8,padding:8,borderRadius:9,background:'#11241c',border:'1px solid #7dffb544'}}><div style={{fontSize:8}}>PLAYER {invite.fromUserId.slice(0,4).toUpperCase()} invited you.</div><button onClick={accept} style={btn}>ACCEPT CREW</button></div>}
  </div>
}
const btn:React.CSSProperties={marginTop:7,minHeight:30,padding:'0 9px',borderRadius:999,border:'1px solid #7dffb577',background:'#0f1d18',color:'#fff',fontSize:8,fontWeight:950,cursor:'pointer'}
