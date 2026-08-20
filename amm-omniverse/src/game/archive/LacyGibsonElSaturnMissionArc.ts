export type ArchiveEvidence = {
  source: string
  locator: string
  establishes: string[]
  doesNotEstablish?: string[]
}

export const LACY_GIBSON_EL_SATURN_EVIDENCE: ArchiveEvidence[] = [
  {
    source: 'University of Chicago — Alton Abraham Collection of Sun Ra',
    locator: 'Box 66 — Lacy Gibson, Saturn 436, 45 rpm records and inserts, circa 1960s',
    establishes: ['Lacy Gibson recording represented in the Alton Abraham archive', 'Saturn 436 association', 'archival audio/record object exists'],
    doesNotEstablish: ['automatic game reproduction rights', 'automatic master/composition license'],
  },
  {
    source: 'University of Chicago — Alton Abraham Collection of Sun Ra',
    locator: 'Box 19 Folder 19 — Atra Productions, Lacy Gibson promotional material, circa 1968',
    establishes: ['Lacy Gibson promotional material is preserved in the collection', 'promotion/business-history research hook'],
  },
  {
    source: '1972/1973 Billboard Buyers Guide historical listing',
    locator: 'El Saturn Research listing',
    establishes: ['Alton E. Abraham listed as president/general manager', 'Sun Ra listed as musical director', 'Lacy Gibson listed in R&B coordination / production-era roles in historical trade listings'],
  },
]

export const LACY_GIBSON_MISSIONS = [
  {
    id: 'saturn-436',
    title: 'Saturn 436: Follow the Record',
    objective: 'Locate the archive entry, connect the record object to promotion and distribution evidence, and build a rights-safe holographic provenance chain.',
    unlocks: ['el-saturn-print-shop','distribution-document-1957'],
  },
  {
    id: 'el-saturn-print-shop',
    title: 'Ink, Stamp, Sleeve',
    objective: 'Enter the immersive print shop, create original cover art, assign provenance, prepare a limited virtual pressing, and generate accessible digital packaging.',
    unlocks: ['seventy-five-copies'],
  },
  {
    id: 'seventy-five-copies',
    title: 'Seventy-Five Copies',
    objective: 'Run a tiny rights-clean release: budget production, manufacture a limited simulated pressing, choose direct/community distribution, and measure demand without pay-to-win mechanics.',
    unlocks: ['mailing-list-network'],
  },
  {
    id: 'mailing-list-network',
    title: 'Build the Audience Before the Algorithm',
    objective: 'Use historical direct-audience concepts to build a consent-based fictional fan list, promote an original release, and compare direct communication with modern algorithmic discovery.',
    unlocks: ['from-saturn-to-streaming'],
  },
  {
    id: 'from-saturn-to-streaming',
    title: 'From Saturn to Streaming',
    objective: 'Translate independent recording, promotion, distribution and audience ownership into a modern creator-business simulation for TRYAMM.',
    unlocks: ['creator-cooperative'],
  },
  {
    id: 'creator-cooperative',
    title: 'Build the Creator Cooperative',
    objective: 'Recruit rights-cleared original artists, define transparent splits, hire engineers/designers/promoters, publish through All American Network, open creator storefronts, and preserve every contribution in World Memory.',
    unlocks: ['teach-next-generation'],
  },
  {
    id: 'teach-next-generation',
    title: 'Pass the Infrastructure Forward',
    objective: 'Mentor a new fictional artist through creation, ownership, provenance, promotion and direct audience building; their later career becomes a persistent World Memory consequence.',
    unlocks: [],
  },
] as const

export const ARCHIVE_TO_CREATOR_LOOP = [
  'ARCHIVE OBJECT',
  'HOLOGRAPHIC RECONSTRUCTION',
  'HISTORICAL QUESTION',
  'HUMAN RESEARCH CHARACTER',
  'STUBBS AI EVIDENCE CHECK',
  'PLAYABLE MISSION',
  'ORIGINAL CREATION',
  'OWNERSHIP + PROVENANCE',
  'CREATOR BUSINESS',
  'DIRECT AUDIENCE',
  'WORLD MEMORY',
  'TEACH NEXT GENERATION',
] as const

export const EL_SATURN_TO_TRYAMM = [
  'ALTON ABRAHAM + SUN RA',
  'EL SATURN',
  'INDEPENDENT INFRASTRUCTURE',
  'ARTIST CONTROL',
  'DIRECT AUDIENCE',
  'CREATOR OWNERSHIP',
  'TRYAMM CREATOR ECONOMY',
  'NEXT GENERATION',
] as const
