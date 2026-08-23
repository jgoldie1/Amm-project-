import { getAccessToken } from './supabaseClient'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('VITE_API_URL is not configured')
  const token = await getAccessToken()
  if (!token) throw new Error('Sign in required')
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`)
  return body as T
}

export async function getFamilyPlugins() {
  return request<{ plugins: any[] }>('/api/family/plugins')
}

export async function getJacobieCyber() {
  return request<{ projects: any[] }>('/api/family/jacobie/cyber')
}

export async function createJacobieCyber(title: string, projectType = 'training-lab') {
  return request<{ project: any }>('/api/family/jacobie/cyber', {
    method: 'POST', body: JSON.stringify({ title, projectType })
  })
}

export async function getJacobieRealEstate() {
  return request<{ projects: any[] }>('/api/family/jacobie/real-estate')
}

export async function createJacobieRealEstate(title: string, projectType = 'flip') {
  return request<{ project: any }>('/api/family/jacobie/real-estate', {
    method: 'POST', body: JSON.stringify({ title, projectType })
  })
}

export async function getStarverseLink() {
  return request<{ link: any; app: string; brand: string }>('/api/family/isaiah/starverse')
}

export async function getAniyahAudio() {
  return request<{ projects: any[] }>('/api/family/aniyah/audio')
}

export async function createAniyahAudio(title: string) {
  return request<{ project: any }>('/api/family/aniyah/audio', {
    method: 'POST', body: JSON.stringify({ title })
  })
}

export async function getAniyahCrossborder() {
  return request<{ quotes: any[]; transfers: any[]; liveTransfersEnabled: boolean; reason: string }>('/api/family/aniyah/crossborder')
}
