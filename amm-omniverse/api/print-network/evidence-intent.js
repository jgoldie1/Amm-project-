import crypto from 'node:crypto'
import {createClient} from '@supabase/supabase-js'
import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'

const SUPABASE_URL=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||''
const SERVICE_ROLE=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||''
const BUCKET='print-network-evidence'
const MAX_BYTES=15*1024*1024
const TYPES=new Set(['front','back','left','right','top','bottom','packaging','shipping-label','dimension','weight','other'])
const MIME=new Set(['image/jpeg','image/png','image/webp','application/pdf'])

async function operatorFor(userId){
  const rows=await adminRest('print_network_operators',{query:{user_id:`eq.${userId}`,limit:1}})
  return rows?.[0]||null
}

export default async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST')
    return json(res,405,{error:'method_not_allowed'})
  }
  const user=await requireUser(req,res)
  if(!user)return
  try{
    const operator=await operatorFor(user.id)
    if(!operator||operator.certification_status!=='certified')return json(res,403,{error:'certified_print_operator_required'})
    const body=req.body&&typeof req.body==='object'?req.body:{}
    const jobId=String(body.jobId||'')
    const evidenceType=String(body.evidenceType||'')
    const mimeType=String(body.mimeType||'')
    const size=Math.max(0,Number(body.size||0))
    if(!TYPES.has(evidenceType))return json(res,400,{error:'invalid_evidence_type'})
    if(!MIME.has(mimeType))return json(res,400,{error:'invalid_evidence_mime'})
    if(!size||size>MAX_BYTES)return json(res,413,{error:'evidence_size_invalid',maxBytes:MAX_BYTES})
    const jobs=await adminRest('print_network_jobs',{query:{id:`eq.${jobId}`,assigned_operator_id:`eq.${operator.id}`,limit:1}})
    const job=jobs?.[0]
    if(!job||!['printing','qa-submitted','qa-approved','packaged'].includes(job.status))return json(res,409,{error:'active_assigned_print_job_required'})

    const url=SUPABASE_URL(),serviceRole=SERVICE_ROLE()
    if(!url||!serviceRole)return json(res,503,{error:'print_evidence_storage_not_configured'})
    const extension=mimeType==='image/jpeg'?'jpg':mimeType==='image/png'?'png':mimeType==='image/webp'?'webp':'pdf'
    const uploadId=crypto.randomUUID()
    const path=`jobs/${job.id}/${operator.id}/${evidenceType}/${uploadId}.${extension}`
    const supabase=createClient(url,serviceRole,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
    const {data,error}=await supabase.storage.from(BUCKET).createSignedUploadUrl(path,{upsert:false})
    if(error||!data?.token)throw Object.assign(new Error(error?.message||'signed_upload_create_failed'),{status:502,code:'signed_upload_create_failed'})
    return json(res,200,{ok:true,schema:'tryamm.print-evidence-upload.v1',bucket:BUCKET,path,token:data.token,signedUrl:data.signedUrl||null,maxBytes:MAX_BYTES,evidenceType,keyExposed:false})
  }catch(error){
    return json(res,error.status||500,{error:error.code||'print_evidence_intent_failed',message:error.message})
  }
}
