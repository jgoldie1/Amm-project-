// Isaiah AI Starverse — Complete Data Layer
// Higfield Dance 2.0 · Mythos Blender · Messiah AI MD
// Anyone Can Be A Star · AI TV · Parent & Child Theme

export type TalentCategory =
  | 'Athlete' | 'Dancer' | 'Singer' | 'Actor' | 'Comedian'
  | 'Musician' | 'Speaker' | 'Creator' | 'Gamer' | 'Artist'
  | 'Poet' | 'Student' | 'Chef' | 'Designer' | 'Producer'

export type StarLevel =
  | 'Rising Talent' | 'New Star' | 'Next Star' | 'Rising Legend'
  | 'Star' | 'Superstar' | 'Icon' | 'Legend'

export type ProductionStatus =
  | 'casting' | 'pre_production' | 'filming' | 'post' | 'released' | 'streaming'

export type ShowcaseStatus =
  | 'upcoming' | 'live' | 'voting' | 'completed'

// ── STARS ─────────────────────────────────────────────────────────────

export interface Star {
  id: number
  name: string
  talent: TalentCategory[]
  city: string
  state: string
  level: StarLevel
  score: number
  votes: number
  bio: string
  parentSupported: boolean
  age?: number
  achievements: string[]
  socialLinks?: { platform: string; handle: string }[]
  aiCoachRating: number
  showcaseReady: boolean
  emoji: string
}

export const STARS: Star[] = [
  {
    id: 1,
    name: 'Isaiah Stubbs',
    talent: ['Athlete','Creator','Speaker'],
    city: 'Herrin', state: 'IL',
    level: 'Rising Legend',
    score: 98, votes: 1396,
    bio: 'Built for sports, leadership, faith, creativity, and legacy. Multi-sport athlete with creator vision.',
    parentSupported: true,
    age: 16,
    achievements: ['Multi-sport athlete','Community leader','Faith ambassador','Content creator'],
    aiCoachRating: 98,
    showcaseReady: true,
    emoji: '⚡'
  },
  {
    id: 2,
    name: 'Aniyah Vision',
    talent: ['Singer','Actor','Creator'],
    city: 'Chicago', state: 'IL',
    level: 'Next Star',
    score: 91, votes: 822,
    bio: 'Bright creator with performance, education, and media potential. Voice of a generation.',
    parentSupported: true,
    age: 14,
    achievements: ['School musical lead','Youth creator award','Vocal performance'],
    aiCoachRating: 91,
    showcaseReady: true,
    emoji: '🌟'
  },
  {
    id: 3,
    name: 'Destiny Higfield',
    talent: ['Dancer','Creator'],
    city: 'Herrin', state: 'IL',
    level: 'Rising Talent',
    score: 89, votes: 714,
    bio: 'Lead dancer in the Higfield Dance 2.0 program. Contemporary, hip-hop, and praise dance fusion.',
    parentSupported: true,
    age: 13,
    achievements: ['Higfield Dance 2.0 lead','Regional dance competition finalist'],
    aiCoachRating: 89,
    showcaseReady: true,
    emoji: '💃'
  },
  {
    id: 4,
    name: 'Marcus Mythos',
    talent: ['Producer','Musician','Creator'],
    city: 'Chicago', state: 'IL',
    level: 'Star',
    score: 93, votes: 967,
    bio: 'Mythos Blender producer — blends gospel, hip-hop, and cinematic sound into one original style.',
    parentSupported: false,
    age: 19,
    achievements: ['100+ original beats','3 EP releases','Mythos Blender founder'],
    aiCoachRating: 93,
    showcaseReady: true,
    emoji: '🎵'
  },
  {
    id: 5,
    name: 'Grace Starfield',
    talent: ['Singer','Actor','Dancer'],
    city: 'Springfield', state: 'IL',
    level: 'New Star',
    score: 84, votes: 512,
    bio: 'Triple threat performer — can sing, act, and dance. Parent-enrolled through the youth program.',
    parentSupported: true,
    age: 11,
    achievements: ['School talent show winner','Dance recital lead'],
    aiCoachRating: 84,
    showcaseReady: false,
    emoji: '🌸'
  },
]

