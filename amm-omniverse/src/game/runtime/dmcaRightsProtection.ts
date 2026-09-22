export type ProtectedContentKind = 'music'|'sound-recording'|'composition'|'image'|'photo'|'video'|'nft-media'|'3d-asset'|'game-asset'|'other'
export type DmcaCaseState = 'submitted'|'needs-info'|'review'|'restricted'|'counter-notice'|'restored'|'removed'|'closed'

export interface DmcaContact {
  name: string
  email: string
  address: string
  phone?: string
}

export interface DmcaNotice {
  id: string
  kind: ProtectedContentKind
  claimant: DmcaContact
  copyrightedWorkDescription: string
  allegedlyInfringingLocations: string[]
  goodFaithStatementAccepted: boolean
  accuracyAndAuthorityStatementAccepted: boolean
  electronicSignature: string
  submittedAt: string
}

export interface DmcaCounterNotice {
  id: string
  caseId: string
  uploader: DmcaContact
  removedMaterialDescription: string
  priorLocation: string
  mistakeOrMisidentificationStatementAccepted: boolean
  jurisdictionConsentAccepted: boolean
  serviceOfProcessAccepted: boolean
  electronicSignature: string
  submittedAt: string
}

export interface DmcaCase {
  id: string
  noticeId: string
  contentId: string
  uploaderUserId: string
  state: DmcaCaseState
  restrictedAt?: string
  removedAt?: string
  restoredAt?: string
  counterNoticeId?: string
  evidenceIds: string[]
  auditEventIds: string[]
}

export interface RightsEvidence {
  id: string
  contentId: string
  type: 'original-file'|'license'|'assignment'|'permission'|'registration'|'purchase-record'|'provenance'|'other'
  uri: string
  submittedByUserId: string
  createdAt: string
}

export interface RepeatInfringerRecord {
  userId: string
  validStrikeCaseIds: string[]
  status: 'clear'|'warning'|'restricted'|'terminated'
}

export const DMCA_WORKFLOW = [
  'RECEIVE_NOTICE',
  'VALIDATE_REQUIRED_FIELDS',
  'PRESERVE_EVIDENCE',
  'LOCATE_CONTENT',
  'RESTRICT_OR_REMOVE_WHEN_REQUIRED',
  'NOTIFY_UPLOADER',
  'ACCEPT_COUNTER_NOTICE',
  'FORWARD_COUNTER_NOTICE',
  'WAIT_STATUTORY_WINDOW',
  'RESTORE_IF_LEGALLY_PERMITTED',
  'UPDATE_REPEAT_INFRINGER_RECORD',
  'CLOSE_WITH_AUDIT_TRAIL',
] as const

export function noticeHasRequiredStatements(notice: DmcaNotice): boolean {
  return Boolean(
    notice.claimant.name &&
    notice.claimant.email &&
    notice.claimant.address &&
    notice.copyrightedWorkDescription &&
    notice.allegedlyInfringingLocations.length &&
    notice.goodFaithStatementAccepted &&
    notice.accuracyAndAuthorityStatementAccepted &&
    notice.electronicSignature
  )
}

export function counterNoticeHasRequiredStatements(notice: DmcaCounterNotice): boolean {
  return Boolean(
    notice.uploader.name &&
    notice.uploader.email &&
    notice.uploader.address &&
    notice.removedMaterialDescription &&
    notice.priorLocation &&
    notice.mistakeOrMisidentificationStatementAccepted &&
    notice.jurisdictionConsentAccepted &&
    notice.serviceOfProcessAccepted &&
    notice.electronicSignature
  )
}

// NFTs do not automatically establish copyright ownership. Rights to the underlying media must be proven separately.
// This module is a workflow/data contract, not legal advice or an automated legal decision engine.
// Deadlines, designated-agent details, statutory wording, and restoration/removal decisions must be configured
// and reviewed against the law applicable at the time of operation.
