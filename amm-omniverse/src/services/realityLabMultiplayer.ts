import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from './supabaseClient'

export type PuzzleState = { energy: number; moves: number; solved: boolean }
export type PuzzleSession = { instanceId: string; joinCode?: string; revision: number; state: PuzzleState }

function clientOrThrow() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

function normalizeState(value: unknown): PuzzleState {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  return {
    energy: typeof raw.energy === 'number' ? raw.energy : Number(raw.energy ?? 0),
    moves: typeof raw.moves === 'number' ? raw.moves : Number(raw.moves ?? 0),
    solved: raw.solved === true || raw.solved === 'true',
  }
}

export async function createPuzzleInstance(): Promise<PuzzleSession> {
  const client = clientOrThrow()
  const { data, error } = await client.rpc('reality_lab_create_instance', { p_room_id: 'puzzle' })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row?.instance_id) throw new Error('Multiplayer instance was not created')
  return { instanceId: row.instance_id, joinCode: row.join_code, revision: Number(row.revision ?? 1), state: normalizeState(row.state) }
}

export async function joinPuzzleInstance(joinCode: string): Promise<PuzzleSession> {
  const client = clientOrThrow()
  const { data, error } = await client.rpc('reality_lab_join_instance', { p_join_code: joinCode })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row?.instance_id) throw new Error('Multiplayer instance was not joined')
  return { instanceId: row.instance_id, revision: Number(row.revision ?? 1), state: normalizeState(row.state) }
}

export async function submitPuzzleCharge(instanceId: string, revision: number, value = 5): Promise<PuzzleSession> {
  const client = clientOrThrow()
  const { data, error } = await client.rpc('reality_lab_submit_puzzle_action', {
    p_instance_id: instanceId,
    p_expected_revision: revision,
    p_action: 'charge',
    p_value: value,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return { instanceId, revision: Number(row?.revision ?? revision), state: normalizeState(row?.state) }
}

export function subscribePuzzleState(instanceId: string, onChange: (session: PuzzleSession) => void): RealtimeChannel {
  const client = clientOrThrow()
  return client
    .channel(`reality-lab-puzzle:${instanceId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'reality_lab_puzzle_state',
      filter: `instance_id=eq.${instanceId}`,
    }, payload => {
      const row = payload.new as { revision?: number; state?: unknown }
      onChange({ instanceId, revision: Number(row.revision ?? 1), state: normalizeState(row.state) })
    })
    .subscribe()
}

export async function removePuzzleSubscription(channel: RealtimeChannel) {
  const client = getSupabaseClient()
  if (client) await client.removeChannel(channel)
}
