import {adminRest} from './supabase-admin.js'
import {requireFactoryAuthority,hasFactoryAuthority} from './meshy-factory.js'

export const PRINT_NETWORK_DEFAULT_SPLIT={
  operatorShareBps:Number(process.env.TRYAMM_PRINT_OPERATOR_BPS||8000),
  platformShareBps:Number(process.env.TRYAMM_PRINT_PLATFORM_BPS||1500),
  reserveShareBps:Number(process.env.TRYAMM_PRINT_RESERVE_BPS||500),
}

const REQUIRED_QA_VIEWS=['front','back','left','right','top','bottom','packaging']
const DISALLOWED_TERMS=[
  'gun','firearm','weapon','receiver','lower receiver','upper receiver','silencer','suppressor',
  'switchblade','brass knuckles','grenade','explosive','detonator','ammo','ammunition'
]

const clean=(v,max=240)=>String(v??'').trim().slice(0,max)
const asArray=value=>Array.isArray(value)?value:[]
const now=()=>new Date().toISOString()

function splitOk(split=PRINT_NETWORK_DEFAULT_SPLIT){
  return split.operatorShareBps>=0&&split.platformShareBps>=0&&split.reserveShareBps>=0&&
    split.operatorShareBps+split.platformShareBps+split.reserveShareBps===10000
}
if(!splitOk())throw new Error('print_network_split_invalid')

function unsafePrintRequest(input={}){
  const haystack=[input.title,input.productCategory,input.material,input.notes].map(x=>String(x||'').toLowerCase()).join(' ')
  return DISALLOWED_TERMS.find(term=>haystack.includes(term))||null
}

async function operatorByUser(userId){
  const rows=await adminRest('print_network_operators',{query:{user_id:`eq.${userId}`,limit:1}})
  return rows?.[0]||null
}

async function jobById(id){
  const rows=await adminRest('print_network_jobs',{query:{id:`eq.${clean(id,80)}`,limit:1}})
  return rows?.[0]||null
}

async function requireCertifiedOperator(user){
  const operator=await operatorByUser(user.id)
  if(!operator||operator.certification_status!=='certified')throw Object.assign(new Error('certified_print_operator_required'),{status:403,code:'certified_print_operator_required'})
  return operator
}

export async function printNetworkDashboard(user){
  const operator=await operatorByUser(user.id)
  const [requests,active,available,earnings]=await Promise.all([
    adminRest('print_network_jobs',{query:{requester_user_id:`eq.${user.id}`,order:'created_at.desc',limit:50}}),
    operator?adminRest('print_network_jobs',{query:{assigned_operator_id:`eq.${operator.id}`,order:'updated_at.desc',limit:50}}):Promise.resolve([]),
    operator?.certification_status==='certified'?adminRest('print_network_jobs',{query:{status:'eq.available',order:'created_at.asc',limit:50}}):Promise.resolve([]),
    operator?adminRest('print_network_earnings',{query:{operator_id:`eq.${operator.id}`,order:'created_at.desc',limit:100}}):Promise.resolve([]),
  ])
  return{operator,requests:requests||[],active:active||[],available:available||[],earnings:earnings||[],requiredQaViews:REQUIRED_QA_VIEWS,split:PRINT_NETWORK_DEFAULT_SPLIT}
}

export async function applyPrintOperator(user,input={}){
  const displayName=clean(input.displayName,120)
  if(!displayName)throw Object.assign(new Error('operator_display_name_required'),{status:400,code:'operator_display_name_required'})
  const existing=await operatorByUser(user.id)
  const body={
    display_name:displayName,
    service_region:clean(input.serviceRegion,160)||null,
    printer_profiles:asArray(input.printerProfiles).slice(0,10),
    materials:asArray(input.materials).slice(0,40),
    service_modes:asArray(input.serviceModes).length?asArray(input.serviceModes).slice(0,10):['ship'],
    max_build_mm:input.maxBuildMm&&typeof input.maxBuildMm==='object'?input.maxBuildMm:{},
    availability:'offline',
    updated_at:now(),
  }
  if(existing){
    const rows=await adminRest('print_network_operators',{method:'PATCH',query:{id:`eq.${existing.id}`,user_id:`eq.${user.id}`},body})
    return rows?.[0]||existing
  }
  const rows=await adminRest('print_network_operators',{method:'POST',body:{
    user_id:user.id,
    ...body,
    level:'applicant',
    certification_status:'training',
    metadata:{employmentPath:['applicant','trainee','apprentice','certified','lead','regional-hub']},
  }})
  return rows?.[0]||null
}

