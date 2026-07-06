// AMM Omniverse — Complete Pricing Registry
// Single source of truth for ALL platform pricing
// Updated with Drama Box, all new features, full tier structure
// Victor uses this file to configure Stripe products

export const AMM_PRICING = {

  // ── SUBSCRIPTION TIERS ───────────────────────────────────────────────────
  subscriptions: {
    free: {
      name: 'Free',
      price_usd: 0,
      price_tokens: 0,
      stripe_price_id: '',
      features: [
        '3 realm visits per day',
        'Basic human avatar only',
        '5 music streams per day',
        '1 Drama Box free episode per series',
        'All 11 games playable (no score saving)',
        'Limited marketplace browsing',
      ],
      limits: {
        realmVisits: 3,
        musicStreams: 5,
        avatarSpecies: 1,
        cardDuels: 3,
        liveStreamMinutes: 0,
      },
    },

    pro: {
      name: 'AMM Pro',
      price_usd: 7.99,  // Lowered from $9.99 — more accessible entry point
      price_tokens: 0,
      stripe_price_id: 'price_pro_monthly',
      billing: 'monthly' as const,
      features: [
        'All 6 realms unlimited',
        'All 16 avatar species (Lion, Eagle, Wolf, Phoenix, Dragon, Seraphim, Anubis + more)',
        'Unlimited music streams',
        '50 music uploads/month',
        'Live streaming — up to 2 hours/day',
        '10 Drama Box episode unlocks/month included',
        'Card battle ranked mode',
        'Business directory listing',
        'Chapelle AI unlimited questions',
        'Tactical Realms all maps and modes',
        'Hero Realms full RPG access',
        'HoloMenu + HoloSearch unlimited',
      ],
      limits: {
        realmVisits: -1,  // unlimited
        musicStreams: -1,
        musicUploads: 50,
        avatarSpecies: 16,
        liveStreamMinutes: 120,
        dramaUnlocks: 10,
      },
    },

    creator: {
      name: 'AMM Creator',
      price_usd: 14.99, // Lowered from $19.99 — better creator onboarding
      price_tokens: 0,
      stripe_price_id: 'price_creator_monthly',
      billing: 'monthly' as const,
      features: [
        'Everything in Pro',
        'Unlimited music + video uploads',
        'Music distribution to Spotify, Apple Music, Amazon, YouTube, Tidal',
        'Live streaming unlimited hours',
        'QVC live selling studio',
        'Marketplace storefront with analytics',
        'AI advertising campaigns',
        'Ministry + church pages',
        'DAO voting weight',
        'Podcast studio',
        'Drama Box — create and publish your own series',
        '30 Drama Box episode unlocks/month included',
        'Holographic ad revenue share',
        'Priority Discord support',
        'Creator analytics dashboard',
      ],
      limits: {
        realmVisits: -1,
        musicStreams: -1,
        musicUploads: -1,
        videoUploads: -1,
        avatarSpecies: 16,
        liveStreamMinutes: -1,
        dramaUnlocks: 30,
        dramaPublish: true,
      },
    },

    battle_pass: {
      name: 'AMM Battle Pass',
      price_usd: 4.99,
      price_tokens: 0,
      stripe_price_id: 'price_battle_monthly',
      billing: 'monthly' as const,
      description: 'Add-on to any tier. Game-focused benefits.',
      features: [
        'Tournament access (all game modes)',
        'Premium card skins (seasonal)',
        'Exclusive battle visual effects',
        'Tactical Realms ranked queue',
        'Hero Realms premium class unlocks',
        'Weekly battle pass challenges (+500 tokens/week)',
        'Exclusive Battle Pass avatar frames',
        'Priority matchmaking',
      ],
    },

    drama_pass: {
      name: 'AMM Drama Pass',
      price_usd: 4.99,
      price_tokens: 299,   // OR pay with tokens
      stripe_price_id: 'price_drama_monthly',
      billing: 'monthly' as const,
      description: 'Add-on — unlimited Drama Box episodes.',
      features: [
        'Unlimited episode unlocks on all series',
        'Early access to new episodes (24 hrs before public)',
        'Ad-free viewing',
        'Download episodes for offline (mobile)',
        'Exclusive drama creator badge',
      ],
    },
  },

  // ── TOKEN PACKS ──────────────────────────────────────────────────────────
  // 1 token = $0.01 USD value
  tokenPacks: [
    {
      id: 'tokens_100',
      name: 'Starter Pack',
      tokens: 100,
      bonus: 0,
      price_usd: 0.99,
      price_cents: 99,
      stripe_price_id: 'price_tokens_099',
      value_note: 'Good for 2 episode unlocks',
      popular: false,
    },
    {
      id: 'tokens_500',
      name: 'Creator Pack',
      tokens: 500,
      bonus: 50,
      total: 550,
      price_usd: 4.99,
      price_cents: 499,
      stripe_price_id: 'price_tokens_499',
      value_note: 'Best for new creators — 10 episodes + bonus',
      popular: false,
    },
    {
      id: 'tokens_1500',
      name: 'Kingdom Pack',
      tokens: 1500,
      bonus: 200,
      total: 1700,
      price_usd: 12.99,
      price_cents: 1299,
      stripe_price_id: 'price_tokens_1299',
      value_note: 'Full drama series + music + gifts',
      popular: true,
    },
    {
      id: 'tokens_5000',
      name: 'Prophet Pack',
      tokens: 5000,
      bonus: 750,
      total: 5750,
      price_usd: 39.99,
      price_cents: 3999,
      stripe_price_id: 'price_tokens_3999',
      value_note: '2 full drama series passes + gifts + cards',
      popular: false,
    },
    {
      id: 'tokens_10000',
      name: 'King Pack',
      tokens: 10000,
      bonus: 2000,
      total: 12000,
      price_usd: 74.99,
      price_cents: 7499,
      stripe_price_id: 'price_tokens_7499',
      value_note: 'Best value — enough for a full month of everything',
      popular: false,
    },
    {
      id: 'tokens_25000',
      name: 'Omniverse Pack',
      tokens: 25000,
      bonus: 7000,
      total: 32000,
      price_usd: 174.99,
      price_cents: 17499,
      stripe_price_id: 'price_tokens_17499',
      value_note: 'For serious supporters and big gifters',
      popular: false,
    },
  ],

  // ── DRAMA BOX PRICING ────────────────────────────────────────────────────
  drama: {
    episodeUnlock: 50,           // 50 tokens per episode ($0.50)
    seriesPassRange: [600, 800], // tokens for full series
    dramaPassMonthly_usd: 4.99,
    dramaPassMonthly_tokens: 299,
    creatorRevShare: 0.70,       // creator keeps 70%
    platformCut: 0.30,           // AMM keeps 30%
    freeEpisodesPerSeries: 1,
    minEpisodeCost: 20,          // tokens (floor)
    maxEpisodeCost: 500,         // tokens (ceiling)
  },

  // ── LIVE STREAMING GIFTS ─────────────────────────────────────────────────
  gifts: {
    creatorCut: 0.90,   // creator keeps 90%
    platformCut: 0.10,  // AMM keeps 10%
    items: [
      { id: 'amen',       name: 'Amen',                emoji: '🙏', tokens: 0,    usd: 0,      tier: 'free',      animDuration: 0   },
      { id: 'holy_cross', name: 'Holy Cross',           emoji: '✝️', tokens: 10,   usd: 0.10,   tier: 'basic',     animDuration: 3   },
      { id: 'holy_dove',  name: 'Holy Dove',            emoji: '🕊️', tokens: 50,   usd: 0.50,   tier: 'basic',     animDuration: 5   },
      { id: 'flame',      name: 'Holy Flame',           emoji: '🔥', tokens: 100,  usd: 1.00,   tier: 'standard',  animDuration: 6   },
      { id: 'menorah',    name: 'Menorah',              emoji: '🕎', tokens: 250,  usd: 2.50,   tier: 'standard',  animDuration: 8   },
      { id: 'shofar',     name: 'Shofar Blast',         emoji: '📯', tokens: 500,  usd: 5.00,   tier: 'premium',   animDuration: 10  },
      { id: 'lion_judah', name: 'Lion of Judah',        emoji: '🦁', tokens: 1000, usd: 10.00,  tier: 'premium',   animDuration: 12  },
      { id: 'ark',        name: 'Ark of the Covenant',  emoji: '📦', tokens: 2500, usd: 25.00,  tier: 'legendary', animDuration: 20  },
      { id: 'crown',      name: 'Crown of Glory',       emoji: '👑', tokens: 5000, usd: 50.00,  tier: 'legendary', animDuration: 25  },
      { id: 'seraphim',   name: 'Seraphim',             emoji: '👼', tokens: 6666, usd: 66.66,  tier: 'legendary', animDuration: 30  },
      { id: 'menorah_xl', name: 'Grand Menorah',        emoji: '🌟', tokens: 7777, usd: 77.77,  tier: 'legendary', animDuration: 30  },
      { id: 'omniverse',  name: 'Omniverse Blast',      emoji: '🌐', tokens: 9999, usd: 99.99,  tier: 'legendary', animDuration: 45  },
      { id: 'saturn',     name: 'El Saturn Ring',       emoji: '🪐', tokens: 13000,usd: 130.00, tier: 'ultra',     animDuration: 60  },
      { id: 'covenant',   name: 'New Covenant',         emoji: '📜', tokens: 16000,usd: 160.00, tier: 'ultra',     animDuration: 60  },
      { id: 'creation',   name: 'Day of Creation',      emoji: '🌍', tokens: 20000,usd: 200.00, tier: 'ultra',     animDuration: 90  },
      { id: 'throne',     name: 'Throne of Glory',      emoji: '⚡', tokens: 25000,usd: 250.00, tier: 'ultra',     animDuration: 120 },
      { id: 'omega',      name: 'Alpha and Omega',      emoji: '∞',  tokens: 50000,usd: 500.00, tier: 'godlike',   animDuration: 180 },
      { id: 'messiah',    name: 'Messiah\'s Return',    emoji: '🕊️', tokens: 99999,usd: 999.99, tier: 'godlike',   animDuration: 300 },
    ],
  },

  // ── MARKETPLACE ──────────────────────────────────────────────────────────
  marketplace: {
    platformFee: 0.10,          // AMM takes 10%
    creatorCut: 0.90,           // Creator keeps 90%
    listingFee: 0,              // Free to list
    boostFees: {
      feed_placement_7d: 50,    // tokens to boost in feed for 7 days
      featured_banner: 200,     // tokens for featured banner
      holo_ad_slot: 500,        // tokens for holographic ad slot
    },
    dropshipping: {
      suppliers: 6,
      processingTime: '3-12 days',
      marginRange: '60-80%',
    },
  },

  // ── TOURNAMENTS ──────────────────────────────────────────────────────────
  tournaments: {
    entryFee_usd: 4.99,
    entryFee_tokens: 499,
    prizePoolPercent: 0.80,   // 80% to prizes
    platformPercent: 0.20,    // 20% to AMM
    schedules: {
      boxing: 'Every Saturday 2pm CT',
      basketball: 'Every Sunday 3pm CT',
      cards: 'Every Tuesday 7pm CT',
      tactical: 'Every Friday 8pm CT',
      hero: 'Monthly championship',
      football: 'Every Sunday 1pm CT (season)',
    },
  },

  // ── MUSIC ROYALTIES ──────────────────────────────────────────────────────
  music: {
    ratePerStream: {
      Gospel: 0.018,       // Was $0.019 — still 4–6× Spotify
      'Gospel Rap': 0.018,
      Worship: 0.018,
      'R&B': 0.015,
      'Hip-Hop': 0.012,
      default: 0.012,
    },
    creatorShare: 0.90,       // creator keeps 90% — unchanged
    platformShare: 0.10,      // AMM pool cut
    qualifiedStream: 30,      // seconds minimum to count
    payoutSchedule: 'Monthly on 1st',
    distributionPlatforms: ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Tidal', 'Deezer'],
    distributionFee: 0,       // AMM charges nothing for distribution
  },

  // ── HOLOGRAPHIC ADS ─────────────────────────────────────────────────────
  holoAds: {
    rates: {
      pre_roll_15s: 200,      // $200 per episode
      corner_popup_10s: 150,
      banner_30s: 100,
      interactive_20s: 300,
      full_screen_30s: 500,
    },
    minimumBudget_usd: 50,
    blackOwnedDiscount: 0.25,   // 25% off for Black-owned brands
    faithFriendlyRequired: true,
    approvalTime: '48 hours',
  },

  // ── CARD BATTLE ECONOMY ──────────────────────────────────────────────────
  cards: {
    starterDeck: 0,             // free
    boosterPack_3cards: 100,    // 100 tokens
    epicPack_5cards: 250,       // 250 tokens
    legendaryPack_1card: 500,   // 500 tokens guaranteed legendary
    tradeFee: 0.05,             // 5% on card trades
    tournamentEntry: 499,       // tokens
  },

  // ── BUSINESS DIRECTORY ───────────────────────────────────────────────────
  directory: {
    basicListing: 0,            // always free
    featuredListing_monthly: 99,// tokens/month
    verifiedBadge: 500,         // one-time tokens
    adPlacement_monthly: 300,   // tokens/month in search results
  },

  // ── NFT / BLOCKCHAIN ─────────────────────────────────────────────────────
  blockchain: {
    mintingFee: 0.025,          // 2.5% of NFT price
    tradingFee: 0.025,          // 2.5% royalty on secondary
    daoVoteWeight: {
      free: 1,
      pro: 5,
      creator: 20,
    },
  },
}

