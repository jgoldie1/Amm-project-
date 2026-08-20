export type HollywoodEra = 'golden-age' | '1970s' | '1992' | '2000s' | 'present' | 'future'

export type TimeMachineLayer = {
  era: HollywoodEra
  label: string
  worldChanges: string[]
  missionTypes: string[]
  rightsMode: 'original-recreation' | 'reference-only' | 'licensed-upgrade'
}

export const HOLLYWOOD_TIME_MACHINE: TimeMachineLayer[] = [
  {
    era: 'golden-age',
    label: 'Golden Age Hollywood',
    worldChanges: ['period vehicles','theater marquees','studio-era street dressing','period storefront silhouettes','original archival-style hologram overlays'],
    missionTypes: ['studio runner','costume delivery','theater opening','public-art history walk'],
    rightsMode: 'original-recreation',
  },
  {
    era: '1970s',
    label: '1970s Hollywood',
    worldChanges: ['period traffic','record shops','music-club economy','street photography layer','analog broadcast production'],
    missionTypes: ['record-store shift','club flyer route','camera-assistant job','music-history creator mission'],
    rightsMode: 'original-recreation',
  },
  {
    era: '1992',
    label: 'Hollywood 1992',
    worldChanges: ['period taxis','production trucks','Hollywood High life-path layer','Soul Train-era dance-production simulation','public mural work zones','early-1990s nightlife and retail'],
    missionTypes: ['television-production memory','dance-show production memory','mural apprenticeship','taxi/lineup memory','Hollywood High return'],
    rightsMode: 'original-recreation',
  },
  {
    era: '2000s',
    label: 'Hollywood 2000s',
    worldChanges: ['digital-camera transition','DVD/music retail','nightlife changes','early social-media creator economy'],
    missionTypes: ['music-video production','street-team promotion','digital editing shift','creator hustle'],
    rightsMode: 'original-recreation',
  },
  {
    era: 'present',
    label: 'Hollywood Now',
    worldChanges: ['current tourism economy','streaming production','creator studios','modern hospitality','transit and rideshare'],
    missionTypes: ['streaming shoot','creator campaign','tour guide','restaurant/nightlife shift','public-art archive scan'],
    rightsMode: 'reference-only',
  },
  {
    era: 'future',
    label: 'Hollywood Future',
    worldChanges: ['holographic wayfinding','AR history layers','mixed-reality theaters','autonomous transit','adaptive accessibility overlays'],
    missionTypes: ['restore a lost memory','build a holo-exhibit','future-film production','time-layer investigation'],
    rightsMode: 'original-recreation',
  },
]

export const AVENUE_OF_STARS = {
  name: 'Avenue of Stars Memory Corridor',
  inspiration: 'Hollywood Boulevard and Vine entertainment-history corridor',
  purpose: 'Walkable entertainment-history lane that connects stars, theaters, public art, music history, creator missions and player memories across eras.',
  rules: [
    'Use public-location/reference metadata for the real Hollywood Walk of Fame corridor.',
    'Do not ship celebrity likenesses, voices, protected photography or trademark-heavy commercial assets without rights.',
    'Every star marker can open a factual reference card, an original fictional mission, or a licensed experience when rights exist.',
    'Player-authored memories appear as separate holographic memory markers and are never presented as official Walk of Fame honors.',
  ],
  gameplay: [
    'scan entertainment-history markers',
    'unlock era shifts in the Time Machine',
    'complete creator/media/public-art missions',
    'collect oral-history and archival clues',
    'compare the same intersection across decades',
    'publish rights-safe history episodes to All American Network',
  ],
} as const

export function getHollywoodEra(era: HollywoodEra) {
  return HOLLYWOOD_TIME_MACHINE.find(layer => layer.era === era)
}