export async function updatePrintOperatorAvailability(user,availability){
  const allowed=new Set(['offline','available','busy','paused'])
  if(!allowed.has(String(availability)))throw Object.assign(new Error('invalid_operator_availability'),{status:400,code:'invalid_operator_availability'})
  const operator=await operatorByUser(user.id)
  if(!operator)throw Object.assign(new Error('print_operator_profile_required'),{status:404,code:'print_operator_profile_required'})
  const rows=await adminRest('print_network_operators',{method:'PATCH',query:{id:`eq.${operator.id}`},body:{availability,updated_at:now()}})
  return rows?.[0]||operator
}

export async function certifyPrintOperator(actor,{userId,status='certified',level='certified',qualityScore=100}={}){
  requireFactoryAuthority(actor)
  const operator=await operatorByUser(clean(userId,80))
  if(!operator)throw Object.assign(new Error('print_operator_not_found'),{status:404,code:'print_operator_not_found'})
  const allowedStatus=new Set(['pending','training','sample-required','review','certified','suspended','rejected'])
  const allowedLevel=new Set(['applicant','trainee','apprentice','certified','lead','regional-hub'])
  const rows=await adminRest('print_network_operators',{method:'PATCH',query:{id:`eq.${operator.id}`},body:{
    certification_status:allowedStatus.has(status)?status:operator.certification_status,
    level:allowedLevel.has(level)?level:operator.level,
    quality_score:Math.max(0,Math.min(100,Number(qualityScore)||0)),
    updated_at:now(),
  }})
  return rows?.[0]||operator
}

export async function createPrintRequest(user,input={}){
  const blockedTerm=unsafePrintRequest(input)
  if(blockedTerm)throw Object.assign(new Error('restricted_physical_print_request'),{status:400,code:'restricted_physical_print_request'})
  const title=clean(input.title,160)
  const material=clean(input.material,80)
  if(!title||!material)throw Object.assign(new Error('print_title_and_material_required'),{status:400,code:'print_title_and_material_required'})
  const quantity=Math.max(1,Math.min(500,Math.trunc(Number(input.quantity)||1)))
  const unitPrice=Math.max(0,Math.trunc(Number(input.unitPriceCents)||0))
  const gross=unitPrice*quantity
  const rows=await adminRest('print_network_jobs',{method:'POST',body:{
    requester_user_id:user.id,
    source_asset_id:clean(input.sourceAssetId,160)||null,
    source_asset_url:clean(input.sourceAssetUrl,1600)||null,
    source_manifest:input.sourceManifest&&typeof input.sourceManifest==='object'?input.sourceManifest:{},
    title,
    product_category:clean(input.productCategory,80)||'general',
    quantity,
    process:['fdm','sla','sls','other'].includes(String(input.process))?String(input.process):'fdm',
    material,
    color:clean(input.color,80)||null,
    target_dimensions_mm:input.targetDimensionsMm&&typeof input.targetDimensionsMm==='object'?input.targetDimensionsMm:{},
    tolerance_mm:input.toleranceMm===undefined?null:Number(input.toleranceMm),
    unit_price_cents:unitPrice,
    gross_cents:gross,
    operator_share_bps:PRINT_NETWORK_DEFAULT_SPLIT.operatorShareBps,
    platform_share_bps:PRINT_NETWORK_DEFAULT_SPLIT.platformShareBps,
    reserve_share_bps:PRINT_NETWORK_DEFAULT_SPLIT.reserveShareBps,
    funding_status:'unfunded',
    rights_status:'pending',
    safety_status:'pending',
    status:'funding-required',
    packaging_spec:input.packagingSpec&&typeof input.packagingSpec==='object'?input.packagingSpec:{fragile:Boolean(input.fragile)},
    delivery_spec:{requestedMode:clean(input.deliveryMode,40)||'ship'},
    created_at:now(),
    updated_at:now(),
  }})
  return rows?.[0]||null
}

