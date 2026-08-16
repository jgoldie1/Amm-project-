import { getAccessToken } from './supabaseClient'

const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''

async function authed<T=any>(path:string,init:RequestInit={}):Promise<T>{
  if(!API) throw new Error('VITE_API_URL is not configured')
  const token=await getAccessToken()
  if(!token) throw new Error('Authentication required')
  const headers=new Headers(init.headers||{})
  headers.set('Authorization',`Bearer ${token}`)
  if(init.body) headers.set('Content-Type','application/json')
  const response=await fetch(`${API}${path}`,{...init,headers})
  const data=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(data?.error||`Workforce request failed (${response.status})`)
  return data as T
}

export const getWorkforceStatus=()=>authed('/api/workforce/status')
export const getApprovedScripts=(campaign='')=>authed(`/api/workforce/scripts${campaign?`?campaign=${encodeURIComponent(campaign)}`:''}`)
export const startWorkforceSession=(campaignKey='')=>authed('/api/workforce/sessions/start',{method:'POST',body:JSON.stringify({campaignKey})})
export const setWorkforceSessionStatus=(id:string,status:string)=>authed(`/api/workforce/sessions/${encodeURIComponent(id)}/status`,{method:'POST',body:JSON.stringify({status})})
export const checkDoNotContact=(contact:string)=>authed('/api/workforce/suppression/check',{method:'POST',body:JSON.stringify({contact})})
export const addDoNotContact=(contact:string,reason='do-not-contact')=>authed('/api/workforce/suppression',{method:'POST',body:JSON.stringify({contact,reason})})
export const logInteraction=(input:Record<string,unknown>)=>authed('/api/workforce/interactions',{method:'POST',body:JSON.stringify(input)})
export const escalateInteraction=(id:string,input:{type:string;priority:string;reason:string})=>authed(`/api/workforce/interactions/${encodeURIComponent(id)}/escalate`,{method:'POST',body:JSON.stringify(input)})
export const getRepoWorkstation=()=>authed('/api/workforce/workstation/repo')
export const getRepoFile=(path:string)=>authed(`/api/workforce/workstation/file?path=${encodeURIComponent(path)}`)
export const askStubbsAboutRepoFile=(path:string,question:string)=>authed('/api/workforce/workstation/ai-review',{method:'POST',body:JSON.stringify({path,question})})

export const getMiddleverseStatus=()=>authed('/api/middleverse/status')
export const getMiddleverseHandoffs=()=>authed('/api/middleverse/handoffs')
export const createMiddleverseHandoff=(input:{routeKey:string;taskSummary:string;sourceContext?:Record<string,unknown>;riskBand?:'green'|'yellow'|'orange'|'red';targetRef?:string})=>authed('/api/middleverse/handoffs',{method:'POST',body:JSON.stringify(input)})
export const updateMiddleverseHandoff=(id:string,status:'accepted'|'in_progress'|'completed'|'blocked'|'cancelled',result?:Record<string,unknown>)=>authed(`/api/middleverse/handoffs/${encodeURIComponent(id)}/status`,{method:'POST',body:JSON.stringify({status,result})})
