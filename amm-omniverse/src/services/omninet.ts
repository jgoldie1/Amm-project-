import { getAccessToken } from './supabaseClient'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

export type OmniNetMode = 'omninet' | 'web' | 'hybrid' | 'news' | 'videos' | 'images'
export type OmniNetResult = {
  id: string
  title: string
  url?: string | null
  description?: string
  source: 'omninet' | 'public-web' | string
  provider?: string
  sourceType?: string
  thumbnail?: string | null
  publishedAt?: string | null
}

async function authHeaders() {
  const token = await getAccessToken()
  if (!token) throw new Error('Sign in is required for Holo Search')
  return { Authorization: `Bearer ${token}` }
}

export async function getOmniNetStatus() {
  if (!API_URL) throw new Error('VITE_API_URL is not configured')
  const response = await fetch(`${API_URL}/api/omninet/status`, { headers: await authHeaders() })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error || 'Failed to load OmniNet status')
  return body as { ownIndex:boolean; publicWebProvider:boolean; publicWebProviderName?:string|null; modes:string[] }
}

export async function searchOmniNet(query:string, mode:OmniNetMode='hybrid', count=10) {
  if (!API_URL) throw new Error('VITE_API_URL is not configured')
  const params = new URLSearchParams({ q:query, mode, count:String(count) })
  const response = await fetch(`${API_URL}/api/omninet/search?${params}`, { headers: await authHeaders() })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error || 'Search failed')
  return body as { query:string; mode:OmniNetMode; results:OmniNetResult[]; ownIndexCount:number; publicWebCount:number; publicWebConfigured:boolean; sourceChoice:boolean }
}

export async function askStubbsAI(question:string, retrieval:'none'|'omninet'|'web'|'hybrid'='hybrid') {
  if (!API_URL) throw new Error('VITE_API_URL is not configured')
  const headers = new Headers(await authHeaders())
  headers.set('Content-Type','application/json')
  const response = await fetch(`${API_URL}/api/ai/answer`, { method:'POST', headers, body:JSON.stringify({ question, retrieval, mode:'holo-search' }) })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error || 'Stubbs AI request failed')
  return body as { answer:string; provider:string; sources:OmniNetResult[]; sourceChoice?:boolean }
}
