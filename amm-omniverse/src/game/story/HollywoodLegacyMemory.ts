export type LegacyClaimState = 'player-authored' | 'publicly-supported' | 'document-required'

export const HOLLYWOOD_1992_REFERENCE = {
  era: '1990–1992 Hollywood / Los Angeles',
  verifiedContext: [
    'Melrose Place season 1 episode 10, Burned, aired September 16, 1992 and includes Billy Campbell working as a taxi driver, a robbery storyline, Rhonda Blair (Vanessa A. Williams), and a police identification sequence.',
    'The Dolores del Rio mural at Hollywood Boulevard and Hudson was painted by Alfredo de Batuc and dates to 1990.',
  ],
  sourceUse: 'Public historical metadata only. TV footage, Soul Train footage/music, celebrity likenesses, logos and dialogue remain license-gated.',
} as const

export const STUBBS_HOLLYWOOD_MEMORIES = [
  { id:'melrose-lineup', title:'Melrose Place / Police Lineup Memory', state:'player-authored' as LegacyClaimState, memory:'Player remembers participating in the production environment around the taxi-robbery/police-lineup story with performers from the episode.', playable:'Original 1992 Los Angeles taxi, street, production-set and lineup recreation; no copied episode footage/dialogue.' },
  { id:'soul-train', title:'Soul Train Stage Memory', state:'player-authored' as LegacyClaimState, memory:'Player remembers dancing on Soul Train, working around the stage/scenic board, being connected through uncle Raymond Jarreau, and being present for a 1992-era performance.', playable:'Original television dance-stage simulator with choreography, scenic-build, camera-blocking and audience systems; program footage/music/likenesses remain rights-gated.' },
  { id:'dolores-mural', title:'Dolores del Rio Mural Memory', state:'player-authored' as LegacyClaimState, memory:'Player remembers assisting Alfredo de Batuc with the Dolores del Rio mural and having his name on the wall.', playable:'Interactive mural-restoration/art apprenticeship chapter using a new digital reconstruction and archival-Hollywoood atmosphere; authorship/credit is displayed as player-authored until documentary evidence is attached.' },
  { id:'old-hollywood', title:'Old Hollywood Memory Map', state:'player-authored' as LegacyClaimState, memory:'Player remembers what Hollywood Boulevard and surrounding neighborhoods looked and felt like in the early 1990s.', playable:'Time-layered 1992 Hollywood digital twin: storefront archetypes, traffic, payphones, taxis, clubs, studios, murals, street life and creator jobs reconstructed from rights-safe references.' },
  { id:'prince-tupac', title:'Music Encounters', state:'player-authored' as LegacyClaimState, memory:'Player remembers meeting Prince three times and knowing/working around Tupac.', playable:'Private World Memory dialogue by default. Any public celebrity avatar, voice, music or likeness requires documented rights.' },
] as const

export const EDUCATION_MEMORY_PATH = [
  'Hollywood High School — player reports graduating in 1992',
  'Andrew Hill High School — San Jose',
  'St. Ignatius', 'Holy Angels', 'Holy Family', 'Holy Name Cathedral',
  'Steinmetz High School', 'Lincoln Park High School — summer school', 'Thomas Jefferson High School',
  'University of Illinois Chicago — player reports attending around 2000; date to be confirmed',
] as const

export const HOLLYWOOD_MEMORY_BEATS = [
  'Arrive in 1992 Hollywood and activate the time-layer overlay',
  'Work a fictionalized TV production call and learn set etiquette/camera blocking',
  'Enter the taxi-story memory and complete a rights-safe police-lineup production beat',
  'Build and paint a mural section through the public-art apprenticeship system',
  'Enter an original televised dance-stage memory and work scenic/camera/choreography jobs',
  'Return years later and compare remembered Hollywood with the modern city',
] as const

export const LEGACY_EVIDENCE_PATHWAY = {
  accepted: ['production call sheet','pay stub','union record','school record/yearbook','dated photograph','newspaper/archive record','mural credit/photo','broadcast credit','personal photo/video with provenance','rights/license agreement'],
  states: ['player-authored','evidence-attached','independently-supported','rights-cleared'],
  rule: 'Never convert a personal memory into a verified public claim merely because an AI or web search repeats it.',
} as const