// ── JUDGES ────────────────────────────────────────────────────────────

export interface Judge {
  id: number
  name: string
  title: string
  expertise: string[]
  bio: string
  emoji: string
  style: 'encouraging' | 'technical' | 'visionary' | 'honest' | 'spiritual'
  aiPersonality: string
}

export const JUDGES: Judge[] = [
  {
    id: 1,
    name: 'Isaiah AI MD',
    title: 'Head Judge & AI Talent Director',
    expertise: ['All categories','AI scoring','Talent development','Life coaching'],
    bio: 'The Messiah AI MD system — trained on decades of talent development, faith-based excellence, and performance coaching. Scores on effort, story, potential, and growth — not just raw talent.',
    emoji: '🤖',
    style: 'visionary',
    aiPersonality: 'I see greatness in you. Not what you are today — what you are becoming. Let\'s build.',
  },
  {
    id: 2,
    name: 'Coach Titan',
    title: 'Athletic Performance Judge',
    expertise: ['Sports','Athletics','Physical performance','Team leadership'],
    bio: 'Former college athlete turned youth coach. Scores on discipline, physical excellence, and competitive heart.',
    emoji: '🏆',
    style: 'technical',
    aiPersonality: 'Talent gets you to the door. Discipline gets you in. Show me your work ethic.',
  },
  {
    id: 3,
    name: 'Pastor Grace',
    title: 'Faith & Character Judge',
    expertise: ['Faith performance','Gospel arts','Character development','Ministry'],
    bio: 'Youth pastor and community leader. Evaluates character, faith expression, community impact, and purpose.',
    emoji: '✝️',
    style: 'spiritual',
    aiPersonality: 'Your gift makes room for you. But your character is what keeps the room. Shine your light.',
  },
  {
    id: 4,
    name: 'DJ Starmaker',
    title: 'Entertainment & Performance Judge',
    expertise: ['Music','Dance','Stage presence','Entertainment value'],
    bio: 'Industry entertainment professional. Evaluates stage presence, entertainment value, and audience connection.',
    emoji: '🎤',
    style: 'encouraging',
    aiPersonality: 'The crowd doesn\'t lie. Did they feel it? Did they move? That\'s what matters on stage.',
  },
  {
    id: 5,
    name: 'Queen Vision',
    title: 'Creative & Arts Judge',
    expertise: ['Visual arts','Creative direction','Brand building','Storytelling'],
    bio: 'Creative director and artist. Scores on originality, storytelling, visual impact, and creative boldness.',
    emoji: '👑',
    style: 'honest',
    aiPersonality: 'Safe is forgettable. Original is remembered. Be bold. Be you. Give me something I\'ve never seen.',
  },
]

// ── HIGFIELD DANCE 2.0 ────────────────────────────────────────────────

export interface DanceProduction {
  id: number
  title: string
  style: string[]
  description: string
  duration: string
  performers: string[]
  music: string
  theme: string
  showcaseDate?: string
  status: ProductionStatus
  holoEffect: boolean
}

export const DANCE_PRODUCTIONS: DanceProduction[] = [
  {
    id: 1,
    title: 'Higfield Dance 2.0 — Genesis',
    style: ['Contemporary','Hip-Hop','Praise Dance'],
    description: 'The opening showcase of Higfield Dance 2.0. A parent-and-child paired performance exploring identity, faith, and movement. Blends street dance with worship choreography.',
    duration: '12 minutes',
    performers: ['Destiny Higfield','Youth Dance Ensemble','Parent Partners'],
    music: 'Original — Mythos Blender production',
    theme: 'Roots and Wings — where you come from shapes where you go',
    showcaseDate: '2026-08-15',
    status: 'pre_production',
    holoEffect: true,
  },
  {
    id: 2,
    title: 'Higfield 2.0 — Kingdom Moves',
    style: ['Stomp','Step','Liturgical'],
    description: 'High-energy stomp and step performance rooted in HBCU traditions and faith expression. Full company piece — 20 performers.',
    duration: '18 minutes',
    performers: ['Full Higfield Dance Company'],
    music: 'Live drumline + Mythos Blender remix',
    theme: 'Heritage, Community, Faith',
    status: 'casting',
    holoEffect: false,
  },
  {
    id: 3,
    title: 'Higfield 2.0 — Solo Showcase',
    style: ['Mixed styles','Solo competition'],
    description: 'Individual dancers compete for the Higfield Star Award. Each performs 90-second original piece judged by all 5 judges.',
    duration: '45 minutes',
    performers: ['Competition slots open'],
    music: 'Performer choice',
    theme: 'Anyone Can Be A Star',
    status: 'casting',
    holoEffect: true,
  },
]

