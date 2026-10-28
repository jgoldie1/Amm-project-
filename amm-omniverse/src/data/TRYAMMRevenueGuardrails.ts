/** Revenue guardrails for TRYAMM. Planning math only, never actual payments or account balances. */
export type ServiceEconomics={id:string;name:string;price:number;estimatedVariableCost:number;estimatedLaborHours:number;recurring:boolean;requiresVerifiedDelivery:boolean}
export const REVENUE_SERVICES:readonly ServiceEconomics[]=[
 {id:'web-preview',name:'Website Preview',price:499,estimatedVariableCost:30,estimatedLaborHours:8,recurring:false,requiresVerifiedDelivery:true},
 {id:'studio-edit',name:'Aniyah vocal edit',price:35,estimatedVariableCost:4,estimatedLaborHours:1,recurring:false,requiresVerifiedDelivery:true},
 {id:'business-pass',name:'Business Pass (monthly)',price:149,estimatedVariableCost:35,estimatedLaborHours:2,recurring:true,requiresVerifiedDelivery:true},
]
export function calculateContribution(service:ServiceEconomics,quantity:number){
 const count=Math.max(0,Math.floor(Number.isFinite(quantity)?quantity:0))
 const gross=count*service.price
 const estimatedVariableCosts=count*service.estimatedVariableCost
 return {gross,estimatedVariableCosts,contributionBeforeLaborAndFixedCosts:gross-estimatedVariableCosts,estimatedLaborHours:count*service.estimatedLaborHours}
}
export const LAUNCH_GATES=[
 'Verify offer scope and a real delivery sample before accepting money',
 'Confirm production checkout server-side using Stripe webhook and order reconciliation',
 'Deliver and document service completion before expanding paid campaigns',
 'Cap AI credits, media processing, storage, egress and advertising spend per customer',
 'Track refunds, fees, support and recurring churn alongside gross receipts',
 'Avoid paid Holo Credits until balances, usage ledger and refunds have been tested',
] as const
