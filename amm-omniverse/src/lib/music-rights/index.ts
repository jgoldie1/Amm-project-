// TRYAMM / StreetVerse Music Rights & Release Engine
// Release decisions are conservative: unknown, denied, expired, or out-of-scope rights block release.

export type RightsStatus = 'pending' | 'verified' | 'blocked' | 'expired'
export type ReleaseGateStatus = 'READY' | 'BLOCKED' | 'REVIEW'
export type AssetOrigin = 'original' | 'commissioned' | 'royalty-free-library' | 'public-domain' | 'cover' | 'interpolation' | 'third-party-master-sample' | 'remix' | 'unknown'

export interface RightsParty { id: string; legalName: string; role: 'writer' | 'publisher' | 'master-owner' | 'featured-artist' | 'producer' | 'performer' | 'administrator'; sharePercent?: number; pro?: 'ASCAP' | 'BMI' | 'SESAC' | 'GMR' | 'OTHER' | 'NONE' | 'UNKNOWN'; ipiCae?: string }
export interface EvidenceRef { id: string; kind: 'license' | 'split-sheet' | 'work-for-hire' | 'sample-clearance' | 'cover-license' | 'public-domain-evidence' | 'consent' | 'other'; storageRef: string; checksum?: string; effectiveAt?: string; expiresAt?: string; territories?: string[] }
export interface SampleAsset { id: string; title: string; origin: AssetOrigin; source?: string; masterPermission: RightsStatus; compositionPermission: RightsStatus; evidenceIds: string[]; contentIdEligible?: boolean }
export interface DistributionMetadata { isrc?: string; upc?: string; distributor?: 'DistroKid' | 'OTHER' | 'NONE'; releaseDate?: string; territories?: string[]; explicit?: boolean }
export interface RightsPassport { projectId: string; versionId: string; title: string; masterOwnerIds: string[]; parties: RightsParty[]; evidence: EvidenceRef[]; samples: SampleAsset[]; distribution: DistributionMetadata; compositionRegistered?: boolean; proMetadataVerified?: boolean; mlcMetadataVerified?: boolean; soundExchangeMetadataVerified?: boolean; neighboringRightsReviewed?: boolean; syncRightsReviewed?: boolean; aiProvenanceRecorded?: boolean; contentIdEligibilityReviewed?: boolean; immutableReleaseSnapshot?: string }
export interface GateFinding { code: string; severity: 'BLOCK' | 'REVIEW' | 'INFO'; message: string }

const sumShares = (parties: RightsParty[], role: RightsParty['role']) => parties.filter(p => p.role === role).reduce((sum, p) => sum + (p.sharePercent ?? 0), 0)
const parseTime = (value?: string) => value ? Date.parse(value) : Number.NaN

