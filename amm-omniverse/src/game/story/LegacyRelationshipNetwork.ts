export type LegacyRelationshipCharacter = {
  id: string
  displayName: string
  relationship: string
  memoryStatus: 'player-authored'
  publicLikeness: 'original-avatar-until-consent'
  roles: string[]
  missionHooks: string[]
}

// Real private people remain player-authored relationship nodes until identity/consent is established.
export const LEGACY_RELATIONSHIP_CHARACTERS: LegacyRelationshipCharacter[] = [
  {
    id: 'michael-castner', displayName: 'Michael Castner', relationship: 'friend / travel-memory connection',
    memoryStatus: 'player-authored', publicLikeness: 'original-avatar-until-consent',
    roles: ['travel companion','culinary/hospitality career node'],
    missionHooks: ['Long Road Home','Vegas hospitality story','crew reunion'],
  },
  {
    id: 'alphonso-gregory', displayName: 'Alphonso Gregory', relationship: 'life-network connection',
    memoryStatus: 'player-authored', publicLikeness: 'original-avatar-until-consent',
    roles: ['relationship NPC','legacy witness'], missionHooks: ['Chicago reunion','memory verification','community story'],
  },
  {
    id: 'von', displayName: 'Von', relationship: 'life-network connection',
    memoryStatus: 'player-authored', publicLikeness: 'original-avatar-until-consent',
    roles: ['relationship NPC','legacy witness'], missionHooks: ['crew memory','reunion story'],
  },
]

export const PRIVATE_PERSON_CHARACTER_GATE = [
  'player-authored memory may exist privately',
  'use an original avatar by default',
  'obtain consent before public likeness/voice recreation',
  'do not invent private dialogue as historical fact',
  'allow evidence/rights receiver to upgrade verification status later',
] as const
