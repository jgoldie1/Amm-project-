import type { WorldMemoryEvent } from '../world/StreetVerseWorldMemory'

export type RightsState = 'original-only' | 'license-pending' | 'licensed'

export const HARDBALL_REFERENCE = {
  title: 'Hardball',
  year: 2001,
  city: 'Chicago',
  publicCastReferences: ['Keanu Reeves / Conor O\'Neill', 'DeWayne Warren / G-Baby', 'Michael B. Jordan / Jamal'],
  sourceUse: 'Reference metadata only. Do not ship movie footage, trailer audio, studio marks, actor likenesses or copied dialogue without documented rights.',
} as const

export const STUBBS_HARDBALL_MEMORY = {
  id: 'stubbs-hardball-memory',
  title: 'The Day the Camera Caught the Block',
  rightsState: 'original-only' as RightsState,
  playerAuthoredMemory: [
    'Player remembers appearing in the production environment with his brother Alton nearby.',
    'Player remembers a handoff moment involving a pot/container and a recognizable neighborhood hand gesture.',
    'The game treats these as player-authored autobiographical memories, not independently verified production credits.',
  ],
  safeRecreation: [
    'Build an original Chicago baseball-film-set memory district using new geometry, extras, wardrobe, audio and camera blocking.',
    'Use fictionalized child players and coaches unless likeness rights are documented.',
    'Represent the player and brother as original StreetVerse avatars controlled by the family identity/consent system.',
    'Recreate the emotional beat of neighborhood kids, baseball, cameras and the block being seen by the world without copying protected shots or dialogue.',
    'Use a generic hand-gesture memory marker rather than teaching or promoting real gang affiliation.',
  ],
  licensedUpgrade: [
    'If studio/clip rights are later obtained, licensed media may be attached as an optional museum-style memory artifact.',
    'If actor likeness rights are later obtained, approved likeness packs can replace fictionalized stand-ins.',
    'All licensed assets must retain source, territory, term and expiry metadata and automatically fall back to original assets when rights expire.',
  ],
} as const

export const HARDBALL_MEMORY_BEATS = [
  { id: 'hb-01-arrive', label: 'Film trucks arrive', objective: 'Walk from the neighborhood into an active fictional film set and learn camera/set boundaries.' },
  { id: 'hb-02-handoff', label: 'The handoff', objective: 'Complete the remembered prop handoff while Eve records it as a personal memory, not a gameplay crime or gang objective.' },
  { id: 'hb-03-brother', label: 'Brother in frame', objective: 'Find the brother avatar behind the player and trigger a family-memory photo/hologram.' },
  { id: 'hb-04-ballfield', label: 'Baseball becomes cinema', objective: 'Move from neighborhood play into a staged baseball sequence with crowd, camera and production simulation.' },
  { id: 'hb-05-world-sees-us', label: 'The world sees the block', objective: 'Finish with a World Memory beat about representation, childhood, neighborhood identity and what gets remembered.' },
] as const

export function canUseLicensedHardballMedia(input: { rightsState: RightsState; rightsProofId?: string; expiresAt?: string }) {
  if (input.rightsState !== 'licensed' || !input.rightsProofId) return false
  if (input.expiresAt && Date.parse(input.expiresAt) <= Date.now()) return false
  return true
}

export function createHardballLegacyMemory(input: { userId: string; characterId: string; summary: string }): WorldMemoryEvent {
  return {
    id: crypto.randomUUID(),
    userId: input.userId,
    characterId: input.characterId,
    scope: 'legacy',
    regionId: 'chicago',
    subjectId: STUBBS_HARDBALL_MEMORY.id,
    eventType: 'autobiographical-film-memory',
    summary: input.summary,
    importance: 95,
    occurredAt: new Date().toISOString(),
    tags: ['meet-the-stubbs', 'film-memory', 'baseball', 'family', 'rights-gated'],
    consequences: ['Unlock family memory dialogue', 'Unlock creator/film-set tutorial', 'Add representation memory to Chicago return dialogue'],
  }
}
