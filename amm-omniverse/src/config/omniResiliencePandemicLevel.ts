export type OmniResiliencePhase =
  | 'normal'
  | 'watch'
  | 'local-emergency'
  | 'remote-quarantine'
  | 'recovery'

export type PandemicScenarioMode = 'historical-covid-19' | 'fictional-future-outbreak'

export const OMNI_RESILIENCE_PANDEMIC_LEVEL = {
  id: 'omniresilience-pandemic-level',
  title: 'OmniResilience • Pandemic Crisis',
  status: 'experimental',
  qualityTarget: 'premium-cinematic-survival-simulation',
  modes: ['historical-covid-19','fictional-future-outbreak'] as PandemicScenarioMode[],
  phases: ['normal','watch','local-emergency','remote-quarantine','recovery'] as OmniResiliencePhase[],
  designRules: {
    realPeopleMustBeFactSourced: true,
    fictionalizeUnsupportedClaims: true,
    noRealPersonVillainizationWithoutDocumentedBasis: true,
    noSyntheticQuotePresentedAsReal: true,
    noMedicalAdviceFromGameplay: true,
    publicHealthInformationRequiresSourceAndDate: true,
    distinguishHistoricalFromFictionalScenario: true,
  },
  chicagoLayerEffects: {
    'elevated-sky': [
      'transit-demand-changes',
      'station-crowd-management',
      'service-frequency-events',
      'essential-worker-missions',
    ],
    street: [
      'business-open-close-state',
      'delivery-demand',
      'hospital-capacity-events',
      'school-work-remote-state',
      'community-supply-missions',
    ],
    'lower-service': [
      'medical-and-food-logistics',
      'warehouse-routing',
      'essential-delivery-corridors',
      'supply-chain-bottleneck-events',
    ],
    'pedway-subway': [
      'indoor-crowd-density',
      'station-transfer-state',
      'weather-safe-essential-routing',
      'public-information-wayfinding',
    ],
    'river-deep': [
      'freight-and-river-logistics',
      'recovery-infrastructure-events',
      'fictionalized-deep-service-missions',
    ],
  },
  systems: [
    'outbreak-dashboard',
    'hospital-capacity-simulation',
    'testing-and-lab-logistics',
    'ppe-and-supply-chain',
    'food-and-medicine-delivery',
    'remote-work-and-school',
    'telehealth-navigation',
    'public-information-and-misinformation-literacy',
    'small-business-survival',
    'community-mutual-aid',
    'vaccine-and-treatment-logistics',
    'contact-and-exposure-simulation-without-real-user-tracking',
    'recovery-and-reopening',
    'economic-recovery',
    'creator-documentary-missions',
  ],
  publicFigurePolicy: {
    defaultRepresentation: 'archival-documentary-cards',
    interactiveRealPersonNPCs: false,
    syntheticVoiceOrQuoteAsReal: false,
    fictionalAdvisorsForDramaticMissions: true,
  },
} as const
