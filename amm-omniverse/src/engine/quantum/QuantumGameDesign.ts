export type AgeLane = 'pre-k'|'child'|'tween'|'teen'|'family'|'adult'
export type PlayLane = 'street-action'|'life-city'|'kingdom'|'generations'|'business'|'creator'|'wilderness'|'space'|'chrono'|'after-dark'
export type ConsequenceDomain = 'reputation'|'law'|'economy'|'relationships'|'property'|'education'|'faith'|'ecology'|'legacy'

export interface AgePolicy {
  ageLane: AgeLane
  allowedPlayLanes: PlayLane[]
  combatLevel: 'none'|'fantasy'|'mild'|'standard'
  commerce: 'guardian-only'|'guardian-approved'|'limited'|'adult'
  chat: 'guardian-circle'|'friends-approved'|'moderated'|'standard-moderated'
  userGeneratedContent: 'curated'|'guardian-approved'|'moderated'|'standard-moderated'
  aiMode: 'early-learning'|'coach'|'mentor'|'full'
  locationSharing: 'off'|'guardian-only'|'coarse'|'user-controlled'
}

export const AGE_POLICIES: Record<AgeLane, AgePolicy> = {
  'pre-k': {
    ageLane:'pre-k',
    allowedPlayLanes:['generations','kingdom','creator','wilderness'],
    combatLevel:'none', commerce:'guardian-only', chat:'guardian-circle', userGeneratedContent:'curated',
    aiMode:'early-learning', locationSharing:'off'
  },
  child: {
    ageLane:'child',
    allowedPlayLanes:['generations','kingdom','creator','wilderness','space','life-city'],
    combatLevel:'fantasy', commerce:'guardian-only', chat:'friends-approved', userGeneratedContent:'curated',
    aiMode:'coach', locationSharing:'guardian-only'
  },
  tween: {
    ageLane:'tween',
    allowedPlayLanes:['generations','kingdom','creator','wilderness','space','life-city','business','chrono'],
    combatLevel:'fantasy', commerce:'guardian-approved', chat:'friends-approved', userGeneratedContent:'guardian-approved',
    aiMode:'coach', locationSharing:'guardian-only'
  },
  teen: {
    ageLane:'teen',
    allowedPlayLanes:['generations','kingdom','creator','wilderness','space','life-city','business','chrono','street-action'],
    combatLevel:'mild', commerce:'limited', chat:'moderated', userGeneratedContent:'moderated',
    aiMode:'mentor', locationSharing:'coarse'
  },
  family: {
    ageLane:'family',
    allowedPlayLanes:['generations','kingdom','creator','wilderness','space','life-city','business','chrono'],
    combatLevel:'mild', commerce:'guardian-approved', chat:'moderated', userGeneratedContent:'moderated',
    aiMode:'mentor', locationSharing:'coarse'
  },
  adult: {
    ageLane:'adult',
    allowedPlayLanes:['street-action','life-city','kingdom','generations','business','creator','wilderness','space','chrono','after-dark'],
    combatLevel:'standard', commerce:'adult', chat:'standard-moderated', userGeneratedContent:'standard-moderated',
    aiMode:'full', locationSharing:'user-controlled'
  },
}

export interface AfterDarkPolicy {
  minimumAge: 18
  requiresAdultVerification: true
  discoverableByMinors: false
  crossLaneInvitesFromMinors: false
  youthProfilesBlocked: true
  youthCreatorAssetsBlocked: true
  adultModerationRequired: true
  separateRecommendations: true
  separateChatGraph: true
  separateCommercePolicy: true
}

export const OMNIVERSE_AFTER_DARK_POLICY: AfterDarkPolicy = {
  minimumAge:18,
  requiresAdultVerification:true,
  discoverableByMinors:false,
  crossLaneInvitesFromMinors:false,
  youthProfilesBlocked:true,
  youthCreatorAssetsBlocked:true,
  adultModerationRequired:true,
  separateRecommendations:true,
  separateChatGraph:true,
  separateCommercePolicy:true,
}

export interface DynamicMission {
  id: string
  lane: PlayLane
  title: string
  objective: string
  district?: string
  risk: number
  reward: number
  minimumAgeLane: AgeLane
  consequenceDomains: ConsequenceDomain[]
  generatedFrom: string[]
}

export interface PlayerLifeState {
  reputation: Record<string, number>
  properties: string[]
  businesses: string[]
  careers: string[]
  relationships: Record<string, number>
  education: Record<string, number>
  legacyScore: number
  lawHeat: number
}

export const QUANTUM_GAME_SYSTEMS = {
  world: [
    'seamless-world-streaming','enterable-interiors','dynamic-weather','day-night-seasons',
    'traffic-and-transit','pedestrian-crowds','construction-and-repair','property-ownership',
    'business-operations','real-estate-development','regional-economy','emergency-services'
  ],
  character: [
    'npc-schedules','npc-memory','relationships','reputation','careers','education','family',
    'skills','health-and-stamina-gameplay','wardrobe','housing','vehicles','social-groups'
  ],
  activities: [
    'original-story-missions','dynamic-side-missions','rideshare','delivery','logistics','music',
    'film-and-tv','sports','real-estate','restaurant','publishing','education','trades','ministry',
    'wildlife','fishing','conservation','space-exploration','chrono-scenarios','creator-worlds','adult-nightlife-lane'
  ],
  action: [
    'driving','boats','aircraft','parkour','melee-gameplay','age-gated-action-combat',
    'law-response','emergency-response','vehicle-damage','environment-repair','wanted-consequence-model'
  ],
  creator: [
    'world-editor','mission-editor','dialogue-editor','npc-editor','vehicle-editor','interior-editor',
    'business-builder','wildlife-editor','education-simulator','visual-scripting','signed-mod-packages'
  ],
  experience: [
    'cinematic-camera','photo-mode','replay-editor','spatial-audio','haptics','voice','accessibility',
    'localization','parental-age-lanes','cloud-persistence','cross-device-passport','adult-lane-isolation'
  ]
} as const

export function isLaneAllowed(ageLane: AgeLane, playLane: PlayLane): boolean {
  return AGE_POLICIES[ageLane].allowedPlayLanes.includes(playLane)
}

export function canEnterAfterDark(ageLane: AgeLane, adultVerified: boolean): boolean {
  return ageLane === 'adult' && adultVerified
}

export function filterMissionsForAge(ageLane: AgeLane, missions: DynamicMission[]): DynamicMission[] {
  const order: AgeLane[] = ['pre-k','child','tween','teen','family','adult']
  const userRank = order.indexOf(ageLane)
  return missions.filter(m => userRank >= order.indexOf(m.minimumAgeLane) && isLaneAllowed(ageLane, m.lane))
}

export function adaptMissionForAge(mission: DynamicMission, ageLane: AgeLane): DynamicMission {
  if (ageLane === 'pre-k' || ageLane === 'child') {
    return { ...mission, risk: Math.min(mission.risk, 1), reward: Math.max(1, mission.reward), consequenceDomains: mission.consequenceDomains.filter(d => d !== 'law') }
  }
  if (ageLane === 'tween' || ageLane === 'family') {
    return { ...mission, risk: Math.min(mission.risk, 2) }
  }
  if (ageLane === 'teen') {
    return { ...mission, risk: Math.min(mission.risk, 3) }
  }
  return mission
}
