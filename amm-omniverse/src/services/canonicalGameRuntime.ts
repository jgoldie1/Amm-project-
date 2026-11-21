import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

export interface CanonicalPlayerState {
  user_id: string
  avatar_id?: string | null
  xp: number
  level: number
  reputation: number
  inventory: unknown[]
  assets: unknown[]
  unlocked_worlds: string[]
  missions: Record<string, unknown>
  secrets: Record<string, unknown>
  checkpoint: Record<string, unknown>
  accessibility_profile: Record<string, unknown>
  revision: number
}

export interface WorldCheckpoint {
  worldId: string
  instanceId?: string
  state: Record<string, unknown>
  revision: number
}

function requireClient() {
  const sb = getSupabaseClient()
  if (!sb) throw new Error('Supabase is not configured')
  return sb
}

export async function loadCanonicalPlayer(): Promise<CanonicalPlayerState | null> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')
  const { data, error } = await sb.from('player_state').select('user_id,avatar_id,xp,level,reputation,inventory,assets,unlocked_worlds,missions,secrets,checkpoint,accessibility_profile,revision').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return (data as CanonicalPlayerState | null) ?? null
}

export async function saveCanonicalCheckpoint(next: WorldCheckpoint): Promise<CanonicalPlayerState> {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')
  const current = await loadCanonicalPlayer()
  if (!current) throw new Error('Canonical player state missing')
  if (next.revision !== current.revision) throw new Error('stale_player_revision')
  const checkpoint = { ...next.state, worldId: next.worldId, instanceId: next.instanceId ?? null, savedAt: new Date().toISOString() }
  const { data, error } = await sb.from('player_state').update({ checkpoint, revision: current.revision + 1 }).eq('user_id', userId).eq('revision', current.revision).select('user_id,avatar_id,xp,level,reputation,inventory,assets,unlocked_worlds,missions,secrets,checkpoint,accessibility_profile,revision').single()
  if (error) throw error
  return data as CanonicalPlayerState
}

export async function loadLatestWorldSave(worldId: string) {
  const sb = requireClient()
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')
  const { data, error } = await sb.from('world_saves').select('*').eq('user_id', userId).eq('world_id', worldId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  return data ?? null
}

// Realtime instance state is intentionally distinct from durable player progression.
// The authoritative server owns world_player_state writes for competitive/shared worlds.
export const GAME_STATE_SOURCES = Object.freeze({
  progression: 'player_state',
  realtimeInstance: 'world_player_state',
  durableWorldCheckpoint: 'world_saves',
})
