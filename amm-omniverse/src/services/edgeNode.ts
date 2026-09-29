import {getAccessToken} from './supabaseClient'
import type {EdgeCapabilitySnapshot} from '../runtime/TryammPocketEdgeRuntime'
import {getTryammEdgeInstallId} from '../runtime/TryammPocketEdgeRuntime'

const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  if(!API)throw new Error('VITE_API_URL is not configured')
  const token=await getAccessToken()
  if(!token)throw new Error('Authentication required')
  const headers=new Headers(init.headers||{})
  headers.set('Authorization',`Bearer ${token}`)
  headers.set('Content-Type','application/json')
  const response=await fetch(`${API}${path}`,{...init,headers,cache:'no-store'})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw Object.assign(new Error(data?.error||`Edge Node request failed (${response.status})`),{status:response.status,data})
  return data as T
}

export const registerPocketEdgeNode=(capabilities:EdgeCapabilitySnapshot)=>request('/api/edge-node/register',{method:'POST',body:JSON.stringify({installId:getTryammEdgeInstallId(),capabilities})})
export const heartbeatPocketEdgeNode=(nodeId:string,capabilities:EdgeCapabilitySnapshot)=>request('/api/edge-node/heartbeat',{method:'POST',body:JSON.stringify({nodeId,capabilities})})
export const leasePocketEdgeJobs=(nodeId:string,capabilities:EdgeCapabilitySnapshot,paidGrid?:{paidGridOptIn:boolean;allowedPaidWork:string[];maxParallelPaidJobs:number})=>request('/api/edge-node/lease',{method:'POST',body:JSON.stringify({nodeId,capabilities,paidGrid})})
export const completePocketEdgeJob=(nodeId:string,jobId:string,resultRef?:string)=>request(`/api/edge-node/jobs/${encodeURIComponent(jobId)}/complete`,{method:'POST',body:JSON.stringify({nodeId,resultRef})})
export const getPocketEdgeEarnings=()=>request('/api/edge-node/earnings',{method:'GET'})