export async function reviewPrintRequest(actor,{jobId,rightsApproved,safetyApproved,unitPriceCents}={}){
  requireFactoryAuthority(actor)
  const job=await jobById(jobId)
  if(!job)throw Object.assign(new Error('print_job_not_found'),{status:404,code:'print_job_not_found'})
  const unit=Math.max(0,Math.trunc(Number(unitPriceCents??job.unit_price_cents)||0))
  const gross=unit*Math.max(1,Number(job.quantity)||1)
  const rightsStatus=rightsApproved===true?'verified':rightsApproved===false?'rejected':job.rights_status
  const safetyStatus=safetyApproved===true?'verified':safetyApproved===false?'rejected':job.safety_status
  const rejected=rightsStatus==='rejected'||safetyStatus==='rejected'
  const funded=job.funding_status==='paid-verified'
  const status=rejected?'cancelled':(rightsStatus==='verified'&&safetyStatus==='verified'&&funded?'available':'funding-required')
  const rows=await adminRest('print_network_jobs',{method:'PATCH',query:{id:`eq.${job.id}`},body:{
    rights_status:rightsStatus,
    safety_status:safetyStatus,
    unit_price_cents:unit,
    gross_cents:gross,
    status,
    updated_at:now(),
  }})
  return rows?.[0]||job
}

export async function linkVerifiedCommercePayment(actor,{jobId,commerceOrderId}={}){
  requireFactoryAuthority(actor)
  const job=await jobById(jobId)
  if(!job)throw Object.assign(new Error('print_job_not_found'),{status:404,code:'print_job_not_found'})
  const orders=await adminRest('commerce_orders',{query:{id:`eq.${clean(commerceOrderId,80)}`,buyer_id:`eq.${job.requester_user_id}`,status:'eq.paid',limit:1}})
  const order=orders?.[0]
  if(!order)throw Object.assign(new Error('verified_paid_commerce_order_required'),{status:409,code:'verified_paid_commerce_order_required'})
  if(Number(order.subtotal_cents)<Number(job.gross_cents))throw Object.assign(new Error('commerce_order_amount_insufficient'),{status:409,code:'commerce_order_amount_insufficient'})
  const status=job.rights_status==='verified'&&job.safety_status==='verified'?'available':'funding-required'
  const rows=await adminRest('print_network_jobs',{method:'PATCH',query:{id:`eq.${job.id}`},body:{
    commerce_order_id:order.id,
    funding_status:'paid-verified',
    status,
    updated_at:now(),
  }})
  return rows?.[0]||job
}

export async function claimPrintJob(user,jobId){
  const operator=await requireCertifiedOperator(user)
  if(operator.availability!=='available')throw Object.assign(new Error('operator_must_be_available'),{status:409,code:'operator_must_be_available'})
  const job=await jobById(jobId)
  if(!job||job.status!=='available')throw Object.assign(new Error('print_job_not_available'),{status:409,code:'print_job_not_available'})
  if(job.funding_status!=='paid-verified'||job.rights_status!=='verified'||job.safety_status!=='verified')throw Object.assign(new Error('print_job_not_release_ready'),{status:423,code:'print_job_not_release_ready'})
  const rows=await adminRest('print_network_jobs',{method:'PATCH',query:{id:`eq.${job.id}`,status:'eq.available',assigned_operator_id:'is.null'},body:{
    assigned_operator_id:operator.id,status:'accepted',accepted_at:now(),updated_at:now()
  }})
  if(!rows?.[0])throw Object.assign(new Error('print_job_claim_race_lost'),{status:409,code:'print_job_claim_race_lost'})
  await adminRest('print_network_operators',{method:'PATCH',query:{id:`eq.${operator.id}`},body:{availability:'busy',updated_at:now()}})
  return rows[0]
}

