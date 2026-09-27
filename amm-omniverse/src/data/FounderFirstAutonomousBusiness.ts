export type AiExecutiveRole='founder'|'ai-ceo'|'ai-coo'|'ai-cfo'|'ai-cmo'|'ai-cto'|'ai-customer-success'|'ai-sales'|'ai-cafe-manager'|'ai-operations'
export type AutonomyRisk='auto'|'review'|'founder-only'
export interface BusinessAction{
 id:string;owner:AiExecutiveRole;goal:string;risk:AutonomyRisk;revenueImpact:boolean;customerImpact:boolean;spendUsd:number
}
export interface FounderPolicy{
 autoSpendLimitUsd:number;dailySpendLimitUsd:number;minimumCashReserveUsd:number
 requireFounderFor:string[]
}

export const FOUNDER_FIRST_AUTONOMY={
 founder:'James / Founder retains ownership, policy authority, treasury limits, shutdown and final approval.',
 aiHierarchy:[
  'AI CEO coordinates goals and operating plan','AI COO routes daily operations','AI CFO monitors cash, margins, payouts and budgets',
  'AI CMO runs approved marketing experiments','AI CTO monitors product/release evidence','AI Sales handles qualified funnels and follow-up',
  'AI Customer Success handles routine support/escalation','AI Cafe Managers operate local digital-business workflows',
 ],
 principle:'AI roles are delegated software agents, not corporate officers with unrestricted legal or financial authority.',
}

export function actionDecision(a:BusinessAction,p:FounderPolicy,cashAvailableUsd:number,dailyCommittedUsd:number){
 if(a.risk==='founder-only'||p.requireFounderFor.includes(a.goal))return'founder-approval' as const
 if(a.spendUsd>p.autoSpendLimitUsd||dailyCommittedUsd+a.spendUsd>p.dailySpendLimitUsd)return'founder-approval' as const
 if(cashAvailableUsd-a.spendUsd<p.minimumCashReserveUsd)return'blocked-reserve' as const
 return a.risk==='review'?'review-queue':'auto-approved' as const
}

export const AUTONOMOUS_BUSINESS_LOOP=[
 'observe product, sales, support and operations signals',
 'prioritize revenue, retention, reliability and customer outcomes',
 'assign work to the smallest capable AI role',
 'execute low-risk approved actions inside budget and policy',
 'measure result against cost and expected value',
 'keep successful experiments, stop weak ones, escalate material decisions',
 'post founder dashboard evidence and next actions',
] as const

export const CAPITAL_DISCIPLINE={
 bootstrap:'Prefer owned channels, QR/Scout network, organic creator/business acquisition, referrals and product-led conversion before expensive paid acquisition.',
 reinvestment:'Reinvest only verified distributable cash according to founder-approved budgets; never assume or guarantee profit.',
 paidAcquisition:'Increase customer-acquisition spend only when measured contribution margin, retention and payback justify it.',
 prohibited:['AI cannot borrow money','AI cannot sign material contracts','AI cannot change ownership','AI cannot bypass payout/tax/compliance controls','AI cannot fabricate customers/revenue/metrics'],
}

export const FOUNDER_COMMAND_CENTER_METRICS=[
 'cash available','net revenue','gross/contribution margin','MRR/ARR where applicable','conversion','retention/churn',
 'CAC by channel','CAC payback','LTV evidence','support backlog','refunds/chargebacks','payout liability','system health','release evidence',
] as const
