export type FractionalAssetType =
  | 'vacation-home'
  | 'vehicle'
  | 'farm-equipment'
  | 'creator-equipment'
  | 'commercial-equipment'
  | 'real-estate-investment'
  | 'business-equity'
  | 'security'
  | 'tokenized-security'

export type FractionalLane = 'shared-use' | 'regulated-investment'

export interface FractionalOfferingRequest {
  assetType: FractionalAssetType
  lane: FractionalLane
  jurisdiction: string
  ownerEntityId: string
  totalUnits: number
  pricePerUnitMinor: number
  currency: string
  expectedProfitOrYield?: boolean
  passiveInvestorStructure?: boolean
  regulatedPartnerId?: string
  complianceApprovalId?: string
  custodyOrEscrowProviderId?: string
}

export interface FractionalOfferingDecision {
  allowed: boolean
  execution: 'shared-use-contract' | 'regulated-partner' | 'blocked'
  reason: string
  requiresHumanApproval: boolean
}

const ALWAYS_REGULATED = new Set<FractionalAssetType>([
  'real-estate-investment',
  'business-equity',
  'security',
  'tokenized-security',
])

/**
 * TRYAMM Fractional Ownership launch gate.
 *
 * Shared-use/co-ownership products and investment products are intentionally
 * separated. Anything involving passive profit expectations, securities,
 * business equity or investment real estate is blocked from direct execution
 * unless an approved regulated partner, compliance approval and escrow/custody
 * path are configured.
 */
export function evaluateFractionalOffering(
  request: FractionalOfferingRequest,
): FractionalOfferingDecision {
  if (!request.ownerEntityId || !request.jurisdiction) {
    return { allowed: false, execution: 'blocked', reason: 'owner entity and jurisdiction are required', requiresHumanApproval: true }
  }
  if (!Number.isInteger(request.totalUnits) || request.totalUnits < 2) {
    return { allowed: false, execution: 'blocked', reason: 'fractional offerings require at least two whole ownership/use units', requiresHumanApproval: false }
  }
  if (!Number.isSafeInteger(request.pricePerUnitMinor) || request.pricePerUnitMinor <= 0 || !request.currency) {
    return { allowed: false, execution: 'blocked', reason: 'valid unit price and currency are required', requiresHumanApproval: false }
  }

  const investmentLike =
    request.lane === 'regulated-investment' ||
    ALWAYS_REGULATED.has(request.assetType) ||
    request.expectedProfitOrYield === true ||
    request.passiveInvestorStructure === true

  if (investmentLike) {
    if (!request.regulatedPartnerId || !request.complianceApprovalId || !request.custodyOrEscrowProviderId) {
      return {
        allowed: false,
        execution: 'blocked',
        reason: 'investment-like fractional ownership is locked until regulated partner, compliance approval, and custody/escrow are configured',
        requiresHumanApproval: true,
      }
    }
    return {
      allowed: true,
      execution: 'regulated-partner',
      reason: 'route through approved regulated offering/execution infrastructure; TRYAMM does not self-clear the investment',
      requiresHumanApproval: true,
    }
  }

  return {
    allowed: true,
    execution: 'shared-use-contract',
    reason: 'eligible shared-use/co-ownership structure may proceed subject to title, insurance, contract, tax and local-law verification',
    requiresHumanApproval: true,
  }
}

export const FRACTIONAL_REVENUE_MODEL = Object.freeze({
  listingSetupFee: true,
  recurringAssetManagementFee: true,
  bookingOrUsageFee: true,
  insuranceAdministrationFee: true,
  maintenanceCoordinationFee: true,
  resaleTransferAdministrationFee: true,
  holographicTourPremium: true,
  aiAssetManagementPremium: true,
  regulatedOfferingFeeOnlyThroughApprovedPartner: true,
  customerInvestmentPrincipalAsTRYAMMRevenue: false,
})

export const FRACTIONAL_RELEASE_GATES = Object.freeze({
  sharedUseVacationHomes: 'gated-pilot',
  sharedUseVehicles: 'gated-pilot',
  sharedUseEquipment: 'gated-pilot',
  realEstateInvestmentFractions: 'regulated-locked',
  businessEquityFractions: 'regulated-locked',
  securities: 'regulated-locked',
  tokenizedSecurities: 'regulated-locked',
})