export async function advanceOwnPrintJob(user,{jobId,action,carrier,trackingCode,trackingUrl}={}){
  const operator=await requireCertifiedOperator(user)
  const job=await jobById(jobId)
  if(!job||job.assigned_operator_id!==operator.id)throw Object.assign(new Error('assigned_print_job_required'),{status:403,code:'assigned_print_job_required'})
  const transitions={start:'printing',submitQa:'qa-submitted',package:'packaged'}
  if(action==='ship'){
    if(job.status!=='packaged')throw Object.assign(new Error('packaged_job_required_before_shipping'),{status:409,code:'packaged_job_required_before_shipping'})
    if(!clean(carrier,80)||!clean(trackingCode,160))throw Object.assign(new Error('carrier_and_tracking_required'),{status:400,code:'carrier_and_tracking_required'})
    const existing=await adminRest('print_network_shipments',{query:{job_id:`eq.${job.id}`,limit:1}})
    const shipmentBody={
      job_id:job.id,operator_id:operator.id,carrier:clean(carrier,80),tracking_code:clean(trackingCode,160),
      tracking_url:clean(trackingUrl,1600)||null,status:'accepted',shipped_at:now(),updated_at:now()
    }
    if(existing?.[0])await adminRest('print_network_shipments',{method:'PATCH',query:{id:`eq.${existing[0].id}`},body:shipmentBody})
    else await adminRest('print_network_shipments',{method:'POST',body:shipmentBody})
    const rows=await adminRest('print_network_jobs',{method:'PATCH',query:{id:`eq.${job.id}`},body:{status:'shipped',shipped_at:now(),updated_at:now()}})
    return rows?.[0]||job
  }
  const next=transitions[action]
  const allowed={
    start:['accepted'],
    submitQa:['printing'],
    package:['qa-approved'],
  }
  if(!next||!allowed[action]?.includes(job.status))throw Object.assign(new Error('invalid_print_job_transition'),{status:409,code:'invalid_print_job_transition'})
  if(action==='submitQa'){
    const evidence=await adminRest('print_network_qa_evidence',{query:{job_id:`eq.${job.id}`}})
    const found=new Set((evidence||[]).map(row=>row.evidence_type))
    const missing=REQUIRED_QA_VIEWS.filter(view=>!found.has(view))
    if(missing.length)throw Object.assign(new Error('required_qa_evidence_missing:'+missing.join(',')),{status:409,code:'required_qa_evidence_missing'})
  }
  const body={status:next,updated_at:now()}
  if(action==='start')body.print_started_at=now()
  if(action==='submitQa')body.qa_submitted_at=now()
  if(action==='package')body.packaged_at=now()
  const rows=await adminRest('print_network_jobs',{method:'PATCH',query:{id:`eq.${job.id}`},body})
  return rows?.[0]||job
}

export async function reviewPrintQa(actor,{jobId,approved}={}){
  requireFactoryAuthority(actor)
  const job=await jobById(jobId)
  if(!job||job.status!=='qa-submitted')throw Object.assign(new Error('qa_submitted_job_required'),{status:409,code:'qa_submitted_job_required'})
  const evidence=await adminRest('print_network_qa_evidence',{query:{job_id:`eq.${job.id}`}})
  const found=new Set((evidence||[]).map(row=>row.evidence_type))
  const missing=REQUIRED_QA_VIEWS.filter(view=>!found.has(view))
  if(missing.length)throw Object.assign(new Error('required_qa_evidence_missing:'+missing.join(',')),{status:409,code:'required_qa_evidence_missing'})
  const next=approved===true?'qa-approved':'disputed'
  await adminRest('print_network_qa_evidence',{method:'PATCH',query:{job_id:`eq.${job.id}`},body:{review_status:approved===true?'accepted':'rejected',reviewed_by:actor.id,reviewed_at:now()}})
  const rows=await adminRest('print_network_jobs',{method:'PATCH',query:{id:`eq.${job.id}`},body:{status:next,qa_approved_at:approved===true?now():null,updated_at:now()}})
  return rows?.[0]||job
}

