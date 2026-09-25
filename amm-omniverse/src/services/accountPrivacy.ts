import {getAccessToken} from './supabaseClient'

const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''
export const ACCOUNT_DELETE_CONFIRM='DELETE MY TRYAMM ACCOUNT'

async function authed(path:string,init:RequestInit={}){
  const token=await getAccessToken()
  if(!token)throw new Error('Sign in is required to manage or delete your account.')
  const headers=new Headers(init.headers||{})
  headers.set('Authorization',`Bearer ${token}`)
  headers.set('Content-Type','application/json')
  const response=await fetch(`${API}${path}`,{...init,headers,cache:'no-store'})
  const body=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(body?.error||`Privacy request failed (${response.status})`)
  return body
}

export async function getAccountDeletionStatus(){
  return authed('/api/privacy/delete-request') as Promise<{request:null|{id:string;status:string;requestedAt:string}}>
}

export async function requestAccountDeletion(){
  return authed('/api/privacy/delete-request',{method:'POST',body:JSON.stringify({confirm:ACCOUNT_DELETE_CONFIRM,source:'tryamm-account-privacy-center'})}) as Promise<{request:{id:string;status:string;requestedAt:string};existing?:boolean;message?:string}>
}
