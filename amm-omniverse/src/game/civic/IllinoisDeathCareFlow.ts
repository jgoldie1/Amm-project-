import type { IllinoisRegionId } from '../world/IllinoisRegionalWorld'

export type DeathCareStage =
  | 'scene-reported'
  | 'ems-police-response'
  | 'authority-notified'
  | 'scene-investigation'
  | 'transport-authorized'
  | 'forensic-facility'
  | 'release-authorized'
  | 'funeral-provider-selected'
  | 'arrangements'
  | 'final-disposition'
  | 'closed'

export type DeathCareAuthority = {
  regionId: IllinoisRegionId
  county: string
  authorityType: 'medical-examiner' | 'coroner'
  authorityLabel: string
  facilityLabel: string
}

export const DEATH_CARE_AUTHORITIES: Record<IllinoisRegionId, DeathCareAuthority> = {
  chicago: {
    regionId: 'chicago',
    county: 'Cook County',
    authorityType: 'medical-examiner',
    authorityLabel: 'Cook County Medical Examiner',
    facilityLabel: 'Cook County forensic facility pathway',
  },
  'mount-vernon': {
    regionId: 'mount-vernon',
    county: 'Jefferson County',
    authorityType: 'coroner',
    authorityLabel: 'Jefferson County Coroner',
    facilityLabel: 'Jefferson County coroner-designated transport/facility pathway',
  },
  herrin: {
    regionId: 'herrin',
    county: 'Williamson County',
    authorityType: 'coroner',
    authorityLabel: 'Williamson County Coroner',
    facilityLabel: 'Williamson County coroner-designated transport/facility pathway',
  },
  peoria: {
    regionId: 'peoria',
    county: 'Peoria County',
    authorityType: 'coroner',
    authorityLabel: 'Peoria County Coroner',
    facilityLabel: 'Peoria County morgue/coroner pathway',
  },
  greenville: {
    regionId: 'greenville',
    county: 'Bond County',
    authorityType: 'coroner',
    authorityLabel: 'Bond County Coroner',
    facilityLabel: 'Bond County coroner-designated transport/facility pathway',
  },
}

export type DeathCareCase = {
  id: string
  regionId: IllinoisRegionId
  stage: DeathCareStage
  syntheticPersonId: string
  causeClassification: 'natural' | 'accident' | 'homicide-suspected' | 'suicide-suspected' | 'undetermined' | 'pending'
  sceneSecured: boolean
  authorityAccepted: boolean
  transportJobId?: string
  funeralProviderId?: string
  disposition?: 'burial' | 'cremation' | 'other-lawful-disposition'
  notes: string[]
}

export const DEATH_CARE_JOBS = [
  '911 dispatcher',
  'EMS responder',
  'Police scene-security officer',
  'Coroner/medical-examiner investigator simulation',
  'Death-care transport driver',
  'Morgue coordinator simulation',
  'Forensic-pathology support simulation',
  'Family liaison/social worker simulation',
  'Licensed funeral director',
  'Licensed funeral director/embalmer',
  'Funeral-home attendant',
  'Cemetery worker',
  'Crematory operator where lawfully licensed',
  'Florist',
  'Caterer',
  'Memorial media/streaming producer',
  'Obituary/memorial designer',
] as const

export function nextDeathCareStage(caseFile: DeathCareCase, action: string): DeathCareCase {
  const transitions: Record<DeathCareStage, Record<string, DeathCareStage>> = {
    'scene-reported': { dispatch: 'ems-police-response' },
    'ems-police-response': { notifyAuthority: 'authority-notified' },
    'authority-notified': { acceptCase: 'scene-investigation' },
    'scene-investigation': { authorizeTransport: 'transport-authorized' },
    'transport-authorized': { arriveFacility: 'forensic-facility' },
    'forensic-facility': { authorizeRelease: 'release-authorized' },
    'release-authorized': { selectProvider: 'funeral-provider-selected' },
    'funeral-provider-selected': { beginArrangements: 'arrangements' },
    arrangements: { recordDisposition: 'final-disposition' },
    'final-disposition': { closeCase: 'closed' },
    closed: {},
  }
  const next = transitions[caseFile.stage]?.[action]
  if (!next) return caseFile
  return { ...caseFile, stage: next, notes: [...caseFile.notes, `${caseFile.stage} → ${next}`] }
}

export const DEATH_CARE_SAFETY_RULES = [
  'Use fictional/synthetic identities for gameplay cases.',
  'No graphic body imagery is required for gameplay progression.',
  'Do not use real death records to recreate identifiable victims or accuse real people.',
  'Government authority stages do not generate private platform commissions.',
  'Paid funeral or disposition services require verified provider eligibility and applicable licensing.',
  'Sensitive family information stays private and access-controlled.',
] as const
