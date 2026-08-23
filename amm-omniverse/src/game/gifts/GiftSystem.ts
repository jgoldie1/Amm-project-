// AMM Live Gift System — beats Bigo Live
// Bigo has: 500+ gifts, 15-25 sec animations, 50% platform cut
// AMM has: 90% creator keep, faith-themed gifts, holographic effects,
//          PK battles, full-screen Lottie + canvas takeovers, combo chains
// AMM advantage: no 50% cut, faith gift categories, community owned via DAO

export type GiftTier = 'free' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary'
export type GiftCategory = 'faith' | 'hype' | 'love' | 'battle' | 'kingdom' | 'cosmic'

export interface Gift {
  id: string
  name: string
  emoji: string
  tier: GiftTier
  category: GiftCategory
  ammTokens: number        // AMM token cost (our currency)
  usdValue: number         // actual USD equivalent
  creatorShare: number     // 0.9 = 90% (vs Bigo's 50%)
  animationDuration: number // seconds
  animationType: 'overlay' | 'fullscreen' | 'ambient' | 'combo'
  color: string
  soundKey: string
  description: string
  lottieKey?: string
  special?: string         // special effect name
}

export interface ActiveGift {
  id: string
  gift: Gift
  sender: string
  senderAvatar: string
  target: string
  timestamp: number
  combo?: number           // combo multiplier if chained
  message?: string
}

export interface PKBattle {
  id: string
  hostA: string
  hostB: string
  scoreA: number
  scoreB: number
  duration: number         // minutes
  timeLeft: number
  active: boolean
  gifts: ActiveGift[]
}

// ── Gift Catalog ─────────────────────────────────────────────────────────────
// Bigo: 50% cut · AMM: 10% cut (creator keeps 90%)
// Bigo: corporate themes · AMM: faith, culture, kingdom themes