// ── REVENUE PROJECTIONS ──────────────────────────────────────────────────────
// Used by RevenueDashboard component

export function calcMonthlyRevenue(users: number) {
  const p = AMM_PRICING
  const proUsers      = users * 0.35
  const creatorUsers  = users * 0.15
  const battleUsers   = users * 0.20
  const dramaUsers    = users * 0.18  // new Drama Pass adopters

  const subscriptions = (proUsers * p.subscriptions.pro.price_usd) +
                        (creatorUsers * p.subscriptions.creator.price_usd) +
                        (battleUsers * p.subscriptions.battle_pass.price_usd) +
                        (dramaUsers * p.subscriptions.drama_pass.price_usd)

  const marketplace   = users * 0.20 * 3 * 45 * p.marketplace.platformFee
  const gifts         = users * 0.25 * 2.5 * 4.50 * p.gifts.platformCut
  const tournaments   = users * 0.10 * p.tournaments.entryFee_usd * p.tournaments.platformPercent
  const music         = users * 50 * p.music.ratePerStream.default * p.music.platformShare
  const drama         = users * 0.30 * 3 * p.drama.episodeUnlock * 0.01 * p.drama.platformCut
  const holoAds       = Math.floor(users / 100) * p.holoAds.rates.full_screen_30s * 0.5
  const tokenSales    = users * 0.15 * 4.99 * 0.971  // 15% buy tokens, after Stripe fee

  const gross   = subscriptions + marketplace + gifts + tournaments + music + drama + holoAds + tokenSales
  const costs   = 200 + Math.floor(users / 1000) * 150
  const net     = gross - costs

  return {
    subscriptions: Math.round(subscriptions),
    marketplace: Math.round(marketplace),
    gifts: Math.round(gifts),
    tournaments: Math.round(tournaments),
    music: Math.round(music),
    drama: Math.round(drama),
    holoAds: Math.round(holoAds),
    tokenSales: Math.round(tokenSales),
    gross: Math.round(gross),
    costs: Math.round(costs),
    net: Math.round(net),
  }
}

