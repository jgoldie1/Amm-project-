import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../services/supabaseClient'
import { installStreetVerseCloudCheckpointRuntime } from '../runtime/StreetVerseCloudCheckpointRuntime'

type Snapshot = { id: string; created_at: string; device_id: string }
type Status = { state: string; at?: string }
const actionStyle = { minHeight: 48, padding: '9px 12px', border: '1px solid #79dcff', borderRadius: 8,
  background: '#193c58', color: '#fff', fontWeight: 700 as const, cursor: 'pointer' }

/** Deliberately small and accessible; it never covers joystick controls unless opened. */
export default function StreetVerseQuantumCloudPanel() {
  const [open, setOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [status, setStatus] = useState<Status>({ state: 'ready' })
  const [confirmedOwner, setConfirmedOwner] = useState(false)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [selected, setSelected] = useState('')
  const [restoreConfirmed, setRestoreConfirmed] = useState(false)

  useEffect(() => {
    installStreetVerseCloudCheckpointRuntime()
    const client = getSupabaseClient()
    let active = true
    if (client) {
      void client.auth.getUser().then(({ data }) => { if (active) setSignedIn(Boolean(data.user)) })
        .catch(() => { if (active) setSignedIn(false) })
    }
    const subscription = client?.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user))
      setConfirmedOwner(false)
      setRestoreConfirmed(false)
      setSnapshots([])
      setSelected('')
    }).data.subscription
    const onStatus = (event: Event) => setStatus((event as CustomEvent<Status>).detail)
    const onList = (event: Event) => {
      const d = (event as CustomEvent<{ snapshots?: Snapshot[]; error?: boolean }>).detail
      setSnapshots(d?.error ? [] : d?.snapshots || [])
      if (d?.error) setStatus({ state: 'list-failed' })
    }
    const onRestored = () => { setStatus({ state: 'restored-navigation-only' }); setRestoreConfirmed(false) }
    window.addEventListener('tryamm:streetverse-cloud-status', onStatus)
    window.addEventListener('tryamm:streetverse-cloud-list-result', onList)
    window.addEventListener('tryamm:streetverse-cloud-restored', onRestored)
    return () => {
      active = false
      subscription?.unsubscribe()
      window.removeEventListener('tryamm:streetverse-cloud-status', onStatus)
      window.removeEventListener('tryamm:streetverse-cloud-list-result', onList)
      window.removeEventListener('tryamm:streetverse-cloud-restored', onRestored)
    }
  }, [])

  const dispatch = (name: string, detail?: object) => window.dispatchEvent(new CustomEvent(name, { detail }))
  return <aside aria-label="Quantum Cloud recovery" style={{
    position: 'fixed', right: 8, top: 'calc(env(safe-area-inset-top) + 66px)', zIndex: 16000,
    maxWidth: 'calc(100vw - 16px)', font: '14px system-ui,sans-serif',
  }}>
    <button type="button" style={actionStyle} aria-expanded={open} onClick={() => setOpen(v => !v)}>☁ Quantum Save</button>
    {open && <div style={{
      width: 'min(340px, calc(100vw - 20px))', maxHeight: '65dvh', overflowY: 'auto', marginTop: 7,
      padding: 14, borderRadius: 12, color: '#fff', background: 'rgba(10,28,49,.98)',
      border: '1px solid #5aaeca', boxShadow: '0 8px 32px #0009',
      display: 'grid', gap: 10,
    }}>
      <strong>Quantum Cloud Recovery</strong>
      <div aria-live="polite">Status: {status.state.replaceAll('-', ' ')}</div>
      <div>{signedIn ? 'Signed in to StreetVerse account' : 'Sign in to TRYAMM to access cloud saves.'}</div>
      <small>Backups contain navigation and displayed mission stages only. Wallets, credits, XP, and purchases are NOT restored.</small>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', minHeight: 48 }}>
        <input type="checkbox" checked={confirmedOwner}
          onChange={e => setConfirmedOwner(e.target.checked)} />
        This Chromebook's current game save belongs to my signed-in account.
      </label>
      <button type="button" style={actionStyle} disabled={!signedIn || !confirmedOwner}
        onClick={() => dispatch('tryamm:streetverse-cloud-opt-in', { confirmed: true })}>
        Enable backup for this session
      </button>
      <button type="button" style={actionStyle} disabled={!signedIn || !confirmedOwner}
        onClick={() => dispatch('tryamm:streetverse-cloud-backup-request')}>Back up now</button>
      <button type="button" style={actionStyle} disabled={!signedIn}
        onClick={() => dispatch('tryamm:streetverse-cloud-list-request')}>Find my cloud saves</button>
      {snapshots.length > 0 && <label style={{ display: 'grid', gap: 6 }}>
        Choose a snapshot
        <select style={{ minHeight: 48, color: '#172c43', background: '#fff' }}
          value={selected} onChange={e => { setSelected(e.target.value); setRestoreConfirmed(false) }}>
          <option value="">Select a recovery point</option>
          {snapshots.map(s => <option key={s.id} value={s.id}>{new Date(s.created_at).toLocaleString()}</option>)}
        </select>
      </label>}
      {selected && <label style={{ display: 'flex', gap: 10, minHeight: 48, alignItems: 'center' }}>
        <input type="checkbox" checked={restoreConfirmed}
          onChange={e => setRestoreConfirmed(e.target.checked)} />
        Restore the saved map position only; my other local data remains unchanged.
      </label>}
      {selected && <button type="button" style={actionStyle} disabled={!restoreConfirmed || !signedIn}
        onClick={() => dispatch('tryamm:streetverse-cloud-restore-request', { snapshotId: selected, confirmed: true })}>
        Restore selected position
      </button>}
      <button type="button" style={actionStyle} onClick={() => setOpen(false)}>Close</button>
    </div>}
  </aside>
}
