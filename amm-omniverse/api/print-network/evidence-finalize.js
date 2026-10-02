import crypto from 'node:crypto'
import {createClient} from '@supabase/supabase-js'
import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'

const SUPABASE_URL=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||''
const SERVICE_ROLE=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||''
const BUCKET='print-network-evidence'
const MAX_BYTES=15*1024*1024
const TYPES=new Set(['front','back','left','right','top','bottom','packaging','shipping-label','dimension','weight','other'])

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
    const path=String(body.path||'').replace(/^\/+/, '')
    if(!TYPES.has(evidenceType))return json(res,400,{error:'invalid_evidence_type'})
    const prefix=`jobs/${jobId}/${operator.id}/${evidenceType}/`
    if(!path.startsWith(prefix))return json(res,400,{error:'invalid_evidence_path'})
    const jobs=await adminRest('print_network_jobs',{query:{id:`eq.${jobId}`,assigned_operator_id:`eq.${operator.id}`,limit:1}})
    const job=jobs?.[0]
    if(!job||!['printing','qa-submitted','qa-approved','packaged'].includes(job.status))return json(res,409,{error:'active_assigned_print_job_required'})

    const url=SUPABASE_URL(),serviceRole=SERVICE_ROLE()
    if(!url||!serviceRole)return json(res,503,{error:'print_evidence_storage_not_configured'})
    const supabase=createClient(url,serviceRole,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
    const {data,error}=await supabase.storage.from(BUCKET).download(path)
    if(error||!data)throw Object.assign(new Error(error?.message||'evidence_download_failed'),{status:502,code:'evidence_download_failed'})
    const bytes=Buffer.from(await data.arrayBuffer())
    if(!bytes.length||bytes.length>MAX_BYTES)return json(res,413,{error:'evidence_size_invalid',maxBytes:MAX_BYTES})
    const mimeType=String(data.type||body.mimeType||'')
    if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(mimeType))return json(res,400,{error:'invalid_evidence_mime'})
    const sha256=crypto.createHash('sha256').update(bytes).digest('hex')
    const rows=await adminRest('print_network_qa_evidence',{method:'POST',body:{
      job_id:job.id,operator_id:operator.id,evidence_type:evidenceType,storage_bucket:BUCKET,storage_path:path,
      mime_type:mimeType,file_size_bytes:bytes.length,sha256,note:String(body.note||'').slice(0,500)||null,review_status:'pending'
    }})
    const evidence=rows?.[0]
    if(!evidence)throw Object.assign(new Error('print_evidence_persist_failed'),{status:503,code:'print_evidence_persist_failed'})
    return json(res,201,{ok:true,schema:'tryamm.print-evidence.v1',evidence:{id:evidence.id,jobId:evidence.job_id,evidenceType:evidence.evidence_type,fileSizeBytes:evidence.file_size_bytes,sha256:evidence.sha256,reviewStatus:evidence.review_status},privateStorage:true})
  }catch(error){
    if(String(error?.message||'').includes('duplicate key'))return json(res,409,{error:'duplicate_print_evidence'})
    return json(res,error.status||500,{error:error.code||'print_evidence_finalize_failed',message:error.message})
  }
}
