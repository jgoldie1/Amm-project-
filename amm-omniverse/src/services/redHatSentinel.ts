import {getAccessToken} from './supabaseClient'

const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''

async function authed(path:string){
  const token=await getAccessToken()
  if(!token)throw new Error('Sign in is required to view Red Hat Sentinel.')
  const response=await fetch(`${API}${path}`,{
    headers:{Authorization:`Bearer ${token}`},
    cache:'no-store',
  })
  const body=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(body?.error||`Red Hat Sentinel request failed (${response.status})`)
  return body
}

export type RedHatSummary={
  windowHours:number
  events:number
  highRisk:number
  canaryContacts:number
  signals:Record<string,number>
  userAgentClasses:Record<string,number>
  note:string
}

export async function getRedHatStatus(){
  return authed('/api/security/red-hat/status')
}

export async function getRedHatSummary(){
  return authed('/api/security/red-hat/summary') as Promise<RedHatSummary>
}