// ── TV SHOWS ─────────────────────────────────────────────────────────

export interface TVShow {
  id: number
  title: string
  format: 'reality' | 'competition' | 'documentary' | 'talk' | 'variety' | 'scripted'
  episodes: number
  episodeDuration: string
  description: string
  hosts: string[]
  judges?: string[]
  theme: string
  targetAudience: string[]
  status: ProductionStatus
  season: number
  productPlacement: boolean
  holoAds: boolean
  aiGenerated: boolean
}

export const TV_SHOWS: TVShow[] = [
  {
    id: 1,
    title: 'Anyone Can Be A Star',
    format: 'competition',
    episodes: 12,
    episodeDuration: '45 min',
    description: 'The flagship Isaiah AI talent competition. Youth and adult creators, athletes, performers, and artists compete across 6 weeks with live audience voting, AI judging, and parent-child teams.',
    hosts: ['Isaiah AI MD','Community Host'],
    judges: ['Isaiah AI MD','Coach Titan','Pastor Grace','DJ Starmaker','Queen Vision'],
    theme: 'Faith · Talent · Family · Legacy',
    targetAudience: ['Youth 8-18','Parents','Faith community','Creators'],
    status: 'pre_production',
    season: 1,
    productPlacement: true,
    holoAds: true,
    aiGenerated: false,
  },
  {
    id: 2,
    title: 'Messiah AI MD — Life Coaching Live',
    format: 'talk',
    episodes: 26,
    episodeDuration: '30 min',
    description: 'Weekly live talk show where the Messiah AI MD system coaches real people — youth, parents, athletes, creators — through challenges, dreams, and life decisions in real time.',
    hosts: ['Messiah AI MD'],
    theme: 'Purpose · Growth · Faith · Excellence',
    targetAudience: ['All ages','Faith community','Parents','Youth'],
    status: 'pre_production',
    season: 1,
    productPlacement: true,
    holoAds: true,
    aiGenerated: true,
  },
  {
    id: 3,
    title: 'Higfield Dance 2.0 — The Series',
    format: 'reality',
    episodes: 8,
    episodeDuration: '30 min',
    description: 'Behind the scenes of the Higfield Dance program. Follow youth dancers through rehearsals, breakthroughs, struggles, and performances. Parent perspectives included every episode.',
    hosts: ['Destiny Higfield narrator'],
    theme: 'Dance · Family · Discipline · Joy',
    targetAudience: ['Youth','Parents','Dance lovers','Faith community'],
    status: 'pre_production',
    season: 1,
    productPlacement: false,
    holoAds: false,
    aiGenerated: false,
  },
  {
    id: 4,
    title: 'Starverse Showcase LIVE',
    format: 'variety',
    episodes: 52,
    episodeDuration: '60 min',
    description: 'Weekly live showcase streamed on AMM Omniverse. Fans vote in real time, judges score instantly, and the Starverse ranking updates live on screen.',
    hosts: ['Isaiah AI MC','Rotating Guest Hosts'],
    judges: ['Isaiah AI MD','Coach Titan','Pastor Grace','DJ Starmaker','Queen Vision'],
    theme: 'Live · Raw · Real · Star-making',
    targetAudience: ['All ages','Talent seekers','Fans','Creators'],
    status: 'pre_production',
    season: 1,
    productPlacement: true,
    holoAds: true,
    aiGenerated: false,
  },
]

// ── MOVIES & FILMS ────────────────────────────────────────────────────

