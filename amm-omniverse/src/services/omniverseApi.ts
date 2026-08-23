import { getAccessToken } from './supabaseClient'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

export function isBackendConfigured(): boolean {
  return Boolean(API_URL)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('VITE_API_URL is not configured')
  const token = await getAccessToken()
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`)
  return body as T
}

export interface AppStoreAsset {
  id: string
  asset_key: string
  name: string
  asset_type: string
  description: string
  price_cents: number
  age_rating: string
  status: string
  metadata: Record<string, unknown>
}

export interface DurablePlayerState {
  id: string
  user_id: string
  cash?: number
  tokens?: number
  xp?: number
  level?: number
  missions?: unknown[]
  avatar?: string
  avatar_id?: string | null
  current_world_id: string
  current_verse: string
  reputation: number
  inventory: unknown[]
  unlocked_worlds: unknown[]
  checkpoint: Record<string, unknown>
  accessibility_profile: Record<string, unknown>
  revision: number
  updated_at?: string
}

export interface StreetVerseMissionRun {
  id: string
  user_id: string
  character_id: string
  mission_id: string
  beat_id: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  choice: Record<string, unknown>
  runtime_state: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface GetPaidToPlayClaim {
  id: string
  programId: string
  programType: string
  userId: string
  evidenceType: string
  evidenceRef: string
  xp: number
  holoCredits: number
  cashCents: number
  cashStatus: string
  status: string
  serverDetermined: boolean
  createdAt: string
}

export function getStoreCatalog(): Promise<AppStoreAsset[]> {
  if (!API_URL) return Promise.resolve([])
  return request<{ assets: AppStoreAsset[] }>('/api/omniverse/store/catalog').then(body => body.assets || [])
}

export async function acquireStoreAsset(assetKey: string) {
  return request<{ entitlement: any; asset: AppStoreAsset }>(`/api/omniverse/store/acquire/${encodeURIComponent(assetKey)}`, { method: 'POST', body: '{}' })
}

export async function askStubbsAI(question: string, context: Record<string, unknown> = {}) {
  if (!API_URL) throw new Error('VITE_API_URL is not configured')
  return request<{ answer: string; provider: string; model?: string }>('/api/ai/answer', {
    method: 'POST',
    body: JSON.stringify({ question, mode: 'hybrid', context }),
  })
}

export async function getDurableStatus() {
  return request<{ ok: boolean; configured: boolean; identityReady: boolean; supabaseUserId: string }>('/api/durable/status')
}

export async function getPlayerState() {
  const body = await request<{ state: DurablePlayerState }>('/api/player/state')
  return body.state
}

export async function patchPlayerState(patch: Partial<Pick<DurablePlayerState, 'avatar' | 'avatar_id' | 'current_world_id' | 'current_verse' | 'checkpoint' | 'accessibility_profile'>>) {
  const body = await request<{ state: DurablePlayerState }>('/api/player/state', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return body.state
}

export async function listStreetVerseMissions() {
  const body = await request<{ missions: StreetVerseMissionRun[] }>('/api/streetverse/missions')
  return body.missions || []
}

export async function createStreetVerseMission(input: {
  mission_id: string
  character_id?: string
  beat_id?: string
  choice?: Record<string, unknown>
  runtime_state?: Record<string, unknown>
}) {
  const body = await request<{ mission: StreetVerseMissionRun }>('/api/streetverse/missions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return body.mission
}

export async function updateStreetVerseMission(id: string, patch: {
  beat_id?: string
  status?: StreetVerseMissionRun['status']
  choice?: Record<string, unknown>
  runtime_state?: Record<string, unknown>
}) {
  const body = await request<{ mission: StreetVerseMissionRun }>(`/api/streetverse/missions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return body.mission
}

export async function claimGetPaidToPlay(input: {
  programId: string
  game?: string
  evidence: Record<string, unknown>
}) {
  return request<{ ok: boolean; applied: boolean; claim: GetPaidToPlayClaim; playerState?: DurablePlayerState; notice?: string; reason?: string }>('/api/get-paid-to-play/claim', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getGetPaidToPlayStatus() {
  return request<{ ok: boolean; mode: string; realPayoutsEnabled: boolean; dailyCashCapCents: number; browserControlsRewardAmount: boolean; chanceGamesCashEligible: boolean; payoutStatus: string }>('/api/get-paid-to-play/status')
}

export async function getGetPaidToPlayPrograms() {
  return request<{ programs: Array<Record<string, unknown>> }>('/api/get-paid-to-play/programs')
}

export async function getGetPaidToPlayHistory() {
  return request<{ claims: GetPaidToPlayClaim[] }>('/api/get-paid-to-play/history')
}

export async function createMediaCatalogItem(input: {
  title: string
  media_type: 'video' | 'image' | 'gif' | 'audio' | 'reel' | 'movie' | 'episode' | 'live-replay'
  caption?: string
  destinations?: string[]
  source?: string
  visibility?: 'private' | 'unlisted' | 'public'
  client_draft_id?: string
}) {
  return request<{ media: Record<string, unknown>; uploadRequired: boolean }>('/api/media/catalog', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
