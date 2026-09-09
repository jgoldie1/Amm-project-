export type ResearchStage =
  | 'theory'
  | 'simulation'
  | 'bench-test'
  | 'independent-replication'
  | 'prototype'
  | 'safety-validation'
  | 'certification'
  | 'production'

export type EvidenceStatus = 'missing' | 'partial' | 'verified'

export interface MeasurementEvidence {
  metric: string
  unit: string
  measuredValue?: number
  baselineValue?: number
  instrument?: string
  calibrationReference?: string
  observedAt?: string
  status: EvidenceStatus
}

export interface QuantumGeneratorResearchRecord {
  projectName: 'Quantum Generator'
  stage: ResearchStage
  hypothesis: string
  inputEnergyWatts?: number
  outputEnergyWatts?: number
  netEnergyWatts?: number
  measurements: MeasurementEvidence[]
  independentlyReplicated: boolean
  safetyValidated: boolean
  certified: boolean
}

export function calculateNetEnergy(inputEnergyWatts?: number, outputEnergyWatts?: number) {
  if (inputEnergyWatts == null || outputEnergyWatts == null) return null
  return outputEnergyWatts - inputEnergyWatts
}

export function canAdvanceQuantumGeneratorStage(record: QuantumGeneratorResearchRecord) {
  const hasVerifiedMeasurements = record.measurements.length > 0 && record.measurements.every(m => m.status === 'verified')

  switch (record.stage) {
    case 'theory':
      return record.hypothesis.trim().length > 0
    case 'simulation':
      return hasVerifiedMeasurements
    case 'bench-test':
      return hasVerifiedMeasurements && record.inputEnergyWatts != null && record.outputEnergyWatts != null
    case 'independent-replication':
      return hasVerifiedMeasurements && record.independentlyReplicated
    case 'prototype':
      return hasVerifiedMeasurements && record.independentlyReplicated
    case 'safety-validation':
      return hasVerifiedMeasurements && record.independentlyReplicated && record.safetyValidated
    case 'certification':
      return hasVerifiedMeasurements && record.independentlyReplicated && record.safetyValidated && record.certified
    case 'production':
      return false
  }
}

export function classifyQuantumGeneratorReadiness(record: QuantumGeneratorResearchRecord) {
  if (record.stage === 'production' && record.certified && record.safetyValidated && record.independentlyReplicated) {
    return 'production-evidence-present' as const
  }
  if (record.stage === 'theory' || record.stage === 'simulation') return 'r-and-d-unverified' as const
  return 'r-and-d-evidence-gated' as const
}

export const QUANTUM_GENERATOR_CLAIM_RULES = {
  perpetualMotionClaimAllowed: false,
  freeEnergyClaimAllowed: false,
  productionReadyClaimRequiresEvidence: true,
  independentReplicationRequired: true,
  calibratedMeasurementRequired: true,
  safetyValidationRequired: true,
  certificationRequiredForProduction: true,
} as const