export interface Movie {
  id: number
  title: string
  genre: string[]
  logline: string
  synopsis: string
  duration: string  // '30 min' | '60 min' | '90 min' | '120 min' etc
  format: 'short' | 'feature' | 'documentary' | 'mini_series'
  targetAudience: string[]
  castingOpen: boolean
  productPlacement: boolean
  holoAds: boolean
  aiAssisted: boolean
  status: ProductionStatus
  budget: string
  theme: string
  parentChildFocus: boolean
}

export const MOVIES: Movie[] = [
  {
    id: 1,
    title: 'Star Born — The Isaiah Story',
    genre: ['Drama','Inspirational','Sports'],
    logline: 'A young athlete from a small town discovers that greatness is not given — it is built.',
    synopsis: `Isaiah Stubbs is 16, multi-sport, full of faith, and stuck in Herrin, IL wondering if the world will ever see him. When a local talent program powered by Isaiah AI identifies his potential, he must decide: play it safe, or risk everything to rise. His mother, his coaches, and the Starverse community push him toward a defining moment that will change the trajectory of his family forever. A story about faith, sacrifice, small-town dreams, and what happens when AI meets human potential.`,
    duration: '90 min',
    format: 'feature',
    targetAudience: ['Youth','Parents','Faith community','Sports fans'],
    castingOpen: true,
    productPlacement: true,
    holoAds: true,
    aiAssisted: true,
    status: 'pre_production',
    budget: 'Micro ($50K–$200K)',
    theme: 'Faith · Family · Sacrifice · Greatness',
    parentChildFocus: true,
  },
  {
    id: 2,
    title: 'Kingdom Rhythm',
    genre: ['Musical','Drama','Faith'],
    logline: 'A gospel producer and a street dancer collide at a city talent showcase — and their collaboration changes both of their lives.',
    synopsis: `Marcus Mythos is a Mythos Blender producer trying to get his sound heard. Destiny Higfield is a dancer from the Higfield Dance 2.0 program with no music that matches her movement. When they meet at the Anyone Can Be A Star showcase, the collision produces something neither expected. A 2-hour musical drama exploring artistic identity, faith, community, and what happens when two gifts find each other.`,
    duration: '120 min',
    format: 'feature',
    targetAudience: ['All ages','Music lovers','Dance community','Faith community'],
    castingOpen: true,
    productPlacement: true,
    holoAds: true,
    aiAssisted: false,
    status: 'casting',
    budget: 'Low ($200K–$500K)',
    theme: 'Music · Dance · Community · Discovery',
    parentChildFocus: false,
  },
  {
    id: 3,
    title: 'My Kid Is A Star',
    genre: ['Documentary','Reality','Family'],
    logline: 'Five parents. Five children. One platform. The real story behind the Starverse.',
    synopsis: `A documentary following five parent-child pairs through the Anyone Can Be A Star program over 6 months. Unscripted. Raw. The fights, the rehearsals, the breakthroughs, the failures, and the moments that change families forever. Produced with holographic behind-the-scenes segments and AI narrative assistance.`,
    duration: '90 min',
    format: 'documentary',
    targetAudience: ['Parents','Youth','Family audiences','Faith community'],
    castingOpen: true,
    productPlacement: false,
    holoAds: false,
    aiAssisted: true,
    status: 'casting',
    budget: 'Micro ($30K–$100K)',
    theme: 'Family · Support · Love · Sacrifice',
    parentChildFocus: true,
  },
  {
    id: 4,
    title: 'Mythos: The Sound of Tomorrow',
    genre: ['Music Documentary','Biopic'],
    logline: '30 minutes inside the mind of a Mythos Blender session.',
    synopsis: `A 30-minute short film following producer Marcus Mythos through a single recording session where he creates an entire EP from scratch using Mythos Blender — his proprietary blending system that fuses gospel, trap, classical, and cinematic sound.`,
    duration: '30 min',
    format: 'short',
    targetAudience: ['Music creators','Youth','Producers'],
    castingOpen: false,
    productPlacement: true,
    holoAds: true,
    aiAssisted: true,
    status: 'pre_production',
    budget: 'Micro ($10K–$30K)',
    theme: 'Creativity · Sound · Identity',
    parentChildFocus: false,
  },
]

