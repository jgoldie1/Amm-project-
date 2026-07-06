import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

type MoveType = 'jab' | 'cross' | 'hook' | 'uppercut' | 'block' | 'dodge' | 'body'
type FighterState = 'idle' | 'attacking' | 'blocking' | 'dodging' | 'stunned' | 'ko'

interface Fighter {
  name: string
  hp: number
  maxHp: number
  stamina: number
  maxStamina: number
  state: FighterState
  combo: number
  lastMove: MoveType | null
  style: 'aggro' | 'counter' | 'technical' | 'brawler'
  emoji: string
  color: string
}

interface BattleLog {
  id: number
  text: string
  type: 'player' | 'ai' | 'neutral' | 'combo'
}

const MOVES: Record<MoveType, { damage: number; staminaCost: number; label: string; emoji: string; counters: MoveType[] }> = {
  jab:      { damage: 8,  staminaCost: 6,  label: 'JAB',      emoji: '👊', counters: ['hook', 'uppercut'] },
  cross:    { damage: 14, staminaCost: 12, label: 'CROSS',    emoji: '🤜', counters: ['body'] },
  hook:     { damage: 18, staminaCost: 16, label: 'HOOK',     emoji: '🥊', counters: ['jab', 'cross'] },
  uppercut: { damage: 22, staminaCost: 20, label: 'UPPERCUT', emoji: '⬆️', counters: ['dodge'] },
  block:    { damage: 0,  staminaCost: 4,  label: 'BLOCK',    emoji: '🛡️', counters: [] },
  dodge:    { damage: 0,  staminaCost: 8,  label: 'DODGE',    emoji: '💨', counters: [] },
  body:     { damage: 12, staminaCost: 10, label: 'BODY SHOT',emoji: '🎯', counters: ['block'] },
}

const COMBO_CHAINS: Record<string, { bonus: number; name: string }> = {
  'jab-cross':           { bonus: 1.3, name: '1-2 COMBO' },
  'jab-cross-hook':      { bonus: 1.6, name: '1-2-3 COMBO' },
  'jab-jab-cross':       { bonus: 1.4, name: 'DOUBLE JAB' },
  'hook-uppercut':       { bonus: 1.7, name: 'HAYMAKER' },
  'body-hook':           { bonus: 1.5, name: 'BODY-HEAD' },
  'dodge-cross':         { bonus: 2.0, name: 'SLIP & COUNTER' },
  'block-uppercut':      { bonus: 1.8, name: 'PARRY-BLAST' },
  'jab-cross-hook-uppercut': { bonus: 2.5, name: '🔥 OMNIVERSE COMBO' },
}

