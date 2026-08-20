export const ALTON_ABRAHAM_ARCHIVE_SOURCE = {
  title: 'Guide to the Alton Abraham Collection of Sun Ra 1822-2008',
  institution: 'University of Chicago Library — Hanna Holborn Gray Special Collections Research Center',
  canonicalUrl: 'https://www.lib.uchicago.edu/e/scrc/findingaids/view.php?eadid=ICU.SPCL.ABRAHAMA',
  accessMode: 'external-authoritative-research-link',
  sourceUse: 'metadata-and-research-navigation',
} as const

export const IMMERSIVE_ARCHIVE_GALLERIES = [
  { id:'bio', title:'Origins & Biography', sourceSeries:'Series I: Biographical', experience:'holographic Chicago timeline + research terminals' },
  { id:'performance', title:'Performance Universe', sourceSeries:'Series II: Performance', experience:'interactive tour-map constellation + venue/time portals' },
  { id:'recording', title:'Saturn Recording Lab', sourceSeries:'Series III: Recording', experience:'rights-safe record-production simulation' },
  { id:'manuscripts', title:'Music Manuscript Observatory', sourceSeries:'Series IV: Music Manuscripts', experience:'original composition/arranging mini-games; archival works remain research references unless licensed' },
  { id:'verse', title:'Words & Ideas', sourceSeries:'Series V: Verse, Prose and Notes', experience:'research constellation; no unlicensed reproduction of protected text' },
  { id:'business', title:'El Saturn Business Lab', sourceSeries:'Series VI: Business Records', experience:'independent-label entrepreneurship simulation' },
  { id:'abraham', title:'Alton Abraham Lab', sourceSeries:'Series VII: Alton Abraham', experience:'science, technology, spirituality, music instruction and entrepreneurship research portals' },
  { id:'av', title:'Audio-Visual Vault', sourceSeries:'Series VIII: Audio-Visual', experience:'rights-gated media catalog; no archival playback unless permitted' },
  { id:'artifacts', title:'Art & Artifact Chamber', sourceSeries:'Series IX: Art and Artifacts', experience:'original holographic artifact interpretation + provenance missions' },
] as const

export const ALTON_ABRAHAM_ARCHIVE_MISSIONS = [
  {
    id:'archive-first-door', title:'The First Door',
    objective:'Open the authoritative finding aid, learn how archival series and box/folder references work, and bookmark three research targets.',
    reward:'Archive Research skill +1',
  },
  {
    id:'archive-el-saturn-business', title:'Build an Independent Label',
    objective:'Use public finding-aid metadata about business records as inspiration to build an original rights-safe label workflow: artist → session → manufacturing → promotion → distribution → ledger.',
    reward:'El Saturn Business Lab access',
  },
  {
    id:'archive-performance-map', title:'Constellation of Performances',
    objective:'Navigate documented performance locations and dates as stars on a holographic map, then unlock StreetVerse travel-history research missions.',
    reward:'Performance Universe portal',
  },
  {
    id:'archive-arkestra-roster', title:'Who Played in the Arkestra?',
    objective:'Research documented members from archival/public sources, separate confirmed roster evidence from game-fiction roles, and populate a rights-gated historical timeline.',
    reward:'Historical roster research node',
  },
  {
    id:'archive-family-evidence', title:'Memory Is Not the Same as Evidence',
    objective:'Compare player-authored family memory with documentary evidence and route supporting records into the private Evidence + Rights Receiver.',
    reward:'Evidence Literacy + Legacy insight',
  },
  {
    id:'archive-lost-session', title:'The Lost Session',
    objective:'Solve an original fictional mystery using catalog metadata, dates, business clues and music-production knowledge without claiming an undocumented historical recording exists.',
    reward:'Cosmic Orchestra mission unlock',
  },
  {
    id:'archive-build-27', title:'Build the 27-Piece Cosmic Orchestra',
    objective:'Recruit original playable musicians, arrange sections, rehearse, solve logistics and stage an original Afrofuturist concert.',
    reward:'Cosmic Concert portal',
  },
  {
    id:'archive-inheritance', title:'What Did We Inherit?',
    objective:'Separate family memory, cultural legacy, learned knowledge and legally documented property/rights.',
    reward:'Legacy chapter completion',
  },
] as const

export const ARCHIVE_TO_GAME_PATH = [
  'AUTHORITATIVE UNIVERSITY OF CHICAGO FINDING AID',
  'IMMERSIVE RESEARCH LIBRARY',
  'ARCHIVE SERIES / METADATA',
  'MISSIONS + ORIGINAL SIMULATIONS',
  'PLAYER-AUTHORED FAMILY MEMORY',
  'PRIVATE EVIDENCE RECEIVER',
  'RIGHTS / OWNERSHIP REVIEW',
  'WORLD MEMORY',
  'STREETVERSE CHICAGO',
  'COSMIC ORCHESTRA',
  'SPACEVERSE',
  'NEXT GENERATION LEGACY',
] as const

export const ARCHIVE_RIGHTS_RULES = {
  findingAidLinkMayOpenExternally: true,
  findingAidMetadataMayGuideResearch: true,
  reproduceArchivalAudioWithoutPermission: false,
  reproduceArchivalVideoWithoutPermission: false,
  reproduceProtectedManuscriptsWithoutPermission: false,
  useOriginalGameArtForImmersiveInterpretation: true,
  labelFictionalMysteriesAsFictional: true,
  keepFamilyClaimsEvidenceGated: true,
} as const
