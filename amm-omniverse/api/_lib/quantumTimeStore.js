import crypto from 'node:crypto'
import {adminReady,adminRest} from './supabase-admin.js'

const clean=(v,n=4000)=>String(v??'').trim().slice(0,n)
const sha256=value=>crypto.createHash('sha256').update(String(value||'')).digest('hex')

function canonicalizeUrl(raw){
  const u=new URL(raw)
  u.hash=''
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'])u.searchParams.delete(key)
  u.hostname=u.hostname.toLowerCase()
  if((u.protocol==='https:'&&u.port==='443')||(u.protocol==='http:'&&u.port==='80'))u.port=''
  return u.toString()
}


async function previousVersion(canonicalUrl,capturedAt){
  const q=new URLSearchParams({
    select:'id,captured_at,content_hash',
    canonical_url:'eq.'+canonicalUrl,
    captured_at:'lt.'+capturedAt,
    order:'captured_at.desc',
    limit:'1'
  })
  const rows=await adminRest('quantum_time_documents',{query:Object.fromEntries(q.entries())})
  return Array.isArray(rows)?rows[0]||null:null
}

export async function persistQuantumTimeDocument(input={}){
  if(!adminReady())return {configured:false,saved:false}
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
  const rows=await adminRest('quantum_time_documents',{
    method:'POST',
    query:Object.fromEntries(q.entries()),
    body:row
  })
  return {configured:true,saved:true,row:Array.isArray(rows)?rows[0]||null:rows,previous}
}

export async function readQuantumTimeVersions(url,limit=20){
  if(!adminReady())return {configured:false,rows:[]}
  const canonicalUrl=canonicalizeUrl(url)
  const q=new URLSearchParams({
    select:'id,canonical_url,source_url,source_type,captured_at,archive_timestamp,title,description,content_excerpt,content_hash,business_name,ad_signals,provenance,verification_status,supersedes',
    canonical_url:'eq.'+canonicalUrl,
    order:'captured_at.desc',
    limit:String(Math.min(Math.max(Number(limit)||20,1),100))
  })
  const rows=await adminRest('quantum_time_documents?'+q)
  return {configured:true,rows:Array.isArray(rows)?rows:[]}
}


export async function persistQuantumTimeDocuments(items=[]){
  if(!adminReady())return {configured:false,saved:0}
  const rows=[]
  for(const input of Array.isArray(items)?items.slice(0,50):[]){
    const sourceUrl=clean(input.sourceUrl||input.url,1600)
    if(!/^https?:\/\//i.test(sourceUrl)||!input.capturedAt)continue
    let canonicalUrl
    try{canonicalUrl=canonicalizeUrl(input.canonicalUrl||sourceUrl)}catch{continue}
    const sourceType=clean(input.sourceType||input.provider||'manual',40)
    if(!['internet-archive','common-crawl','current','tryamm','manual'].includes(sourceType))continue
    const excerpt=clean(input.contentExcerpt||input.textSample,8000)
    const digest=clean(input.digest,500)
    rows.push({
      canonical_url:canonicalUrl,
      source_url:sourceUrl,
      source_type:sourceType,
      captured_at:clean(input.capturedAt,80),
      archive_timestamp:clean(input.archiveTimestamp,30)||null,
      title:clean(input.title,500)||null,
      description:clean(input.description,1200)||null,
      content_excerpt:excerpt,
      content_hash:sha256([canonicalUrl,sourceType,input.capturedAt,digest,excerpt].join('|')),
      business_name:clean(input.businessName,300)||(()=>{try{return new URL(canonicalUrl).hostname}catch{return''}})()||null,
      ad_signals:Array.isArray(input.adSignals)?input.adSignals.slice(0,24):[],
      provenance:{...(input.provenance&&typeof input.provenance==='object'?input.provenance:{}),providerDigest:digest||null},
      verification_status:clean(input.verificationStatus||'source-capture',80),
      updated_at:new Date().toISOString()
    })
  }
  if(!rows.length)return {configured:true,saved:0}
  const q=new URLSearchParams({on_conflict:'canonical_url,source_type,captured_at'})
  const saved=await adminRest('quantum_time_documents',{
    method:'POST',
    query:Object.fromEntries(q.entries()),
    body:rows
  })
  return {configured:true,saved:rows.length,result:saved}
}
