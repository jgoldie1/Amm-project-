export type RevenueLane = {
  id: string
  label: string
  source: 'gameplay'|'creator'|'commerce'|'ads'|'streaming'|'education'|'services'|'telecom'|'property'|'publishing'|'events'
  settlement: 'server-verified'|'stripe-verified'|'contract-verified'
  enabled: boolean
  notes: string[]
}

export type LedgerEvent = {
  id: string
  occurredAt: string
  actorId: string
  laneId: string
  world: string
  eventType: string
  grossAmount: number
  currency: 'USD'|'OMNI_CREDIT'|'XP'
  referenceId: string
  sourceProof?: string
  status: 'pending'|'verified'|'settled'|'rejected'
}

export const OMNIVERSE_REVENUE_LANES: RevenueLane[] = [
  { id:'play-missions', label:'Get Paid to Play / sponsored missions', source:'gameplay', settlement:'server-verified', enabled:true, notes:['budget-capped','anti-duplicate','one-event-one-settlement'] },
  { id:'creator-gifts', label:'Creator gifts, PK, subscriptions and fan support', source:'creator', settlement:'server-verified', enabled:true, notes:['creator-ledger','moderation-gate'] },
  { id:'reels-omni-box', label:'Reels, Omni Box, clips and premium creator media', source:'creator', settlement:'server-verified', enabled:true, notes:['rights-proof','creator-attribution'] },
  { id:'marketplace', label:'All American Marketplace sales and seller services', source:'commerce', settlement:'stripe-verified', enabled:true, notes:['server-payment-verification','seller-payout-ledger'] },
  { id:'holo-ads', label:'Holo Ads, sponsorships and product placement', source:'ads', settlement:'contract-verified', enabled:true, notes:['campaign-budget','impression-proof','brand-safety'] },
  { id:'streaming', label:'TRYAMM Live, podcasts, music, OTT and streaming marketplace', source:'streaming', settlement:'server-verified', enabled:true, notes:['rights-proof','royalty-ledger'] },
  { id:'academy', label:'All American University, certifications and training', source:'education', settlement:'stripe-verified', enabled:true, notes:['course-entitlement','instructor-payout'] },
  { id:'jobs-services', label:'Middleverse AI jobs, freelance services and local work', source:'services', settlement:'server-verified', enabled:true, notes:['verified-work','qa-before-payout'] },
  { id:'telecom', label:'Holo Fon, connectivity, dealer and telecom services', source:'telecom', settlement:'contract-verified', enabled:true, notes:['provider-settlement','dealer-share'] },
  { id:'property', label:'PropertyVerse, listings, referrals and real-estate services', source:'property', settlement:'contract-verified', enabled:true, notes:['license-aware','referral-proof'] },
  { id:'publishing', label:'Kingdoms Press books, audio, interactive and events', source:'publishing', settlement:'server-verified', enabled:true, notes:['rights-proof','royalty-ledger'] },
  { id:'events-racing', label:'Racing, tournaments, concerts and sponsored events', source:'events', settlement:'server-verified', enabled:true, notes:['prize-reserve','eligibility-gate'] },
]

export const INTERNAL_LEDGER_RULES = [
  'append-only-event-id',
  'server-authoritative-amount',
  'one-economic-action-one-ledger-event',
  'no-client-self-awarded-cash',
  'source-proof-required-for-paid-events',
  'restricted-payout-reserve',
  'idempotency-key-required',
  'separate-xp-from-cash',
  'pending-before-verified-before-settled',
  'reconciliation-before-payout',
  'asset-license-gate-before-commercial-use',
] as const

export function createLedgerEvent(input: Omit<LedgerEvent,'id'|'occurredAt'|'status'>): LedgerEvent {
  const id = `${input.laneId}:${input.referenceId}`
  return {
    ...input,
    id,
    occurredAt: new Date().toISOString(),
    status: 'pending',
  }
}

export function canSettleEvent(event: LedgerEvent): boolean {
  return event.status === 'verified' && event.grossAmount >= 0 && Boolean(event.referenceId)
}
