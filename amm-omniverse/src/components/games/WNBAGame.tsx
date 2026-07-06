// AMM WNBA Game — Women's Basketball
// Features W-specific mechanics: paint dominance, drive-and-kick, 
// defensive rotations, WNBA shot arc timing, W-era stars
// MyWPlayer career: WNBA draft, development, team chemistry

import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

type WShot = 'bank_shot' | 'mid_post' | 'pull_back_three' | 'fast_break' | 'and_one' | 'top_key_three' | 'drive_floater'
type WDefense = 'box_out' | 'deny_wing' | 'help_rotate' | 'contest_arc' | 'trap_ball'
type WCareerStage = 'college' | 'draft' | 'rookie' | 'star' | 'legend'

const W_SHOTS: Record<WShot, { label: string; emoji: string; pts: number; basePct: number; desc: string }> = {
  bank_shot:       { label: 'Bank Shot',      emoji: '🏀', pts: 2, basePct: 0.62, desc: 'Glass is your friend' },
  mid_post:        { label: 'Mid-Post',       emoji: '📐', pts: 2, basePct: 0.58, desc: 'Post moves are elite in the W' },
  pull_back_three: { label: 'Pull-Back 3',    emoji: '⬅️', pts: 3, basePct: 0.38, desc: 'Step back off the dribble' },
  fast_break:      { label: 'Fast Break',     emoji: '⚡', pts: 2, basePct: 0.78, desc: 'Transition layup — high % when open' },
  and_one:         { label: 'And-One Drive',  emoji: '💥', pts: 2, basePct: 0.52, desc: 'Draw contact + convert' },
  top_key_three:   { label: 'Top-Key 3',      emoji: '3️⃣', pts: 3, basePct: 0.36, desc: 'Pull up from the logo' },
  drive_floater:   { label: 'Drive & Float',  emoji: '🕊️', pts: 2, basePct: 0.55, desc: 'Float over the help D' },
}

// WNBA-inspired stars (fictional for AMM)
const W_STARS = [
  { name: 'Zion Faith', team: 'AMM Spirit', pos: 'PG', rating: 96, emoji: '👑', specialty: 'Playmaker + Mid-range killer' },
  { name: 'Queen Gospel', team: 'Holy Hoops', pos: 'SF', rating: 94, emoji: '🕊️', specialty: 'Wing scorer + lockdown D' },
  { name: 'Grace Power', team: 'Creator Wave', pos: 'C',  rating: 92, emoji: '💪', specialty: 'Post beast + interior wall' },
  { name: 'Blessed Speed', team: 'Kingdom Run',  pos: 'SG', rating: 91, emoji: '⚡', specialty: 'Fast break + 3-point sniper' },
]

const W_ARCHETYPES = [
  { id: 'w_pg',      emoji: '🎯', label: 'Floor General',   bonus: 'Pass +25, Court vision', color: '#00ccff' },
  { id: 'w_wing',    emoji: '🕊️', label: 'Wing Scorer',     bonus: '3PT +20, Mid-range +15', color: '#ff8800' },
  { id: 'w_post',    emoji: '💪', label: 'Post Presence',   bonus: 'Interior +30, Rebnd +20', color: '#8800ff' },
  { id: 'w_athlete', emoji: '⚡', label: 'Athletic Slasher', bonus: 'Speed +25, Fast break +20', color: '#00cc44' },
]

