import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

export interface Vec3 { x: number; y: number; z: number }
export interface AuthoritativeMovementInput {
  instanceId: string
  displayName: string
  position: Vec3
  rotation?: Vec3
  velocity?: Vec3
  animation?: string
}

function finiteVec3(value: Vec3) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z)
}

export async function submitAuthoritativeMovement(input: AuthoritativeMovementInput) {
  const sb = getSupabaseClient()
  if (!sb) throw new Error('Supabase is not configured')
  const userId = await getAuthenticatedUserId()
  if (!userId) throw new Error('Authentication required')
  if (!finiteVec3(input.position)) throw new Error('Invalid position')
  if (input.rotation && !finiteVec3(input.rotation)) throw new Error('Invalid rotation')
  if (input.velocity && !finiteVec3(input.velocity)) throw new Error('Invalid velocity')

  const { data, error } = await sb.rpc('game_move_player', {
    p_instance_id: input.instanceId,
    p_display_name: input.displayName.slice(0, 80),
    p_position: input.position,
    p_rotation: input.rotation ?? { x: 0, y: 0, z: 0 },
    p_velocity: input.velocity ?? { x: 0, y: 0, z: 0 },
    p_animation: (input.animation ?? 'idle').slice(0, 40),
  })
  if (error) throw error
  return data
}

export async function subscribeToWorldState(instanceId: string, onState: (rows: unknown[]) => void) {
  const sb = getSupabaseClient()
  if (!sb) throw new Error('Supabase is not configured')
  const load = async () => {
    const { data, error } = await sb.from('world_player_state').select('*').eq('instance_id', instanceId)
    if (error) throw error
    onState(data ?? [])
  }
  await load()
  const channel = sb.channel(`world:${instanceId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'world_player_state', filter: `instance_id=eq.${instanceId}` }, load).subscribe()
  return () => { void sb.removeChannel(channel) }
}
