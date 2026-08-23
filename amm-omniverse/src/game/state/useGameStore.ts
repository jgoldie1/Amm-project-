import { create } from 'zustand'

export type Screen = 'intro' | 'login' | 'city' | 'portal' | 'sports' | 'marketplace' | 'music' | 'faith' | 'blockchain'

export type MissionStatus = 'locked' | 'available' | 'active' | 'complete'

export interface Mission {
  id: string
  title: string
  description: string
  reward: number
  xp: number
  status: MissionStatus
  realm: Screen
}

export interface Vehicle {
  id: string
  name: string
  speed: number
  color: string
  owned: boolean
}

export interface Player {
  name: string
  avatar: 'king' | 'queen' | 'prophet' | 'warrior'
  cash: number
  tokens: number
  xp: number
  level: number
  wantedLevel: number // 0-5 stars
  health: number
  rep: number // street reputation
  faith: number // faith points
  activeVehicle: string | null
  ownedVehicles: string[]
  completedMissions: string[]
}

export interface NPC {
  id: string
  name: string
  role: 'cop' | 'creator' | 'pastor' | 'merchant' | 'athlete' | 'gangster'
  x: number
  z: number
  dialogue: string[]
}

export interface GameState {
  screen: Screen
  player: Player
  missions: Mission[]
  vehicles: Vehicle[]
  npcs: NPC[]
  activeMusic: string | null
  radioStation: number
  radioStations: { name: string; genre: string; track: string }[]
  chatMessages: { user: string; text: string; time: number }[]
  walletConnected: boolean
  walletAddress: string
  nftCount: number
  notif: string | null

  // actions
  setScreen: (s: Screen) => void
  setPlayer: (p: Partial<Player>) => void
  earnCash: (amount: number) => void
  earnXp: (amount: number) => void
  addWanted: () => void
  clearWanted: () => void
  buyVehicle: (id: string) => void
  startMission: (id: string) => void
  completeMission: (id: string) => void
  connectWallet: () => void
  sendChat: (text: string) => void
  setActiveMusic: (track: string | null) => void
  nextRadioStation: () => void
  setNotif: (msg: string | null) => void
}

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm1', title: 'First Drop', realm: 'city',
    description: 'Deliver a creator\'s new album to 3 record shops across AMM City before midnight.',
    reward: 500, xp: 200, status: 'available'
  },
  {
    id: 'm2', title: 'Street Sermon', realm: 'faith',
    description: 'Broadcast a faith message on the corner of Gospel Ave. Reach 50 listeners.',
    reward: 300, xp: 150, status: 'available'
  },
  {
    id: 'm3', title: 'Championship Bout', realm: 'sports',
    description: 'Enter the Omniverse Boxing Championship. Win 3 rounds to claim the belt.',
    reward: 2000, xp: 500, status: 'available'
  },
  {
    id: 'm4', title: 'Market Hustle', realm: 'marketplace',
    description: 'Open your creator shop. List 5 products and make your first sale.',
    reward: 750, xp: 300, status: 'locked'
  },
  {
    id: 'm5', title: 'Holographic Set', realm: 'music',
    description: 'Perform a live holographic music set in Set Apart Music\'s VR stage.',
    reward: 1200, xp: 400, status: 'locked'
  },
  {
    id: 'm6', title: 'Genesis Block', realm: 'blockchain',
    description: 'Mint your first NFT on the El Saturn chain. List it for auction.',
    reward: 0, xp: 600, status: 'locked'
  },
]

const DEFAULT_VEHICLES: Vehicle[] = [
  { id: 'veh1', name: 'Lowrider Classic', speed: 60, color: '#1a1aff', owned: true },
  { id: 'veh2', name: 'AMM Muscle', speed: 90, color: '#ff4400', owned: false },
  { id: 'veh3', name: 'Quantum Cruiser', speed: 120, color: '#00ffcc', owned: false },
  { id: 'veh4', name: 'Holy Rider', speed: 80, color: '#ffd700', owned: false },
  { id: 'veh5', name: 'Omniverse SUV', speed: 70, color: '#8800ff', owned: false },
]

