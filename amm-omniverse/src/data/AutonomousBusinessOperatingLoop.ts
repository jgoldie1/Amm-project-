import {actionDecision,type BusinessAction,type FounderPolicy,type AiExecutiveRole} from './FounderFirstAutonomousBusiness'

export type OperatingSignalType='lead'|'qr-scan'|'trial'|'checkout'|'payment-verified'|'refund'|'support'|'churn-risk'|'system-health'|'release'|'ad-performance'|'marketplace-order'
export interface OperatingSignal{type:OperatingSignalType;id:string;value?:number;channel?:string;customerId?:string}
export interface OperatingContext{cashAvailableUsd:number;dailyCommittedUsd:number;policy:FounderPolicy}

const ROUTES:Record<OperatingSignalType,AiExecutiveRole>={
 lead:'ai-sales','qr-scan':'ai-sales',trial:'ai-customer-success',checkout:'ai-sales','payment-verified':'ai-cfo',
 refund:'ai-customer-success',support:'ai-customer-success','churn-risk':'ai-customer-success','system-health':'ai-cto',
 release:'ai-cto','ad-performance':'ai-cmo','marketplace-order':'ai-operations',
}

export function signalToAction(s:OperatingSignal):BusinessAction{
 const owner=ROUTES[s.type]
 const money=s.type==='payment-verified'||s.type==='refund'||s.type==='marketplace-order'
 return{id:`${s.type}:${s.id}`,owner,goal:`handle:${s.type}`,risk:money?'review':'auto',revenueImpact:['lead','qr-scan','checkout','payment-verified','ad-performance','marketplace-order','churn-risk'].includes(s.type),customerImpact:!!s.customerId,spendUsd:0}
}

export function routeOperatingSignal(s:OperatingSignal,ctx:OperatingContext){
 const action=signalToAction(s)
 return{action,decision:actionDecision(action,ctx.policy,ctx.cashAvailableUsd,ctx.dailyCommittedUsd)}
}

export const OPERATING_CONNECTIONS={
 acquisition:['Scout/QR','organic/referral','creator/business onboarding','Holo Ads experiments'],
 conversion:['Free','Starter','Growth','Business Pass','Preview','Experience','Digital Twin'],
 fulfillment:['AI Cafe Manager','AI Operations','Marketplace/Delivery','AI Studio','Customer Success'],
 money:['server-authoritative checkout','verified webhook','order/entitlement','ledger/splits','refund/reconciliation'],
 retention:['onboarding','support','usage health','renewal','churn-risk recovery'],
 founder:['Command Nexus dashboard','approval queue','cash/reserve limits','shutdown','audit evidence'],
} as const

export const AUTONOMY_SUGGESTIONS=[
 'Use a durable job queue with idempotency so an AI action cannot execute twice.',
 'Require evidence links for every material AI decision shown to the Founder.',
 'Add human escalation for legal, tax, safety, employment, large refunds and contractual disputes.',
 'Use feature flags and kill switches per AI department.',
 'Separate sandbox experiments from production customer actions.',
 'Measure contribution margin and CAC payback before scaling paid acquisition.',
 'Create a customer-trust center for AI disclosure, privacy, support and appeals.',
 'Add backup/restore, incident response and daily reconciliation before unattended operation.',
] as const

export const HIRING_TRIGGER_MODEL={
 principle:'AI-first does not mean human-never. Add people when verified demand, risk or service quality justifies payroll.',
 triggers:['support SLA misses','sales pipeline exceeds automation capacity','rights/compliance review backlog','creative quality bottleneck','operations incident load','positive unit economics support expansion'],
 roles:['customer success','sales/account management','creative/cultural review','finance/bookkeeping','legal/compliance counsel','engineering/SRE','local operations'],
}
