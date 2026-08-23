// AMM Music Video + Distribution System
// Video upload, holographic 9:16 player, swipeable reel feed
// Music distribution: AMM → DistroKid/TuneCore → Spotify/Apple Music
// Artist profiles with cross-platform stats

export interface MusicVideo {
  id: string
  title: string
  artist: string
  genre: string
  videoUrl: string | null      // null = demo/placeholder
  thumbnailUrl: string | null
  audioTrackId: string | null  // linked audio track for royalties
  duration: number             // seconds
  views: number
  likes: number
  scripture?: string
  bpm?: number
  uploadedAt: number
  isVertical: boolean          // 9:16 for reels, 16:9 for MV
  holographicMode: boolean     // AR holographic overlay mode
  distributionStatus: DistributionStatus
  platforms: PlatformStats[]
  uploadedBy: string
}

export interface DistributionStatus {
  submitted: boolean
  submittedAt?: number
  platforms: {
    spotify: 'pending' | 'live' | 'rejected' | 'not_submitted'
    appleMusic: 'pending' | 'live' | 'rejected' | 'not_submitted'
    amazon: 'pending' | 'live' | 'rejected' | 'not_submitted'
    youtube: 'pending' | 'live' | 'rejected' | 'not_submitted'
    tidal: 'pending' | 'live' | 'rejected' | 'not_submitted'
  }
  distributor: 'distrokid' | 'tunecore' | 'amm_direct' | null
  isrc?: string
  upc?: string
}

export interface PlatformStats {
  platform: 'spotify' | 'apple_music' | 'amm' | 'youtube' | 'amazon'
  streams: number
  revenue: number   // USD
  monthlyChange: number  // % vs last month
}

export interface ArtistProfile {
  id: string
  name: string
  bio: string
  photoUrl: string | null
  genres: string[]
  socialLinks: {
    instagram?: string
    tiktok?: string
    youtube?: string
    website?: string
  }
  totalStreams: number
  totalRevenue: number
  monthlyListeners: number
  tracks: number
  videos: number
  platformStats: PlatformStats[]
  isVerified: boolean
  isMinistry: boolean
  scriptureTheme?: string
  distributionActive: boolean
  joinedAt: number
}

// ── Demo music videos ─────────────────────────────────────────────────────────

export const DEMO_VIDEOS: MusicVideo[] = [
  {
    id: 'mv1', title: 'Holy Is The Lord — Official Video', artist: 'SetApart Worship',
    genre: 'Gospel', videoUrl: null, thumbnailUrl: null, audioTrackId: 't1',
    duration: 214, views: 87234, likes: 12441, scripture: 'Isaiah 6:3',
    uploadedAt: Date.now() - 7776000000, isVertical: false, holographicMode: true,
    uploadedBy: 'SisRuth',
    distributionStatus: {
      submitted: true, submittedAt: Date.now() - 7000000000,
      platforms: { spotify: 'live', appleMusic: 'live', amazon: 'live', youtube: 'live', tidal: 'pending' },
      distributor: 'distrokid', isrc: 'US-SAW-26-00001', upc: '195497001234'
    },
    platforms: [
      { platform: 'spotify',     streams: 52000, revenue: 208.00,  monthlyChange: 12 },
      { platform: 'apple_music', streams: 18000, revenue: 90.00,   monthlyChange: 8 },
      { platform: 'amm',         streams: 12432, revenue: 236.21,  monthlyChange: 34 },
      { platform: 'youtube',     streams: 4802,  revenue: 14.41,   monthlyChange: -3 },
    ]
  },
  {
    id: 'mv2', title: 'Street Gospel (Official Reel)', artist: 'AMM Trap',
    genre: 'Hip-Hop/Gospel', videoUrl: null, thumbnailUrl: null, audioTrackId: 't2',
    duration: 60, views: 234109, likes: 41209, bpm: 140,
    uploadedAt: Date.now() - 2592000000, isVertical: true, holographicMode: false,
    uploadedBy: 'DJ_King',
    distributionStatus: {
      submitted: true,
      platforms: { spotify: 'live', appleMusic: 'pending', amazon: 'not_submitted', youtube: 'live', tidal: 'not_submitted' },
      distributor: 'tunecore', isrc: 'US-AMM-26-00002'
    },
    platforms: [
      { platform: 'spotify',     streams: 89000, revenue: 356.00, monthlyChange: 67 },
      { platform: 'amm',         streams: 8901,  revenue: 160.22, monthlyChange: 45 },
      { platform: 'youtube',     streams: 136208, revenue: 408.62, monthlyChange: 122 },
    ]
  },
  {
    id: 'mv3', title: 'Hebraic Praise — Dance Video', artist: 'Zion Collective',
    genre: 'Worship', videoUrl: null, thumbnailUrl: null, audioTrackId: 't6',
    duration: 195, views: 34129, likes: 9887, scripture: 'Psalm 150',
    uploadedAt: Date.now() - 1209600000, isVertical: false, holographicMode: true,
    uploadedBy: 'ZionChoir',
    distributionStatus: {
      submitted: false,
      platforms: { spotify: 'not_submitted', appleMusic: 'not_submitted', amazon: 'not_submitted', youtube: 'live', tidal: 'not_submitted' },
      distributor: null
    },
    platforms: [
      { platform: 'amm',     streams: 9887,  revenue: 187.85, monthlyChange: 18 },
      { platform: 'youtube', streams: 24242, revenue: 72.73,  monthlyChange: 22 },
    ]
  },
]

