// StreetVerse music ecosystem routing layer.
// Names here represent TRYAMM internal brands/roles unless an executed external agreement is recorded.

export type EcosystemNodeId =
  | 'all-american-records'
  | 'spectra-entertainment'
  | 'all-american-network'
  | 'holo-music'
  | 'holoverse'
  | 'streetverse'
  | 'rights-release-engine'
  | 'creator-ledger'

export interface EcosystemNode {
  id: EcosystemNodeId
  name: string
  role: string
  status: 'LOCKED' | 'BUILDING' | 'READY' | 'LIVE'
  externalAgreementRequired?: boolean
}

export const MUSIC_ECOSYSTEM: EcosystemNode[] = [
  { id: 'all-american-records', name: 'All American Records', role: 'Label/A&R, artist development, masters and release campaigns', status: 'LOCKED' },
  { id: 'spectra-entertainment', name: 'Spectra Entertainment', role: 'Entertainment production, talent, events, film/stage and sync coordination', status: 'LOCKED', externalAgreementRequired: true },
  { id: 'all-american-network', name: 'All American Network', role: 'Owned media, FAST/CTV/OTT, promotion, premieres, interviews and advertising inventory', status: 'LOCKED' },
  { id: 'holo-music', name: 'Holo Music', role: 'Spatial/binaural/AR/VR/MR music, virtual concerts and holographic product experiences', status: 'LOCKED' },
  { id: 'holoverse', name: 'HoloVerse', role: 'Immersive worlds, venues, missions, virtual merchandise and fan experiences', status: 'LOCKED' },
  { id: 'streetverse', name: 'StreetVerse', role: 'Creator discovery, social distribution, LIVE, reels, community and commerce', status: 'BUILDING' },
  { id: 'rights-release-engine', name: 'Rights & Release Engine', role: 'Rights Passport, clearance, metadata, release gate and distribution adapters', status: 'BUILDING' },
  { id: 'creator-ledger', name: 'Creator Ledger', role: 'Separated revenue/royalty accounting, reconciliation and payout state', status: 'BUILDING' },
]

export const MUSIC_ECOSYSTEM_FLOW = [
  'StreetVerse discovery/create',
  'All American Records A&R/project ownership',
  'Rights & Release clearance',
  'Holo Music immersive production',
  'Spectra Entertainment production/sync/event coordination',
  'All American Network owned-media launch',
  'HoloVerse immersive experiences',
  'Distribution adapters and external destinations',
  'Usage/revenue reconciliation',
  'Creator Ledger payout',
] as const

export interface PartnerAuthorization {
  partnerNode: EcosystemNodeId
  agreementId?: string
  verified: boolean
  scopes: string[]
  territories?: string[]
  expiresAt?: string
}

export function canUseExternalPartner(node: EcosystemNode, authorization?: PartnerAuthorization): boolean {
  if (!node.externalAgreementRequired) return true
  return Boolean(authorization?.verified && authorization.partnerNode === node.id && authorization.agreementId)
}
