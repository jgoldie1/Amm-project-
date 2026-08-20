export type EvidenceClass = 'archive-fact'|'interpretation'|'family-memory'|'community-lead'|'rights-cleared'

export type ArchiveMissionSeed = {
  id: string
  sourceTitle: string
  sourceUrl: string
  evidenceClass: EvidenceClass
  historicalQuestion: string
  reconstruction: string
  researchRoles: string[]
  creationChallenge: string
  businessChallenge: string
  legacyOutcome: string
}

export const ARCHIVE_TO_CREATOR_SEEDS: ArchiveMissionSeed[] = [
  {
    id:'distribution-to-direct-audience',
    sourceTitle:'Alton Abraham Collection of Sun Ra',
    sourceUrl:'https://www.lib.uchicago.edu/e/scrc/findingaids/view.php?eadid=ICU.SPCL.ABRAHAMA',
    evidenceClass:'archive-fact',
    historicalQuestion:'How did an independent music operation record, promote, distribute and reach listeners outside conventional gatekeepers?',
    reconstruction:'Holographic El Saturn business lab with rights-safe fictional documents and simulated pressing/distribution tools.',
    researchRoles:['archive researcher','community historian','artist','label operator'],
    creationChallenge:'Create an original rights-clean recording, artwork and provenance record.',
    businessChallenge:'Choose direct sales, distributor simulation, fan club, mailing list and modern storefront paths; set transparent splits.',
    legacyOutcome:'Teach another fictional creator to launch without surrendering ownership by default.',
  },
  {
    id:'archive-object-to-living-art',
    sourceTitle:'Alton Abraham Collection of Sun Ra',
    sourceUrl:'https://www.lib.uchicago.edu/e/scrc/findingaids/view.php?eadid=ICU.SPCL.ABRAHAMA',
    evidenceClass:'archive-fact',
    historicalQuestion:'What can physical artifacts reveal that a summary cannot?',
    reconstruction:'Immersive Library artifact chamber with holographic object inspection, provenance overlays and Time Machine context.',
    researchRoles:['curator','historian','visual artist','accessibility narrator'],
    creationChallenge:'Transform the lesson into an original living mural, spatial-audio piece or holographic installation.',
    businessChallenge:'Publish only original/cleared work through creator tools with attribution and provenance.',
    legacyOutcome:'The installation changes as future players add verified research and original responses.',
  },
  {
    id:'musician-constellation',
    sourceTitle:'Alton Abraham Collection of Sun Ra',
    sourceUrl:'https://www.lib.uchicago.edu/e/scrc/findingaids/view.php?eadid=ICU.SPCL.ABRAHAMA',
    evidenceClass:'archive-fact',
    historicalQuestion:'How did musicians, performances, places, recordings and business infrastructure connect over time?',
    reconstruction:'A holographic constellation links people, dates, cities, instruments, documents and performances.',
    researchRoles:['player','claimed historical character','authorized representative','community historian'],
    creationChallenge:'Assemble an original 27-piece cosmic orchestra and compose an original response to the research.',
    businessChallenge:'Run rehearsal, staffing, venue, ticketing and rights-clearance simulations.',
    legacyOutcome:'A younger NPC studies the constellation and later becomes a creator, researcher or bandleader.',
  },
]

export const ARCHIVE_MISSION_PIPELINE = [
  'ARCHIVE OBJECT OR DOCUMENT',
  'SOURCE LINK + CITATION METADATA',
  'HOLOGRAPHIC RECONSTRUCTION',
  'HISTORICAL QUESTION',
  'HUMAN RESEARCH CHARACTER',
  'STUBBS AI EVIDENCE CHECK',
  'FACT vs INTERPRETATION vs FAMILY MEMORY',
  'PLAYABLE MISSION',
  'ORIGINAL CREATION',
  'OWNERSHIP + PROVENANCE',
  'CREATOR BUSINESS',
  'DIRECT AUDIENCE',
  'WORLD MEMORY',
  'TEACH THE NEXT GENERATION',
] as const

export const CREATOR_COOPERATIVE_SYSTEMS = [
  'original-work registration',
  'collaborator split ledger',
  'rights/provenance receipts',
  'creator storefront',
  'fan/follower relationship tools',
  'ticketed rights-cleared events',
  'merchandise for owned/cleared IP',
  'job board for musicians, engineers, designers and production crew',
  'education/mentorship missions',
  'archive research attribution',
  'World Memory impact tracking',
] as const

export const NEXT_GENERATION_LOOP = [
  'LEARN THE HISTORY',
  'QUESTION THE EVIDENCE',
  'CREATE ORIGINAL WORK',
  'KEEP CLEAR OWNERSHIP RECORDS',
  'BUILD AN AUDIENCE',
  'CREATE JOBS',
  'MENTOR A NEW CREATOR',
  'LEAVE THE WORLD',
  'WORLD CONTINUES',
  'RETURN YEARS LATER',
  'SEE WHAT THE NEW CREATOR BUILT',
  'ADD THE RESULT TO THE LIVING ARCHIVE',
] as const
