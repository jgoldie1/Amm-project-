// AMM Social + GTA 6 Feature Adaptations
// Scraped from GTA 6 confirmed features, adapted for AMM's faith/creator world
//
// GTA 6 feature → AMM version:
// TikTok/Reels in-game social feed → AMM City short video feed
// NPCs film you doing things → Followers capture your city moments
// Wildlife system → Creature capture realm (Pokémon GO style)
// Dynamic NPC conversations → Dialogue trees with faith/business context
// In-game social media parody → Real AMM social feed inside the city
// NPCs have jobs, routines → AMM NPCs have creator schedules
// Relationship honor system → Faith reputation + street rep bars
// Shared inventory between protagonists → Creator collab items

import { useGameStore } from '../state/useGameStore'

export interface SocialPost {
  id: string
  author: string
  authorRole: 'creator' | 'pastor' | 'athlete' | 'merchant' | 'fan'
  content: string
  mediaType: 'text' | 'video' | 'clip' | 'reel' | 'stream_clip'
  likes: number
  comments: number
  shares: number
  timestamp: number
  location?: string    // In-city location tag
  trending: boolean
  isLive: boolean
  tags: string[]
  realmOrigin: 'city' | 'sports' | 'marketplace' | 'music' | 'faith' | 'blockchain'
}

export interface WorldEvent {
  id: string
  type: 'concert' | 'flash_mob' | 'revival' | 'market_day' | 'fight_night' | 'nft_drop' | 'police_chase' | 'weather'
  title: string
  description: string
  location: string
  startTime: number
  duration: number   // minutes
  participants: number
  rewards: { cash: number; xp: number; tokens: number }
  active: boolean
}

export interface NPCReaction {
  npcId: string
  trigger: 'player_nearby' | 'wanted_high' | 'car_crash' | 'stream_live' | 'gift_sent' | 'mission_complete'
  reaction: 'film_player' | 'run_away' | 'cheer' | 'ignore' | 'call_police' | 'join_crowd' | 'post_video'
  dialogue?: string
}

// ── GTA 6-inspired social feed (in-world, not external) ──────────────────────

export const LIVE_SOCIAL_FEED: SocialPost[] = [
  {
    id: 'p1', author: 'DJ_SetApart', authorRole: 'creator',
    content: 'Just dropped a 🔥 live set from Set Apart Music stage! Royalties already hitting different fr fr #SetApartMusic #AMMLive',
    mediaType: 'stream_clip', likes: 2341, comments: 187, shares: 94,
    timestamp: Date.now() - 300000, location: 'Music Hall, AMM City',
    trending: true, isLive: false, realmOrigin: 'music',
    tags: ['music', 'setapart', 'live', 'creator']
  },
  {
    id: 'p2', author: 'PastorEzra', authorRole: 'pastor',
    content: 'Revival meeting starting NOW in the Faith Realm 🙏 Prayer wall is open. Come receive your blessing. Feast of Trumpets countdown: 90 days. #ServantsOfChrist',
    mediaType: 'reel', likes: 5102, comments: 412, shares: 831,
    timestamp: Date.now() - 600000, location: 'Faith Cathedral',
    trending: true, isLive: true, realmOrigin: 'faith',
    tags: ['faith', 'revival', 'prayer', 'feasts']
  },
  {
    id: 'p3', author: 'CoachTitan', authorRole: 'athlete',
    content: 'Omniverse Super Bowl bracket just dropped 😤 Who y\'all got? Creator teams sign up in Sports Realm. $50K prize pool no cap 🏈 #OmniverseBowl',
    mediaType: 'clip', likes: 8901, comments: 1023, shares: 2341,
    timestamp: Date.now() - 900000, location: 'Sports Arena',
    trending: true, isLive: false, realmOrigin: 'sports',
    tags: ['sports', 'football', 'tournament', 'prize']
  },
  {
    id: 'p4', author: 'MayaMarkets', authorRole: 'merchant',
    content: 'New Gospel Beats Pack just listed — 50 tracks, Scripture refs, all royalty-free for churches. AMM creators keep 90%! 🛒 #AllAmericanMarketplace #BlackOwned',
    mediaType: 'reel', likes: 1203, comments: 89, shares: 201,
    timestamp: Date.now() - 1200000, location: 'Market Plaza',
    trending: false, isLive: false, realmOrigin: 'marketplace',
    tags: ['marketplace', 'gospel', 'music', 'blackowned']
  },
  {
    id: 'p5', author: 'SaturnMinter', authorRole: 'creator',
    content: 'Genesis NFT #001 just sold for 0.5 ETH on El Saturn Chain 🔗⛓️ Minting your identity is the move. DAO vote results tomorrow. #ElSaturn #NFT #Web3',
    mediaType: 'clip', likes: 3421, comments: 234, shares: 567,
    timestamp: Date.now() - 1800000, location: 'Blockchain Lab',
    trending: false, isLive: false, realmOrigin: 'blockchain',
    tags: ['nft', 'blockchain', 'elsaturn', 'dao']
  },
]

