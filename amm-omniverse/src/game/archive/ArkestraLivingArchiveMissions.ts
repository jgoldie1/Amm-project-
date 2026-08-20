export type ArkestraArchiveCharacter = {
  id: string
  displayName: string
  role: string
  era: 'historical'|'current'|'historical-and-current'
  verification: 'authoritative-source'|'research-needed'
  playableMode: 'research-npc'|'rights-gated-real-character'|'original-avatar-until-claimed'
  missions: string[]
}

// Historical facts are sourced from authoritative/public research.
// Name/likeness/voice/music rights remain separate from factual reference.
export const ARKESTRA_LIVING_ARCHIVE_ROSTER: ArkestraArchiveCharacter[] = [
  { id:'marshall-allen', displayName:'Marshall Allen', role:'leader; alto saxophone, flute, EVI', era:'historical-and-current', verification:'authoritative-source', playableMode:'rights-gated-real-character', missions:['The Leader Carries the Book','Arrange the Impossible','A Century of Sound','Pass the Signal Forward'] },
  { id:'elson-nascimento', displayName:'Elson Nascimento', role:'surdo drums and percussion; long-running Arkestra member', era:'historical-and-current', verification:'authoritative-source', playableMode:'rights-gated-real-character', missions:['Rhythm Holds the Ship Together','Brazil to the Arkestra','Road Manager Challenge','Twenty-Seven Pieces One Pulse'] },
  { id:'michael-ray', displayName:'Michael Ray', role:'trumpet and vocals', era:'historical-and-current', verification:'authoritative-source', playableMode:'rights-gated-real-character', missions:['Signal Through Brass','Lead the Call and Response'] },
  { id:'knoel-scott', displayName:'Knoel Scott', role:'baritone and alto saxophone', era:'historical-and-current', verification:'authoritative-source', playableMode:'rights-gated-real-character', missions:['Find the Chart','Low-Reed Constellation'] },
  { id:'vincent-chancey', displayName:'Vincent Chancey', role:'French horn', era:'historical-and-current', verification:'authoritative-source', playableMode:'rights-gated-real-character', missions:['The Missing Color','Horn in Orbit'] },
  { id:'tyler-mitchell', displayName:'Tyler Mitchell', role:'bass', era:'historical-and-current', verification:'authoritative-source', playableMode:'rights-gated-real-character', missions:['Gravity of the Groove','Hold the Orbit'] },
  { id:'tara-middleton', displayName:'Tara Middleton', role:'voice, percussion and violin', era:'current', verification:'authoritative-source', playableMode:'rights-gated-real-character', missions:['Voice Across Space','Strings and Signal'] },
  { id:'john-gilmore', displayName:'John Gilmore', role:'tenor saxophone; major historical Arkestra member', era:'historical', verification:'authoritative-source', playableMode:'research-npc', missions:['The Tenor Archive','Trace the Chicago Sound'] },
  { id:'pat-patrick', displayName:'Pat Patrick', role:'baritone saxophone; major historical Arkestra member', era:'historical', verification:'authoritative-source', playableMode:'research-npc', missions:['Baritone Foundation','Follow the Early Arkestra'] },
  { id:'june-tyson', displayName:'June Tyson', role:'vocalist and performer', era:'historical', verification:'authoritative-source', playableMode:'research-npc', missions:['Voice of the Pageant','Performance as Worldbuilding'] },
]

export type CharacterClaim = {
  rosterCharacterId: string
  claimantUserId: string
  requestedAt: string
  status: 'requested'|'identity-review'|'consent-review'|'rights-review'|'approved'|'rejected'
  evidenceIds: string[]
}

export function canPublishClaimedCharacter(claim: CharacterClaim) {
  return claim.status === 'approved' && claim.evidenceIds.length > 0
}

export const ARKESTRA_CLAIM_PATH = [
  'find your archive character',
  'sign in to TRYAMM',
  'request character claim',
  'verify identity or authorized representation',
  'confirm consent for public profile/avatar',
  'review likeness, voice, music and archival-media rights separately',
  'approve the claim',
  'unlock creator-controlled biography corrections and mission participation',
] as const

export const LIVING_ARCHIVE_LOOP = [
  'PLAY',
  'DISCOVER',
  'RESEARCH THE REAL ARCHIVE',
  'RETURN TO THE GAME',
  'SOLVE THE MISSION',
  'PRESERVE THE EVIDENCE',
  'COMPARE FACT vs INTERPRETATION vs FAMILY MEMORY',
  'BUILD SOMETHING NEW FROM THE HISTORY',
  'LET LIVING PARTICIPANTS CLAIM THEIR CHARACTER',
  'WORLD MEMORY RECORDS THE CONTRIBUTION',
  'PASS KNOWLEDGE TO THE NEXT GENERATION',
] as const
