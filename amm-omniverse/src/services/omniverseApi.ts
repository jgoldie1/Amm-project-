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

export async function getStoreCatalog(): Promise<AppStoreAsset[]> {
  if (!API_URL) return []
  const body = await request<{ assets: AppStoreAsset[] }>('/api/omniverse/store/catalog')
  return body.assets || []
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
