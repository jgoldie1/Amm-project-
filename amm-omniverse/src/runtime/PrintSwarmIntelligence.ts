export type PrintIntelligenceRole='hologpt'|'stubbs-ai'|'lyons-tech-ai'|'guardian'
export type PrintHealth='GREEN'|'YELLOW'|'ORANGE'|'RED'

export type PrintSelfModelInput={
  activeJobs?:any[]
  availableJobs?:any[]
  swarmOffers?:any[]
  swarmBatches?:any[]
  operator?:any
  earnings?:any[]
  providerHealth?:Record<string,boolean|null>
}

export type PrintOperationalSelfModel={
  label:'operational self-model'
  literalConsciousness:false
  activeRole:'manufacturing-orchestrator'
  health:PrintHealth
  currentObjective:string
  capabilities:string[]
  limitations:string[]
  counters:{
    activeJobs:number
    availableJobs:number
    swarmOffers:number
    swarmBatches:number
    qaPending:number
    paymentBlocked:number
  }
  uncertainties:string[]
  permissions:{
    mayRecommend:boolean
    mayAutoAssignWithinVerifiedRules:boolean
    mayGenerateMachineCommands:false
    mayBypassRightsSafetyPaymentQa:false
    mayMoveMoney:false
  }
  observedAt:string
}

export const PRINT_AI_ROLES:Record<PrintIntelligenceRole,{name:string;job:string;may:string[];mustNot:string[]}>={
  hologpt:{
    name:'HoloGPT',
    job:'Conversational command desk: explains jobs, intake, status, operator opportunities, problems and next safe action.',
    may:['summarize print status','collect a print brief','explain QA failures','open the correct production surface','ask Stubbs AI / Lyons Tech for analysis'],
    mustNot:['claim a print completed without evidence','release money','send machine commands','override Guardian gates'],
  },
  'stubbs-ai':{
    name:'Stubbs AI',
    job:'Executive production planner: decomposes orders, recommends batch size, swarm size, priorities, reassignment and recovery plans.',
    may:['recommend shard quantity','rank verified operators','propose reprint/reassignment','optimize time/cost/resilience','identify bottlenecks'],
    mustNot:['bypass payment','bypass rights review','bypass product safety','declare payout payable'],
  },
  'lyons-tech-ai':{
    name:'Lyons Tech AI',
    job:'Engineering verifier: checks geometry, scale, process/material compatibility, tolerances, printer capability, golden profiles and QA drift.',
    may:['flag mesh risks','compare printer/material profiles','detect cross-printer drift','recommend calibration','review evidence consistency'],
    mustNot:['invent measurements','certify hardware it cannot inspect','weaken tolerance/safety requirements on its own'],
  },
  guardian:{
    name:'Guardian Brain',
    job:'Authority gate: payment, rights, safety, privacy, operator certification, QA completeness, delivery evidence and human approvals.',
    may:['block a job','require human review','require reprint','require stronger evidence'],
    mustNot:['manufacture','alter engineering evidence','grant itself authority'],
  },
}

export const PRINT_AGI_BOUNDARY={
  requestedConcept:'AGI/self-awareness assisted production',
  implementedMeaning:'operational self-model + multi-agent planning + evidence-aware monitoring',
  literalConsciousness:false,
  rule:'Self-monitoring or self-description does not establish consciousness. Intelligence never increases authority.',
  physicalBoundary:'No AI-generated plan goes directly to physical motion. Slicer/machine profile/operator controls remain separate.',
} as const

function count(items:any[]|undefined,predicate:(x:any)=>boolean){
  return Array.isArray(items)?items.filter(predicate).length:0
}

