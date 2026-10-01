import crypto from 'node:crypto'

const clean=(v,n=4000)=>String(v??'').trim().slice(0,n)
const base=()=>String(process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||'').trim().replace(/\/$/,'')
const secret=()=>String(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||'').trim()

function canonicalizeUrl(raw){
  const u=new URL(raw)
  u.hash=''
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'])u.searchParams.delete(key)
  u.hostname=u.hostname.toLowerCase()
  if((u.protocol==='https:'&&u.port==='443')||(u.protocol==='http:'&&u.port==='80'))u.port=''
  return u.toString()
}
const sha256=value=>crypto.createHash('sha256').update(String(value||'')).digest('hex')
const configured=()=>Boolean(base()&&secret())

async function rest(path,options={}){
  if(!configured())throw new Error('quantum_time_store_not_configured')
  const key=secret()
  const r=await fetch(base()+'/rest/v1/'+path,{
    ...options,
    headers:{
      apikey:key,
      authorization:'Bearer '+key,
      'content-type':'application/json',
      accept:'application/json',
      ...(options.headers||{})
    }
  })
  const text=await r.text();let data
  try{data=text?JSON.parse(text):null}catch{data=null}
  if(!r.ok)throw new Error(data?.message||data?.error||'quantum_time_store_'+r.status)
  return data
}

async function previousVersion(canonicalUrl,capturedAt){
  const q=new URLSearchParams({
    select:'id,captured_at,content_hash',
    canonical_url:'eq.'+canonicalUrl,
    captured_at:'lt.'+capturedAt,
    order:'captured_at.desc',
    limit:'1'
  })
  const rows=await rest('quantum_time_documents?'+q)
  return Array.isArray(rows)?rows[0]||null:null
}

export async function persistQuantumTimeDocument(input={}){
  if(!configured())return {configured:false,saved:false}
  const sourceUrl=clean(input.sourceUrl||input.url,1600)
  if(!/^https?:\/\//i.test(sourceUrl))return {configured:true,saved:false,error:'invalid_source_url'}
  const canonicalUrl=canonicalizeUrl(input.canonicalUrl||sourceUrl)
  const capturedAt=clean(input.capturedAt,80)
  if(!capturedAt)return {configured:true,saved:false,error:'captured_at_required'}
  const sourceType=clean(input.sourceType||'manual',40)
  if(!['internet-archive','common-crawl','current','tryamm','manual'].includes(sourceType))return {configured:true,saved:false,error:'invalid_source_type'}
  const excerpt=clean(input.contentExcerpt||input.textSample,8000)
  const digest=clean(input.digest,500)
  const contentHash=sha256([canonicalUrl,sourceType,capturedAt,digest,excerpt].join('|'))
  const previous=await previousVersion(canonicalUrl,capturedAt).catch(()=>null)
  const row={
    canonical_url:canonicalUrl,
    source_url:sourceUrl,
    source_type:sourceType,
    captured_at:capturedAt,
    archive_timestamp:clean(input.archiveTimestamp,30)||null,
    title:clean(input.title,500)||null,
    description:clean(input.description,1200)||null,
    content_excerpt:excerpt,
    content_hash:contentHash,
    business_name:clean(input.businessName,300)||(()=>{try{return new URL(canonicalUrl).hostname}catch{return''}})()||null,
    ad_signals:Array.isArray(input.adSignals)?input.adSignals.slice(0,24):[],
    provenance:{...(input.provenance&&typeof input.provenance==='object'?input.provenance:{}),providerDigest:digest||null},
    verification_status:clean(input.verificationStatus||'source-capture',80),
    supersedes:previous?.id||null,
    updated_at:new Date().toISOString()
  }
  const q=new URLSearchParams({on_conflict:'canonical_url,source_type,captured_at'})
  const rows=await rest('quantum_time_documents?'+q,{
    method:'POST',
    headers:{Prefer:'resolution=merge-duplicates,return=representation'},
    body:JSON.stringify(row)
  })
  return {configured:true,saved:true,row:Array.isArray(rows)?rows[0]||null:rows,previous}
}

export async function readQuantumTimeVersions(url,limit=20){
  if(!configured())return {configured:false,rows:[]}
  const canonicalUrl=canonicalizeUrl(url)
  const q=new URLSearchParams({
    select:'id,canonical_url,source_url,source_type,captured_at,archive_timestamp,title,description,content_excerpt,content_hash,business_name,ad_signals,provenance,verification_status,supersedes',
    canonical_url:'eq.'+canonicalUrl,
    order:'captured_at.desc',
    limit:String(Math.min(Math.max(Number(limit)||20,1),100))
  })
  const rows=await rest('quantum_time_documents?'+q)
  return {configured:true,rows:Array.isArray(rows)?rows:[]}
}
