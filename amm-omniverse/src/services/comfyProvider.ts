export type ComfyJobKind='image'|'video'|'audio'|'3d'
export type ComfyJob={id:string;kind:ComfyJobKind;prompt:string;workflow?:string;status:'queued'|'gated'|'submitted';provider:'comfy';createdAt:number}
const endpoint=()=>String((import.meta as any).env?.VITE_COMFY_ENDPOINT||'').trim().replace(/\/$/,'')
const token=()=>String((import.meta as any).env?.VITE_COMFY_TOKEN||'').trim()
export async function submitComfyJob(input:{kind:ComfyJobKind;prompt:string;workflow?:string}){
 const job:ComfyJob={id:`comfy_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,kind:input.kind,prompt:input.prompt.trim(),workflow:input.workflow,status:endpoint()?'queued':'gated',provider:'comfy',createdAt:Date.now()}
 if(!job.prompt)throw new Error('Comfy prompt is required')
 if(!endpoint())return {...job,status:'gated' as const}
 const r=await fetch(`${endpoint()}/prompt`,{method:'POST',headers:{'content-type':'application/json',...(token()?{authorization:`Bearer ${token()}`}:{})},body:JSON.stringify({prompt:job.prompt,kind:job.kind,workflow:job.workflow||null,client_id:job.id})})
 if(!r.ok)throw new Error(`Comfy provider ${r.status}`)
 return {...job,status:'submitted' as const}
}
export function getComfyHealth(){return {configured:Boolean(endpoint()),endpoint:endpoint()||null,provider:'comfy' as const}}