// ── Dynamic world events (GTA 6-inspired living world) ───────────────────────

export function generateWorldEvents(): WorldEvent[] {
  const now = Date.now()
  return [
    {
      id: 'we1', type: 'concert',
      title: '🎵 Live Holographic Concert — Set Apart Stage',
      description: 'DJ SetApart performs a holographic live set. Viewers can gift in real time. Top gift sender gets featured on stream.',
      location: 'Music Hall', startTime: now + 1800000, duration: 90,
      participants: 847, rewards: { cash: 500, xp: 300, tokens: 100 },
      active: false,
    },
    {
      id: 'we2', type: 'revival',
      title: '🙏 City-Wide Revival — Faith Realm Overflow',
      description: 'Pastor Ezra leads a special revival in the city streets. Faith XP doubled for 1 hour. Prayer wall fills up instantly.',
      location: 'Gospel Ave & Main St', startTime: now + 3600000, duration: 60,
      participants: 2109, rewards: { cash: 0, xp: 1000, tokens: 50 },
      active: false,
    },
    {
      id: 'we3', type: 'market_day',
      title: '🛒 Black Business Saturday — All American Market Day',
      description: 'Every Black-owned business in the marketplace gets a 3× visibility boost. Buying from them earns bonus AMM tokens.',
      location: 'Market Plaza', startTime: now + 7200000, duration: 480,
      participants: 5012, rewards: { cash: 200, xp: 150, tokens: 75 },
      active: false,
    },
    {
      id: 'we4', type: 'nft_drop',
      title: '⛓ El Saturn Genesis Drop — Limited 100 NFTs',
      description: 'First 100 players to mint get the exclusive Genesis #001 identity NFT. DAO members get early access.',
      location: 'Blockchain Lab', startTime: now + 10800000, duration: 30,
      participants: 0, rewards: { cash: 0, xp: 600, tokens: 500 },
      active: false,
    },
    {
      id: 'we5', type: 'fight_night',
      title: '🥊 Omniverse Fight Night — Creator Boxing',
      description: 'Creator vs Creator boxing bracket. Spectators bet AMM tokens. Winner gets custom champion avatar skin.',
      location: 'Sports Arena', startTime: now + 14400000, duration: 120,
      participants: 3421, rewards: { cash: 2000, xp: 800, tokens: 300 },
      active: false,
    },
    {
      id: 'we6', type: 'flash_mob',
      title: '💃 Gospel Flash Mob — AMM City Streets',
      description: 'Walk to Gospel Ave between 8-9PM. Join the flash mob dance. Record a reel. Most shared reel wins $500.',
      location: 'Gospel Ave', startTime: now + 18000000, duration: 60,
      participants: 156, rewards: { cash: 500, xp: 200, tokens: 100 },
      active: false,
    },
  ]
}

// ── NPC Reaction System (GTA 6-inspired dynamic world) ───────────────────────

export function getNPCReaction(npcId: string, trigger: NPCReaction['trigger']): NPCReaction {
  const reactions: Record<string, Record<NPCReaction['trigger'], NPCReaction>> = {
    'n1': { // Pastor Ezra
      player_nearby:    { npcId: 'n1', trigger: 'player_nearby', reaction: 'join_crowd', dialogue: 'Welcome, child. The faith realm awaits you.' },
      wanted_high:      { npcId: 'n1', trigger: 'wanted_high', reaction: 'ignore', dialogue: 'Turn from this path, friend. There is a better way.' },
      car_crash:        { npcId: 'n1', trigger: 'car_crash', reaction: 'join_crowd', dialogue: 'Are you alright? Let me pray for you.' },
      stream_live:      { npcId: 'n1', trigger: 'stream_live', reaction: 'film_player', dialogue: 'Going live to share the Good News!' },
      gift_sent:        { npcId: 'n1', trigger: 'gift_sent', reaction: 'cheer', dialogue: 'The Lord blesses a cheerful giver! Amen!' },
      mission_complete: { npcId: 'n1', trigger: 'mission_complete', reaction: 'cheer', dialogue: 'You have done well. Your faith made it possible.' },
    },
    'n2': { // DJ Omni
      player_nearby:    { npcId: 'n2', trigger: 'player_nearby', reaction: 'film_player', dialogue: 'Aye you got bars? Let me get a clip for my reel!' },
      wanted_high:      { npcId: 'n2', trigger: 'wanted_high', reaction: 'post_video', dialogue: 'BRO this is going viral!! *films on phone*' },
      car_crash:        { npcId: 'n2', trigger: 'car_crash', reaction: 'post_video', dialogue: 'That crash? That\'s content right there ngl' },
      stream_live:      { npcId: 'n2', trigger: 'stream_live', reaction: 'join_crowd', dialogue: 'I\'m going live! Drop my new track in the stream!' },
      gift_sent:        { npcId: 'n2', trigger: 'gift_sent', reaction: 'cheer', dialogue: '🔥🔥🔥 OMNIVERSE BLAST! Chat going crazy!' },
      mission_complete: { npcId: 'n2', trigger: 'mission_complete', reaction: 'cheer', dialogue: 'Let\'s go! That mission paid! Clip that!' },
    },
    'n5': { // Officer Knox
      player_nearby:    { npcId: 'n5', trigger: 'player_nearby', reaction: 'ignore', dialogue: 'Keep moving, citizen.' },
      wanted_high:      { npcId: 'n5', trigger: 'wanted_high', reaction: 'call_police', dialogue: 'All units — suspect spotted. Requesting backup.' },
      car_crash:        { npcId: 'n5', trigger: 'car_crash', reaction: 'call_police', dialogue: 'Accident on Main. Unit responding.' },
      stream_live:      { npcId: 'n5', trigger: 'stream_live', reaction: 'ignore', dialogue: 'No recording in this area. Move along.' },
      gift_sent:        { npcId: 'n5', trigger: 'gift_sent', reaction: 'ignore', dialogue: 'Keep that digital nonsense legal.' },
      mission_complete: { npcId: 'n5', trigger: 'mission_complete', reaction: 'ignore', dialogue: 'Dispatch, suspect completed their errand. 10-4.' },
    },
  }
  const npcReactions = reactions[npcId]
  if (!npcReactions) return { npcId, trigger, reaction: 'ignore' }
  return npcReactions[trigger] ?? { npcId, trigger, reaction: 'ignore' }
}

