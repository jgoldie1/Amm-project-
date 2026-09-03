import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '../services/supabaseClient'

type MissionComplete={id?:string;label?:string;xp?:number;timeMs?:number;financialReward?:boolean}
type ProgressRow={xp?:number;level?:number;missions_completed?:number;last_mission_id?:string|null;progress_state?:Record<string,unknown>|null}

const XP_KEY='tryamm.streetverse.xp.v1'

export default function StreetVerseProgressSync(){
  const userId=useRef<string|null>(null)
  const recent=useRef(new Map<string,number>())

  useEffect(()=>{
    const sb=getSupabaseClient()
    if(!sb){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-progress-sync-status',{detail:{state:'LOCAL_ONLY',reason:'supabase-not-configured'}}))
      return
    }
    let alive=true

    const load=async(id:string|null)=>{
      userId.current=id
      if(!id){
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-progress-sync-status',{detail:{state:'LOCAL_ONLY',reason:'signed-out'}}))
        return
      }
      const {data,error}=await sb.from('streetverse_player_progress').select('xp,level,missions_completed,last_mission_id,progress_state').eq('user_id',id).maybeSingle()
      if(!alive)return
      if(error){
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-progress-sync-status',{detail:{state:'ERROR',message:error.message}}))
        return
      }
      const row=(data||{xp:0,level:1,missions_completed:0}) as ProgressRow
      const xp=Math.max(0,Number(row.xp||0))
      try{localStorage.setItem(XP_KEY,String(xp))}catch{}
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-progress-loaded',{detail:{xp,level:Number(row.level||1),missionsCompleted:Number(row.missions_completed||0),lastMissionId:row.last_mission_id||null,progressState:row.progress_state||{}}}))
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-progress-sync-status',{detail:{state:'SYNCED',xp,level:Number(row.level||1)}}))
    }

    sb.auth.getSession().then(({data})=>{if(alive)load(data.session?.user?.id||null)})
    const {data:authListener}=sb.auth.onAuthStateChange((_event,session)=>{if(alive)load(session?.user?.id||null)})

    const onMissionComplete=async(event:Event)=>{
      const d=(event as CustomEvent<MissionComplete>).detail||{}
      if(d.financialReward===true)return
      const id=String(d.id||'').trim(),xp=Math.round(Number(d.xp||0))
      if(!id||!Number.isFinite(xp)||xp<=0||xp>10000)return
      if(!userId.current)return
      const now=Date.now(),last=recent.current.get(id)||0
      if(now-last<1200)return
      recent.current.set(id,now)
      const progressState={lastMissionLabel:String(d.label||id),lastMissionTimeMs:Number.isFinite(Number(d.timeMs))?Number(d.timeMs):null,lastSyncedAt:new Date().toISOString()}
      const {data,error}=await sb.rpc('streetverse_award_gameplay_xp',{p_mission_id:id,p_xp:xp,p_progress_state:progressState})
      if(error){
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-progress-sync-status',{detail:{state:'ERROR',missionId:id,message:error.message}}))
        return
      }
      const row=((Array.isArray(data)?data[0]:data)||{}) as ProgressRow
      const totalXp=Math.max(0,Number(row.xp||0))
      try{localStorage.setItem(XP_KEY,String(totalXp))}catch{}
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-progress-synced',{detail:{missionId:id,earnedXp:xp,xp:totalXp,level:Number(row.level||1),missionsCompleted:Number(row.missions_completed||0),financialReward:false}}))
    }

    addEventListener('tryamm:streetverse-mission-complete',onMissionComplete)
    return()=>{
      alive=false
      removeEventListener('tryamm:streetverse-mission-complete',onMissionComplete)
      authListener.subscription.unsubscribe()
    }
  },[])

  return null
}
