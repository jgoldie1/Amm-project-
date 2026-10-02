import {adminRest} from './supabase-admin.js'
import {requireFactoryAuthority} from './meshy-factory.js'
import {printerQualificationForJob} from './print-network.js'

const now=()=>new Date().toISOString()
const clean=(v,max=240)=>String(v??'').trim().slice(0,max)
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Math.trunc(Number(n)||0)))

async function parentJob(id){
  const rows=await adminRest('print_network_jobs',{query:{id:`eq.${clean(id,80)}`,limit:1}})
  return rows?.[0]||null
}
async function operatorByUser(userId){
  const rows=await adminRest('print_network_operators',{query:{user_id:`eq.${userId}`,limit:1}})
  return rows?.[0]||null
}
function supports(operator,job){
  const materials=Array.isArray(operator?.materials)?operator.materials.map(x=>String(x).toLowerCase()):[]
  const profiles=Array.isArray(operator?.printer_profiles)?operator.printer_profiles:[]
  const material=String(job.material||'').toLowerCase()
  const process=String(job.process||'').toLowerCase()
  const materialOk=!materials.length||materials.some(x=>x===material||x.includes(material)||material.includes(x))
  const processOk=!profiles.length||profiles.some(p=>String(typeof p==='string'?p:JSON.stringify(p)).toLowerCase().includes(process))
  return materialOk&&processOk
}

export async function createPrintSwarm(actor,input={}){
  requireFactoryAuthority(actor)
  const job=await parentJob(input.parentJobId)
  if(!job)throw Object.assign(new Error('print_parent_job_not_found'),{status:404,code:'print_parent_job_not_found'})
  if(job.funding_status!=='paid-verified'||job.rights_status!=='verified'||job.safety_status!=='verified'){
    throw Object.assign(new Error('print_parent_job_not_release_ready'),{status:423,code:'print_parent_job_not_release_ready'})
  }
  const targetQuantity=clamp(input.targetQuantity||job.quantity,2,100000)
  const shardTarget=clamp(input.shardTargetQuantity||10,1,10000)
  const [operatorsRaw,printersRaw]=await Promise.all([
    adminRest('print_network_operators',{query:{certification_status:'eq.certified',availability:'eq.available',order:'quality_score.desc.nullslast,completed_jobs.desc',limit:250}}),
    adminRest('print_network_printers',{query:{qualification_status:'eq.qualified',availability:'eq.available',process:`eq.${job.process}`,order:'quality_score.desc.nullslast,updated_at.desc',limit:500}}),
  ])
  const operatorsById=new Map((operatorsRaw||[]).map(operator=>[operator.id,operator]))
  const eligibleMachines=(printersRaw||[])
    .map(printer=>({printer,operator:operatorsById.get(printer.operator_id)}))
    .filter(entry=>entry.operator&&supports(entry.operator,job)&&printerQualificationForJob(entry.printer,job).qualified)
    .sort((a,b)=>(Number(b.operator.quality_score||0)+Number(b.printer.quality_score||0))-(Number(a.operator.quality_score||0)+Number(a.printer.quality_score||0)))
  if(!eligibleMachines.length)throw Object.assign(new Error('no_eligible_print_swarm_printers'),{status:409,code:'no_eligible_print_swarm_printers'})

  const createdAt=now()
  const rows=await adminRest('print_swarm_batches',{method:'POST',body:{
    parent_job_id:job.id,created_by:actor.id,
    title:clean(input.title,160)||`${job.title} — Print Swarm`,
    target_quantity:targetQuantity,shard_target_quantity:shardTarget,
    process:job.process,material:job.material,color:job.color,
    golden_profile:{
      sourceAssetId:job.source_asset_id,
      targetDimensionsMm:job.target_dimensions_mm,
      toleranceMm:job.tolerance_mm,
      material:job.material,color:job.color,
      sourceRevision:clean(input.sourceRevision,120)||'approved-parent-job',
      rule:'Every shard uses one approved source revision, material target and QA standard.'
    },
    qa_policy:{
      requiredViews:['front','back','left','right','top','bottom','packaging'],
      requireDimensionCheck:true,requireMaterialBatch:true,
      sampleRate:Math.max(1,Number(input.sampleRate)||1)
    },
    consolidation_policy:{mode:clean(input.consolidationMode,40)||'direct-or-hub'},
    evidence:{serverAuthoritative:true,machineCommands:false,createdAt},
    status:'planning'
  }})
  const batch=rows?.[0]
  if(!batch)throw Object.assign(new Error('print_swarm_create_failed'),{status:503,code:'print_swarm_create_failed'})

  let remaining=targetQuantity, shardNumber=1, assigned=0
  const assignments=[]
  for(const entry of eligibleMachines){
    const {operator,printer}=entry
    if(remaining<=0)break
    const qty=Math.min(shardTarget,remaining)
    const lotCode=`SW-${String(batch.id).slice(0,8).toUpperCase()}-${String(shardNumber).padStart(3,'0')}`
    const childRows=await adminRest('print_network_jobs',{method:'POST',body:{
      requester_user_id:job.requester_user_id,commerce_order_id:job.commerce_order_id,
      source_asset_id:job.source_asset_id,source_asset_url:job.source_asset_url,
      source_manifest:{...(job.source_manifest||{}),swarmId:batch.id,parentJobId:job.id,shardNumber,lotCode},
      title:`${job.title} — Swarm ${shardNumber}`,product_category:job.product_category,
      quantity:qty,process:job.process,material:job.material,color:job.color,
      target_dimensions_mm:job.target_dimensions_mm,tolerance_mm:job.tolerance_mm,
      unit_price_cents:job.unit_price_cents,gross_cents:Math.floor((Number(job.gross_cents)||0)*qty/targetQuantity),
      operator_share_bps:job.operator_share_bps,platform_share_bps:job.platform_share_bps,reserve_share_bps:job.reserve_share_bps,
      funding_status:'paid-verified',rights_status:'verified',safety_status:'verified',
      status:'available',assigned_operator_id:operator.id,assigned_printer_id:printer.id,packaging_spec:job.packaging_spec||{},delivery_spec:job.delivery_spec||{},
      due_at:job.due_at,created_at:createdAt,updated_at:createdAt
    }})
    const child=childRows?.[0]
    if(!child)continue
    const assignmentRows=await adminRest('print_swarm_assignments',{method:'POST',body:{
      swarm_id:batch.id,operator_id:operator.id,printer_id:printer.id,child_job_id:child.id,shard_number:shardNumber,quantity:qty,
      state:'offered',lot_code:lotCode,
      calibration_profile:{targetDimensionsMm:job.target_dimensions_mm,toleranceMm:job.tolerance_mm,material:job.material,color:job.color},
      offered_at:createdAt,updated_at:createdAt
    }})
    if(assignmentRows?.[0])assignments.push(assignmentRows[0])
    remaining-=qty;assigned+=qty;shardNumber++
  }
  const status=remaining===0?'ready':'planning'
  await adminRest('print_swarm_batches',{method:'PATCH',query:{id:`eq.${batch.id}`},body:{assigned_quantity:assigned,status,updated_at:now()}})
  return{batch:{...batch,assigned_quantity:assigned,status},assignments,unassignedQuantity:remaining}
}

