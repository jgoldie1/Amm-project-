// Explicit leader-authorized Google Workspace writes. No background sync or email sending.
import {getSupabaseClient} from '../services/supabaseClient'
export const ministryScopes='https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.compose'
export async function ministryLeader(){
 const sb=getSupabaseClient();if(!sb)return false
 const {data,error}=await sb.auth.getUser()
 return !error && data.user?.app_metadata?.faithverse_adult_leader===true
}
export async function connectMinistryGoogle(){
 const sb=getSupabaseClient();if(!sb||!await ministryLeader())throw Error('Verified adult ministry leader required.')
 const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{scopes:ministryScopes,redirectTo:window.location.origin+window.location.pathname,queryParams:{prompt:'consent',access_type:'offline'}}})
 if(error)throw Error(error.message)
}
export async function writeMinistryGoogle(kind:'drive'|'docs'|'draft',title:string,body:string){
 const sb=getSupabaseClient();if(!sb||!await ministryLeader())throw Error('Verified adult ministry leader required.')
 const {data}=await sb.auth.getSession();const token=data.session?.provider_token
 if(!token)throw Error('Reconnect Google to grant Workspace access.')
 if(!body.trim()||body.length>30000)throw Error('Enter a nonempty draft of at most 30,000 characters.')
 const headers={Authorization:'Bearer '+token,'Content-Type':'application/json'}
 async function post(url:string,payload:unknown){const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(payload)});if(!r.ok)throw Error('Google request failed ('+r.status+'). Check consent and API configuration.');return r.json()}
 if(kind==='draft'){
 const bytes=new TextEncoder().encode('Subject: FaithVerse ministry draft\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n'+btoa(Array.from(new TextEncoder().encode(body),b=>String.fromCharCode(b)).join('')))
 const raw=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
 const d=await post('https://gmail.googleapis.com/gmail/v1/users/me/drafts',{message:{raw}});if(!d.id)throw Error('No draft ID returned.');return 'Gmail draft created; not sent.'
 }
 const f=await post('https://www.googleapis.com/drive/v3/files?fields=id',{name:title,mimeType:kind==='docs'?'application/vnd.google-apps.document':'text/plain'})
 if(!f.id)throw Error('No Drive file ID returned.')
 const id=encodeURIComponent(f.id)
 if(kind==='docs')await post('https://docs.googleapis.com/v1/documents/'+id+':batchUpdate',{requests:[{insertText:{location:{index:1},text:body}}]})
 else {const r=await fetch('https://www.googleapis.com/upload/drive/v3/files/'+id+'?uploadType=media',{method:'PATCH',headers:{Authorization:'Bearer '+token,'Content-Type':'text/plain; charset=UTF-8'},body});if(!r.ok)throw Error('File created but content upload failed; check Drive before retrying.')}
 return 'Saved to Google '+(kind==='docs'?'Docs':'Drive')+'.'
}

export async function diagnoseMinistryGoogle(){
 const sb=getSupabaseClient()
 if(!sb||!await ministryLeader())throw Error('Verified adult ministry leader required.')
 const {data}=await sb.auth.getSession()
 const token=data.session?.provider_token
 if(!token)throw Error('Google consent required. Reconnect Google Workspace.')
 const headers={Authorization:'Bearer '+token}
 const checks=await Promise.all([
 ['Drive','https://www.googleapis.com/drive/v3/files?pageSize=1&fields=nextPageToken'],
 ['Gmail drafts','https://gmail.googleapis.com/gmail/v1/users/me/drafts?maxResults=1&fields=nextPageToken'],
 ['Docs (nonexistent document probe)','https://docs.googleapis.com/v1/documents/faithverse-diagnostic-nonexistent']
 ].map(async ([service,url])=>{
 try{const r=await fetch(url,{headers,cache:'no-store'});return {service,http:r.status,result:r.ok?'READ_ACCESS_OK':service.startsWith('Docs')&&r.status===404?'REACHABLE_WRITE_UNVERIFIED':r.status===401?'RECONNECT_REQUIRED':r.status===403?'PERMISSION_OR_API_BLOCKED':'UNVERIFIED'}}
 catch{return {service,http:0,result:'NETWORK_ERROR'}}
 }))
 return {checkedAt:new Date().toISOString(),checks,writeVerified:false,backgroundSyncVerified:false}
}
