export type ClaimStatus = 'unclaimed' | 'pending' | 'verified' | 'rejected' | 'suspended'
export type StorefrontStatus = 'draft' | 'private-preview' | 'open' | 'paused'

export type BusinessRegistryRecord = {
  source: string
  externalId: string
  legalName: string
  doingBusinessAs?: string
  address?: string
  city: string
  regionId: string
  licenseType?: string
  licenseStatus?: string
  latitude?: number
  longitude?: number
}

export type BusinessClaim = {
  id: string
  registryRecordId: string
  claimantUserId: string
  status: ClaimStatus
  verificationMethods: Array<'business-email' | 'domain' | 'phone' | 'license-document' | 'manual-review'>
  verifiedAt?: string
}

export type DigitalStorefront = {
  id: string
  businessClaimId: string
  status: StorefrontStatus
  displayName: string
  description: string
  categories: string[]
  hours?: Record<string, string>
  services: Array<{ id: string; name: string; priceCents?: number; bookingEligible: boolean }>
  customerCapacity: number
  trafficMultiplier: number
  reputation: number
}

export type StorefrontTrafficState = {
  footTraffic: number
  onlineTraffic: number
  customersWaiting: number
  customersServed: number
  conversions: number
  revenueCents: number
  abandonedVisits: number
}

export const BUSINESS_CLAIM_FLOW = [
  'Search public registry record',
  'Select Claim this business',
  'Authenticate account',
  'Prove relationship using approved verification method',
  'Manual review when automated proof is insufficient',
  'Create private storefront preview',
  'Configure hours, services, media, accessibility and staff',
  'Run compliance/license readiness checks',
  'Open storefront',
  'Receive simulated foot traffic + eligible real marketplace traffic',
] as const

export function createStorefrontTraffic(seed = 1): StorefrontTrafficState {
  const normalized = Math.max(1, seed)
  return {
    footTraffic: 20 * normalized,
    onlineTraffic: 35 * normalized,
    customersWaiting: 0,
    customersServed: 0,
    conversions: 0,
    revenueCents: 0,
    abandonedVisits: 0,
  }
}

export function simulateTrafficTick(
  state: StorefrontTrafficState,
  storefront: DigitalStorefront,
  inputs: { districtDemand: number; eventBoost: number; serviceQuality: number; priceFit: number }
): StorefrontTrafficState {
  const demand = Math.max(0, inputs.districtDemand)
  const eventBoost = Math.max(0, inputs.eventBoost)
  const quality = Math.max(0, Math.min(1.5, inputs.serviceQuality))
  const priceFit = Math.max(0, Math.min(1.5, inputs.priceFit))
  const newVisitors = Math.floor((demand + eventBoost) * storefront.trafficMultiplier * (0.75 + storefront.reputation / 200))
  const capacityLeft = Math.max(0, storefront.customerCapacity - state.customersWaiting)
  const entering = Math.min(newVisitors, capacityLeft)
  const turnedAway = Math.max(0, newVisitors - entering)
  const serviceRate = Math.max(1, Math.floor(storefront.customerCapacity * 0.25 * quality))
  const served = Math.min(state.customersWaiting + entering, serviceRate)
  const conversionRate = Math.max(0.05, Math.min(0.95, 0.25 * quality * priceFit))
  const conversions = Math.floor(served * conversionRate)
  const averageTicketCents = storefront.services.find(service => typeof service.priceCents === 'number')?.priceCents ?? 1500

  return {
    footTraffic: state.footTraffic + entering,
    onlineTraffic: state.onlineTraffic + Math.floor(newVisitors * 0.7),
    customersWaiting: Math.max(0, state.customersWaiting + entering - served),
    customersServed: state.customersServed + served,
    conversions: state.conversions + conversions,
    revenueCents: state.revenueCents + conversions * averageTicketCents,
    abandonedVisits: state.abandonedVisits + turnedAway,
  }
}

export type MarketplaceRevenuePolicy = {
  subscriptionCents: number
  promotedPlacementCents?: number
  bookingPlatformFeeBps: number
  ancillaryMarketplaceFeeBps: number
  regulatedServiceMode: 'provider-contract-required' | 'disabled'
}

export const DEFAULT_MARKETPLACE_REVENUE_POLICY: MarketplaceRevenuePolicy = {
  subscriptionCents: 2900,
  promotedPlacementCents: 1500,
  bookingPlatformFeeBps: 500,
  ancillaryMarketplaceFeeBps: 1000,
  regulatedServiceMode: 'provider-contract-required',
}

export function calculatePlatformFee(amountCents: number, basisPoints: number) {
  if (!Number.isFinite(amountCents) || amountCents <= 0) return 0
  const bps = Math.max(0, Math.min(10000, basisPoints))
  return Math.round((amountCents * bps) / 10000)
}