export default function BoxingGame({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [round, setRound] = useState(1)
  const [totalRounds] = useState(3)
  const [phase, setPhase] = useState<'intro' | 'fight' | 'roundEnd' | 'gameOver'>('intro')
  const [player, setPlayer] = useState<Fighter>({
    name: store.player.name || 'King James',
    hp: 100, maxHp: 100, stamina: 100, maxStamina: 100,
    state: 'idle', combo: 0, lastMove: null,
    style: 'technical', emoji: '👑', color: '#00ffcc'
  })
  const [ai, setAI] = useState<Fighter>({
    name: 'Iron Mike AI', hp: 100, maxHp: 100, stamina: 100, maxStamina: 100,
    state: 'idle', combo: 0, lastMove: null,
    style: 'aggro', emoji: '🤖', color: '#ff4400'
  })
  const [log, setLog] = useState<BattleLog[]>([{ id: 0, text: 'Round 1 - FIGHT!', type: 'neutral' }])
  const [moveHistory, setMoveHistory] = useState<MoveType[]>([])
  const [comboName, setComboName] = useState<string | null>(null)
  const [roundTimer, setRoundTimer] = useState(60)
  const [scores, setScores] = useState<{ player: number; ai: number }[]>([])
  const [lastHit, setLastHit] = useState<{ side: 'player' | 'ai'; damage: number } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const aiCooldown = useRef(0)
  const logIdRef = useRef(1)

  const addLog = useCallback((text: string, type: BattleLog['type']) => {
    const id = logIdRef.current++
    setLog(prev => [...prev.slice(-8), { id, text, type }])
  }, [])

  // Round timer
  useEffect(() => {
    if (phase !== 'fight') return
    timerRef.current = setInterval(() => {
      setRoundTimer(t => {
        if (t <= 1) { endRound(); return 60 }
        return t - 1
      })
      // AI turn every 2-3 seconds
      aiCooldown.current++
      if (aiCooldown.current >= 2 + Math.floor(Math.random() * 2)) {
        aiCooldown.current = 0
        doAIMove()
      }
      // Stamina regen
      setPlayer(p => ({ ...p, stamina: Math.min(p.maxStamina, p.stamina + 3) }))
      setAI(a => ({ ...a, stamina: Math.min(a.maxStamina, a.stamina + 3) }))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const doPlayerMove = (move: MoveType) => {
    if (phase !== 'fight') return
    setPlayer(prev => {
      if (prev.stamina < MOVES[move].staminaCost) {
        addLog('⚡ Out of stamina!', 'neutral')
        return prev
      }
      const newHistory = [...moveHistory, move].slice(-4)
      setMoveHistory(newHistory)

      // Check combo
      const comboKey = newHistory.join('-')
      let bonusMultiplier = 1
      let comboStr: string | null = null
      for (const [chain, info] of Object.entries(COMBO_CHAINS)) {
        if (comboKey.endsWith(chain) || comboKey === chain) {
          bonusMultiplier = info.bonus
          comboStr = info.name
          break
        }
      }
      if (comboStr) { setComboName(comboStr); setTimeout(() => setComboName(null), 1500) }

      if (move === 'block' || move === 'dodge') {
        addLog(`${MOVES[move].emoji} You ${move}!`, 'player')
        return { ...prev, state: move === 'block' ? 'blocking' : 'dodging', stamina: prev.stamina - MOVES[move].staminaCost, lastMove: move }
      }

      // Check if AI is blocking/dodging
      let damage = Math.floor(MOVES[move].damage * bonusMultiplier * (0.8 + Math.random() * 0.4))
      let blocked = false
      setAI(a => {
        if (a.state === 'blocking' && MOVES[move].counters.includes('block')) { damage = Math.floor(damage * 0.2); blocked = true }
        if (a.state === 'dodging') { damage = 0; blocked = true }
        const newHp = Math.max(0, a.hp - damage)
        const newState: FighterState = newHp === 0 ? 'ko' : damage > 20 ? 'stunned' : 'idle'
        if (newState === 'stunned') setTimeout(() => setAI(x => ({ ...x, state: 'idle' })), 800)
        setLastHit({ side: 'ai', damage })
        setTimeout(() => setLastHit(null), 600)
        return { ...a, hp: newHp, state: newState }
      })

      const msg = blocked ? `${MOVES[move].emoji} ${MOVES[move].label} — BLOCKED!` :
        comboStr ? `${MOVES[move].emoji} ${comboStr}! ${damage} damage!` :
        `${MOVES[move].emoji} ${MOVES[move].label} — ${damage} dmg`
      addLog(msg, comboStr ? 'combo' : 'player')

      return { ...prev, stamina: prev.stamina - MOVES[move].staminaCost, state: 'attacking', lastMove: move }
    })
    setTimeout(() => setPlayer(p => ({ ...p, state: 'idle' })), 300)
  }

  const doAIMove = () => {
    const moves: MoveType[] = ['jab', 'cross', 'hook', 'uppercut', 'block', 'dodge', 'body']
    const weights = [3, 2, 2, 1, 2, 1, 1]  // weighted random
    const total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    let chosen: MoveType = 'jab'
    for (let i = 0; i < moves.length; i++) { r -= weights[i]; if (r <= 0) { chosen = moves[i]; break } }

    setAI(prev => {
      if (prev.stamina < MOVES[chosen].staminaCost) return prev
      if (prev.state === 'stunned' || prev.state === 'ko') return prev

      if (chosen === 'block' || chosen === 'dodge') {
        addLog(`${MOVES[chosen].emoji} AI ${chosen}s!`, 'ai')
        return { ...prev, state: chosen === 'block' ? 'blocking' : 'dodging', stamina: prev.stamina - MOVES[chosen].staminaCost, lastMove: chosen }
      }

      let damage = Math.floor(MOVES[chosen].damage * (0.7 + Math.random() * 0.4))
      setPlayer(p => {
        if (p.state === 'blocking') damage = Math.floor(damage * 0.15)
        if (p.state === 'dodging') damage = 0
        const newHp = Math.max(0, p.hp - damage)
        setLastHit({ side: 'player', damage })
        setTimeout(() => setLastHit(null), 600)
        return { ...p, hp: newHp, state: newHp === 0 ? 'ko' : 'idle' }
      })

      addLog(`🤖 AI ${MOVES[chosen].label} — ${damage} dmg`, 'ai')
      return { ...prev, stamina: prev.stamina - MOVES[chosen].staminaCost, state: 'attacking', lastMove: chosen }
    })
    setTimeout(() => setAI(a => ({ ...a, state: 'idle' })), 400)
  }

  const endRound = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const playerWon = player.hp > ai.hp
    setScores(s => [...s, { player: player.hp, ai: ai.hp }])
    if (round >= totalRounds || player.hp === 0 || ai.hp === 0) {
      setPhase('gameOver')
      const won = player.hp > ai.hp
      if (won) { store.earnCash(2000); store.earnXp(500); store.completeMission('m3') }
      store.setNotif(won ? '🏆 YOU WIN! +$2,000 +500 XP' : '❌ KNOCKOUT! Rematch?')
    } else {
      setPhase('roundEnd')
      setTimeout(() => {
        setRound(r => r + 1)
        setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + 30), stamina: 100, state: 'idle' }))
        setAI(a => ({ ...a, hp: Math.min(a.maxHp, a.hp + 20), stamina: 100, state: 'idle' }))
        setRoundTimer(60)
        setMoveHistory([])
        addLog(`Round ${round + 1} — FIGHT!`, 'neutral')
        setPhase('fight')
      }, 3000)
    }
  }

  const barPct = (v: number, max: number) => `${Math.max(0, (v / max) * 100)}%`

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0005', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #ff440033' }}>
        <button onClick={onExit} style={{ background: '#11111180', border: '1px solid #333', color: '#888', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>← EXIT</button>
        <span style={{ color: '#ff4400', fontWeight: 900, letterSpacing: 3, fontSize: 14 }}>🥊 OMNIVERSE BOXING</span>
        <span style={{ color: '#888', fontSize: 11, marginLeft: 'auto' }}>Round {round}/{totalRounds} · ⏱ {roundTimer}s</span>
      </div>

      {/* Fighter bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, padding: '10px 14px', alignItems: 'center' }}>
        {/* Player */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ color: player.color, fontWeight: 700, fontSize: 13 }}>{player.emoji} {player.name}</span>
            <span style={{ color: '#888', fontSize: 11 }}>{player.hp}/100</span>
          </div>
          <div style={{ background: '#111', borderRadius: 4, height: 8, marginBottom: 3 }}>
            <div style={{ background: player.hp > 50 ? '#00cc44' : player.hp > 25 ? '#ffaa00' : '#ff4400', height: '100%', width: barPct(player.hp, player.maxHp), borderRadius: 4, transition: 'width 0.2s' }} />
          </div>
          <div style={{ background: '#111', borderRadius: 4, height: 4 }}>
            <div style={{ background: '#0088ff', height: '100%', width: barPct(player.stamina, player.maxStamina), borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          <div style={{ color: '#333', fontSize: 9, marginTop: 2 }}>STAMINA</div>
        </div>

        {/* VS */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ff4400', fontSize: 20, fontWeight: 900 }}>VS</div>
          <div style={{ color: '#555', fontSize: 10 }}>{phase === 'fight' ? '⚔️ LIVE' : phase === 'roundEnd' ? '⏸ BREAK' : '🏁'}</div>
        </div>

        {/* AI */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ color: '#888', fontSize: 11 }}>{ai.hp}/100</span>
            <span style={{ color: ai.color, fontWeight: 700, fontSize: 13 }}>{ai.name} {ai.emoji}</span>
          </div>
          <div style={{ background: '#111', borderRadius: 4, height: 8, marginBottom: 3 }}>
            <div style={{ background: ai.hp > 50 ? '#ff4400' : ai.hp > 25 ? '#ff8800' : '#ff0000', height: '100%', width: barPct(ai.hp, ai.maxHp), borderRadius: 4, transition: 'width 0.2s', marginLeft: 'auto' }} />
          </div>
          <div style={{ background: '#111', borderRadius: 4, height: 4 }}>
            <div style={{ background: '#ff4400', height: '100%', width: barPct(ai.stamina, ai.maxStamina), borderRadius: 4, transition: 'width 0.3s', marginLeft: 'auto' }} />
          </div>
          <div style={{ color: '#333', fontSize: 9, marginTop: 2, textAlign: 'right' }}>STAMINA</div>
        </div>
      </div>

      {/* Fight arena */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 50%, #1a0010 0%, #0a0005 70%)' }}>
        {/* Fighters */}
        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-end', marginBottom: 20 }}>
          {/* Player fighter */}
          <div style={{ textAlign: 'center', transition: 'transform 0.1s', transform: player.state === 'attacking' ? 'translateX(12px)' : player.state === 'blocking' ? 'scale(0.95)' : player.state === 'stunned' ? 'rotate(-5deg)' : player.state === 'ko' ? 'rotate(-30deg) translateY(20px)' : 'none' }}>
            <div style={{ fontSize: 64, filter: `drop-shadow(0 0 ${player.state === 'attacking' ? '20px' : '8px'} ${player.color})` }}>
              {player.state === 'ko' ? '😵' : player.state === 'blocking' ? '🛡️' : player.state === 'dodging' ? '💨' : '🥊'}
            </div>
            <div style={{ fontSize: 32, marginTop: -10 }}>👤</div>
            <div style={{ color: player.color, fontSize: 11, fontWeight: 700 }}>{player.state.toUpperCase()}</div>
          </div>

          {/* Damage numbers */}
          <div style={{ position: 'relative', width: 60 }}>
            {lastHit && (
              <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', color: lastHit.side === 'ai' ? '#ff4400' : '#00cc44', fontSize: 20, fontWeight: 900, animation: 'float 0.6s ease-out' }}>
                {lastHit.damage > 0 ? `-${lastHit.damage}` : 'MISS!'}
              </div>
            )}
            {comboName && (
              <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: '#ffd700', fontSize: 13, fontWeight: 900, textShadow: '0 0 10px #ffd700' }}>
                {comboName}!
              </div>
            )}
          </div>

          {/* AI fighter */}
          <div style={{ textAlign: 'center', transition: 'transform 0.1s', transform: ai.state === 'attacking' ? 'translateX(-12px)' : ai.state === 'stunned' ? 'rotate(5deg)' : ai.state === 'ko' ? 'rotate(30deg) translateY(20px)' : 'none' }}>
            <div style={{ fontSize: 64, filter: `drop-shadow(0 0 ${ai.state === 'attacking' ? '20px' : '8px'} ${ai.color})`, transform: 'scaleX(-1)', display: 'inline-block' }}>
              {ai.state === 'ko' ? '😵' : ai.state === 'blocking' ? '🛡️' : ai.state === 'dodging' ? '💨' : '🤜'}
            </div>
            <div style={{ fontSize: 32, marginTop: -10, transform: 'scaleX(-1)', display: 'inline-block' }}>🤖</div>
            <div style={{ color: ai.color, fontSize: 11, fontWeight: 700 }}>{ai.state.toUpperCase()}</div>
          </div>
        </div>

        {/* Phase overlays */}
        {phase === 'intro' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}>
            <div style={{ color: '#ff4400', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>🥊 ROUND {round}</div>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Use combos to deal bonus damage</div>
            <button onClick={() => setPhase('fight')} style={{ background: '#ff440022', border: '2px solid #ff4400', color: '#ff4400', borderRadius: 8, padding: '12px 40px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 18 }}>
              FIGHT!
            </button>
          </div>
        )}
        {phase === 'gameOver' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{player.hp >= ai.hp ? '🏆' : '💀'}</div>
            <div style={{ color: player.hp >= ai.hp ? '#ffd700' : '#ff4400', fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
              {player.hp >= ai.hp ? 'CHAMPION!' : 'KNOCKED OUT!'}
            </div>
            {player.hp >= ai.hp && <div style={{ color: '#00cc44', fontSize: 13, marginBottom: 16 }}>+$2,000 · +500 XP · Mission Complete!</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPlayer(p => ({ ...p, hp: 100, stamina: 100, state: 'idle' })); setAI(a => ({ ...a, hp: 100, stamina: 100, state: 'idle' })); setRound(1); setScores([]); setRoundTimer(60); setLog([{ id: 0, text: 'Round 1 - FIGHT!', type: 'neutral' }]); setPhase('intro') }}
                style={{ background: '#ff440022', border: '1px solid #ff4400', color: '#ff4400', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>REMATCH</button>
              <button onClick={onExit} style={{ background: '#11111180', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontFamily: 'monospace' }}>EXIT</button>
            </div>
          </div>
        )}
      </div>

      {/* Battle log */}
      <div style={{ height: 64, overflowY: 'auto', padding: '4px 12px', borderTop: '1px solid #1a000a', borderBottom: '1px solid #1a000a', background: 'rgba(0,0,5,0.9)' }}>
        {log.slice(-4).map(l => (
          <div key={l.id} style={{ fontSize: 11, color: l.type === 'player' ? '#00ffcc' : l.type === 'ai' ? '#ff4400' : l.type === 'combo' ? '#ffd700' : '#888' }}>{l.text}</div>
        ))}
      </div>

      {/* Move buttons */}
      <div style={{ padding: '10px 12px', background: 'rgba(0,0,5,0.95)' }}>
        <div style={{ color: '#333', fontSize: 10, marginBottom: 6, letterSpacing: 2 }}>ATTACK · CHAIN MOVES FOR COMBOS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 6 }}>
          {(['jab', 'cross', 'hook', 'uppercut'] as MoveType[]).map(m => (
            <button key={m} onClick={() => doPlayerMove(m)} disabled={player.stamina < MOVES[m].staminaCost || phase !== 'fight'}
              style={{ background: player.stamina >= MOVES[m].staminaCost && phase === 'fight' ? '#ff440022' : '#0a0005', border: `1px solid ${player.stamina >= MOVES[m].staminaCost && phase === 'fight' ? '#ff4400' : '#222'}`, color: player.stamina >= MOVES[m].staminaCost && phase === 'fight' ? '#ff4400' : '#333', borderRadius: 6, padding: '8px 4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>
              {MOVES[m].emoji} {MOVES[m].label}<div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{MOVES[m].staminaCost} STA</div>
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {(['body', 'block', 'dodge'] as MoveType[]).map(m => (
            <button key={m} onClick={() => doPlayerMove(m)} disabled={player.stamina < MOVES[m].staminaCost || phase !== 'fight'}
              style={{ background: m === 'block' || m === 'dodge' ? '#00ffcc11' : '#ff440011', border: `1px solid ${m === 'block' || m === 'dodge' ? '#00ffcc44' : '#ff440044'}`, color: m === 'block' || m === 'dodge' ? '#00ffcc' : '#ff8800', borderRadius: 6, padding: '8px 4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>
              {MOVES[m].emoji} {MOVES[m].label}<div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{MOVES[m].staminaCost} STA</div>
            </button>
          ))}
        </div>
        <div style={{ color: '#333', fontSize: 9, marginTop: 6, textAlign: 'center' }}>
          COMBOS: JAB→CROSS (1-2) · JAB→CROSS→HOOK (1-2-3) · DODGE→CROSS (2× COUNTER) · BLOCK→UPPERCUT (PARRY)
        </div>
      </div>
    </div>
  )
}
