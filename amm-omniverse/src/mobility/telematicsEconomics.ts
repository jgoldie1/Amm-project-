export type TelematicsConnectionMode = 'CONNECTED_VEHICLE_API' | 'DEDICATED_HARDWARE'

export interface TelematicsCostAssumptions {
  providerPerVehicleCents: number
  connectivityPerVehicleCents: number
  mapsAndEventsPerVehicleCents: number
  supportReservePerVehicleCents: number
  hardwareAmortizationPerVehicleCents: number
}

export interface TelematicsPlanScenario {
  mode: TelematicsConnectionMode
  retailPriceCents: number
  vehicleCount: number
  costs: TelematicsCostAssumptions
}

export function monthlyVariableCostCents(costs: TelematicsCostAssumptions) {
  return costs.providerPerVehicleCents
    + costs.connectivityPerVehicleCents
    + costs.mapsAndEventsPerVehicleCents
    + costs.supportReservePerVehicleCents
    + costs.hardwareAmortizationPerVehicleCents
}

export function modelTelematicsPlan(scenario: TelematicsPlanScenario) {
  const perVehicleCostCents = monthlyVariableCostCents(scenario.costs)
  const perVehicleContributionCents = scenario.retailPriceCents - perVehicleCostCents
  return {
    monthlyRevenueCents: scenario.retailPriceCents * scenario.vehicleCount,
    monthlyVariableCostCents: perVehicleCostCents * scenario.vehicleCount,
    monthlyContributionCents: perVehicleContributionCents * scenario.vehicleCount,
    perVehicleContributionCents,
    contributionMargin: scenario.retailPriceCents > 0
      ? perVehicleContributionCents / scenario.retailPriceCents
      : 0,
  }
}

// Pricing is deliberately not hard-coded to any vendor's public marketing price.
// Production pricing must be based on TRYAMM's executed provider agreement and real usage costs.
export const TELEMATICS_PRICING_POLICY = Object.freeze({
  connectedVehicleApiPreferredWhenCompatible: true,
  hardwareFallbackSupported: true,
  vendorPricingMustBeVerifiedBeforeLaunch: true,
  customerPriceMustCoverAllInVariableCost: true,
  taxesAndRegulatedFeesExcludedFromContribution: true,
  providerSpecificPricingHardcoded: false,
})
