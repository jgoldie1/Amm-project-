export type MediaSurface = 'all-american-network' | 'streaming-service' | 'courfree-tv'

export type MediaChannel = {
  id: string
  name: string
  surface: MediaSurface
  categories: string[]
  supportsLive: boolean
  supportsReplay: boolean
  supportsCreatorRevenue: boolean
}

export const STREETVERSE_MEDIA_CHANNELS: MediaChannel[] = [
  { id: 'aan-live', name: 'All American Network LIVE', surface: 'all-american-network', categories: ['news', 'sports', 'music', 'city-events', 'creator-shows'], supportsLive: true, supportsReplay: true, supportsCreatorRevenue: true },
  { id: 'aan-stories', name: 'StreetVerse Stories', surface: 'streaming-service', categories: ['missions', 'documentary-style-fiction', 'character-stories', 'city-series'], supportsLive: false, supportsReplay: true, supportsCreatorRevenue: true },
  { id: 'courfree-worlds', name: 'Courfree TV Worlds', surface: 'courfree-tv', categories: ['world-premieres', 'community-series', 'education', 'creator-programming'], supportsLive: true, supportsReplay: true, supportsCreatorRevenue: true },
]

export const MEDIA_GAMEPLAY_LOOP = [
  'Player accepts or creates a media mission',
  'Record or livestream a permitted in-world event',
  'Edit/publish through the creator workflow',
  'Distribute to All American Network / streaming surfaces',
  'Measure audience and reputation',
  'Unlock sponsorship, creator revenue or future story opportunities where eligible',
] as const

export const MEDIA_SAFETY_RULES = [
  'No real-person likeness, music or footage without rights',
  'No doxxing or private information',
  'Real school minors are never used as public entertainment characters',
  'News-like fictional content must be labeled as fictional/in-world',
  'Real-money creator payouts remain behind eligibility and payment-provider controls',
] as const