export async function printSwarmDashboard(user){
  const operator=await operatorByUser(user.id)
  const offers=operator?await adminRest('print_swarm_assignments',{query:{operator_id:`eq.${operator.id}`,order:'offered_at.desc',limit:100}}):[]
  let batches=[]
  try{requireFactoryAuthority(user);batches=await adminRest('print_swarm_batches',{query:{order:'updated_at.desc',limit:100}})||[]}catch{}
  return{operator,offers:offers||[],batches}
}

export async function acceptPrintSwarmOffer(user,assignmentId){
  const operator=await operatorByUser(user.id)
  if(!operator||operator.certification_status!=='certified')throw Object.assign(new Error('certified_print_operator_required'),{status:403,code:'certified_print_operator_required'})
  if(operator.availability!=='available')throw Object.assign(new Error('operator_must_be_available'),{status:409,code:'operator_must_be_available'})
  const rows=await adminRest('print_swarm_assignments',{query:{id:`eq.${clean(assignmentId,80)}`,operator_id:`eq.${operator.id}`,state:'eq.offered',limit:1}})
  const assignment=rows?.[0]
  if(!assignment)throw Object.assign(new Error('swarm_offer_not_available'),{status:409,code:'swarm_offer_not_available'})
  const child=await parentJob(assignment.child_job_id)
  const printers=await adminRest('print_network_printers',{query:{id:`eq.${assignment.printer_id}`,operator_id:`eq.${operator.id}`,limit:1}})
  const printer=printers?.[0]
  const gate=printerQualificationForJob(printer,child)
  if(!child||!gate.qualified)throw Object.assign(new Error('swarm_printer_no_longer_qualified:'+gate.reasons.join(',')),{status:409,code:'swarm_printer_no_longer_qualified'})
  const acceptedAt=now()
  const updated=await adminRest('print_swarm_assignments',{method:'PATCH',query:{id:`eq.${assignment.id}`,state:'eq.offered'},body:{state:'accepted',accepted_at:acceptedAt,updated_at:acceptedAt}})
  if(!updated?.[0])throw Object.assign(new Error('swarm_offer_accept_race_lost'),{status:409,code:'swarm_offer_accept_race_lost'})
  const printerRows=await adminRest('print_network_printers',{method:'PATCH',query:{id:`eq.${printer.id}`,availability:'eq.available'},body:{availability:'printing',updated_at:acceptedAt}})
  if(!printerRows?.[0])throw Object.assign(new Error('swarm_printer_accept_race_lost'),{status:409,code:'swarm_printer_accept_race_lost'})
  await adminRest('print_network_jobs',{method:'PATCH',query:{id:`eq.${assignment.child_job_id}`,status:'eq.available'},body:{status:'accepted',assigned_printer_id:printer.id,accepted_at:acceptedAt,updated_at:acceptedAt}})
  await adminRest('print_network_operators',{method:'PATCH',query:{id:`eq.${operator.id}`},body:{availability:'busy',updated_at:acceptedAt}})
  return{...updated[0],printerQualification:{printerId:printer.id,nickname:printer.nickname,status:printer.qualification_status,level:printer.qualification_level}}
}

export const PRINT_SWARM_POLICY={
  purpose:'Split one verified manufacturing order across many certified operators and internally qualified compatible printers while preserving one golden source/profile and QA standard.',
  intelligenceCanRecommend:true,
  intelligenceCanBypassPaymentRightsSafetyQa:false,
  machineControl:false,
  lotTraceability:true,
  goldenProfileRequired:true,
  sixViewQaRequired:true,
  dimensionalSampling:true,
  qualifiedPrinterPerShard:true,
  machineQualificationDoesNotImplyExternalCertification:true,
  restrictedGoodsInheritedFromPrintNetwork:true,
}
