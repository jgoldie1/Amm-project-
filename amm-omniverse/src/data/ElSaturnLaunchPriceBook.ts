export type ServiceTier='starter'|'pro'|'business'|'enterprise'
export type PriceBookEntry={
 id:string;name:string;monthlyLeaseUsd?:number;setupUsd?:number;buyoutUsd?:number;
 usage?:string;transaction?:string;managedServiceUsd?:number;notes?:string
}

export const EL_SATURN_LAUNCH_PRICE_BOOK:PriceBookEntry[]=[
 {id:'ai-business-os',name:'AI Business OS',monthlyLeaseUsd:49,setupUsd:199,buyoutUsd:2500,managedServiceUsd:299,notes:'Hosted website/storefront, AI copilot, Business Passport, CRM-style workflows and analytics. Domain/provider fees separate.'},
 {id:'business-server',name:'Business Server Package',monthlyLeaseUsd:79,setupUsd:249,managedServiceUsd:399,notes:'Hosted infrastructure/service package. Dedicated/high-volume deployments are custom; no transfer of underlying shared cloud infrastructure.'},
 {id:'middleverse-workforce',name:'AI Workforce + Contact Center',monthlyLeaseUsd:99,setupUsd:249,managedServiceUsd:499,usage:'AI/telephony/provider usage billed separately or passed through at disclosed cost + service margin.'},
 {id:'logistics-os',name:'Logistics + Fleet OS',monthlyLeaseUsd:39,setupUsd:149,managedServiceUsd:299,usage:'Owner-operator base $39/mo; small-fleet Pro target $149/mo; larger fleet Business target $399/mo.',transaction:'Per-load or dispatch fees activate only after real carrier/broker settlement is verified.'},
 {id:'commerce-network',name:'Omnichannel Commerce Network',monthlyLeaseUsd:49,setupUsd:199,managedServiceUsd:399,transaction:'Target platform commission 2.5% on eligible TRYAMM-originated commerce once provider settlement is live; external processor/marketplace fees separate.'},
 {id:'fintech-orchestration',name:'El Saturn Fintech Orchestration',monthlyLeaseUsd:99,setupUsd:299,managedServiceUsd:599,transaction:'No live fintech transaction fee until regulated/payment-provider agreements, disclosures and settlement are verified.',notes:'Software/orchestration pricing only at launch.'},
 {id:'creator-monetization',name:'Creator Revenue Network',monthlyLeaseUsd:19,setupUsd:0,managedServiceUsd:99,transaction:'Target 5% platform fee on eligible creator commerce/gifts/tickets once server-authoritative settlement is live.'},
 {id:'robotics-cell',name:'Robotic Fabrication Cell Services',setupUsd:250,managedServiceUsd:750,usage:'Engineering/operator time from $95/hr plus machine time, material, finishing, inspection and shipping. Final quote required.'},
 {id:'12d-fabrication',name:'12D Fabrication Service',setupUsd:500,managedServiceUsd:1500,usage:'R&D/engineering from $150/hr plus material, certified-machine time, tooling, inspection and finishing. Final quote required.',notes:'Pilot/R&D service; not a promise of autonomous physical production.'},
 {id:'print-swarm',name:'Distributed Print Swarm Network',monthlyLeaseUsd:29,setupUsd:99,managedServiceUsd:299,transaction:'Target marketplace commission 15% of verified manufacturing job value; shipping/material costs separate.'},
 {id:'holo-services',name:'Holo Services Suite',monthlyLeaseUsd:39,setupUsd:149,buyoutUsd:3500,managedServiceUsd:299,usage:'Higher-volume media, AI, telecom or storage/provider usage is metered or custom.'},
]

export const BUSINESS_IN_A_BOX_PRICING={
 starter:{name:'Starter Site',monthlyLeaseUsd:49,setupUsd:199,buyoutUsd:2500,includes:['website','lead form or booking','basic CRM','analytics','TRYAMM business profile']},
 pro:{name:'Business-in-a-Box Pro',monthlyLeaseUsd:99,setupUsd:399,buyoutUsd:5000,includes:['website','store or booking','CRM','Holo Ads tools','StreetVerse location','analytics','Stubbs AI assistant']},
 commerce:{name:'Commerce + Growth',monthlyLeaseUsd:199,setupUsd:750,buyoutUsd:8500,includes:['everything in Pro','product catalog','supplier/sourcing workflow','delivery tracking','creator commerce','Middleverse workforce hooks']},
 managed:{name:'Managed Business',monthlyLeaseUsd:499,setupUsd:1500,includes:['Commerce + Growth','monthly managed operations','content/offer updates','analytics review','workflow support'],buyoutUsd:undefined},
} as const

export const PRICE_BOOK_BOUNDARY={
 currency:'USD',
 launchPricing:true,
 taxesExcluded:true,
 domainsExcluded:true,
 adSpendExcluded:true,
 shippingExcluded:true,
 materialsExcluded:true,
 regulatedProviderFeesExcluded:true,
 processorFeesExcluded:true,
 enterprise:'custom quote',
 rule:'These are TRYAMM/El Saturn launch list prices and can be changed by the founder. No fee is charged unless checkout/contract terms show it and server-authoritative billing confirms it.'
} as const

export function priceFor(id:string){return EL_SATURN_LAUNCH_PRICE_BOOK.find(x=>x.id===id)}