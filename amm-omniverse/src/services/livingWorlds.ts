import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

export type WorldStatus = 'development' | 'alpha' | 'beta' | 'live' | 'maintenance'

export interface WorldRecord {
  id: string
  slug: string
  name: string
  kind: string
  description: string
  status: WorldStatus
  max_players: number
  metadata: Record<string, unknown>
}

export interface WorldProfile {
  user_id: string
  avatar_name: string
  home_world_slug: string
  level: number
  xp: number
  reputation: number
  skills: Record<string, unknown>
  accessibility: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface WorldSession {
  id: string
  user_id: string
  world_id: string
  shard: string
  state: Record<string, unknown>
  entered_at: string
  ended_at: string | null
}

export interface CreatorProject {
  id: string
  owner_id: string
  title: string
  project_type: string
  status: string
  current_stage: string
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface WorkforceRun {
  id: string
  simulation_key: string
  status: string
  score: number | null
  state: Record<string, unknown>
  feedback: Record<string, unknown>
  started_at: string
  completed_at: string | null
}

function requireClient() {
  const sb = getSupabaseClient()
  if (!sb) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  return sb
}

export async function listWorlds(): Promise<WorldRecord[]> {
  const sb = requireClient()
  const { data, error } = await sb.from('worlds').select('*').order('name')
  if (error) throw error
  return (data ?? []) as WorldRecord[]
}

export async function getOrCreateWorldProfile(defaults?: Partial<WorldProfile>): Promise<WorldProfile> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')

  const existing = await sb.from('world_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (existing.error) throw existing.error
  if (existing.data) return existing.data as WorldProfile

  const row = {
    user_id: userId,
    avatar_name: defaults?.avatar_name || 'Traveler',
    home_world_slug: defaults?.home_world_slug || 'my-world',
    level: defaults?.level || 1,
    xp: defaults?.xp || 0,
    reputation: defaults?.reputation || 0,
    skills: defaults?.skills || {},
    accessibility: defaults?.accessibility || {},
  }
  const { data, error } = await sb.from('world_profiles').insert(row).select('*').single()
  if (error) throw error
  return data as WorldProfile
}

export async function updateWorldProfile(changes: Partial<Omit<WorldProfile, 'user_id'>>): Promise<WorldProfile> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')
  const { data, error } = await sb
    .from('world_profiles')
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('*')
    .single()
  if (error) throw error
  return data as WorldProfile
}

export async function getActiveWorldSession(): Promise<WorldSession | null> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return null
  const { data, error } = await sb
    .from('world_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('entered_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as WorldSession | null) ?? null
}

export async function enterWorld(world: WorldRecord, state: Record<string, unknown> = {}): Promise<WorldSession> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')

  await sb.from('world_sessions').update({ ended_at: new Date().toISOString() }).eq('user_id', userId).is('ended_at', null)
  const { data, error } = await sb.from('world_sessions').insert({
    user_id: userId,
    world_id: world.id,
    shard: 'global-1',
    state,
  }).select('*').single()
  if (error) throw error
  await emitPlatformEvent('WORLD_ENTERED', { worldSlug: world.slug, state }, world.id)
  return data as WorldSession
}

export async function saveWorldSessionState(sessionId: string, state: Record<string, unknown>): Promise<void> {
  const sb = requireClient()
  const { error } = await sb.from('world_sessions').update({ state }).eq('id', sessionId)
  if (error) throw error
}

export async function closeWorldSession(sessionId: string): Promise<void> {
  const sb = requireClient()
  const { error } = await sb.from('world_sessions').update({ ended_at: new Date().toISOString() }).eq('id', sessionId)
  if (error) throw error
}

export async function emitPlatformEvent(eventType: string, payload: Record<string, unknown> = {}, worldId?: string): Promise<void> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return
  const { error } = await sb.from('platform_events').insert({
    user_id: userId,
    world_id: worldId || null,
    event_type: eventType,
    source: 'amm-omniverse-web',
    payload,
  })
  if (error) throw error
}

export async function listProjects(): Promise<CreatorProject[]> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return []
  const { data, error } = await sb.from('creator_projects').select('*').eq('owner_id', userId).order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CreatorProject[]
}

export async function createProject(title: string, projectType: string): Promise<CreatorProject> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')
  const { data, error } = await sb.from('creator_projects').insert({
    owner_id: userId,
    title,
    project_type: projectType,
    status: 'idea',
    current_stage: 'idea',
    data: {},
  }).select('*').single()
  if (error) throw error
  await emitPlatformEvent('PROJECT_CREATED', { projectId: data.id, projectType })
  return data as CreatorProject
}

export async function listWorkforceRuns(): Promise<WorkforceRun[]> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return []
  const { data, error } = await sb.from('workforce_runs').select('*').eq('user_id', userId).order('started_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as WorkforceRun[]
}

export async function startWorkforceRun(simulationKey: string): Promise<WorkforceRun> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')
  const { data, error } = await sb.from('workforce_runs').insert({
    user_id: userId,
    simulation_key: simulationKey,
    status: 'started',
    state: {},
    feedback: {},
  }).select('*').single()
  if (error) throw error
  await emitPlatformEvent('WORKFORCE_SIMULATION_STARTED', { runId: data.id, simulationKey })
  return data as WorkforceRun
}

export async function listEntitlements() {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return []
  const { data, error } = await sb.from('entitlements').select('*').eq('user_id', userId).order('starts_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listPublications() {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) return []
  const { data, error } = await sb.from('publications').select('*').eq('owner_id', userId).order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