export const GIFT_CATALOG: Gift[] = [
  // FREE TIER — no cost, drives engagement
  { id: 'g_amen',       name: 'Amen',          emoji: '🙏', tier: 'free',      category: 'faith',   ammTokens: 0,    usdValue: 0,     creatorShare: 0.90, animationDuration: 1,  animationType: 'overlay',    color: '#8800ff', soundKey: 'prayer_submit', description: 'Send an Amen of support' },
  { id: 'g_heart',      name: 'Heart',          emoji: '❤️', tier: 'free',      category: 'love',    ammTokens: 0,    usdValue: 0,     creatorShare: 0.90, animationDuration: 1,  animationType: 'overlay',    color: '#ff4488', soundKey: 'button_click',  description: 'Show some love' },
  { id: 'g_fire',       name: 'Fire',           emoji: '🔥', tier: 'free',      category: 'hype',    ammTokens: 0,    usdValue: 0,     creatorShare: 0.90, animationDuration: 1,  animationType: 'overlay',    color: '#ff4400', soundKey: 'xp_gain',       description: 'Hype the stream' },

  // BRONZE — 1-10 tokens
  { id: 'g_cross',      name: 'Holy Cross',     emoji: '✝️', tier: 'bronze',    category: 'faith',   ammTokens: 5,    usdValue: 0.05,  creatorShare: 0.90, animationDuration: 3,  animationType: 'overlay',    color: '#ffd700', soundKey: 'blessing',      description: 'A cross of blessing', lottieKey: 'faith_glow' },
  { id: 'g_crown',      name: 'Crown',          emoji: '👑', tier: 'bronze',    category: 'kingdom', ammTokens: 10,   usdValue: 0.10,  creatorShare: 0.90, animationDuration: 3,  animationType: 'overlay',    color: '#ffd700', soundKey: 'cash_earn',     description: 'Crown your king/queen' },
  { id: 'g_mic',        name: 'Mic Drop',       emoji: '🎤', tier: 'bronze',    category: 'hype',    ammTokens: 8,    usdValue: 0.08,  creatorShare: 0.90, animationDuration: 2,  animationType: 'overlay',    color: '#00ccff', soundKey: 'mic_check',     description: 'The creator killed it' },

  // SILVER — 25-100 tokens
  { id: 'g_dove',       name: 'Holy Dove',      emoji: '🕊️', tier: 'silver',    category: 'faith',   ammTokens: 50,   usdValue: 0.50,  creatorShare: 0.90, animationDuration: 6,  animationType: 'overlay',    color: '#ffffff', soundKey: 'choir_hit',     description: 'Peace be upon this stream', lottieKey: 'faith_glow', special: 'dove_trail' },
  { id: 'g_gold_star',  name: 'Gold Star',      emoji: '⭐', tier: 'silver',    category: 'hype',    ammTokens: 30,   usdValue: 0.30,  creatorShare: 0.90, animationDuration: 4,  animationType: 'overlay',    color: '#ffd700', soundKey: 'xp_gain',       description: 'Five stars for this creator', lottieKey: 'xp_burst' },
  { id: 'g_roses',      name: 'Rose Bouquet',   emoji: '🌹', tier: 'silver',    category: 'love',    ammTokens: 75,   usdValue: 0.75,  creatorShare: 0.90, animationDuration: 5,  animationType: 'overlay',    color: '#ff4488', soundKey: 'applause',      description: 'Roses for a star performer' },
  { id: 'g_nft_card',   name: 'NFT Card',       emoji: '🃏', tier: 'silver',    category: 'kingdom', ammTokens: 100,  usdValue: 1.00,  creatorShare: 0.90, animationDuration: 5,  animationType: 'overlay',    color: '#00ffcc', soundKey: 'card_play',     description: 'Rare card from El Saturn Chain', lottieKey: 'blockchain_spin' },

  // GOLD — 250-1000 tokens
  { id: 'g_holy_fire',  name: 'Holy Fire',      emoji: '🔥', tier: 'gold',      category: 'faith',   ammTokens: 500,  usdValue: 5.00,  creatorShare: 0.90, animationDuration: 10, animationType: 'overlay',    color: '#ff8800', soundKey: 'blessing',      description: 'Pentecostal fire on this stream', special: 'flame_burst', lottieKey: 'faith_glow' },
  { id: 'g_championship',name: 'Championship',  emoji: '🏆', tier: 'gold',      category: 'battle',  ammTokens: 750,  usdValue: 7.50,  creatorShare: 0.90, animationDuration: 8,  animationType: 'overlay',    color: '#ffd700', soundKey: 'battle_win',    description: 'You are the champion' },
  { id: 'g_lambo',      name: 'AMM Lambo',      emoji: '🏎️', tier: 'gold',      category: 'kingdom', ammTokens: 1000, usdValue: 10.00, creatorShare: 0.90, animationDuration: 12, animationType: 'fullscreen', color: '#00ccff', soundKey: 'engine_rev',    description: 'Flex on the haters', special: 'car_drive' },

  // DIAMOND — 2500-9999 tokens
  { id: 'g_ark',        name: 'Ark of the Covenant', emoji: '📦', tier: 'diamond', category: 'faith', ammTokens: 2500, usdValue: 25.00, creatorShare: 0.90, animationDuration: 18, animationType: 'fullscreen', color: '#ffd700', soundKey: 'church_bell', description: 'The holiest gift in AMM', special: 'golden_rays', lottieKey: 'faith_glow' },
  { id: 'g_palace',     name: 'AMM Palace',     emoji: '🏰', tier: 'diamond',   category: 'kingdom', ammTokens: 5000, usdValue: 50.00, creatorShare: 0.90, animationDuration: 20, animationType: 'fullscreen', color: '#8800ff', soundKey: 'level_up',      description: 'Kingdom takeover', special: 'palace_rise' },
  { id: 'g_seraphim_g', name: 'Seraphim',       emoji: '👼', tier: 'diamond',   category: 'cosmic',  ammTokens: 6666, usdValue: 66.66, creatorShare: 0.90, animationDuration: 22, animationType: 'fullscreen', color: '#fffacd', soundKey: 'choir_hit',     description: '6-winged angel fills the screen', special: 'wings_spread', lottieKey: 'faith_glow' },

  // LEGENDARY — screen takeovers, pauses stream
  { id: 'g_omniverse',  name: 'Omniverse Blast', emoji: '🌐', tier: 'legendary', category: 'cosmic', ammTokens: 9999, usdValue: 99.99, creatorShare: 0.90, animationDuration: 25, animationType: 'fullscreen', color: '#00ffcc', soundKey: 'portal_enter', description: 'The biggest gift in AMM. Full-screen holographic universe.', special: 'universe_explode', lottieKey: 'portal_swirl' },
  { id: 'g_god_king',   name: 'God King',        emoji: '👑', tier: 'legendary', category: 'kingdom',ammTokens: 7777, usdValue: 77.77, creatorShare: 0.90, animationDuration: 22, animationType: 'fullscreen', color: '#ffd700', soundKey: 'mission_complete', description: 'Throne descends from heaven', special: 'throne_descend' },
]