export default function WNBAGame({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [phase, setPhase] = useState<'build' | 'pregame' | 'live' | 'final'>('build')
  const [archetype, setArchetype] = useState('w_pg')
  const [careerStage] = useState<WCareerStage>('rookie')
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [quarter, setQuarter] = useState(1)
  const [clock, setClock] = useState(120)
  const [possession, setPossession] = useState<'player' | 'ai'>('player')
  const [shotMeter, setShotMeter] = useState(0)
  const [currentShot, setCurrentShot] = useState<WShot | null>(null)
  const [momentum, setMomentum] = useState(50)
  const [teamChem, setTeamChem] = useState(75) // W-specific: team chemistry
  const [selectedDef, setSelectedDef] = useState<WDefense | null>(null)
  const [log, setLog] = useState<string[]>(['Tip off! The W is live.'])
  const [shotResult, setShotResult] = useState<string | null>(null)
  const [assists, setAssists] = useState(0)
  const [rebounds, setRebounds] = useState(0)
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const meterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const aiRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addLog = (m: string) => setLog(p => [...p.slice(-6), m])
  const arch = W_ARCHETYPES.find(a => a.id === archetype)!

  useEffect(() => {
    if (phase !== 'live') return
    clockRef.current = setInterval(() => {
      setClock(c => {
        if (c <= 0) {
          clearInterval(clockRef.current!)
          if (quarter >= 4) { setPhase('final'); return 0 }
          setQuarter(q => q + 1); setClock(120)
          setMomentum(50)
          addLog(`Q${quarter + 1} starts!`)
          return 120
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(clockRef.current!)
  }, [phase, quarter])

  useEffect(() => {
    if (phase !== 'live' || possession !== 'ai') return
    aiRef.current = setTimeout(() => {
      const shots: WShot[] = ['bank_shot', 'mid_post', 'fast_break', 'drive_floater']
      const s = shots[Math.floor(Math.random() * shots.length)]
      const def = selectedDef
      let pct = W_SHOTS[s].basePct
      if (def === 'contest_arc') pct -= 0.18
      if (def === 'help_rotate') pct -= 0.10
      if (def === 'box_out') pct -= 0.05
      pct = Math.max(0.08, pct - (teamChem / 800))
      const made = Math.random() < pct
      if (made) {
        setScore(sc => ({ ...sc, ai: sc.ai + W_SHOTS[s].pts }))
        setMomentum(m => Math.max(0, m - 12))
        addLog(`🤖 AI ${W_SHOTS[s].label} — ${W_SHOTS[s].pts} pts`)
      } else {
        setRebounds(r => r + 1)
        setMomentum(m => Math.min(100, m + 8))
        addLog(`🛡 AI missed! ${def ? `${def.replace('_',' ')} worked!` : 'Board!'}`)
      }
      setSelectedDef(null)
      setPossession('player')
    }, 1600)
    return () => clearTimeout(aiRef.current!)
  }, [possession, phase])

  const shoot = (shot: WShot) => {
    if (phase !== 'live' || possession !== 'player') return
    setCurrentShot(shot)
    setShotMeter(0)
    if (meterRef.current) clearInterval(meterRef.current)
    meterRef.current = setInterval(() => {
      setShotMeter(v => {
        if (v >= 100) { clearInterval(meterRef.current!); resolveShot(shot, v); return 0 }
        return v + 2.8
      })
    }, 28)
  }

  const tapShot = () => {
    if (!currentShot || !meterRef.current) return
    clearInterval(meterRef.current!)
    const val = shotMeter
    resolveShot(currentShot, val)
    setShotMeter(0); setCurrentShot(null)
  }

  const resolveShot = (shot: WShot, meterVal: number) => {
    const inPerfect = meterVal >= 48 && meterVal <= 74
    const inGood = meterVal >= 38 && meterVal <= 84
    const s = W_SHOTS[shot]
    let pct = s.basePct
    if (inPerfect) pct = Math.min(0.95, pct + 0.32)
    else if (inGood) pct += 0.12
    else pct -= 0.18
    if (momentum > 65) pct += 0.10
    // Team chemistry bonus (W-specific)
    pct += (teamChem / 1000)
    const made = Math.random() < Math.max(0.03, pct)
    const pts = s.pts
    if (made) {
      setScore(sc => ({ ...sc, player: sc.player + pts }))
      setMomentum(m => Math.min(100, m + (inPerfect ? 20 : 10)))
      setTeamChem(t => Math.min(100, t + 3))
      const msg = inPerfect ? `🎯 PERFECT ${s.label}! +${pts}` : `✅ ${s.label} — ${pts} pts`
      setShotResult(msg); addLog(msg)
    } else {
      setMomentum(m => Math.max(0, m - 5))
      setShotResult('📵 MISS'); addLog(`📵 ${s.label} — off the iron`)
    }
    setTimeout(() => { setShotResult(null); setCurrentShot(null); setPossession('ai') }, 1300)
  }

  const won = score.player > score.ai
  const formatClock = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (phase === 'build') return (
    <div style={{ width: '100%', height: '100%', background: '#050215', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #ff66cc33' }}>
        <button onClick={onExit} style={{ background: '#11111180', border: '1px solid #333', color: '#888', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>← EXIT</button>
        <span style={{ color: '#ff66cc', fontWeight: 900, fontSize: 14, letterSpacing: 3 }}>🏀 MyWPLAYER — THE W</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ color: '#888', fontSize: 12, marginBottom: 14 }}>Build your W player. The W emphasizes team basketball, fundamentals, and court IQ over athleticism.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {W_ARCHETYPES.map(a => (
            <div key={a.id} onClick={() => setArchetype(a.id)} style={{ padding: 12, borderRadius: 8, cursor: 'pointer', background: archetype === a.id ? `${a.color}15` : 'rgba(5,5,30,0.9)', border: `2px solid ${archetype === a.id ? a.color : '#1a1a3e'}` }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{a.emoji}</div>
              <div style={{ color: archetype === a.id ? a.color : '#ccc', fontWeight: 700, fontSize: 12 }}>{a.label}</div>
              <div style={{ color: '#555', fontSize: 10, marginTop: 4 }}>{a.bonus}</div>
            </div>
          ))}
        </div>
        {/* W Stars roster */}
        <div style={{ background: 'rgba(255,102,204,0.06)', border: '1px solid #ff66cc33', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ color: '#ff66cc', fontWeight: 700, marginBottom: 10 }}>YOUR TEAM — AMM W LEAGUE</div>
          {W_STARS.map(s => (
            <div key={s.name} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1a1a3e' }}>
              <span style={{ fontSize: 18 }}>{s.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{s.name} <span style={{ color: '#555', fontSize: 10 }}>#{s.pos}</span></div>
                <div style={{ color: '#888', fontSize: 10 }}>{s.specialty}</div>
              </div>
              <div style={{ color: '#ffd700', fontSize: 13, fontWeight: 700 }}>{s.rating}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase('pregame')} style={{ width: '100%', background: '#ff66cc22', border: '2px solid #ff66cc', color: '#ff66cc', borderRadius: 8, padding: '14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 16 }}>
          BUILD {arch.emoji} {arch.label.toUpperCase()} →
        </button>
      </div>
    </div>
  )

  if (phase === 'pregame') return (
    <div style={{ width: '100%', height: '100%', background: '#050215', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏀</div>
      <div style={{ color: '#ff66cc', fontSize: 22, fontWeight: 900, marginBottom: 4 }}>AMM W LEAGUE</div>
      <div style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{arch.emoji} {arch.label} · {careerStage.toUpperCase()}</div>
      <div style={{ color: '#555', fontSize: 12, marginBottom: 6, textAlign: 'center' }}>The W is about team chemistry. Higher team chem = better shot %. Pass the ball, get assists, build the chemistry bar.</div>
      <button onClick={() => { setPhase('live'); addLog('Tip off! AMM Spirit vs City Starz') }}
        style={{ background: '#ff66cc22', border: '2px solid #ff66cc', color: '#ff66cc', borderRadius: 8, padding: '14px 50px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 18 }}>
        🏀 TIP OFF — THE W
      </button>
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%', background: '#050215', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
      {/* Scoreboard */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #ff66cc33', background: 'rgba(0,0,10,0.95)' }}>
        <button onClick={onExit} style={{ background: '#11111180', border: '1px solid #333', color: '#888', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>←</button>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#ff66cc', fontSize: 22, fontWeight: 900 }}>{score.player}</div>
            <div style={{ color: '#888', fontSize: 9 }}>AMM SPIRIT · {arch.emoji}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#ffd700', fontSize: 12, fontWeight: 700 }}>Q{quarter} · {formatClock(clock)}</div>
            <div style={{ color: '#555', fontSize: 9 }}>CHEM {Math.round(teamChem)}%</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#aaa', fontSize: 22, fontWeight: 900 }}>{score.ai}</div>
            <div style={{ color: '#888', fontSize: 9 }}>CITY STARZ</div>
          </div>
        </div>
      </div>

      {/* Team chemistry bar */}
      <div style={{ height: 5, background: '#111' }}>
        <div style={{ height: '100%', width: `${teamChem}%`, background: '#ff66cc', transition: 'width 0.5s' }} />
      </div>

      {/* Court */}
      <div style={{ flex: 1, position: 'relative', background: 'linear-gradient(180deg,#0d0820 0%,#050215 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }} viewBox="0 0 300 200">
          <rect x="10" y="10" width="280" height="180" fill="none" stroke="#ff66cc" strokeWidth="1.5"/>
          <circle cx="150" cy="100" r="28" fill="none" stroke="#ff66cc" strokeWidth="1"/>
          <line x1="150" y1="10" x2="150" y2="190" stroke="#ff66cc" strokeWidth="0.5"/>
          <rect x="10" y="50" width="60" height="100" fill="none" stroke="#ff66cc" strokeWidth="1"/>
          <rect x="230" y="50" width="60" height="100" fill="none" stroke="#ff66cc" strokeWidth="1"/>
        </svg>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, filter: `drop-shadow(0 0 ${possession === 'player' ? '18px' : '5px'} #ff66cc)`, transition: 'filter 0.2s' }}>
            {currentShot ? '🎯' : possession === 'player' ? '🏀' : '🏃'}
          </div>
          <div style={{ color: '#ff66cc', fontSize: 9 }}>{possession === 'player' ? '● BALL' : ''}</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>AST {assists} · REB {rebounds}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, filter: `drop-shadow(0 0 ${possession === 'ai' ? '18px' : '5px'} #888)`, transition: 'filter 0.2s' }}>
            {possession === 'ai' ? '🤖🏀' : '🤖'}
          </div>
        </div>

        {/* Shot meter */}
        {currentShot && (
          <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 20 }}>
            <div style={{ color: '#ff66cc', fontSize: 12, marginBottom: 6, fontWeight: 700 }}>{W_SHOTS[currentShot].label.toUpperCase()} — TAP!</div>
            <div style={{ width: 220, height: 16, background: '#111', borderRadius: 8, border: '1px solid #333', overflow: 'hidden', position: 'relative', marginBottom: 8 }}>
              <div style={{ position: 'absolute', left: '48%', width: '26%', height: '100%', background: 'rgba(255,102,204,0.3)', borderLeft: '2px solid #ff66cc', borderRight: '2px solid #ff66cc' }} />
              <div style={{ height: '100%', width: `${shotMeter}%`, background: '#ff66cc', borderRadius: 8, transition: 'width 0.025s' }} />
            </div>
            <button onClick={tapShot} style={{ background: '#ff66cc22', border: '2px solid #ff66cc', color: '#ff66cc', borderRadius: 8, padding: '10px 44px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 16 }}>
              TAP 🏀
            </button>
          </div>
        )}

        {shotResult && (
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)', color: shotResult.includes('MISS') ? '#ff4400' : '#ff66cc', fontSize: 20, fontWeight: 900, textShadow: '0 0 20px currentColor' }}>
            {shotResult}
          </div>
        )}

        {phase === 'final' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{won ? '🏆' : '😤'}</div>
            <div style={{ color: won ? '#ff66cc' : '#ff4400', fontSize: 20, fontWeight: 900, marginBottom: 6 }}>{won ? 'W LEAGUE CHAMPION!' : 'Tough game, Queen.'}</div>
            <div style={{ color: '#888', marginBottom: 12 }}>Final: {score.player} – {score.ai} · AST {assists} · REB {rebounds}</div>
            {won && <div style={{ color: '#00cc44', fontSize: 12, marginBottom: 12 }}>+$1,500 · +400 XP · MyWCareer progress!</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setScore({ player: 0, ai: 0 }); setQuarter(1); setClock(120); setMomentum(50); setTeamChem(75); setAssists(0); setRebounds(0); setLog(['Tip off!']); setPhase('pregame') }}
                style={{ background: '#ff66cc22', border: '1px solid #ff66cc', color: '#ff66cc', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>REMATCH</button>
              <button onClick={onExit} style={{ background: '#11111180', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontFamily: 'monospace' }}>EXIT</button>
            </div>
          </div>
        )}
      </div>

      {/* Log */}
      <div style={{ height: 44, overflowY: 'auto', padding: '4px 12px', background: 'rgba(0,0,12,0.95)', borderTop: '1px solid #ff66cc22' }}>
        {log.slice(-2).map((l, i) => <div key={i} style={{ fontSize: 11, color: l.includes('AI') ? '#aaa' : l.includes('PERFECT') ? '#ffd700' : '#ff66cc' }}>{l}</div>)}
      </div>

      {/* Controls */}
      <div style={{ padding: '8px 10px', background: 'rgba(0,0,12,0.98)', borderTop: '1px solid #ff66cc33' }}>
        {phase === 'live' && possession === 'player' && !currentShot && (
          <div>
            <div style={{ color: '#555', fontSize: 9, marginBottom: 5, letterSpacing: 2 }}>OFFENSE · TEAM CHEM {Math.round(teamChem)}% · MOM {Math.round(momentum)}%</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 5 }}>
              {(['bank_shot', 'mid_post', 'drive_floater', 'fast_break'] as WShot[]).map(s => (
                <button key={s} onClick={() => shoot(s)} style={{ background: '#ff66cc11', border: '1px solid #ff66cc44', borderRadius: 5, padding: '7px 3px', cursor: 'pointer', fontFamily: 'monospace', textAlign: 'center' }}>
                  <div style={{ fontSize: 14 }}>{W_SHOTS[s].emoji}</div>
                  <div style={{ color: '#ff66cc', fontSize: 9, fontWeight: 700 }}>{W_SHOTS[s].label}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
              {(['pull_back_three', 'top_key_three', 'and_one'] as WShot[]).map(s => (
                <button key={s} onClick={() => shoot(s)} style={{ background: '#ffd70011', border: '1px solid #ffd70044', borderRadius: 5, padding: '7px 3px', cursor: 'pointer', fontFamily: 'monospace', textAlign: 'center' }}>
                  <div style={{ fontSize: 14 }}>{W_SHOTS[s].emoji}</div>
                  <div style={{ color: '#ffd700', fontSize: 9, fontWeight: 700 }}>{W_SHOTS[s].label}</div>
                </button>
              ))}
              <button onClick={() => { setAssists(a => a + 1); setTeamChem(t => Math.min(100, t + 5)); addLog('🎯 ASSIST! Team chem +5'); setPossession('ai') }}
                style={{ background: '#00cc4411', border: '1px solid #00cc4444', borderRadius: 5, padding: '7px 3px', cursor: 'pointer', fontFamily: 'monospace', textAlign: 'center' }}>
                <div style={{ fontSize: 14 }}>🎯</div>
                <div style={{ color: '#00cc44', fontSize: 9, fontWeight: 700 }}>ASSIST</div>
              </button>
            </div>
          </div>
        )}
        {phase === 'live' && possession === 'ai' && !currentShot && (
          <div>
            <div style={{ color: '#555', fontSize: 9, marginBottom: 5, letterSpacing: 2 }}>DEFENSE — PICK YOUR SCHEME:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
              {(['box_out', 'deny_wing', 'help_rotate', 'contest_arc', 'trap_ball'] as WDefense[]).map(d => (
                <button key={d} onClick={() => { setSelectedDef(d); addLog(`${d.replace(/_/g, ' ')} ready`) }}
                  style={{ background: selectedDef === d ? '#ff66cc22' : 'transparent', border: `1px solid ${selectedDef === d ? '#ff66cc' : '#333'}`, borderRadius: 5, padding: '7px 3px', cursor: 'pointer', fontFamily: 'monospace', textAlign: 'center' }}>
                  <div style={{ fontSize: 12 }}>{d === 'box_out' ? '📦' : d === 'deny_wing' ? '🚫' : d === 'help_rotate' ? '🔄' : d === 'contest_arc' ? '✋' : '🪤'}</div>
                  <div style={{ color: selectedDef === d ? '#ff66cc' : '#555', fontSize: 9 }}>{d.replace(/_/g, ' ').toUpperCase()}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
