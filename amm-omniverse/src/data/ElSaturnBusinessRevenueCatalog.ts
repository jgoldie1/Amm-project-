import {priceFor,type PriceBookEntry} from './ElSaturnLaunchPriceBook'
export type RevenueModel='subscription'|'usage'|'transaction-fee'|'setup-fee'|'managed-service'|'marketplace-commission'|'license'|'fabrication-margin'|'delivery-fee'|'fintech-fee'
export type ProductStatus='sellable-foundation'|'provider-gated'|'pilot'|'internal-only'
export type BusinessProduct={
 id:string;brand:'El Saturn'|'TRYAMM'|'Lyons Tech'|'Middleverse AI';name:string;category:string;
 revenueModels:RevenueModel[];status:ProductStatus;customer:string;value:string;productionBoundary?:string;pricing?:PriceBookEntry
}

const BASE_BUSINESS_PRODUCT_CATALOG:Omit<BusinessProduct,'pricing'>[]=[
 {id:'ai-business-os',brand:'TRYAMM',name:'AI Business OS',category:'SaaS',revenueModels:['subscription','setup-fee','managed-service'],status:'sellable-foundation',customer:'small business / creator / local merchant',value:'Holographic Founder Command, website/storefront, AI copilot, Business Passport, CRM-like workflows, commerce, analytics, support and approval-aware business operations.'},
 {id:'business-server',brand:'Lyons Tech',name:'Business Server Package',category:'Cloud / SaaS',revenueModels:['subscription','setup-fee','managed-service'],status:'sellable-foundation',customer:'businesses that need TRYAMM-hosted tools',value:'Hosted business services, integrations, storage, automation, commerce and operational dashboards.'},
 {id:'middleverse-workforce',brand:'Middleverse AI',name:'AI Workforce + Contact Center',category:'Workforce SaaS',revenueModels:['subscription','usage','managed-service'],status:'sellable-foundation',customer:'businesses needing remote support/sales/operations',value:'AI-assisted contact center, task routing, training, QA, remote workers and business operators.'},
 {id:'logistics-os',brand:'Lyons Tech',name:'Logistics + Fleet OS',category:'Logistics SaaS',revenueModels:['subscription','usage','transaction-fee','managed-service'],status:'sellable-foundation',customer:'fleets / owner-operators / merchants / 3PLs',value:'Freight planning, fleet, owner-operator onboarding, BOL/POD, detention/accessorial tracking, EV fleet, drones and Proof Tracking.'},
 {id:'commerce-network',brand:'TRYAMM',name:'Omnichannel Commerce Network',category:'Commerce',revenueModels:['subscription','marketplace-commission','transaction-fee','managed-service'],status:'provider-gated',customer:'brands / sellers / creators',value:'TRYAMM, StreetVerse, LIVE, Holographic Gallery, Shopify/eBay bridges, sourcing and fulfillment.'},
 {id:'fintech-orchestration',brand:'El Saturn',name:'El Saturn Fintech Orchestration',category:'Fintech',revenueModels:['fintech-fee','transaction-fee','subscription','managed-service'],status:'provider-gated',customer:'businesses / creators / marketplaces',value:'Payment routing, Omni Cash, Aniyah Pay, payouts, ledger reconciliation, fraud controls and cross-border payment orchestration.',productionBoundary:'Money movement requires regulated/payment providers, KYC/KYB, webhooks, reconciliation and jurisdiction-specific compliance.'},
 {id:'creator-monetization',brand:'TRYAMM',name:'Creator Revenue Network',category:'Creator Economy',revenueModels:['subscription','transaction-fee','marketplace-commission'],status:'sellable-foundation',customer:'creators / hosts / agencies',value:'LIVE, Reels, gifts, subscriptions, sponsorship, products, tickets, licensing and verified creator ledgers.'},
 {id:'robotics-cell',brand:'Lyons Tech',name:'Robotic Fabrication Cell Services',category:'Robotics / Manufacturing',revenueModels:['managed-service','usage','fabrication-margin','setup-fee'],status:'pilot',customer:'designers / product companies / local manufacturers',value:'Robot-arm assisted fabrication, machine vision, scanning, tool changing, assembly, finishing and quality evidence.',productionBoundary:'Physical work requires certified machines, safety controls, qualified operators and human approval.'},
 {id:'12d-fabrication',brand:'El Saturn',name:'12D Fabrication Service',category:'Advanced Manufacturing',revenueModels:['fabrication-margin','usage','setup-fee','managed-service','license'],status:'pilot',customer:'R&D / product design / digital-twin customers',value:'Design-to-fabrication workflow using Asset Passport, simulation, advanced multi-material/robotic manufacturing and inspection evidence.',productionBoundary:'12D is an R&D/future fabrication platform; no browser prompt directly controls physical motion.'},
 {id:'print-swarm',brand:'TRYAMM',name:'Distributed Print Swarm Network',category:'Manufacturing Marketplace',revenueModels:['marketplace-commission','usage','managed-service'],status:'pilot',customer:'print shops / operators / customers needing distributed production',value:'Split verified production orders across certified operators with QA, evidence, shipping and settlement.'},
 {id:'holo-services',brand:'TRYAMM',name:'Holo Services Suite',category:'Digital Services',revenueModels:['subscription','usage','managed-service','license'],status:'sellable-foundation',customer:'businesses / campuses / communities',value:'HoloGPT, Holo Gallery, Holo Ads, Holo Labs, Holo FON, Holo Delivery, Holo Music/TV and world services.'},
]
export const BUSINESS_PRODUCT_CATALOG:BusinessProduct[]=BASE_BUSINESS_PRODUCT_CATALOG.map(product=>({...product,pricing:priceFor(product.id)}))

export const BUSINESS_REVENUE_RULES={
 serverAuthoritativeBilling:true,
 clientCannotCreatePayableBalance:true,
 regulatedServicesFailClosed:true,
 noGuaranteedRevenue:true,
 noUnverifiedProviderClaims:true,
 recurringRevenueFirst:true,
 transactionRevenueSecond:true,
 managedServicesForHighTouchCustomers:true,
} as const

export function productsByRevenue(model:RevenueModel){return BUSINESS_PRODUCT_CATALOG.filter(p=>p.revenueModels.includes(model))}