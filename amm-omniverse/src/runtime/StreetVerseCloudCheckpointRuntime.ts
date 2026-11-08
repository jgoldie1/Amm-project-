import { getSupabaseClient } from '../services/supabaseClient'

const KEY = 'tryamm_streetverse_checkpoint_v1'
const TABLE = 'quantum_memory_snapshots'
let installed = false

function emit(state: string, extra: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-cloud-status', { detail: { state, ...extra } }))
}
function safeCheckpoint(raw: string) {
  const v = JSON.parse(raw)
  if (!Number.isFinite(v?.savedAt) || v.savedAt <= 0 || v.savedAt > Date.now() + 300000) throw Error('Invalid checkpoint timestamp')
  const position = v.position && [v.position.x, v.position.y, v.position.z].every((n: unknown) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 100000)
    ? { x: v.position.x, y: v.position.y, z: v.position.z } : null
  return { format: 'streetverse-safe-checkpoint-v1', savedAt: v.savedAt, screen: String(v.screen || 'streetverse').slice(0, 64),
    position, character: String(v.player?.name || 'BJ Stubbs').slice(0, 80),
    missionStatuses: (Array.isArray(v.missions) ? v.missions.slice(0, 100) : []).filter((m: any) => typeof m?.id === 'string' && typeof m?.status === 'string')
      .map((m: any) => ({ id: m.id.slice(0, 80), status: m.status.slice(0, 30) })) }
}
async function digest(raw: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('')
}

/** Saves navigation state only. Server-authoritative XP, currency, inventory and rewards are never synchronized here. */
export function installStreetVerseCloudCheckpointRuntime() {
  if (installed || typeof window === 'undefined') return
  installed = true
  const client = getSupabaseClient()
  if (!client) { emit('unconfigured'); return }
  let pending = false, writing = false, lastUpload = 0, revision = 0, retryFailures = 0
  let timer: number | undefined
  const backup = async () => {
    if (writing || !pending || navigator.onLine === false) return
    writing = true
    let auth
    try { ({ data: auth } = await client.auth.getUser()) }
    catch { writing = false; emit('sign-in-required'); return }
    if (!auth?.user) { writing = false; emit('sign-in-required'); return }
    let safe: ReturnType<typeof safeCheckpoint>
    try { safe = safeCheckpoint(localStorage.getItem(KEY) || 'null') } catch { writing = false; emit('no-valid-local-save'); return }
    const raw = JSON.stringify(safe)
    if (new TextEncoder().encode(raw).byteLength > 160000) { writing = false; emit('too-large'); return }
    const startedRevision = revision
    try {
      const checksum = await digest(raw)
      const { data, error } = await client.from(TABLE).insert({
        device_id: 'streetverse-browser', checksum,
        payload: { payload: { format: 'quantum-memory-backup', raw } },
      }).select('id,created_at').single()
      if (error || !data?.id) throw Error('Save not acknowledged')
      pending = revision !== startedRevision
      lastUpload = Date.now()
      retryFailures = 0
      emit('saved', { snapshotId: data.id, at: data.created_at })
    } catch { pending = true; retryFailures++; emit('failed', { retryable: true, retryFailures }) }
    finally { writing = false; if (pending) schedule() }
  }
  const schedule = () => {
    pending = true
    if (timer !== undefined) return
    timer = window.setTimeout(() => { timer = undefined; void backup() }, Math.max(1000, 300000 - (Date.now() - lastUpload), Math.min(600000, 5000 * 2 ** Math.min(retryFailures, 7))))
  }
  window.addEventListener('tryamm:streetverse-checkpoint-saved', () => { revision++; schedule() })
  window.addEventListener('online', () => { if (pending) void backup() })
  window.addEventListener('tryamm:streetverse-cloud-backup-request', () => { revision++; pending = true; void backup() })
  // Reschedule old browser checkpoints after a new session; do not depend on a fresh mission event.
  client.auth.onAuthStateChange((_event, session) => {
    if (session?.user && pending) window.setTimeout(() => { if (pending) void backup() }, 0)
  })
  window.addEventListener('tryamm:streetverse-cloud-list-request', () => {
    void (async () => {
      const { data: auth } = await client.auth.getUser()
      if (!auth.user) { emit('sign-in-required'); return }
      const { data, error } = await client.from(TABLE).select('id,created_at,device_id')
        .eq('device_id', 'streetverse-browser').order('created_at', { ascending: false }).limit(20)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-cloud-list-result',
        { detail: { snapshots: error ? [] : data || [], error: Boolean(error) } }))
    })()
  })
  window.addEventListener('tryamm:streetverse-cloud-restore-request', (event: Event) => {
    void (async () => {
      const d = (event as CustomEvent<{ snapshotId?: string; confirmed?: boolean }>).detail
      if (!d?.confirmed || !/^[0-9a-f-]{36}$/i.test(d.snapshotId || '')) return
      const { data: auth } = await client.auth.getUser()
      if (!auth.user) { emit('sign-in-required'); return }
      const { data: row, error } = await client.from(TABLE).select('id,checksum,payload')
        .eq('id', d.snapshotId).eq('device_id', 'streetverse-browser').single()
      if (error || !row) { emit('restore-failed'); return }
      const raw = row.payload?.payload?.raw
      if (typeof raw !== 'string' || await digest(raw) !== row.checksum) { emit('checksum-mismatch'); return }
      const safe = JSON.parse(raw)
      if (safe?.format !== 'streetverse-safe-checkpoint-v1') { emit('restore-failed'); return }
      // Apply position only; never overwrite local saves or award missions, XP, inventory, or currency.
      if (safe.position && [safe.position.x, safe.position.y, safe.position.z].every(Number.isFinite))
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-position-restore',
          { detail: { position: safe.position, savedAt: safe.savedAt, source: 'quantum-cloud' } }))
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-cloud-restored',
        { detail: { snapshotId: row.id, checkpoint: safe, protectedEconomy: true } }))
    })().catch(() => emit('restore-failed'))
  })
  try { if (safeCheckpoint(localStorage.getItem(KEY) || 'null')) schedule() } catch { /* No valid prior checkpoint. */ }
  emit('ready', { scope: 'navigation-only' })
}
