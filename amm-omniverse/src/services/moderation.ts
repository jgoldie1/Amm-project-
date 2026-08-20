import { getAccessToken } from './supabaseClient'

// Empty API base intentionally targets /api on the current Vercel origin.
const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''

export type ModerationTarget='user'|'live'|'reel'|'post'|'comment'|'dm'|'game'|'marketplace'|'ride'|'delivery'|'business'|'other'
export type ModerationReason='harassment'|'hate'|'threat'|'sexual-content'|'minor-safety'|'violence'|'self-harm'|'scam-fraud'|'impersonation'|'spam'|'copyright'|'privacy'|'unsafe-driving'|'wrong-driver-vehicle'|'payment-abuse'|'cheating'|'misinformation'|'other'

export type SubmitReportInput={
  targetType:ModerationTarget
  targetId:string
  reportedUserId?:string|null
  reason:ModerationReason
  details?:string
  contentId?:string
  roomName?:string
  messageIds?:string[]
  mediaRefs?:string[]
  context?:Record<string,unknown>
}

async function authed(path:string,init:RequestInit={}){
  const token=await getAccessToken()
  if(!token) throw new Error('Authentication required')
  const response=await fetch(`${API}${path}`,{
    ...init,
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(init.headers||{})},
  })
  const data=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(data?.error||'Moderation request failed')
  return data
}

export function submitMisconductReport(input:SubmitReportInput){return authed('/api/moderation/report',{method:'POST',body:JSON.stringify(input)})}
export function getMyReports(){return authed('/api/moderation/my-reports')}
export function appealModerationDecision(reportId:string,statement:string,evidence:Record<string,unknown>={}){return authed('/api/moderation/appeal',{method:'POST',body:JSON.stringify({reportId,statement,evidence})})}
function relationshipAction(action:'block'|'unblock'|'mute'|'unmute',userId:string,reason?:string){return authed(`/api/moderation/${action}/${encodeURIComponent(userId)}`,{method:'POST',body:JSON.stringify({reason,source:'user-action'})})}
export const blockUser=(userId:string,reason?:string)=>relationshipAction('block',userId,reason)
export const unblockUser=(userId:string)=>relationshipAction('unblock',userId)
export const muteUser=(userId:string,reason?:string)=>relationshipAction('mute',userId,reason)
export const unmuteUser=(userId:string)=>relationshipAction('unmute',userId)
export const getSafetyRelationships=()=>authed('/api/moderation/relationships')
export const getSafetyRelationship=(userId:string)=>authed(`/api/moderation/relationship/${encodeURIComponent(userId)}`)

export const REPORT_REASON_LABELS:Record<ModerationReason,string>={
  harassment:'Harassment or bullying',hate:'Hate or hateful conduct',threat:'Threat or intimidation',
  'sexual-content':'Sexual content or misconduct','minor-safety':'Minor/child safety',violence:'Violence or dangerous conduct',
  'self-harm':'Self-harm concern','scam-fraud':'Scam or fraud',impersonation:'Impersonation',spam:'Spam',copyright:'Copyright/IP',
  privacy:'Privacy violation','unsafe-driving':'Unsafe driving','wrong-driver-vehicle':'Wrong driver or vehicle','payment-abuse':'Payment abuse',
  cheating:'Cheating/exploit',misinformation:'Misleading or false information',other:'Other misconduct',
}
