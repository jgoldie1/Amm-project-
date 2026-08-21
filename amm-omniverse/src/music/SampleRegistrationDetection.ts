export type SampleStatus = 'declared'|'detected-review'|'clearance-pending'|'cleared'|'rejected'|'original-no-sample'

export const SAMPLE_REGISTRATION_PIPELINE = [
  'UPLOAD/RECORD SONG',
  'CREATOR SAMPLE DECLARATION',
  'AUDIO FINGERPRINT + SIMILARITY SCREEN',
  'POTENTIAL MATCH REVIEW',
  'IDENTIFY MASTER + COMPOSITION OWNERS',
  'UPLOAD LICENSE/CLEARANCE EVIDENCE',
  'RIGHTS TEAM/HUMAN REVIEW',
  'SPLITS + TERRITORY + TERM + USAGE LIMITS',
  'APPROVE OR BLOCK DISTRIBUTION',
  'PRESERVE PROVENANCE',
] as const

export const SAMPLE_REGISTRATION_FIELDS = [
  'trackId','creatorId','usesSample','sampleSourceTitle','sampleSourceArtist','sampleStartMs','sampleDurationMs',
  'masterOwner','compositionOwner','licenseEvidenceId','territories','termStart','termEnd','allowedUses','status'
] as const

export const SAMPLE_DETECTION_RULES = {
  purpose: 'risk-screening-and-review',
  neverClaim: 'Automated similarity is not proof of infringement or ownership.',
  matches: ['exact-fingerprint','likely-recording-match','melodic/harmonic-similarity-review','declared-sample-cross-check'],
  actions: ['clear','request-evidence','human-review','block-release-until-resolved'],
  preserveCreatorAppeal: true,
  preserveAuditTrail: true,
} as const

export const MUSIC_RELEASE_GATE = {
  allow: ['original-no-sample','cleared'],
  blockCommercialRelease: ['declared','detected-review','clearance-pending','rejected'],
  rule: 'Unresolved sample rights cannot enter paid distribution, monetized streaming, paid ads, commercial Movie Box export, or payable creator earnings.',
  draftUse: 'Private drafting/editing may continue where lawful and platform policy permits; public/commercial release remains gated.',
} as const

export const MUSIC_MONETIZATION_LANES = {
  creatorFree: ['record/basic-edit','rights-registration','sample-declaration','basic-detection-screen','save/reopen','basic Movie Box'],
  optionalPaidDigital: ['premium-studio-tools','Lottie-2-effect-packs','advanced-spatial-tools','premium-digital-sets'],
  revenueShare: ['qualified-streams','eligible-live-performance','tickets','subscriptions','authorized-music-sales','merchandise'],
  prohibited: ['pay-for-organic-chart-rank','pay-to-fake-streams','pay-to-bypass-rights','pay-to-bypass-sample-clearance','pay-to-win-creator-earnings'],
  principle: 'Charge for real tools, services and optional promotion; do not charge creators merely for the right to be heard or to qualify for legitimate earnings.'
} as const
