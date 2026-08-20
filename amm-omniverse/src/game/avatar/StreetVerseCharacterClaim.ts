export type CharacterOrigin = 'chicago' | 'illinois' | 'michigan' | 'missouri' | 'tennessee' | 'california' | 'georgia' | 'florida' | 'new-york' | 'custom'

export type CharacterArchetype =
  | 'student'
  | 'worker'
  | 'entrepreneur'
  | 'creator'
  | 'athlete'
  | 'public-service'
  | 'driver-logistics'
  | 'tech-builder'
  | 'custom'

export type StreetVerseCharacter = {
  id: string
  ownerUserId: string
  displayName: string
  origin: CharacterOrigin
  homeRegion: string
  archetype: CharacterArchetype
  appearance: {
    bodyPreset: string
    skinTone: string
    hairStyle: string
    outfit: string
    accessibilityGear: string[]
  }
  accessibility: {
    oneHanded: boolean
    reducedMotion: boolean
    highContrast: boolean
    captions: boolean
    audioDescription: boolean
  }
  education: string[]
  jobs: string[]
  businesses: string[]
  licenses: string[]
  missionHistory: string[]
  reputation: Record<string, number>
  createdAt: string
  updatedAt: string
}

export const CHARACTER_CREATION_FLOW = [
  'Choose a display name',
  'Choose home region/origin',
  'Choose starter archetype',
  'Customize appearance and accessibility gear',
  'Choose accessibility settings',
  'Review identity and safety rules',
  'Claim character to authenticated account',
  'Create first checkpoint',
  'Start Meet the Stubbs / regional opening mission'
] as const

export const CHARACTER_CLAIM_RULES = [
  'One character claim must map to an authenticated account owner.',
  'A player may create fictional names and appearances, but may not impersonate a real person for fraud or deception.',
  'Character ownership does not prove ownership of a real business, school role, professional license, government role or real-world identity.',
  'Real-world credentials must pass their own verification flow before the game unlocks verified provider/employer/business status.',
  'K-12 characters remain age-appropriate and cannot enter adult-only systems.',
  'Character state follows the player across supported StreetVerse regions.'
] as const

export const CHARACTER_PORTABLE_STATE = [
  'avatar appearance',
  'accessibility settings',
  'education progress',
  'job history',
  'mission history',
  'reputation',
  'verified business relationships',
  'inventory/unlocks',
  'travel history',
  'safe checkpoint'
] as const

export function makeCharacterId(userId: string, displayName: string) {
  const safe = displayName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'player'
  return `${userId}:${safe}`
}
