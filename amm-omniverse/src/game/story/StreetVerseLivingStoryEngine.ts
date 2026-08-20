export type FictionalCharacter = {
  id: string
  displayName: string
  hometown: string
  archetype: string
  reputation: number
  relationships: Record<string, number>
  memory: string[]
  goals: string[]
}

export type DialogueContext = {
  district: string
  timeOfDay: 'morning' | 'day' | 'evening' | 'night'
  playerReputation: number
  relationshipScore: number
  recentEvents: string[]
}

export function chooseDialogueTone(ctx: DialogueContext) {
  if (ctx.relationshipScore >= 75) return 'trusted'
  if (ctx.playerReputation >= 70) return 'respectful'
  if (ctx.relationshipScore <= 20) return 'guarded'
  return 'neutral'
}

export const LIVING_WORLD_FEATURES = [
  'NPC long-term memory',
  'NPC schedules: home, school, work, entertainment and travel',
  'relationship graph and neighborhood reputation',
  'branching dialogue based on past choices',
  'rumor and local-news propagation',
  'dynamic businesses that open, grow, hire, struggle or close',
  'weather and event-driven missions',
  'emergent traffic, transit and crowds',
  'player-created businesses and community events',
  'multi-city consequences for major choices',
] as const

export type SecretDiscovery = {
  id: string
  regionId: string
  clueChain: string[]
  rewardType: 'lore' | 'cosmetic' | 'location' | 'mission' | 'business-opportunity'
  replayable: boolean
}

export const SECRET_SYSTEMS: SecretDiscovery[] = [
  { id: 'chi-underground-radio', regionId: 'chicago', clueChain: ['late-night frequency', 'mural symbol', 'record-store receipt'], rewardType: 'mission', replayable: false },
  { id: 'det-producer-vault', regionId: 'detroit', clueChain: ['studio flyer', 'beat-machine serial', 'warehouse key'], rewardType: 'location', replayable: false },
  { id: 'diaspora-route', regionId: 'diaspora', clueChain: ['Chicago archive', 'Haiti artifact', 'Lagos recording', 'Johannesburg poster'], rewardType: 'lore', replayable: false },
]

export type CommunityPitch = {
  title: string
  pitch: string
  proposedRegion?: string
  proposedCharacter?: string
  proposedMission?: string
}

export function scoreCommunityPitch(pitch: CommunityPitch) {
  const completeness = [pitch.title, pitch.pitch, pitch.proposedRegion, pitch.proposedCharacter, pitch.proposedMission].filter(Boolean).length
  return { completeness, eligibleForReview: completeness >= 2 }
}

export const COMMUNITY_CREATION_LOOP = [
  'Player submits What do you want to see come to life?',
  'Moderation and rights review',
  'Community voting and creator-team review',
  'Selected concept becomes a fictional content pack',
  'Mission/story team builds and tests it',
  'Seasonal release introduces the new character, mission or district',
] as const
