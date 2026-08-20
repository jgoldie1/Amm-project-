export type ArchiveLegacyPerson = {
  id: string
  displayName: string
  status: 'archive-supported'|'player-authored-claim'
  roles: string[]
  missionHooks: string[]
  claimable: boolean
  rightsGate: string[]
}

export const EL_SATURN_ARCHIVE_PEOPLE: ArchiveLegacyPerson[] = [
  {
    id:'danny-davis', displayName:'Danny Davis', status:'archive-supported',
    roles:['Arkestra alto saxophone','flute','historical ensemble node'],
    missionHooks:['Two Horns, One Signal','Read the Personnel Sheet','Build the 27-Piece Arkestra'], claimable:true,
    rightsGate:['likeness','voice','recordings','music/performance rights'],
  },
  {
    id:'teddy-thomas', displayName:'Teddy Thomas', status:'archive-supported',
    roles:['percussion','dance','historical performance node'],
    missionHooks:['Rhythm in Motion','Dance Is Part of the Arrangement','1991 Performance Map'], claimable:true,
    rightsGate:['likeness','voice','recordings','performance rights'],
  },
  {
    id:'lacy-gibson', displayName:'Lacy Gibson', status:'player-authored-claim',
    roles:['El Saturn artist / Chicago blues connection — evidence pending'],
    missionHooks:['Chicago Blues Meets Saturn','Bring the Source','Artist Ledger'], claimable:true,
    rightsGate:['identity verification','archive/source verification','likeness','voice','recording rights'],
  },
  {
    id:'bessie-smith-family-memory', displayName:'Bessie Smith family connection', status:'player-authored-claim',
    roles:['family-history node — genealogy evidence pending'],
    missionHooks:['The Blues Before Saturn','Family Tree: Bring the Evidence','Women Who Changed the Sound'], claimable:false,
    rightsGate:['genealogy verification','estate/publicity analysis','music/recording rights'],
  },
]

export const ARCHIVE_TO_GAME_MISSIONS = [
  {
    id:'personnel-sheet-detective', title:'Read the Personnel Sheet',
    loop:['open authoritative archive/source','identify musicians and instruments','compare dates and personnel','mark uncertainty','unlock musician-specific mission'],
    reward:'research skill + verified-history reputation',
  },
  {
    id:'two-horns-one-signal', title:'Two Horns, One Signal',
    loop:['study Danny Davis performance credits','build an original alto/flute phrase','trade phrases with an original NPC ensemble','use harmony to activate a holographic archive portal'],
    reward:'woodwind arranging skill + cosmic orchestra part',
  },
  {
    id:'rhythm-in-motion', title:'Rhythm in Motion',
    loop:['research Teddy Thomas performance role','learn percussion-and-movement timing','complete accessible rhythm choreography','direct an original 27-piece stage sequence'],
    reward:'percussion leadership + movement direction',
  },
  {
    id:'chicago-blues-meets-saturn', title:'Chicago Blues Meets Saturn',
    loop:['receive the player-authored Lacy Gibson lead','search archive/catalog evidence','separate supported facts from family/community memory','create an original blues-to-space-jazz collaboration'],
    reward:'source-analysis skill + original recording opportunity',
  },
  {
    id:'blues-before-saturn', title:'The Blues Before Saturn',
    loop:['open the player-authored Bessie Smith family-memory node','build a genealogy evidence checklist','research blues history from authoritative sources','create an original rights-clean blues lesson/performance'],
    reward:'family-history research + blues legacy chapter',
  },
  {
    id:'artist-ledger', title:'The Artist Ledger',
    loop:['study historical independent-label business records','create an original artist agreement simulation','set transparent splits and provenance','press a limited virtual release','sell directly to simulated fans','audit every payment'],
    reward:'creator-cooperative governance + marketplace unlock',
  },
  {
    id:'archive-constellation', title:'The Archive Constellation',
    loop:['map recordings, performances, people and business documents as stars','connect evidence nodes','resolve conflicting metadata','open a Time Machine destination from a supported date/place'],
    reward:'Immersive Library curator rank',
  },
  {
    id:'build-the-label-without-gatekeepers-plus', title:'Build the Label Without the Gatekeepers: Living Edition',
    loop:['write original music','recruit rights-cleared players','record','document provenance','create artwork','set splits','market directly','fulfill simulated orders','preserve masters','mentor another creator'],
    reward:'All American Network creator-label pathway',
  },
]

export const CLAIM_CHARACTER_PIPELINE = [
  'FIND CHARACTER','SIGN IN','CLAIM CHARACTER','VERIFY IDENTITY OR AUTHORIZED REPRESENTATION','GIVE CONSENT',
  'RIGHTS REVIEW','APPROVAL','CONTROL BIOGRAPHY CORRECTIONS','OPTIONAL LIKENESS/VOICE LICENSE','PARTICIPATE IN MISSIONS',
] as const

export const EL_SATURN_TO_TRYAMM_LOOP = [
  'ALTON ABRAHAM + SUN RA','EL SATURN','ARTIST CONTROL','INDEPENDENT RECORDING','PROMOTION','DISTRIBUTION',
  'DIRECT AUDIENCE','PROVENANCE','ORIGINAL RIGHTS-CLEAN MUSIC','CREATOR COOPERATIVE','ALL AMERICAN NETWORK',
  'TRYAMM STOREFRONTS + CREATOR TOOLS','WORLD MEMORY','NEXT GENERATION',
] as const

export const LEARNING_TO_LEGACY = ['HISTORY','EDUCATION','GAMEPLAY','CREATION','ENTREPRENEURSHIP','OWNERSHIP','EMPLOYMENT','LEGACY'] as const