export function evaluateReleaseGate(passport: RightsPassport): { status: ReleaseGateStatus; findings: GateFinding[] } {
  const findings: GateFinding[] = []
  const releaseTime = Number.isFinite(parseTime(passport.distribution.releaseDate)) ? parseTime(passport.distribution.releaseDate) : Date.now()
  const requestedTerritories = passport.distribution.territories ?? []
  const evidenceById = new Map(passport.evidence.map(e => [e.id, e]))

  if (!passport.masterOwnerIds.length) findings.push({ code: 'MASTER_OWNER_MISSING', severity: 'BLOCK', message: 'Master ownership must be identified.' })
  const writerShare = sumShares(passport.parties, 'writer')
  if (writerShare <= 0 || writerShare > 100) findings.push({ code: 'WRITER_SPLITS_INVALID', severity: 'BLOCK', message: 'Writer splits must be documented and total no more than 100%.' })

  for (const sample of passport.samples) {
    if (sample.masterPermission === 'blocked' || sample.compositionPermission === 'blocked') findings.push({ code: 'RIGHTS_DENIED', severity: 'BLOCK', message: `${sample.title}: an applicable master or composition permission is explicitly denied.` })
    if (sample.origin === 'third-party-master-sample' && (sample.masterPermission !== 'verified' || sample.compositionPermission !== 'verified')) findings.push({ code: 'SAMPLE_CLEARANCE_REQUIRED', severity: 'BLOCK', message: `${sample.title}: third-party master and composition permissions must be verified.` })
    if (sample.origin === 'interpolation' && sample.compositionPermission !== 'verified') findings.push({ code: 'INTERPOLATION_CLEARANCE_REQUIRED', severity: 'BLOCK', message: `${sample.title}: composition permission must be verified.` })
    if (sample.origin === 'unknown') findings.push({ code: 'UNKNOWN_AUDIO_ORIGIN', severity: 'BLOCK', message: `${sample.title}: audio origin must be identified before release.` })
    if (sample.masterPermission === 'expired' || sample.compositionPermission === 'expired') findings.push({ code: 'RIGHTS_EXPIRED', severity: 'BLOCK', message: `${sample.title}: rights permission is expired.` })
    if (!sample.evidenceIds.length && !['original', 'public-domain'].includes(sample.origin)) findings.push({ code: 'EVIDENCE_MISSING', severity: 'REVIEW', message: `${sample.title}: attach provenance/license evidence.` })

    for (const evidenceId of sample.evidenceIds) {
      const evidence = evidenceById.get(evidenceId)
      if (!evidence) { findings.push({ code: 'EVIDENCE_REFERENCE_MISSING', severity: 'BLOCK', message: `${sample.title}: referenced rights evidence ${evidenceId} is unavailable.` }); continue }
      const effectiveAt = parseTime(evidence.effectiveAt)
      const expiresAt = parseTime(evidence.expiresAt)
      if (Number.isFinite(effectiveAt) && releaseTime < effectiveAt) findings.push({ code: 'RIGHTS_NOT_YET_EFFECTIVE', severity: 'BLOCK', message: `${sample.title}: rights evidence is not effective on the intended release date.` })
      if (Number.isFinite(expiresAt) && releaseTime > expiresAt) findings.push({ code: 'EVIDENCE_EXPIRED', severity: 'BLOCK', message: `${sample.title}: rights evidence expires before the intended release date.` })
      if (requestedTerritories.length && evidence.territories?.length) {
        const granted = new Set(evidence.territories.map(t => t.toUpperCase()))
        const uncovered = requestedTerritories.filter(t => !granted.has(t.toUpperCase()))
        if (uncovered.length) findings.push({ code: 'TERRITORY_NOT_CLEARED', severity: 'BLOCK', message: `${sample.title}: requested territories are not fully covered by the referenced rights evidence.` })
      }
    }
  }

  if (!passport.proMetadataVerified) findings.push({ code: 'PRO_METADATA', severity: 'REVIEW', message: 'Verify songwriter/publisher PRO affiliations and identifiers.' })
  if (!passport.mlcMetadataVerified) findings.push({ code: 'MECHANICAL_METADATA', severity: 'REVIEW', message: 'Review U.S. digital mechanical registration/claim metadata where applicable.' })
  if (!passport.soundExchangeMetadataVerified) findings.push({ code: 'SOUNDEXCHANGE_METADATA', severity: 'REVIEW', message: 'Review sound-recording artist/rightsholder metadata for applicable digital-performance royalties.' })
  if (!passport.neighboringRightsReviewed) findings.push({ code: 'NEIGHBORING_RIGHTS', severity: 'REVIEW', message: 'Review neighboring-rights collection and territories.' })
  if (!passport.syncRightsReviewed) findings.push({ code: 'SYNC_RIGHTS', severity: 'REVIEW', message: 'Review film, stage, advertising, game and immersive synchronization permissions.' })
  if (!passport.aiProvenanceRecorded) findings.push({ code: 'AI_PROVENANCE', severity: 'REVIEW', message: 'Record AI/human creation provenance and source inputs.' })
  if (!passport.contentIdEligibilityReviewed) findings.push({ code: 'CONTENT_ID', severity: 'REVIEW', message: 'Review Content ID eligibility separately from distribution eligibility.' })
  if (!passport.distribution.isrc) findings.push({ code: 'ISRC_MISSING', severity: 'REVIEW', message: 'Assign or preserve an ISRC before final distribution when applicable.' })
  if (!passport.immutableReleaseSnapshot) findings.push({ code: 'RELEASE_SNAPSHOT_MISSING', severity: 'BLOCK', message: 'Create an immutable release snapshot before distribution.' })
  const hasBlock = findings.some(f => f.severity === 'BLOCK')
  const hasReview = findings.some(f => f.severity === 'REVIEW')
  return { status: hasBlock ? 'BLOCKED' : hasReview ? 'REVIEW' : 'READY', findings }
}

export const ROYALTY_BUCKETS = ['composition-performance','mechanical','master-streaming-sales','sound-recording-digital-performance','neighboring-rights','sync','direct-license','creator-platform-revenue'] as const
export const RELEASE_PIPELINE = ['CREATE','RIGHTS_SCAN','CLEARANCE','SPLITS','METADATA','ROYALTY_ROUTING','IMMUTABLE_SNAPSHOT','DISTRIBUTION','MONITOR','COLLECT','LEDGER','PAYOUT'] as const
