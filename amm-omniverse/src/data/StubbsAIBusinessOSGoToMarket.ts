export type BusinessOSMarketSegment={
  id:string
  label:string
  pain:string
  demo:string
  primaryOffer:'starter'|'pro'|'commerce'|'managed'
}

export const STUBBS_AI_BUSINESS_OS_MARKET_SEGMENTS:readonly BusinessOSMarketSegment[]=[
  {id:'local-service',label:'Local service businesses',pain:'Missed leads, follow-up, scheduling, customer questions and scattered tools.',demo:'Show lead intake → AI follow-up draft → booking/work queue → founder brief.',primaryOffer:'pro'},
  {id:'restaurant-catering',label:'Restaurants + catering',pain:'Orders, catering leads, promotions, reviews, staffing communication and repeat customers.',demo:'Show campaign → inquiry → booking/order workflow → support → daily owner summary.',primaryOffer:'pro'},
  {id:'retail-commerce',label:'Retail + ecommerce',pain:'Catalog updates, customer support, promotions, fulfillment visibility and analytics.',demo:'Show product → Holo showroom → checkout intent → fulfillment/ledger visibility.',primaryOffer:'commerce'},
  {id:'creator-host',label:'Creators + hosts',pain:'Content planning, sponsorship follow-up, products, LIVE/Reels and earnings visibility.',demo:'Show content calendar → LIVE/Reel → offer → Creator Money / ledger.',primaryOffer:'starter'},
  {id:'fleet-logistics',label:'Small fleets + logistics operators',pain:'Dispatch communication, documents, customer updates, exceptions and proof tracking.',demo:'Show job intake → operations queue → exception alert → proof/ledger view.',primaryOffer:'managed'},
] as const

export const STUBBS_AI_BUSINESS_OS_SALES_MOTION=[
  {stage:'DEMO',goal:'Make the owner see their business inside the command room in 5 minutes.',exit:'Prospect identifies at least one painful workflow worth fixing.'},
  {stage:'AUDIT',goal:'Map 3 repetitive tasks or revenue/service bottlenecks.',exit:'Scope is written and high-impact actions requiring approval are marked.'},
  {stage:'SETUP',goal:'Configure the selected Business-in-a-Box plan and integrations.',exit:'Customer accepts disclosed setup/provider costs and production boundaries.'},
  {stage:'SUBSCRIBE',goal:'Activate recurring service after checkout/contract authority is verified.',exit:'Server-authoritative billing or signed contract confirms the plan.'},
  {stage:'EXPAND',goal:'Add managed operations, Holo Services, commerce, workforce or custom integrations.',exit:'Expansion is tied to measured use, workload or customer outcome.'},
] as const

export const STUBBS_AI_BUSINESS_OS_CHANNELS=[
  'founder-led local demonstrations',
  'short-form demo reels showing before/after workflow',
  'LIVE webinar / business clinic',
  'business association and chamber partnerships',
  'accountant / marketer / IT consultant referral partners',
  'customer referral program with disclosed terms',
  'targeted outbound business audit invitation',
  'TRYAMM Business Passport and directory cross-sell',
] as const

export const STUBBS_AI_BUSINESS_OS_SALES_POLICY={
  noGuaranteedRevenue:true,
  noFakeAutomationClaims:true,
  providerGatedClaimsMustStayGated:true,
  regulatedActionsRequireProviderOrHumanAuthority:true,
  quantResearchStartsPaperOnly:true,
  checkoutMustMatchDisclosedPriceAndTerms:true,
  primaryPitch:'Run more of your business from one AI command center.',
  demoHook:'See your business as a holographic operating map—then click into the real workflows underneath.',
} as const
