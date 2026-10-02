import {adminRest} from './supabase-admin.js'
import {requireFactoryAuthority} from './meshy-factory.js'

const TABLE='twelve_d_rnd_records'
const MAX_TITLE=160
const MAX_SUMMARY=4000
const MAX_NOTES=30000
const CATEGORIES=new Set(['general','materials','robotics','machine-vision','additive','assembly','tooling','safety','simulation','quality','controls','digital-twin'])

const clean=(value,max)=>String(value??'').trim().slice(0,max)
const safeCategory=value=>CATEGORIES.has(String(value||''))?String(value):'general'

export function requireTwelveDRndAuthority(user){
  requireFactoryAuthority(user)
  return true
}

export async function listTwelveDRndRecords(user,{limit=50}={}){
  requireTwelveDRndAuthority(user)
  return await adminRest(TABLE,{query:{
    owner_user_id:`eq.${user.id}`,
    order:'updated_at.desc',
    limit:Math.max(1,Math.min(100,Number(limit)||50))
  }})||[]
}

export async function createTwelveDRndRecord(user,input={}){
  requireTwelveDRndAuthority(user)
  const title=clean(input.title,MAX_TITLE)
  if(!title)throw Object.assign(new Error('12d_rnd_title_required'),{status:400,code:'12d_rnd_title_required'})
  const rows=await adminRest(TABLE,{method:'POST',body:{
    owner_user_id:user.id,
    title,
    category:safeCategory(input.category),
    status:'private-draft',
    publication_state:'private',
    summary:clean(input.summary,MAX_SUMMARY)||null,
    private_notes:clean(input.privateNotes,MAX_NOTES)||null,
    evidence:input.evidence&&typeof input.evidence==='object'?input.evidence:{},
    publication_approval:{},
    created_at:new Date().toISOString(),
    updated_at:new Date().toISOString(),
  }})
  return rows?.[0]||null
}

async function ownedRecord(user,id){
  const rows=await adminRest(TABLE,{query:{id:`eq.${clean(id,80)}`,owner_user_id:`eq.${user.id}`,limit:1}})
  return rows?.[0]||null
}

export async function updateTwelveDRndRecord(user,input={}){
  requireTwelveDRndAuthority(user)
  const current=await ownedRecord(user,input.id)
  if(!current)throw Object.assign(new Error('12d_rnd_record_not_found'),{status:404,code:'12d_rnd_record_not_found'})
  const allowedStatus=new Set(['private-draft','private-review','private-validated','archived'])
  const body={
    title:input.title===undefined?current.title:clean(input.title,MAX_TITLE),
    category:input.category===undefined?current.category:safeCategory(input.category),
    status:allowedStatus.has(String(input.status||''))?String(input.status):current.status,
    summary:input.summary===undefined?current.summary:(clean(input.summary,MAX_SUMMARY)||null),
    private_notes:input.privateNotes===undefined?current.private_notes:(clean(input.privateNotes,MAX_NOTES)||null),
    evidence:input.evidence&&typeof input.evidence==='object'?{...(current.evidence||{}),...input.evidence}:current.evidence,
    updated_at:new Date().toISOString(),
  }
  const rows=await adminRest(TABLE,{method:'PATCH',query:{id:`eq.${current.id}`,owner_user_id:`eq.${user.id}`},body})
  return rows?.[0]||null
}

export async function approveTwelveDRndPublication(user,{id,confirmation}={}){
  requireTwelveDRndAuthority(user)
  if(String(confirmation||'')!=='APPROVE_12D_PUBLICATION')throw Object.assign(new Error('explicit_publication_confirmation_required'),{status:400,code:'explicit_publication_confirmation_required'})
  const current=await ownedRecord(user,id)
  if(!current)throw Object.assign(new Error('12d_rnd_record_not_found'),{status:404,code:'12d_rnd_record_not_found'})
  const now=new Date().toISOString()
  const rows=await adminRest(TABLE,{method:'PATCH',query:{id:`eq.${current.id}`,owner_user_id:`eq.${user.id}`},body:{
    publication_state:'approved-for-publication',
    publication_approval:{approvedBy:user.id,approvedAt:now,confirmation:'APPROVE_12D_PUBLICATION'},
    updated_at:now,
  }})
  // This only records approval. There is intentionally no public read/publish action here.
  return rows?.[0]||null
}

export async function returnTwelveDRndToPrivate(user,id){
  requireTwelveDRndAuthority(user)
  const current=await ownedRecord(user,id)
  if(!current)throw Object.assign(new Error('12d_rnd_record_not_found'),{status:404,code:'12d_rnd_record_not_found'})
  const rows=await adminRest(TABLE,{method:'PATCH',query:{id:`eq.${current.id}`,owner_user_id:`eq.${user.id}`},body:{
    publication_state:'private',
    publication_approval:{},
    updated_at:new Date().toISOString(),
  }})
  return rows?.[0]||null
}

export const TWELVE_D_PRIVATE_RND_POLICY={
  storage:'service-role-only Supabase table',
  publicManifest:false,
  anonymousRead:false,
  authenticatedDirectRead:false,
  founderOrAdminApiOnly:true,
  defaultPublicationState:'private',
  publicReleaseEndpointImplemented:false,
  explicitApprovalPhrase:'APPROVE_12D_PUBLICATION',
  note:'Approval records intent only. A future public release still requires an explicit product change and rights/safety review.',
}