// ── SHOWCASES ─────────────────────────────────────────────────────────

export interface Showcase {
  id: number
  title: string
  date: string
  time: string
  venue: string
  format: 'in_person' | 'online' | 'hybrid'
  categories: TalentCategory[]
  judges: string[]
  entryFee: number
  prizePool: string
  maxPerformers: number
  currentEntries: number
  ageGroups: string[]
  status: ShowcaseStatus
  parentRequired: boolean
  streamLink?: string
  theme: string
}

export const SHOWCASES: Showcase[] = [
  {
    id: 1,
    title: 'Starverse Showcase — Anyone Can Be A Star Vol. 1',
    date: '2026-08-15',
    time: '6:00 PM CT',
    venue: 'AMM Omniverse Live + Herrin Community Center',
    format: 'hybrid',
    categories: ['Dancer','Singer','Athlete','Actor','Musician','Speaker','Creator'],
    judges: ['Isaiah AI MD','Coach Titan','Pastor Grace','DJ Starmaker','Queen Vision'],
    entryFee: 15,
    prizePool: '$2,500 total — 1st: $1,000 · 2nd: $750 · 3rd: $500 · Youth: $250',
    maxPerformers: 30,
    currentEntries: 12,
    ageGroups: ['6–10','11–14','15–18','19+','Parent-Child Duo'],
    status: 'upcoming',
    parentRequired: true,
    streamLink: 'https://tryamm.online/showcase/live',
    theme: 'Roots · Wings · Stars',
  },
  {
    id: 2,
    title: 'Higfield Dance 2.0 — Online Auditions',
    date: '2026-07-20',
    time: '2:00 PM CT',
    venue: 'AMM Omniverse Live',
    format: 'online',
    categories: ['Dancer'],
    judges: ['Isaiah AI MD','Queen Vision','DJ Starmaker'],
    entryFee: 0,
    prizePool: 'Invitation to Higfield Dance Company',
    maxPerformers: 20,
    currentEntries: 8,
    ageGroups: ['8–12','13–17'],
    status: 'upcoming',
    parentRequired: true,
    theme: 'Movement · Story · Excellence',
  },
]

// ── PRODUCT PLACEMENTS ────────────────────────────────────────────────

export interface ProductPlacement {
  id: number
  brand: string
  product: string
  category: string
  placement: 'pre_roll' | 'in_show' | 'holographic' | 'host_mention' | 'prize' | 'banner'
  shows: string[]
  rate: string
  holoCapable: boolean
  blackOwned: boolean
  faithFriendly: boolean
}

export const PRODUCT_PLACEMENTS: ProductPlacement[] = [
  {
    id: 1,
    brand: 'AMM Marketplace',
    product: 'Creator Starter Bundle',
    category: 'Education/Creator Tools',
    placement: 'holographic',
    shows: ['Anyone Can Be A Star','Starverse Showcase LIVE'],
    rate: '$500/episode',
    holoCapable: true,
    blackOwned: true,
    faithFriendly: true,
  },
  {
    id: 2,
    brand: 'AMM Omniverse',
    product: 'Pro Subscription',
    category: 'Platform',
    placement: 'host_mention',
    shows: ['Messiah AI MD — Life Coaching Live','Starverse Showcase LIVE'],
    rate: '$300/episode',
    holoCapable: true,
    blackOwned: true,
    faithFriendly: true,
  },
  {
    id: 3,
    brand: 'Gospel Beats Pack',
    product: 'Set Apart Music Beats Vol. 1',
    category: 'Music',
    placement: 'in_show',
    shows: ['Kingdom Rhythm','Higfield Dance 2.0 — The Series'],
    rate: '$200/placement',
    holoCapable: false,
    blackOwned: true,
    faithFriendly: true,
  },
]

// ── HOLOGRAPHIC AD SYSTEM ─────────────────────────────────────────────

