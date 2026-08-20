import { getAccessToken } from './supabaseClient'

const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

export type LegacySceneStatus = 'draft' | 'rights-review' | 'original-ready' | 'licensed-ready'
export type LegacySceneRecord = {
  id: string
  characterId: string
  status: LegacySceneStatus
  summary: string
  rightsProofId?: string
  memoryTags: string[]
  updatedAt: string
}

async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API) throw new Error('VITE_API_URL is not configured')
  const token = await getAccessToken()
  if (!token) throw new Error('Authentication required')
  const headers = new Headers(init.headers || {})
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  const response = await fetch(`${API}${path}`, { ...init, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error || `Legacy API request failed (${response.status})`)
  return data as T
}

export const STREETVERSE_LEGACY_API = {
  scene: '/api/streetverse/legacy/scene',
  memory: '/api/streetverse/legacy/memory',
  rights: '/api/streetverse/legacy/rights',
  eve: '/api/streetverse/legacy/eve-directive',
  assets: '/api/streetverse/legacy/assets',
  smoke: '/api/streetverse/legacy/smoke',
} as const

export function saveLegacyScene(input: Omit<LegacySceneRecord, 'updatedAt'>) {
  return authed<{ scene: LegacySceneRecord }>(STREETVERSE_LEGACY_API.scene, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function saveLegacyMemory(input: { characterId: string; summary: string; tags: string[] }) {
  return authed<{ ok: true; memoryId: string }>(STREETVERSE_LEGACY_API.memory, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getLegacyRightsStatus(sceneId: string) {
  return authed<{ sceneId: string; status: LegacySceneStatus; rightsProofId?: string }>(`${STREETVERSE_LEGACY_API.rights}?sceneId=${encodeURIComponent(sceneId)}`)
}

export function requestEveLegacyDirective(input: Record<string, unknown>) {
  return authed<{ directive: Record<string, unknown> }>(STREETVERSE_LEGACY_API.eve, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function runLegacyBackendSmoke() {
  return authed<{ ok: boolean; checks: Record<string, boolean> }>(STREETVERSE_LEGACY_API.smoke)
}