const DEFAULT_NPCS: NPC[] = [
  { id: 'n1', name: 'Pastor Ezra', role: 'pastor', x: 20, z: -30,
    dialogue: ['God has a plan for this city.', 'Come to the Faith Realm, brother.', 'Your faith points are rising!'] },
  { id: 'n2', name: 'DJ Omni', role: 'creator', x: -40, z: 10,
    dialogue: ['I\'m dropping a new track on Set Apart Music!', 'Stream my holographic set tonight.', 'The royalties are real on AMM.'] },
  { id: 'n3', name: 'Coach Titan', role: 'athlete', x: 60, z: 40,
    dialogue: ['The Omniverse Super Bowl is next week!', 'Join a creator league. Big prizes.', 'AI football never sleeps.'] },
  { id: 'n4', name: 'Maya Markets', role: 'merchant', x: -20, z: 50,
    dialogue: ['My AMM store is hitting $10K!', 'List your products in the Marketplace Realm.', 'The NFT drop was fire.'] },
  { id: 'n5', name: 'Officer Knox', role: 'cop', x: 0, z: -60,
    dialogue: ['Keep it clean out here.', 'Wanted level: watch yourself.', 'AMM City police — move along.'] },
]

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'intro',
  activeMusic: null,
  radioStation: 0,
  radioStations: [
    { name: 'Set Apart FM', genre: 'Gospel/Worship', track: 'Holy Is The Lord' },
    { name: 'AMM Trap Radio', genre: 'Hip-Hop', track: 'Street Gospel' },
    { name: 'Omniverse Beats', genre: 'Electronic', track: 'Quantum Drive' },
    { name: 'Creator Wave', genre: 'R&B/Soul', track: 'Rise Up' },
    { name: 'El Saturn Jazz', genre: 'Jazz/Neo-Soul', track: 'Block Chain Blues' },
  ],
  chatMessages: [
    { user: 'DJ_Omni', text: 'New track dropping in the Music Realm 🔥', time: Date.now() - 60000 },
    { user: 'PastorEzra', text: 'Faith Realm sermon at 8PM 🙏', time: Date.now() - 30000 },
    { user: 'CoachTitan', text: 'Super Bowl qualifier tonight! 🏈', time: Date.now() - 10000 },
  ],
  walletConnected: false,
  walletAddress: '',
  nftCount: 0,
  notif: null,
  player: {
    name: '',
    avatar: 'king',
    cash: 2500,
    tokens: 100,
    xp: 0,
    level: 1,
    wantedLevel: 0,
    health: 100,
    rep: 10,
    faith: 20,
    activeVehicle: 'veh1',
    ownedVehicles: ['veh1'],
    completedMissions: [],
  },
  missions: DEFAULT_MISSIONS,
  vehicles: DEFAULT_VEHICLES,
  npcs: DEFAULT_NPCS,

  setScreen: (screen) => set({ screen }),
  setPlayer: (p) => set(s => ({ player: { ...s.player, ...p } })),

  earnCash: (amount) => set(s => ({
    player: { ...s.player, cash: s.player.cash + amount }
  })),

  earnXp: (amount) => {
    const { player } = get()
    const newXp = player.xp + amount
    const newLevel = Math.floor(newXp / 1000) + 1
    set(s => ({ player: { ...s.player, xp: newXp, level: newLevel } }))
    if (newLevel > player.level) {
      get().setNotif(`🎉 Level Up! You're now Level ${newLevel}`)
    }
  },

  addWanted: () => set(s => ({
    player: { ...s.player, wantedLevel: Math.min(5, s.player.wantedLevel + 1) }
  })),

  clearWanted: () => set(s => ({
    player: { ...s.player, wantedLevel: 0 }
  })),

  buyVehicle: (id) => {
    const { player, vehicles } = get()
    const v = vehicles.find(x => x.id === id)
    if (!v || v.owned) return
    const prices: Record<string, number> = { veh2: 5000, veh3: 12000, veh4: 8000, veh5: 9500 }
    const price = prices[id] || 5000
    if (player.cash < price) {
      get().setNotif('Not enough cash! 💸')
      return
    }
    set(s => ({
      player: { ...s.player, cash: s.player.cash - price, ownedVehicles: [...s.player.ownedVehicles, id], activeVehicle: id },
      vehicles: s.vehicles.map(x => x.id === id ? { ...x, owned: true } : x)
    }))
    get().setNotif(`🚗 You bought the ${v.name}!`)
  },

  startMission: (id) => {
    set(s => ({
      missions: s.missions.map(m => m.id === id ? { ...m, status: 'active' } : m)
    }))
    get().setNotif('🎯 Mission started! Check your objectives.')
  },

  completeMission: (id) => {
    const { missions } = get()
    const m = missions.find(x => x.id === id)
    if (!m) return
    set(s => ({
      missions: s.missions.map(x => x.id === id ? { ...x, status: 'complete' } : x),
      player: {
        ...s.player,
        cash: s.player.cash + m.reward,
        completedMissions: [...s.player.completedMissions, id]
      }
    }))
    get().earnXp(m.xp)
    // unlock next mission
    const order = ['m1','m2','m3','m4','m5','m6']
    const idx = order.indexOf(id)
    if (idx >= 0 && idx < order.length - 1) {
      const nextId = order[idx + 1]
      set(s => ({
        missions: s.missions.map(m2 => m2.id === nextId ? { ...m2, status: 'available' } : m2)
      }))
    }
    get().setNotif(`✅ Mission complete! +$${m.reward} cash, +${m.xp} XP`)
  },

  connectWallet: () => {
    const addr = '0x' + Math.random().toString(16).slice(2, 10).toUpperCase() + '...SATURN'
    set({ walletConnected: true, walletAddress: addr, nftCount: Math.floor(Math.random() * 5) })
    get().setNotif(`🔗 Wallet connected: ${addr}`)
  },

  sendChat: (text) => {
    const { player } = get()
    set(s => ({
      chatMessages: [...s.chatMessages.slice(-49), { user: player.name || 'You', text, time: Date.now() }]
    }))
  },

  setActiveMusic: (track) => set({ activeMusic: track }),

  nextRadioStation: () => set(s => {
    const next = (s.radioStation + 1) % s.radioStations.length
    return { radioStation: next, activeMusic: s.radioStations[next].track }
  }),

  setNotif: (msg) => {
    set({ notif: msg })
    if (msg) setTimeout(() => set({ notif: null }), 3500)
  },
}))
