import { getAccessToken } from './supabaseClient'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

export function isBackendConfigured(): boolean {
  return true
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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
  try {
    const body = await request<{ assets: AppStoreAsset[] }>('/api/omniverse/store/catalog')
    return body.assets || []
  } catch {
    return []
  }
}

export async function acquireStoreAsset(assetKey: string) {
  return request<{ entitlement: any; asset: AppStoreAsset }>(`/api/omniverse/store/acquire/${encodeURIComponent(assetKey)}`, { method: 'POST', body: '{}' })
}

export async function getHoloGPTStatus() {
  return request<{ok:boolean;service:string;providers:Record<string,{configured:boolean;model:string}>;providerOrder:string[];note:string}>('/api/ai/status')
}

export async function askStubbsAI(question: string, context: Record<string, unknown> = {}, provider: 'auto'|'openai'|'anthropic'|'deepseek' = 'auto') {
  return request<{ ok: boolean; answer: string; provider: string; model?: string }>('/api/ai/answer', {
    method: 'POST',
    body: JSON.stringify({ question, mode: 'hybrid', context, provider }),
  })
}