// ── VICTOR'S STRIPE SETUP ────────────────────────────────────────────────────
// Send Victor this list — he creates these Stripe Products + Prices

export const STRIPE_PRODUCTS_FOR_VICTOR = [
  // Subscriptions (recurring)
  { name: 'AMM Pro Monthly',          amount: 799,   interval: 'month', id: 'price_pro_monthly' },  // $7.99
  { name: 'AMM Creator Monthly',      amount: 1499,  interval: 'month', id: 'price_creator_monthly' }, // $14.99
  { name: 'AMM Battle Pass Monthly',  amount: 499,   interval: 'month', id: 'price_battle_monthly' },
  { name: 'AMM Drama Pass Monthly',   amount: 499,   interval: 'month', id: 'price_drama_monthly' },
  // Annual (17% savings)
  { name: 'AMM Pro Annual',           amount: 7990,  interval: 'year',  id: 'price_pro_annual' },  // $79.90
  { name: 'AMM Creator Annual',       amount: 14990, interval: 'year',  id: 'price_creator_annual' }, // $149.90
  // Token packs (one-time)
  { name: '100 Tokens Starter',       amount: 99,    interval: null,    id: 'price_tokens_099' },
  { name: '550 Tokens Creator',       amount: 499,   interval: null,    id: 'price_tokens_499' },
  { name: '1700 Tokens Kingdom',      amount: 1299,  interval: null,    id: 'price_tokens_1299' },
  { name: '5750 Tokens Prophet',      amount: 3999,  interval: null,    id: 'price_tokens_3999' },
  { name: '12000 Tokens King',        amount: 7499,  interval: null,    id: 'price_tokens_7499' },
  { name: '32000 Tokens Omniverse',   amount: 17499, interval: null,    id: 'price_tokens_17499' },
]