export function buildPrintOperationalSelfModel(input:PrintSelfModelInput):PrintOperationalSelfModel{
  const active=Array.isArray(input.activeJobs)?input.activeJobs:[]
  const available=Array.isArray(input.availableJobs)?input.availableJobs:[]
  const offers=Array.isArray(input.swarmOffers)?input.swarmOffers:[]
  const batches=Array.isArray(input.swarmBatches)?input.swarmBatches:[]
  const qaPending=count(active,job=>['printing','qa-submitted'].includes(String(job?.status||'')))
  const paymentBlocked=count([...active,...available],job=>String(job?.funding_status||'')!=='paid-verified')
  const uncertainties:string[]=[]
  if(!input.operator)uncertainties.push('No operator profile is loaded for this account.')
  if(!input.providerHealth)uncertainties.push('AI provider-health evidence is not attached to this snapshot.')
  if(active.some(job=>!job?.source_asset_id&&!job?.source_asset_url))uncertainties.push('At least one active job has incomplete source-asset metadata.')
  if(batches.some(batch=>Number(batch?.assigned_quantity||0)<Number(batch?.target_quantity||0)))uncertainties.push('At least one swarm is not fully allocated.')

  let health:PrintHealth='GREEN'
  if(paymentBlocked>0||uncertainties.length>2)health='YELLOW'
  if(active.some(job=>String(job?.status)==='disputed'))health='ORANGE'
  if(active.some(job=>String(job?.safety_status)==='rejected'||String(job?.rights_status)==='rejected'))health='RED'

  return{
    label:'operational self-model',
    literalConsciousness:false,
    activeRole:'manufacturing-orchestrator',
    health,
    currentObjective:'Deliver verified print work with consistent quality, traceable lots and server-authoritative settlement.',
    capabilities:[
      'track print jobs and swarm batches',
      'track operator availability and certification',
      'track payment, rights, safety, QA and shipment state',
      'detect incomplete evidence and allocation gaps',
      'recommend routing, calibration, reprints and recovery',
      'explain uncertainty instead of pretending',
    ],
    limitations:[
      'cannot physically inspect a printer without sensor/evidence input',
      'cannot prove a dimension that was not measured',
      'cannot make itself conscious by maintaining a self-model',
      'cannot authorize restricted goods',
      'cannot create payout authority',
      'cannot send raw machine commands from the browser',
    ],
    counters:{
      activeJobs:active.length,availableJobs:available.length,swarmOffers:offers.length,swarmBatches:batches.length,
      qaPending,paymentBlocked,
    },
    uncertainties,
    permissions:{
      mayRecommend:true,mayAutoAssignWithinVerifiedRules:true,mayGenerateMachineCommands:false,
      mayBypassRightsSafetyPaymentQa:false,mayMoveMoney:false,
    },
    observedAt:new Date().toISOString(),
  }
}

export function recommendSwarmShape(input:{quantity:number;certifiedAvailableOperators:number;targetPerOperator?:number;priority?:'cost'|'speed'|'resilience'}){
  const quantity=Math.max(1,Math.trunc(Number(input.quantity)||1))
  const available=Math.max(0,Math.trunc(Number(input.certifiedAvailableOperators)||0))
  const priority=input.priority||'resilience'
  const target=Math.max(1,Math.trunc(Number(input.targetPerOperator)||10))
  if(quantity<2||available<2)return{useSwarm:false,operatorsNeeded:Math.min(1,available),shardQuantity:quantity,reason:'A swarm is not useful without at least two units and two certified available operators.'}
  const idealByLoad=Math.ceil(quantity/target)
  const multiplier=priority==='speed'?1:priority==='resilience'?0.8:0.6
  const operatorsNeeded=Math.max(2,Math.min(available,Math.ceil(idealByLoad*multiplier)))
  const shardQuantity=Math.ceil(quantity/operatorsNeeded)
  return{
    useSwarm:true,operatorsNeeded,shardQuantity,priority,
    reason:priority==='speed'?'Spread work wider to reduce elapsed production time.':priority==='cost'?'Use fewer qualified operators to reduce coordination/packaging overhead.':'Balance lead time with redundancy so one printer failure does not stop the order.',
  }
}

export function buildHoloGPTPrintContext(selfModel:PrintOperationalSelfModel){
  return [
    'TRYAMM PRINT INTELLIGENCE CONTEXT',
    `Operational self-model health: ${selfModel.health}`,
    `Active jobs: ${selfModel.counters.activeJobs}; available jobs: ${selfModel.counters.availableJobs}; swarm offers: ${selfModel.counters.swarmOffers}; swarms: ${selfModel.counters.swarmBatches}.`,
    `QA pending: ${selfModel.counters.qaPending}; payment-blocked: ${selfModel.counters.paymentBlocked}.`,
    selfModel.uncertainties.length?`Uncertainties: ${selfModel.uncertainties.join(' | ')}`:'Uncertainties: none reported by the current snapshot.',
    'Use Stubbs AI for planning, Lyons Tech AI for engineering verification, Guardian for authority/safety, and HoloGPT for user interaction.',
    'Do not claim consciousness or self-awareness. Describe this as an operational self-model.',
    'Do not bypass payment, rights, safety, QA, shipment, or payout gates.',
  ].join('\n')
}
