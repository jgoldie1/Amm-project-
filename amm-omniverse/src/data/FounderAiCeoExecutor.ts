import {actionDecision,type BusinessAction,type FounderPolicy} from './FounderFirstAutonomousBusiness'

export type CeoObjective='revenue-growth'|'customer-retention'|'product-readiness'|'business-onboarding'|'cost-control'|'reliability'
export interface CeoPlanItem extends BusinessAction{objective:CeoObjective;expectedOutcome:string;evidenceRequired:string[]}
export interface CeoExecutionContext{policy:FounderPolicy;cashAvailableUsd:number;dailyCommittedUsd:number}

export const FOUNDER_AI_CEO_CHARTER={
 relationship:'Founder sets mission, ownership policy, risk limits and final material approvals. AI CEO works with the Founder to turn those directives into measurable plans and executable low-risk work.',
 canExecute:['prioritize approved backlog','assign work to AI departments','run zero/low-cost approved experiments','follow up qualified leads','coordinate onboarding/support','request engineering/release work','measure results','stop underperforming experiments','prepare hiring recommendations'],
 founderApproval:['material contracts','borrowing or financing','ownership/equity','banking or treasury-policy changes','spend above limits','new regulated business activity','material legal/tax commitments','large refunds/payout exceptions','production policy changes affecting minors/privacy/safety'],
}

export function buildCeoPlan(objectives:CeoObjective[]):CeoPlanItem[]{
 return objectives.map((objective,i)=>({
  id:`ceo-plan:${objective}:${i}`,owner:'ai-ceo',goal:`advance:${objective}`,objective,
  risk:objective==='cost-control'?'review':'auto',revenueImpact:['revenue-growth','customer-retention','business-onboarding'].includes(objective),
  customerImpact:['customer-retention','business-onboarding','reliability'].includes(objective),spendUsd:0,
  expectedOutcome:`measurable improvement in ${objective}`,
  evidenceRequired:['baseline metric','action log','result metric','cost','next recommendation'],
 }))
}
export function executableCeoPlan(items:CeoPlanItem[],ctx:CeoExecutionContext){
 let committed=ctx.dailyCommittedUsd
 return items.map(item=>{
  const decision=actionDecision(item,ctx.policy,ctx.cashAvailableUsd,committed)
  if(decision==='auto-approved')committed+=item.spendUsd
  return{item,decision}
 })
}

export const CEO_EXECUTION_CADENCE={
 daily:['read Founder priorities','read cash/revenue/customer/release signals','rank bottlenecks','dispatch approved work','review exceptions','report evidence'],
 weekly:['revenue and margin review','funnel/retention review','product/reliability review','business pipeline review','cost review','hiring trigger review','Founder strategy review'],
 rule:'No task is reported complete from intent alone; completion requires execution evidence.',
}

export const CEO_COMPANY_BUILDER={
 departments:['COO operations','CFO finance','CTO product/reliability','CMO growth','Sales','Customer Success','AI Cafe Managers'],
 buildSequence:['prove offer','acquire first customers','fulfill reliably','collect/reconcile verified revenue','retain customers','document repeatable playbook','automate repeatable work','scale channels with positive economics','hire where human judgment/capacity is needed'],
 northStar:'Build a durable customer-serving company under Founder control, not activity for its own sake.',
}
