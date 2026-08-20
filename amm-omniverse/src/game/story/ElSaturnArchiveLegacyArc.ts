export type ArchiveMission = {
  id: string
  title: string
  location: string
  objectives: string[]
  unlocks: string[]
  evidenceMode: 'public-archive'|'player-authored-family-claim'|'rights-gated'
}

// Public-history facts in this module should be backed by archival sources.
// Family/heir relationships remain player-authored until documentary evidence is reviewed.
export const EL_SATURN_PUBLIC_HISTORY = {
  altonAbraham: {
    born: 1927,
    died: 1999,
    roles: ['entrepreneur','hospital technician','Sun Ra friend and business associate','Saturn/El Saturn business collaborator'],
  },
  archive: {
    canonicalName: 'Alton Abraham Collection of Sun Ra',
    repository: 'Hanna Holborn Gray Special Collections Research Center, University of Chicago Library',
    collectionSize: '156.5 linear feet / 147 boxes plus oversize material',
    contentTypes: ['manuscripts','business records','printed ephemera','artifacts','photographs','audio','video','music manuscripts','art and artifacts'],
    researchAccess: 'archive/research rules apply; some audiovisual and restricted materials require staff consultation',
  },
  exhibition: {
    title: "Sounds from Tomorrow's World: Sun Ra and the Chicago Years, 1946-1961",
    institution: 'University of Chicago Library',
    basis: 'materials drawn from the Alton Abraham Papers/Collection of Sun Ra',
  },
  elSaturn: {
    origin: 'Chicago',
    note: 'Archival records describe Alton Abraham, his brother Artis, and Sun Ra as central to El Saturn/Saturn research and recording activity in the 1950s.',
  },
} as const

export const EL_SATURN_ARCHIVE_MISSIONS: ArchiveMission[] = [
  { id:'old-name', title:'The Old Name', location:'Chicago', objectives:['hear the El Saturn name in a World Memory echo','ask Stubbs AI what is documented versus family memory','unlock the archive investigation'], unlocks:['who-was-alton'], evidenceMode:'public-archive' },
  { id:'who-was-alton', title:'Who Was Alton Abraham?', location:'Chicago archive layer', objectives:['explore a rights-safe virtual reading room','inspect metadata for business, music, science and correspondence records','build an evidence timeline'], unlocks:['family-tree','el-saturn-archive'], evidenceMode:'public-archive' },
  { id:'el-saturn-archive', title:'The El Saturn Archive', location:'University of Chicago research-world adapter', objectives:['navigate a virtual finding-aid experience','discover recording/business/artifact categories','request rights-safe reproductions through the Evidence Receiver','separate archival fact from dramatized reconstruction'], unlocks:['lost-session','build-orchestra'], evidenceMode:'public-archive' },
  { id:'family-tree', title:'The Family Tree', location:'private evidence room', objectives:['record the claimed Alton Abraham → Alton Stubbs → James Stubbs relationship','attach family documents when available','keep heirship status evidence-pending until independently supported'], unlocks:['what-did-we-inherit'], evidenceMode:'player-authored-family-claim' },
  { id:'lost-session', title:'The Lost Session', location:'holographic studio reconstruction', objectives:['reconstruct an original fictional session from archive metadata','identify roles of musicians, engineer, label and manager','avoid copying unreleased/protected recordings'], unlocks:['build-orchestra'], evidenceMode:'rights-gated' },
  { id:'build-orchestra', title:'Build the Orchestra', location:'Chicago cosmic music district', objectives:['recruit 27 original musician NPC roles','rehearse sections','solve arrangement and leadership challenges','perform an original cosmic-jazz composition'], unlocks:['chicago-to-saturn'], evidenceMode:'rights-gated' },
  { id:'chicago-to-saturn', title:'Chicago to Saturn', location:'StreetVerse → SpaceVerse portal', objectives:['use original music to activate the immersive-art portal','travel through a cosmic environment','recover knowledge fragments about independent art, science and entrepreneurship','return to Chicago'], unlocks:['what-did-we-inherit'], evidenceMode:'rights-gated' },
  { id:'what-did-we-inherit', title:'What Did We Inherit?', location:'Legacy chamber', objectives:['separate family history, cultural inheritance, knowledge and legal property','review evidence status','choose what the next generation should build','write the decision into World Memory'], unlocks:['next-generation'], evidenceMode:'player-authored-family-claim' },
]

export const LEGACY_CHAIN = [
  'ALTON ABRAHAM',
  'EL SATURN',
  'CHICAGO MUSIC HISTORY',
  'FAMILY MEMORY',
  'EVIDENCE',
  "JAMES'S LIFE",
  'STREETVERSE',
  'SPACEVERSE',
  'NEXT GENERATION',
] as const

export const INHERITANCE_LAYERS = {
  family: 'relationships, oral history and documented genealogy',
  culture: 'Chicago jazz, independent production and Afrofuturist history',
  knowledge: 'music, entrepreneurship, research, art and technology',
  legalProperty: 'only rights established by valid ownership, estate, contract, copyright, trademark or other legal evidence',
} as const
