import { useEffect, useState } from 'react'
import { getAuthenticatedUserId } from '../services/supabaseClient'
import {
  createPuzzleInstance,
  joinPuzzleInstance,
  removePuzzleSubscription,
  submitPuzzleCharge,
  subscribePuzzleState,
  type PuzzleSession,
} from '../services/realityLabMultiplayer'

export default function RealityLabMultiplayerPanel({ active }: { active: boolean }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [session, setSession] = useState<PuzzleSession | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [status, setStatus] = useState('Room 5 shared puzzle is idle.')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!active) return
    void getAuthenticatedUserId().then(userId => setAuthenticated(Boolean(userId)))
  }, [active])

  useEffect(() => {
    if (!session?.instanceId) return
    const channel = subscribePuzzleState(session.instanceId, next => {
      setSession(prev => ({ ...next, joinCode: prev?.joinCode }))
      setStatus(next.state.solved ? 'Collective Puzzle solved by the shared session.' : `Shared state updated to revision ${next.revision}.`)
    })
    return () => { void removePuzzleSubscription(channel) }
  }, [session?.instanceId])

  if (!active) return null

  const create = async () => {
    setBusy(true)
    try {
      const next = await createPuzzleInstance()
      setSession(next)
      setStatus(`Session created. Share join code ${next.joinCode}.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not create multiplayer session.')
    } finally { setBusy(false) }
  }

  const join = async () => {
    if (!joinCode.trim()) return
    setBusy(true)
    try {
      const next = await joinPuzzleInstance(joinCode.trim())
      setSession(next)
      setStatus('Joined authoritative shared puzzle session.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not join multiplayer session.')
    } finally { setBusy(false) }
  }

  const charge = async () => {
    if (!session) return
    setBusy(true)
    try {
      const next = await submitPuzzleCharge(session.instanceId, session.revision, 5)
      setSession(prev => ({ ...next, joinCode: prev?.joinCode }))
      setStatus(next.state.solved ? 'Collective Puzzle solved.' : `Server accepted move ${next.state.moves}; revision ${next.revision}.`)
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error)
      setStatus(text.includes('revision_conflict') ? 'Another player moved first. Shared state changed; wait for Realtime sync and retry.' : text)
    } finally { setBusy(false) }
  }

  return (
    <section aria-label="Authoritative multiplayer puzzle" style={{ marginTop:16, border:'1px solid #4fe3ff66', borderRadius:16, padding:14, background:'#061522' }}>
      <div style={{ color:'#4fe3ff', fontWeight:900, letterSpacing:1 }}>ROOM 5 • AUTHORITATIVE MULTIPLAYER</div>
      <p style={{ color:'#a9b8c8', margin:'8px 0 12px' }}>Clients submit actions; Supabase validates membership and expected revision, then the server writes the shared puzzle state. Realtime distributes the accepted state to every joined client.</p>
      {authenticated === false && <div role="status" style={{ color:'#e8b944' }}>Sign in with the existing TRYAMM/Supabase account to create or join a shared puzzle. Guest mode stays local-only.</div>}
      {authenticated && !session && <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button disabled={busy} onClick={create}>Create shared session</button>
        <input aria-label="Puzzle join code" value={joinCode} onChange={event=>setJoinCode(event.target.value.toUpperCase())} placeholder="JOIN CODE" maxLength={8} />
        <button disabled={busy || !joinCode.trim()} onClick={join}>Join session</button>
      </div>}
      {session && <div>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontFamily:'monospace', fontSize:11 }}>
          {session.joinCode && <span>JOIN CODE {session.joinCode}</span>}
          <span>REVISION {session.revision}</span><span>ENERGY {session.state.energy}/100</span><span>MOVES {session.state.moves}</span><span>{session.state.solved ? 'SOLVED' : 'ACTIVE'}</span>
        </div>
        <progress aria-label="Shared puzzle energy" value={session.state.energy} max={100} style={{ width:'100%', marginTop:10 }} />
        <button disabled={busy || session.state.solved} onClick={charge} style={{ marginTop:10 }}>Charge shared puzzle +5</button>
      </div>}
      <div role="status" aria-live="polite" style={{ marginTop:10, color:'#c9d5df', fontSize:11 }}>{status}</div>
    </section>
  )
}