// ── Gift vs Bigo comparison ───────────────────────────────────────────────────
export const AMM_VS_BIGO = {
  creatorCut:    { amm: '90%', bigo: '50%' },
  topGiftCost:   { amm: '$99.99 (9,999 tokens)', bigo: '$585 (Love Carriage)' },
  animLength:    { amm: 'Up to 25 sec full-screen', bigo: '15-25 sec full-screen' },
  giftTypes:     { amm: '18 faith/kingdom/cosmic gifts', bigo: '500+ generic gifts' },
  currency:      { amm: 'AMM tokens (community owned)', bigo: 'Diamonds (corporate)' },
  pkBattle:      { amm: 'PK Battle + Faith Battle modes', bigo: 'PK Battle only' },
  uniqueFeature: { amm: 'Gifts mint NFTs on El Saturn Chain', bigo: 'No NFTs' },
  familyClub:    { amm: 'Ministry families + DAO vote', bigo: 'Family groups only' },
}

// ── PK Battle engine ──────────────────────────────────────────────────────────

export function createPKBattle(hostA: string, hostB: string, durationMinutes = 10): PKBattle {
  return {
    id: 'pk_' + Date.now(),
    hostA, hostB,
    scoreA: 0, scoreB: 0,
    duration: durationMinutes,
    timeLeft: durationMinutes * 60,
    active: true,
    gifts: [],
  }
}

export function addGiftToPK(battle: PKBattle, gift: ActiveGift, forHost: 'A' | 'B'): PKBattle {
  const points = gift.gift.ammTokens
  return {
    ...battle,
    scoreA: forHost === 'A' ? battle.scoreA + points : battle.scoreA,
    scoreB: forHost === 'B' ? battle.scoreB + points : battle.scoreB,
    gifts: [...battle.gifts.slice(-19), gift],
  }
}

// ── Token economy ─────────────────────────────────────────────────────────────
// AMM Token Packs (vs Bigo Diamond pricing)
export const TOKEN_PACKS = [
  { id: 'pack_starter',  tokens: 100,   usd: 0.99,  bonus: 0,  label: 'Starter' },
  { id: 'pack_creator',  tokens: 500,   usd: 4.99,  bonus: 50, label: 'Creator' },
  { id: 'pack_kingdom',  tokens: 1500,  usd: 12.99, bonus: 200, label: 'Kingdom' },
  { id: 'pack_prophet',  tokens: 5000,  usd: 39.99, bonus: 1000, label: 'Prophet' },
  { id: 'pack_king',     tokens: 10000, usd: 74.99, bonus: 2500, label: 'King', bestValue: true },
  { id: 'pack_omni',     tokens: 25000, usd: 174.99,bonus: 7500, label: 'Omniverse' },
]