export async function confirmPrintDeliveryAndLedger(actor,{jobId,proofReference}={}){
  requireFactoryAuthority(actor)
  const job=await jobById(jobId)
  if(!job||job.status!=='shipped')throw Object.assign(new Error('shipped_print_job_required'),{status:409,code:'shipped_print_job_required'})
  const shipments=await adminRest('print_network_shipments',{query:{job_id:`eq.${job.id}`,limit:1}})
  const shipment=shipments?.[0]
  if(!shipment)throw Object.assign(new Error('shipment_required'),{status:409,code:'shipment_required'})
  const deliveredAt=now()
  await adminRest('print_network_shipments',{method:'PATCH',query:{id:`eq.${shipment.id}`},body:{
    status:'delivered',provider_verified:true,proof_reference:clean(proofReference,500)||shipment.proof_reference,delivered_at:deliveredAt,updated_at:deliveredAt
  }})
  const deliveredRows=await adminRest('print_network_jobs',{method:'PATCH',query:{id:`eq.${job.id}`},body:{status:'settlement-review',delivered_at:deliveredAt,updated_at:deliveredAt}})
  const delivered=deliveredRows?.[0]||job
  if(delivered.funding_status!=='paid-verified'||delivered.rights_status!=='verified'||delivered.safety_status!=='verified'||!delivered.qa_approved_at){
    throw Object.assign(new Error('settlement_verification_incomplete'),{status:423,code:'settlement_verification_incomplete'})
  }
  const gross=Number(delivered.gross_cents)||0
  const operatorEarnings=Math.floor(gross*Number(delivered.operator_share_bps)/10000)
  const platformRevenue=Math.floor(gross*Number(delivered.platform_share_bps)/10000)
  const reserve=Math.max(0,gross-operatorEarnings-platformRevenue)
  const existing=await adminRest('print_network_earnings',{query:{job_id:`eq.${delivered.id}`,limit:1}})
  if(!existing?.[0]){
    await adminRest('print_network_earnings',{method:'POST',body:{
      job_id:delivered.id,operator_id:delivered.assigned_operator_id,gross_cents:gross,
      operator_earnings_cents:operatorEarnings,platform_revenue_cents:platformRevenue,reserve_cents:reserve,
      verification_status:'verified',payout_status:'blocked',
      verified_at:deliveredAt,
      evidence:{payment:'paid-verified',rights:'verified',safety:'verified',qa:'approved',delivery:'provider-verified'}
    }})
  }
  await adminRest('print_network_operators',{method:'PATCH',query:{id:`eq.${delivered.assigned_operator_id}`},body:{
    availability:'available',completed_jobs:Number((await operatorByUser((await adminRest('print_network_operators',{query:{id:`eq.${delivered.assigned_operator_id}`,limit:1}}))?.[0]?.user_id))?.completed_jobs||0)+1,updated_at:now()
  }})
  return{job:delivered,ledger:{grossCents:gross,operatorEarningsCents:operatorEarnings,platformRevenueCents:platformRevenue,reserveCents:reserve,payoutStatus:'blocked'}}
}

export const PRINT_NETWORK_POLICY={
  publicName:'TRYAMM Print Network',
  nickname:'Printer Mafia is treated only as a playful internal nickname, not criminal affiliation.',
  employmentPath:['applicant','trainee','apprentice','certified','lead','regional-hub'],
  requiredQaViews:REQUIRED_QA_VIEWS,
  operatorHomeAddressPublic:false,
  evidenceBucketPrivate:true,
  restrictedWeaponsAndIllegalGoods:true,
  paymentAuthority:'verified commerce order only',
  payoutAuthority:'server verified ledger; actual transfer integration separate',
  settlementRequirements:['paid order','rights verified','safety verified','six-view QA + packaging','QA approved','tracking','delivery verified'],
}
