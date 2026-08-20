export type HistoricalClaim = {
  claim: string
  status: 'documented' | 'interpretive' | 'player-authored'
  note: string
}

export const EL_SATURN_LEGACY_CLAIMS: HistoricalClaim[] = [
  {
    claim: 'Alton Abraham and Sun Ra built Saturn/El Saturn as an artist-controlled independent music operation in Chicago.',
    status: 'documented',
    note: 'University of Chicago business records document recording, performance, distribution and promotion operations; PBS describes Saturn as one of the earliest Black artist-owned labels.',
  },
  {
    claim: 'Alton Abraham was a father of decentralized music.',
    status: 'interpretive',
    note: 'Use as a StreetVerse thesis/theme rather than an uncontested historical title: the documented model anticipated artist control, direct distribution, small-batch releases and independent infrastructure.',
  },
]

export const DECENTRALIZED_MUSIC_MISSIONS = [
  {
    id: 'build-the-label-without-the-gatekeepers',
    title: 'Build the Label Without the Gatekeepers',
    objectives: ['study rights-safe archive metadata','design an artist-controlled label','choose ownership and revenue rules','press/release a fictional original recording','sell directly to an in-world audience'],
    unlocks: ['independent-label skill','creator-business reputation','All American Network distribution path'],
  },
  {
    id: 'seventy-five-copies',
    title: 'Seventy-Five Copies',
    objectives: ['budget a small-batch release','create original cover art','coordinate manufacturing','sell at a performance','compare scarcity, reach and artist control'],
    unlocks: ['physical-media economy','collector NPCs','archive artifact mission'],
  },
  {
    id: 'from-saturn-to-streaming',
    title: 'From Saturn to Streaming',
    objectives: ['map historical independent distribution to modern creator tools','build a rights ledger','publish an original in-game release','track transparent splits','preserve provenance in World Memory'],
    unlocks: ['creator ledger','modern decentralized-distribution lesson','music-business mission chain'],
  },
  {
    id: 'archive-roundtable',
    title: 'The Archive Roundtable',
    objectives: ['invite approved researchers/fans','compare memories against primary sources','flag disagreements instead of inventing certainty','publish a sourced exhibit note'],
    unlocks: ['historian reputation','Immersive Library curator missions','evidence-receiver submissions'],
  },
] as const

export type CommunityHistorianSlot = {
  id: string
  displayName: string
  source: string
  status: 'player-nominated-unverified'
  avatarPolicy: 'original-avatar-until-consent-and-identity-verification'
  missionRoles: string[]
}

// The user nominated this person from Facebook. Do not assert historian credentials,
// identity, endorsement, private Facebook content, likeness, or voice until verified/consented.
export const BRAD_MARCUS_HISTORIAN_SLOT: CommunityHistorianSlot = {
  id: 'brad-marcus-sun-ra-community',
  displayName: 'Brad Marcus',
  source: 'player nomination: Facebook / Sun Ra fan community',
  status: 'player-nominated-unverified',
  avatarPolicy: 'original-avatar-until-consent-and-identity-verification',
  missionRoles: ['community researcher','archive roundtable guest','discography clue-giver','oral-history contributor'],
}

export const BRAD_MARCUS_MISSION_PATH = [
  'Community Signal — meet the player-nominated researcher through an original avatar',
  'Bring a Source — locate an authoritative archive record for a disputed clue',
  'Pressing Detective — compare catalog/pressing metadata without copying protected recordings',
  'Archive Roundtable — separate documented history, interpretation and personal memory',
  'Curate the Future — help create a sourced Immersive Library exhibit using cleared/original assets',
] as const

export const EL_SATURN_TO_TRYAMM_LOOP = [
  'ARCHIVE',
  'ARTIST CONTROL',
  'ORIGINAL MUSIC',
  'RIGHTS + PROVENANCE',
  'DIRECT DISTRIBUTION',
  'CREATOR REVENUE',
  'WORLD MEMORY',
  'ALL AMERICAN NETWORK',
  'NEXT GENERATION',
] as const
