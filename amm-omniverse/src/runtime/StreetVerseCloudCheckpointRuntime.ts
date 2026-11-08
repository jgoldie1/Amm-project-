import { getSupabaseClient } from '../services/supabaseClient'

const KEY = 'tryamm_streetverse_checkpoint_v1'
const TABLE = 'quantum_memory_snapshots'
const DEVICE = 'streetverse-browser'
let installed = false

function emit(state: string, extra: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-cloud-status', { detail: { state, ...extra } }))
}

function safeCheckpoint(raw: string) {
  const v = JSON.parse(raw)
  if (!Number.isFinite(v?.savedAt) || v.savedAt <= 0 || v.savedAt > Date.now() + 300000) throw Error('Invalid checkpoint timestamp')
  const position = v.position && [v.position.x, v.position.y, v.position.z].every(
    (n: unknown) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 100000,
  ) ? { x: v.position.x, y: v.position.y, z: v.position.z } : null
  return {
    format: 'streetverse-safe-checkpoint-v1', savedAt: v.savedAt,
    screen: String(v.screen || 'streetverse').slice(0, 64),
    position, character: String(v.player?.name || 'BJ Stubbs').slice(0, 80),
    missionStatuses: (Array.isArray(v.missions) ? v.missions.slice(0, 100) : [])
      .filter((m: any) => typeof m?.id === 'string' && typeof m?.status === 'string')
      .map((m: any) => ({ id: m.id.slice(0, 80), status: m.status.slice(0, 30) })),
  }
}

async function digest(raw: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('')
}

/**
 * Only navigation/mission-display metadata crosses this boundary.
 * Browser localStorage has no owner, so cloud uploads require a new explicit
 * opt-in for every page session and authenticated identity.
 */
export function installStreetVerseCloudCheckpointRuntime() {
  if (installed || typeof window === 'undefined') return
  installed = true
  const client = getSupabaseClient()
  if (!client) { emit('unconfigured'); return }

  let consentOwner: string | null = null
  let pending = false, writing = false, lastUpload = 0, revision = 0, retryFailures = 0
  let timer: number | undefined

  const disarm = () => {
    consentOwner = null
    pending = false
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    emit('disabled')
  }

  const backup = async () => {
    if (writing || !pending || !consentOwner) return
    if (navigator.onLine === false) { emit('offline'); return }
    writing = true
    const owner = consentOwner, startedRevision = revision
    try {
      const { data: auth, error: authError } = await client.auth.getUser()
      if (authError || !auth.user || auth.user.id !== owner || consentOwner !== owner) {
        disarm()
        emit('sign-in-required')
        return
      }
      const safe = safeCheckpoint(localStorage.getItem(KEY) || 'null')
      const raw = JSON.stringify(safe)
      if (new TextEncoder().encode(raw).byteLength > 160000) {
        pending = false
        emit('too-large')
        return
      }
      const checksum = await digest(raw)
      if (consentOwner !== owner) return
      const { data, error } = await client.from(TABLE).insert({
        user_id: owner, device_id: DEVICE, checksum,
        payload: { payload: { format: 'quantum-memory-backup', raw } },
      }).select('id,created_at').single()
      if (consentOwner !== owner) return
      if (error || !data?.id) throw Error('Cloud save not acknowledged')
      pending = revision !== startedRevision
      lastUpload = Date.now()
      retryFailures = 0
      emit('saved', { snapshotId: data.id, at: data.created_at })
    } catch {
      if (consentOwner !== owner) return
      pending = true
      retryFailures++
      emit('failed', { retryable: true })
    } finally {
      writing = false
      if (pending && consentOwner === owner) schedule()
    }
  }

  const schedule = () => {
    if (!consentOwner) return
    pending = true
    if (timer !== undefined) return
    const backoff = retryFailures ? Math.min(600000, 5000 * 2 ** Math.min(retryFailures, 7)) : 1000
    const throttle = Math.max(0, 60000 - (Date.now() - lastUpload))
    timer = window.setTimeout(() => {
      timer = undefined
      void backup()
    }, Math.max(backoff, throttle))
  }

  window.addEventListener('tryamm:streetverse-cloud-opt-in', (event: Event) => {
    const confirmed = (event as CustomEvent<{ confirmed?: boolean }>).detail?.confirmed === true
    if (!confirmed) return
    void (async () => {
      const { data, error } = await client.auth.getUser()
      if (error || !data.user) { emit('sign-in-required'); return }
      try { safeCheckpoint(localStorage.getItem(KEY) || 'null') }
      catch { emit('no-valid-local-save'); return }
      consentOwner = data.user.id
      revision++
      emit('enabled', { owner: data.user.id })
      schedule()
    })().catch(() => emit('sign-in-required'))
  })

  window.addEventListener('tryamm:streetverse-checkpoint-saved', () => { revision++; schedule() })
  window.addEventListener('online', () => { if (pending && consentOwner) void backup() })
  window.addEventListener('tryamm:streetverse-cloud-backup-request', () => {
    if (!consentOwner) { emit('confirmation-required'); return }
    revision++
    pending = true
    void backup()
  })

  client.auth.onAuthStateChange((_event, session) => {
    // Never transfer an unscoped browser checkpoint to a different signed-in account.
    if (consentOwner && session?.user?.id !== consentOwner) disarm()
  })

  window.addEventListener('tryamm:streetverse-cloud-list-request', () => {
    void (async () => {
      const { data: auth, error: authError } = await client.auth.getUser()
      if (authError || !auth.user) { emit('sign-in-required'); return }
      const { data, error } = await client.from(TABLE).select('id,created_at,device_id')
        .eq('device_id', DEVICE).order('created_at', { ascending: false }).limit(20)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-cloud-list-result', {
        detail: { snapshots: error ? [] : data || [], error: Boolean(error) },
      }))
    })().catch(() => emit('list-failed'))
  })

  window.addEventListener('tryamm:streetverse-cloud-restore-request', (event: Event) => {
    void (async () => {
      const d = (event as CustomEvent<{ snapshotId?: string; confirmed?: boolean }>).detail
      if (!d?.confirmed || !/^[0-9a-f-]{36}$/i.test(d.snapshotId || '')) return
      const { data: auth, error: authError } = await client.auth.getUser()
      if (authError || !auth.user) { emit('sign-in-required'); return }
      const owner = auth.user.id
      const { data: row, error } = await client.from(TABLE).select('id,checksum,payload')
        .eq('id', d.snapshotId).eq('device_id', DEVICE).eq('user_id', owner).single()
      if (error || !row) { emit('restore-failed'); return }
      const raw = row.payload?.payload?.raw
      if (typeof raw !== 'string' || await digest(raw) !== row.checksum) {
        emit('checksum-mismatch')
        return
      }
      const safe = JSON.parse(raw)
      if (safe?.format !== 'streetverse-safe-checkpoint-v1' ||
          !Number.isFinite(safe.savedAt)) { emit('restore-failed'); return }
      // Position-only preview/recovery. NEVER rewrite a browser save or issue a reward.
      if (safe.position && [safe.position.x, safe.position.y, safe.position.z].every(Number.isFinite)) {
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-position-restore', {
          detail: { position: safe.position, savedAt: safe.savedAt, source: 'quantum-cloud' },
        }))
      }
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-cloud-restored', {
        detail: { snapshotId: row.id, checkpoint: safe, protectedEconomy: true },
      }))
    })().catch(() => emit('restore-failed'))
  })
  emit('ready', { scope: 'navigation-only', requiresConfirmation: true })
}