// ── Distribution flow ─────────────────────────────────────────────────────────

export interface DistributionSubmission {
  trackId: string
  videoId?: string
  distributor: 'distrokid' | 'tunecore' | 'amm_direct'
  targetPlatforms: string[]
  releaseDate: string
  artistName: string
  albumTitle?: string
  genre: string
  explicit: boolean
  scriptureTag?: string
  upcRequested: boolean
  isrcRequested: boolean
}

export async function submitToDistribution(sub: DistributionSubmission): Promise<{ success: boolean; message: string; estimatedLiveDate: string }> {
  // Real integration: POST to /api/distribution/submit
  // Which calls DistroKid API or TuneCore API
  const endpoint = '/api/distribution/submit'

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    })
    if (res.ok) {
      const data = await res.json() as { success: boolean; message: string; estimatedLiveDate: string }
      return data
    }
  } catch { /* fall through to mock */ }

  // Mock response — works without backend
  const days = sub.distributor === 'distrokid' ? 3 : 5
  const liveDate = new Date(Date.now() + days * 86400000).toLocaleDateString()
  return {
    success: true,
    message: `Demo mode: ${sub.distributor} submission queued. Platforms: ${sub.targetPlatforms.join(', ')}. Add /api/distribution/submit to your backend to go live.`,
    estimatedLiveDate: liveDate,
  }
}

// ── Platform revenue summary ──────────────────────────────────────────────────

export function calcTotalRevenue(videos: MusicVideo[]): {
  total: number
  byPlatform: Record<string, number>
  topPlatform: string
  ammAdvantage: number   // how much MORE AMM pays vs Spotify alone
} {
  const byPlatform: Record<string, number> = {}
  let total = 0
  videos.forEach(v => {
    v.platforms.forEach(p => {
      byPlatform[p.platform] = (byPlatform[p.platform] ?? 0) + p.revenue
      total += p.revenue
    })
  })
  const topPlatform = Object.entries(byPlatform).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'amm'
  const ammRev = byPlatform['amm'] ?? 0
  const spotifyRev = byPlatform['spotify'] ?? 0
  return { total, byPlatform, topPlatform, ammAdvantage: ammRev - spotifyRev }
}

// ── Holographic Video Player config ──────────────────────────────────────────

export interface HoloPlayerConfig {
  videoId: string
  mode: 'standard' | 'holographic' | 'ar_overlay' | 'vertical_reel'
  glowColor: string
  scanlines: boolean
  chromaKey?: string  // for AR green-screen mode
  subtitles: boolean
}

export function getHoloConfig(video: MusicVideo): HoloPlayerConfig {
  return {
    videoId: video.id,
    mode: video.holographicMode ? 'holographic' : video.isVertical ? 'vertical_reel' : 'standard',
    glowColor: genreGlowColor(video.genre),
    scanlines: video.holographicMode,
    subtitles: true,
  }
}

function genreGlowColor(genre: string): string {
  const map: Record<string, string> = {
    'Gospel': '#8800ff', 'Worship': '#ffd700', 'Hip-Hop/Gospel': '#ff4400',
    'R&B/Soul': '#ff8800', 'Electronic': '#00ccff', 'Jazz/Neo-Soul': '#ffaa00',
  }
  return map[genre] ?? '#00ffcc'
}

// ── DistroKid vs TuneCore vs AMM Direct ──────────────────────────────────────

export const DISTRIBUTION_COMPARISON = [
  {
    service: 'DistroKid',
    annualFee: '$22.99/yr unlimited',
    royaltyRate: '100% (they keep $0)',
    processingTime: '1-3 days',
    platforms: 35,
    ammIntegration: 'API available',
    best: 'Volume — many releases',
  },
  {
    service: 'TuneCore',
    annualFee: '$9.99/single, $29.99/album',
    royaltyRate: '100% (they keep $0)',
    processingTime: '3-5 days',
    platforms: 150,
    ammIntegration: 'API available',
    best: 'Maximum platform reach',
  },
  {
    service: 'AMM Direct',
    annualFee: 'Free (included in Creator plan)',
    royaltyRate: '90% (AMM keeps 10%)',
    processingTime: 'Instant on AMM',
    platforms: 1, // AMM only
    ammIntegration: 'Native',
    best: 'Faith community audience + fastest royalties',
  },
]
