export type BalanceKind = 'STREET_CREDIT' | 'REWARD' | 'PAYABLE'
export type CommerceRole = 'BUSINESS' | 'CUSTOMER' | 'SCOUT' | 'TRYAMM'

export type BusinessPassport = {
  businessId: string
  legalName: string
  displayName: string
  countryCode: string
  city: string
  ownerAuthorized: boolean
  blackOwned?: boolean
  products: string[]
  services: string[]
  deliveryEnabled: boolean
  digitalTwinEnabled: boolean
}

export type RevenueSplit = {
  grossMinor: number
  currency: string
  merchantMinor: number
  tryammFeeMinor: number
  scoutCommissionMinor: number
  taxMinor: number
}

export const globalCommercePolicy = {
  name: 'TRYAMM Global Business Commerce',
  rules: [
    'LICENSED_PAYMENT_PROVIDER_FOR_REAL_MONEY',
    'SERVER_AUTHORITATIVE_LEDGER',
    'STREET_CREDIT_NOT_CASH_CONVERTIBLE',
    'PAYABLE_REQUIRES_VERIFIED_TRANSACTION',
    'DISCLOSED_PLATFORM_FEES',
    'DISCLOSED_SCOUT_COMMISSIONS',
    'KYC_KYB_WHERE_REQUIRED',
    'SANCTIONS_AND_COUNTRY_CONTROLS',
    'TAX_AND_RECORDKEEPING_CONTROLS',
    'CHARGEBACK_AND_REFUND_CONTROLS',
    'NO_CLIENT_AUTHORITY_OVER_PAYABLE_BALANCE',
  ] as const,
}

export function validateBusinessPassport(passport: BusinessPassport) {
  const errors: string[] = []
  if (!passport.businessId || !passport.legalName) errors.push('BUSINESS_IDENTITY_REQUIRED')
  if (!passport.countryCode || passport.countryCode.length !== 2) errors.push('COUNTRY_CODE_REQUIRED')
  if (!passport.ownerAuthorized) errors.push('OWNER_AUTHORIZATION_REQUIRED')
  return { valid: errors.length === 0, errors }
}

export function calculateRevenueSplit(args: {
  grossMinor: number
  currency: string
  tryammFeeBps: number
  scoutCommissionBps?: number
  taxMinor?: number
}): RevenueSplit {
  const grossMinor = Math.max(0, Math.trunc(args.grossMinor))
  const taxMinor = Math.max(0, Math.trunc(args.taxMinor ?? 0))
  const tryammFeeMinor = Math.floor((grossMinor * Math.max(0, args.tryammFeeBps)) / 10_000)
  const scoutCommissionMinor = Math.floor((grossMinor * Math.max(0, args.scoutCommissionBps ?? 0)) / 10_000)
  const merchantMinor = Math.max(0, grossMinor - taxMinor - tryammFeeMinor - scoutCommissionMinor)
  return { grossMinor, currency: args.currency.toUpperCase(), merchantMinor, tryammFeeMinor, scoutCommissionMinor, taxMinor }
}

export function canPromoteToPayable(input: {
  providerVerified: boolean
  serverVerified: boolean
  fraudHold: boolean
  complianceHold: boolean
}) {
  return input.providerVerified && input.serverVerified && !input.fraudHold && !input.complianceHold
}

export const blackBusinessGrowthLoop = [
  'DIRECTORY',
  'BUSINESS_PASSPORT',
  'DIGITAL_TWIN',
  'PLANET_CLONE',
  'MARKETPLACE',
  'DELIVERY',
  'HOLO_ADS',
  'MIDDLEVERSE_JOBS',
  'SUPPLIER_NETWORK',
  'CONTRACT_OPPORTUNITIES',
  'CHECKOUT',
  'VERIFIED_SETTLEMENT',
  'ANALYTICS',
  'REPEAT_GROWTH',
] as const