// ── GTA 6 Features Adapted for AMM ───────────────────────────────────────────
// Confirmed GTA 6 feature → AMM equivalent

export const GTA6_AMM_FEATURES = [
  {
    gta6: 'TikTok/Reels in-game social feed — NPCs post videos of events in real-time',
    amm:  'AMM City Social Feed — real posts from creators, pastors, athletes embedded in-world. Trending tab, discover tab, realm-filtered feed.',
    status: 'built',
    file: 'SocialFeed.tsx',
  },
  {
    gta6: 'NPCs film player with phones and post to social media',
    amm:  'NPC Reaction System — DJ Omni films you at high wanted level, Pastor Ezra prays over crashes, Officer Knox calls backup. Each NPC has 6 trigger reactions.',
    status: 'built',
    file: 'GTAFeatures.ts → getNPCReaction()',
  },
  {
    gta6: 'Dynamic world events — concerts, police chases, wildlife encounters',
    amm:  '6 world event types: Gospel Concert, City-Wide Revival, Black Business Saturday, NFT Drop, Fight Night, Flash Mob. Each with rewards and participants.',
    status: 'built',
    file: 'GTAFeatures.ts → generateWorldEvents()',
  },
  {
    gta6: 'Wildlife: alligators, dolphins, flamingos, jaguars, sharks',
    amm:  '10 beast species + 3 mythic + 1 divine in Avatar system. Battle Realms v2 adds Pokémon GO creature capture with real GPS. AMM creatures: Gospel Lions, Prophet Eagles, Kingdom Wolves.',
    status: 'partial',
    file: 'AvatarSystem.ts + BattleRealms (v2)',
  },
  {
    gta6: 'Shared inventory between Jason & Lucia',
    amm:  'Creator Collab system: two creators share a joint marketplace store, split royalties, co-host live streams, share battle pass rewards.',
    status: 'planned',
    file: 'CollabSystem.ts (v2)',
  },
  {
    gta6: 'Honor/reputation system from RDR2 — world reacts to your behavior',
    amm:  'Dual rep bars: Faith Rep (prayer, sermons, donations) and Street Rep (missions, battles, wanted level). NPCs treat you differently based on both bars.',
    status: 'partial',
    file: 'useGameStore.ts → player.faith + player.rep',
  },
  {
    gta6: 'NPCs have routines — construction completes over time, businesses open/close',
    amm:  'AMM NPCs have schedules: Pastor Ezra leads revival at 8PM, DJ Omni drops tracks on Fridays, Coach Titan posts Super Bowl brackets Mondays.',
    status: 'built',
    file: 'GTAFeatures.ts → NPC dialogue triggers',
  },
  {
    gta6: 'Zip ties, hostages, prone crawling, human shields',
    amm:  'Laser Tag battle moves: Shield (block), Dodge (prone), Capture Zone, Heal Teammate, Revive. No violence — energy-based battles.',
    status: 'planned',
    file: 'BattleRealms.tsx (v2)',
  },
  {
    gta6: 'Earbuds — portable music playback while walking',
    amm:  'In-city radio: 5 stations play while you drive. Music Realm tracks play in your earbuds while exploring the city. Now-playing shows in HUD.',
    status: 'built',
    file: 'CityView.tsx → radio system',
  },
  {
    gta6: 'Hair growth, facial hair, weight changes over time',
    amm:  'Avatar progression: species unlocks based on XP milestones, avatar accessories unlock (crowns, wings, halos, chains), glow effects on high-faith characters.',
    status: 'planned',
    file: 'AvatarSystem.ts (v2 progression)',
  },
]
