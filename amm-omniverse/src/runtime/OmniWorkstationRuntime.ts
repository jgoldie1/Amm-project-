export type OmniRenderTarget = 'this-device' | 'cloud' | 'workstation'

export type OmniAsset = {
  id: string
  name: string
  kind: 'image' | 'video' | 'audio' | 'scene' | 'document' | 'other'
  createdAt: string
  source?: string
  projectId?: string
}

export type OmniProject = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  renderTarget: OmniRenderTarget
  assets: OmniAsset[]
  workflow?: string
}

export type OmniWorkstationState = {
  activeProjectId: string | null
  projects: OmniProject[]
  deviceId: string
  deviceLabel: string
  lastHandoffAt?: string
}

const STORAGE_KEY = 'tryamm_omni_workstation_v1'

const now = () => new Date().toISOString()
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`

const detectDeviceLabel = () => {
  if (typeof navigator === 'undefined') return 'Unknown device'
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Android/i.test(ua)) return 'Android'
  if (/CrOS/i.test(ua)) return 'Chromebook'
  if (/Windows/i.test(ua)) return 'Windows workstation'
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac workstation'
  return 'Web device'
}

const initialState = (): OmniWorkstationState => ({
  activeProjectId: null,
  projects: [],
  deviceId: uid('device'),
  deviceLabel: detectDeviceLabel(),
})

const readState = (): OmniWorkstationState => {
  if (typeof window === 'undefined') return initialState()
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as OmniWorkstationState | null
    if (parsed?.deviceId && Array.isArray(parsed.projects)) return { ...parsed, deviceLabel: detectDeviceLabel() }
  } catch {}
  const fresh = initialState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  return fresh
}

const writeState = (state: OmniWorkstationState) => {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('tryamm:workstation:state', { detail: state }))
  return state
}

const mutate = (fn: (state: OmniWorkstationState) => OmniWorkstationState) => writeState(fn(readState()))

export const omniWorkflowRecipes = [
  { id: 'reel-from-idea', name: 'Idea → OmniReel', steps: ['Brief', 'Storyboard', 'Generate/Edit', 'Voice + Captions', 'Render 9:16', 'Omni Box', 'Publish'] },
  { id: 'streetverse-scene', name: 'StreetVerse Scene', steps: ['Scene brief', 'Assets', 'World preview', 'Performance check', 'Render/Publish'] },
  { id: 'brand-campaign', name: 'Brand Campaign', steps: ['Brand kit', 'Asset variants', 'Short video', 'Social formats', 'Marketplace publish'] },
  { id: 'live-to-reel', name: 'LIVE → Reel', steps: ['Capture', 'Highlight detection', 'Quick cut', 'Captions', 'Cover', 'Publish'] },
] as const

export const omniWorkstation = {
  getState: readState,
  createProject(name = 'Untitled project', workflow?: string) {
    const project: OmniProject = { id: uid('project'), name, createdAt: now(), updatedAt: now(), renderTarget: 'this-device', assets: [], workflow }
    return mutate(state => ({ ...state, activeProjectId: project.id, projects: [project, ...state.projects] }))
  },
  setActiveProject(projectId: string) {
    return mutate(state => ({ ...state, activeProjectId: state.projects.some(p => p.id === projectId) ? projectId : state.activeProjectId }))
  },
  setRenderTarget(target: OmniRenderTarget, projectId?: string) {
    return mutate(state => ({
      ...state,
      projects: state.projects.map(p => p.id === (projectId || state.activeProjectId) ? { ...p, renderTarget: target, updatedAt: now() } : p),
    }))
  },
  addAsset(asset: Omit<OmniAsset, 'id' | 'createdAt'>, projectId?: string) {
    const id = projectId || readState().activeProjectId
    if (!id) return readState()
    const next: OmniAsset = { ...asset, id: uid('asset'), createdAt: now(), projectId: id }
    return mutate(state => ({ ...state, projects: state.projects.map(p => p.id === id ? { ...p, assets: [next, ...p.assets], updatedAt: now() } : p) }))
  },
  handoff(projectId?: string) {
    const id = projectId || readState().activeProjectId
    return mutate(state => ({ ...state, activeProjectId: id || state.activeProjectId, lastHandoffAt: now() }))
  },
  launch(destination: 'omnireel' | 'streetverse' | 'live' | 'audio' | 'holo' | 'home') {
    if (typeof window === 'undefined') return
    localStorage.setItem('tryamm_workstation_launch', JSON.stringify({ destination, at: now(), projectId: readState().activeProjectId }))
    const routes: Record<string, string> = { streetverse: '/streetverse', home: '/', omnireel: '/', live: '/', audio: '/', holo: '/' }
    window.location.href = routes[destination] || '/'
  },
}

export function installOmniWorkstationRuntime() {
  if (typeof window === 'undefined') return
  ;(window as any).__omniWorkstation = omniWorkstation
  window.dispatchEvent(new CustomEvent('tryamm:workstation:ready', { detail: omniWorkstation.getState() }))
}
