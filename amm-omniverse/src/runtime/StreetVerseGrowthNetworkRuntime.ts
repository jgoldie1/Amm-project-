export type BusinessCategory =
  | 'restaurant' | 'gas-station' | 'grocery' | 'retail' | 'beauty' | 'automotive'
  | 'home-services' | 'music-entertainment' | 'fitness' | 'logistics' | 'legal'
  | 'telehealth' | 'healthcare' | 'financial-services' | 'insurance' | 'real-estate'
  | 'education' | 'professional-services'

export type BusinessNetworkInput = {
  businessId: string
  ownerUserId: string
  scoutId?: string
  category: BusinessCategory
  name: string
  city?: string
  ownerApprovedPhotos?: boolean
  regulatedVerification?: 'not-required' | 'pending' | 'verified' | 'blocked'
}

export type GrowthNetworkPlan = {
  businessId: string
  regulated: boolean
  enabledLanes: string[]
  blockedUntilVerified: string[]
  jobsCreated: string[]
  distribution: string[]
}

const regulated = new Set<BusinessCategory>(['legal','telehealth','healthcare','financial-services','insurance'])

const workLanes = [
  'business-scout','business-verifier','photo-content-capture','storefront-operator',
  'middleverse-ai-call-center','appointment-order-support','creator-reel-producer',
  'holo-ad-campaign-operator','live-stream-moderator','pk-event-operator',
  'commerce-operations','delivery-dispatch-support','ctv-ott-programming-operator',
  'telecom-customer-support'
]

const commonLanes = [
  'streetverse-storefront','business-qr-passport','global-business-registry',
  'business-server-package','marketplace','booking','delivery-eligibility',
  'holo-advertising','reels','live-streaming','pk-events','middleverse-ai-call-center',
  'earnings-ledger','business-earnings-center','scout-attribution','command-nexus-economics',
  'ctv-ott-distribution','fast-tv-distribution','all-american-network','servants-network',
  'isaiah-ai-tv','telecom-cross-promotion','holo-fon-entry'
]

const emit = (name: string, detail: unknown) => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(name, { detail }))
}

export function buildGrowthNetworkPlan(input: BusinessNetworkInput): GrowthNetworkPlan {
  const isRegulated = regulated.has(input.category)
  const isVerified = input.regulatedVerification === 'verified'
  const blockedUntilVerified = isRegulated && !isVerified
    ? ['regulated-service-activation','regulated-client-intake','regulated-transaction']
    : []

  const enabledLanes = commonLanes.filter((lane) => {
    if (!isRegulated || isVerified) return true
    return !['booking','delivery-eligibility'].includes(lane)
  })

  if (['restaurant','grocery','gas-station'].includes(input.category)) {
    enabledLanes.push('food-convenience-commerce','local-delivery-dispatch','live-menu-commerce')
  }
  if (input.category === 'music-entertainment') {
    enabledLanes.push('64-track-studio','starverse','music-live-pk','ticket-merch-commerce')
  }

  return {
    businessId: input.businessId,
    regulated: isRegulated,
    enabledLanes: Array.from(new Set(enabledLanes)),
    blockedUntilVerified,
    jobsCreated: [...workLanes],
    distribution: ['streetverse','reels','live','pk','holo-ads','marketplace','ctv','ott','fast-tv']
  }
}

export function activateStreetVerseBusinessNetwork(input: BusinessNetworkInput) {
  const plan = buildGrowthNetworkPlan(input)
  const attribution = { businessId: input.businessId, scoutId: input.scoutId ?? null, source: 'streetverse-scout-network' }

  emit('tryamm:growth-network:activated', { input, plan })
  emit('tryamm:middleverse:work-opportunity', { businessId: input.businessId, jobs: plan.jobsCreated })
  emit('tryamm:holo-ads:business-eligible', { businessId: input.businessId, category: input.category })
  emit('tryamm:creator:promotion-opportunity', { businessId: input.businessId, channels: plan.distribution })
  emit('tryamm:broadcast:distribution-opportunity', {
    businessId: input.businessId,
    destinations: ['all-american-network','servants-network','isaiah-ai-tv','ctv','ott','fast-tv'],
    providerActivationRequired: true
  })
  emit('tryamm:telecom:cross-promotion-opportunity', {
    businessId: input.businessId,
    channels: ['holo-fon','tryamm-connect'],
    carrierProvisioningRequired: true
  })
  emit('tryamm:command-nexus:economics-register', {
    ...attribution,
    ledgers: ['business','worker','creator','scout','platform'],
    serverAuthoritative: true
  })
  return plan
}

export function installStreetVerseGrowthNetworkRuntime() {
  if (typeof window === 'undefined') return
  const w = window as Window & {
    __streetVerseGrowthNetworkInstalled?: boolean
    __activateStreetVerseBusinessNetwork?: typeof activateStreetVerseBusinessNetwork
    __buildStreetVerseGrowthNetworkPlan?: typeof buildGrowthNetworkPlan
  }
  if (w.__streetVerseGrowthNetworkInstalled) return
  w.__streetVerseGrowthNetworkInstalled = true
  w.__activateStreetVerseBusinessNetwork = activateStreetVerseBusinessNetwork
  w.__buildStreetVerseGrowthNetworkPlan = buildGrowthNetworkPlan

  emit('tryamm:growth-network:ready', {
    systems: [
      'StreetVerse Scout Network','Business QR Passport','Global Business Registry',
      'Business Server Package','Delivery Network','Agent Earnings Ledger','Business Earnings Center',
      'Command Nexus Economics','Middleverse AI Call Center','Holo Advertising','Live','PK','Reels',
      'CTV','OTT','FAST TV','TRYAMM Connect','Holo FON'
    ],
    providerGates: ['live carrier activation','eSIM provisioning','CTV/OTT media buying/distribution','regulated professional services','real-money settlement']
  })
}
