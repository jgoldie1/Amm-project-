import { getAccessToken } from './supabaseClient'
import { reportLiveHealth } from '../runtime/ProductionHealthMonitor'

const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''

export type ProtectedBreakReason='brb'|'bathroom'|'accessibility'|'meal'|'technical'|'emergency'|'backstage'|'ai-host'|'phone-call'|'background-interruption'

async function request(path:string,body?:unknown){
  if(!API) throw new Error('VITE_API_URL is not configured')
  const token=await getAccessToken()
  if(!token) throw new Error('Authentication required')
  const response=await fetch(`${API}${path}`,{
    method:body===undefined?'GET':'POST',
    headers:{Authorization:`Bearer ${token}`,...(body===undefined?{}:{'Content-Type':'application/json'})},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
  })
  const data=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(data?.error||'Protected LIVE request failed')
  return data
}

export const getLiveSession=(roomName:string)=>request(`/api/live/session/${encodeURIComponent(roomName)}`)
export const pauseLive=(roomName:string,reason:ProtectedBreakReason='brb',source='manual')=>request(`/api/live/session/${encodeURIComponent(roomName)}/pause`,{reason,source})
export const resumeLive=(roomName:string)=>request(`/api/live/session/${encodeURIComponent(roomName)}/resume`,{})
export const endLive=(roomName:string)=>request(`/api/live/session/${encodeURIComponent(roomName)}/end`,{})

export type ProtectedLiveMediaControls={
  muteMicrophone:()=>Promise<void>|void
  disableCamera:()=>Promise<void>|void
  restoreMicrophone:()=>Promise<void>|void
  restoreCamera:()=>Promise<void>|void
  showPrivacyShield?:(reason:ProtectedBreakReason)=>void
  hidePrivacyShield?:()=>void
  saveCheckpoint?:()=>Promise<void>|void
}

export function installCallSafeLive(roomName:string,controls:ProtectedLiveMediaControls){
  let protectedPause=false
  let interruptedAt=0
  let resumeTimer:number|undefined

  const enterProtectedPause=async(reason:ProtectedBreakReason,source:string)=>{
    if(protectedPause)return
    protectedPause=true
    interruptedAt=Date.now()
    controls.showPrivacyShield?.(reason)
    await Promise.resolve(controls.muteMicrophone()).catch(()=>{})
    await Promise.resolve(controls.disableCamera()).catch(()=>{})
    await Promise.resolve(controls.saveCheckpoint?.()).catch(()=>{})
    await pauseLive(roomName,reason,source).catch(error=>{
      reportLiveHealth(roomName,{kind:'protected-pause-api-error',severity:'error',message:String(error),metadata:{reason,source}})
    })
    reportLiveHealth(roomName,{kind:'protected-pause-entered',severity:'info',message:`Protected pause entered: ${reason}`,metadata:{reason,source}})
  }

  const leaveProtectedPause=async()=>{
    if(!protectedPause)return
    const response=await resumeLive(roomName).catch(error=>{
      reportLiveHealth(roomName,{kind:'protected-resume-api-error',severity:'error',message:String(error)})
      return null
    })
    const countdown=Math.max(0,Number(response?.resumeCountdownSeconds??3))
    if(resumeTimer)window.clearTimeout(resumeTimer)
    resumeTimer=window.setTimeout(async()=>{
      await Promise.resolve(controls.restoreCamera()).catch(()=>{})
      await Promise.resolve(controls.restoreMicrophone()).catch(()=>{})
      controls.hidePrivacyShield?.()
      protectedPause=false
      reportLiveHealth(roomName,{kind:'protected-pause-resumed',severity:'info',message:'LIVE resumed after protected pause',metadata:{interruptionMs:Date.now()-interruptedAt}})
    },countdown*1000)
  }

  const onVisibility=()=>{
    if(document.visibilityState==='hidden')void enterProtectedPause('background-interruption','visibility-change')
    else if(document.visibilityState==='visible')void leaveProtectedPause()
  }
  const onPageHide=()=>void enterProtectedPause('background-interruption','pagehide')
  const onOffline=()=>void enterProtectedPause('technical','network-offline')
  const onOnline=()=>{ if(document.visibilityState==='visible')void leaveProtectedPause() }

  document.addEventListener('visibilitychange',onVisibility)
  window.addEventListener('pagehide',onPageHide)
  window.addEventListener('offline',onOffline)
  window.addEventListener('online',onOnline)

  return {
    pause:(reason:ProtectedBreakReason='brb')=>enterProtectedPause(reason,'manual'),
    phoneCall:()=>enterProtectedPause('phone-call','native-call-interruption'),
    bathroom:()=>enterProtectedPause('bathroom','manual'),
    accessibility:()=>enterProtectedPause('accessibility','manual'),
    emergency:()=>enterProtectedPause('emergency','manual'),
    resume:leaveProtectedPause,
    destroy(){
      document.removeEventListener('visibilitychange',onVisibility)
      window.removeEventListener('pagehide',onPageHide)
      window.removeEventListener('offline',onOffline)
      window.removeEventListener('online',onOnline)
      if(resumeTimer)window.clearTimeout(resumeTimer)
    },
  }
}
