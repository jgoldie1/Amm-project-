import { getAccessToken } from '../services/supabaseClient'

type MissionCompleteDetail={
  id?:string
  missionId?:string
  label?:string
  source?:string
  visited?:string[]
  total?:number
  vehicle?:boolean
  mobileSafeMode?:boolean
  htmlCity?:boolean
}

const CLIENT_MISSION_ID='district-01-mobile-safe'
const PROGRAM_ID='streetverse_first_drop'
let installed=false
let inFlight=false

function apiBase(){
  const configured=String((import.meta as any).env?.VITE_API_URL||'').replace(/\/$/,'')
  return configured
}

function emitStatus(detail:Record<string,unknown>){
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-reward-status',{detail}))
}

function toast(message:string){
  window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message}}))
}

async function postJson(path:string,token:string,body:unknown){
  const response=await fetch(`${apiBase()}${path}`,{
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify(body),
  })
  const data=await response.json().catch(()=>({}))
  if(!response.ok){
    const error=new Error(String(data?.error||`Request failed (${response.status})`)) as Error&{code?:string;status?:number}
    error.code=String(data?.code||'')
    error.status=response.status
    throw error
  }
  return data
}

async function settleMission(detail:MissionCompleteDetail){
  if(inFlight)return
  inFlight=true
  try{
    const token=await getAccessToken()
    if(!token){
      emitStatus({status:'SIGN_IN_REQUIRED',missionId:CLIENT_MISSION_ID,serverDetermined:true})
      toast('District complete ✓ Sign in to claim the verified XP + Holo Credit reward.')
      return
    }

    emitStatus({status:'VERIFYING_MISSION',missionId:CLIENT_MISSION_ID,serverDetermined:true})
    const completion=await postJson('/api/get-paid-to-play/streetverse/complete',token,{
      missionId:detail.id||detail.missionId,
      source:detail.source,
      visited:detail.visited,
      total:detail.total,
      vehicle:detail.vehicle,
      mobileSafeMode:detail.mobileSafeMode,
      htmlCity:detail.htmlCity,
    })

    const missionRunId=String(completion?.missionRun?.id||'')
    if(!missionRunId)throw new Error('Server did not return an authoritative mission run')

    emitStatus({status:'CLAIMING_REWARD',missionRunId,programId:PROGRAM_ID,serverDetermined:true})
    const reward=await postJson('/api/get-paid-to-play/claim',token,{
      programId:PROGRAM_ID,
      game:'streetverse',
      evidence:{missionRunId},
    })

    const authoritative={
      status:reward?.applied===false?'ALREADY_VERIFIED':'VERIFIED',
      missionRunId,
      programId:PROGRAM_ID,
      claim:reward?.claim||null,
      playerState:reward?.playerState||null,
      serverDetermined:true,
    }
    emitStatus(authoritative)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-authoritative-reward',{detail:authoritative}))
    const xp=Number(reward?.claim?.xp??reward?.claim?.xp_awarded??0)
    const credits=Number(reward?.claim?.holoCredits??reward?.claim?.holo_credits_awarded??0)
    toast(reward?.applied===false
      ? 'StreetVerse reward already verified ✓'
      : `Verified reward ✓ +${xp} XP • +${credits} Holo Credits`)
  }catch(error){
    const failure=error as Error&{code?:string;status?:number}
    emitStatus({status:'ERROR',missionId:CLIENT_MISSION_ID,code:failure.code||'',httpStatus:failure.status||0,message:failure.message,serverDetermined:true})
    toast(`Mission saved locally • verified reward pending: ${failure.message}`)
  }finally{
    inFlight=false
  }
}

export function installStreetVerseMissionLedgerBridge(){
  if(installed)return
  installed=true
  window.addEventListener('tryamm:streetverse-mission-complete',event=>{
    const detail=(event as CustomEvent<MissionCompleteDetail>).detail||{}
    const missionId=detail.id||detail.missionId||''
    if(missionId!==CLIENT_MISSION_ID)return
    void settleMission(detail)
  })
}