export interface HoloAd {
  id: number
  title: string
  brand: string
  duration: number  // seconds
  type: 'full_screen' | 'corner' | 'overlay' | 'interactive' | 'environmental'
  triggerEvent: string
  color: string
  emoji: string
  cta: string
  targetUrl: string
}

export const HOLO_ADS: HoloAd[] = [
  {
    id: 1,
    title: 'AMM Pro — Upgrade Your Star',
    brand: 'AMM Omniverse',
    duration: 15,
    type: 'full_screen',
    triggerEvent: 'showcase_break',
    color: '#00ffcc',
    emoji: '🌐',
    cta: 'JOIN FOR $9.99/MONTH',
    targetUrl: 'https://tryamm.online',
  },
  {
    id: 2,
    title: 'Gospel Beats Pack — Set Apart Music',
    brand: 'Set Apart Records',
    duration: 10,
    type: 'overlay',
    triggerEvent: 'music_performance',
    color: '#ffd700',
    emoji: '🎵',
    cta: 'GET 50 TRACKS — $29',
    targetUrl: 'https://tryamm.online/marketplace',
  },
  {
    id: 3,
    title: 'Messiah AI MD — Get Your Life Plan',
    brand: 'Isaiah AI',
    duration: 20,
    type: 'interactive',
    triggerEvent: 'coaching_segment',
    color: '#8800ff',
    emoji: '🤖',
    cta: 'START FREE COACHING',
    targetUrl: 'https://tryamm.online/coaching',
  },
]

// ── AUDITIONS ─────────────────────────────────────────────────────────

export interface Audition {
  id: number
  name: string
  talent: TalentCategory
  city: string
  state: string
  videoUrl: string
  story: string
  status: 'pending' | 'approved' | 'featured' | 'rejected'
  score: number
  judgeScores: { judgeId: number; score: number; comment: string }[]
  parentName?: string
  parentConsent: boolean
  ageGroup: string
  submittedAt: string
}

export const AUDITIONS: Audition[] = [
  {
    id: 1,
    name: 'Isaiah Stubbs',
    talent: 'Athlete',
    city: 'Herrin', state: 'IL',
    videoUrl: 'https://tryamm.online/demo-reel',
    story: 'I want to show the world that discipline, faith, family, and greatness are not separate things. They are one.',
    status: 'featured',
    score: 98,
    judgeScores: [
      { judgeId: 1, score: 98, comment: 'Exceptional story. Clear purpose. Ready for the Starverse.' },
      { judgeId: 2, score: 97, comment: 'Athletic excellence combined with leadership. Rare combination.' },
      { judgeId: 3, score: 99, comment: 'Faith in action. Character is elite.' },
      { judgeId: 4, score: 96, comment: 'Stage presence is natural. Crowd will love this kid.' },
      { judgeId: 5, score: 98, comment: 'Original. Authentic. Memorable.' },
    ],
    parentName: 'Mrs. Stubbs',
    parentConsent: true,
    ageGroup: '15–18',
    submittedAt: '2026-06-01',
  },
]

// ── PARENT-CHILD TEAMS ────────────────────────────────────────────────

export interface ParentChildTeam {
  id: number
  childName: string
  parentName: string
  childTalent: TalentCategory[]
  story: string
  city: string
  state: string
  enrolled: boolean
  score: number
  emoji: string
}

export const PARENT_CHILD_TEAMS: ParentChildTeam[] = [
  {
    id: 1,
    childName: 'Isaiah Stubbs',
    parentName: 'Mrs. Stubbs',
    childTalent: ['Athlete','Creator','Speaker'],
    story: 'My mom believed in me before I believed in myself. She drove me to every practice, every game, every audition. This is for her.',
    city: 'Herrin', state: 'IL',
    enrolled: true,
    score: 98,
    emoji: '⚡',
  },
  {
    id: 2,
    childName: 'Destiny Higfield',
    parentName: 'Ms. Higfield',
    childTalent: ['Dancer'],
    story: 'Dance saved our family. When we were going through hard times, the Higfield Dance program gave us both something to look forward to every week.',
    city: 'Herrin', state: 'IL',
    enrolled: true,
    score: 89,
    emoji: '💃',
  },
]
