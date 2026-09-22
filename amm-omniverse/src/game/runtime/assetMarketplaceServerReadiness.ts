export type MarketplaceEndpoint =
  | 'POST /api/marketplace/assets/listings'
  | 'POST /api/marketplace/assets/checkout'
  | 'POST /api/marketplace/assets/webhooks/payment'
  | 'GET /api/marketplace/assets/purchases/:transactionId'
  | 'GET /api/marketplace/assets/entitlements'
  | 'POST /api/marketplace/assets/refunds'

export interface MarketplaceServerDependencies {
  authenticateUser: boolean
  durableDatabase: boolean
  paymentProvider: boolean
  webhookSignatureVerification: boolean
  idempotencyStore: boolean
  rightsService: boolean
  assetCertificationService: boolean
  taxAndFeeAccounting: boolean
  ledger: boolean
  entitlementStore: boolean
  auditLog: boolean
  monitoring: boolean
}

export interface MarketplaceRouteReadiness {
  endpoint: MarketplaceEndpoint
  dependencies: MarketplaceServerDependencies
}

export function missingServerDependencies(readiness: MarketplaceRouteReadiness): (keyof MarketplaceServerDependencies)[] {
  return (Object.entries(readiness.dependencies) as [keyof MarketplaceServerDependencies, boolean][])
    .filter(([, ready]) => !ready)
    .map(([name]) => name)
}

export function canEnableMarketplaceRoute(readiness: MarketplaceRouteReadiness): boolean {
  return missingServerDependencies(readiness).length === 0
}

export const MARKETPLACE_SERVER_BUILD_ORDER: MarketplaceEndpoint[] = [
  'POST /api/marketplace/assets/listings',
  'POST /api/marketplace/assets/checkout',
  'POST /api/marketplace/assets/webhooks/payment',
  'GET /api/marketplace/assets/purchases/:transactionId',
  'GET /api/marketplace/assets/entitlements',
  'POST /api/marketplace/assets/refunds',
]

// Routes must remain disabled until their dependencies are real and verified.
// Never ship a mock payment-success response in production.
// Provider webhook verification and durable idempotency are mandatory before entitlement or ledger writes.
