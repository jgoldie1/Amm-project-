import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

type ShotZone = 'paint' | 'midrange' | 'three' | 'corner3' | 'buzzer'
type MoveType = 'drive' | 'jump_shot' | 'three_pointer' | 'corner_three' | 'dunk' | 'pass_inside' | 'steal_attempt' | 'block_attempt'
type GamePhase = 'pregame' | 'playing' | 'freethrow' | 'halftime' | 'gameover'

interface Shot {
  zone: ShotZone
  pct: number
  points: number
  label: string
}

const SHOTS: Record<ShotZone, Shot> = {
  paint:    { zone:'paint',    pct:0.65, points:2, label:'In the paint' },
  midrange: { zone:'midrange', pct:0.48, points:2, label:'Mid-range J' },
  three:    { zone:'three',    pct:0.36, points:3, label:'3-pointer' },
  corner3:  { zone:'corner3', pct:0.40, points:3, label:'Corner 3' },
  buzzer:   { zone:'buzzer',   pct:0.12, points:3, label:'Buzzer beater' },
}

const MOVES: Record<MoveType, { label:string; emoji:string; shot?:ShotZone; staminaCost:number; desc:string }> = {
  drive:          { label:'Drive to Hoop', emoji:'🏃', shot:'paint',    staminaCost:12, desc:'Attack the basket hard' },
  jump_shot:      { label:'Jump Shot',     emoji:'🏀', shot:'midrange', staminaCost:8,  desc:'Pull-up mid-range' },
  three_pointer:  { label:'3-Pointer',     emoji:'3️⃣', shot:'three',    staminaCost:7,  desc:'Step back from deep' },
  corner_three:   { label:'Corner 3',      emoji:'📐', shot:'corner3',  staminaCost:6,  desc:'Kick out to corner' },
  dunk:           { label:'Dunk!',         emoji:'💥', shot:'paint',    staminaCost:20, desc:'Needs 70+ energy' },
  pass_inside:    { label:'Pass Inside',   emoji:'🎯', shot:'paint',    staminaCost:5,  desc:'Feed the post' },
  steal_attempt:  { label:'Go for Steal',  emoji:'🤜', staminaCost:10, desc:'Defensive gamble — risky!' },
  block_attempt:  { label:'Block Shot',    emoji:'✋', staminaCost:12, desc:'Contest hard at rim' },
}

export default function BasketballGame({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [quarter, setQuarter] = useState(1)
  const [clock, setClock] = useState(90)
  const [phase, setPhase] = useState<GamePhase>('pregame')
  const [stamina, setStamina] = useState(100)
  const [energy, setEnergy] = useState(100) // crowd energy / momentum
  const [possession, setPossession] = useState<'player' | 'ai'>('player')
  const [shotMeter, setShotMeter] = useState(0)
  const [shootingMove, setShootingMove] = useState<MoveType | null>(null)
  const [shotResult, setShotResult] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>(['Tip-off! You got possession.'])
  const [freethrows, setFreethrows] = useState(0)
  const [ftZone, setFtZone] = useState(0) // 0-100 timing window
  const meterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (phase !== 'playing') return
    clockRef.current = setInterval(() => {
      setClock(c => {
        if (c <= 0) { nextQuarter(); return 90 }
        return c - 1
      })
      setStamina(s => Math.min(100, s + 2))
      // AI gets possessions randomly
      if (possession === 'ai') {
        // handled in aiTurn
      }
    }, 1000)
    return () => { if (clockRef.current) clearInterval(clockRef.current) }
  }, [phase, possession])

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-5), msg])

  const nextQuarter = () => {
    if (clockRef.current) clearInterval(clockRef.current)
    if (quarter === 2) { setPhase('halftime'); return }
    if (quarter >= 4) { setPhase('gameover'); finishGame(); return }
    setQuarter(q => q + 1)
    setClock(90)
    addLog(`Q${quarter + 1} starts!`)
  }

  const finishGame = () => {
    const won = score.player > score.ai
    if (won) { store.earnCash(1500); store.earnXp(400) }
    store.setNotif(won ? '🏀 Buzzer beater! +$1,500 +400 XP' : '😤 L. Hit the gym.')
    setPhase('gameover')
  }

  // Shot timing mechanic — tap at the right moment
  const startShot = (move: MoveType) => {
    if (phase !== 'playing' || possession !== 'player') return
    const m = MOVES[move]
    if (stamina < m.staminaCost) { addLog('⚡ Too tired! Rest a moment.'); return }
    if (move === 'dunk' && energy < 70) { addLog('💪 Not enough energy for the dunk!'); return }

    setShootingMove(move)
    setStamina(s => s - m.staminaCost)

    if (move === 'steal_attempt' || move === 'block_attempt') {
      const success = Math.random() > 0.55
      if (success) {
        addLog(move === 'steal_attempt' ? '🤜 STEAL! You got the ball!' : '✋ BLOCKED! Great defense!')
        setEnergy(e => Math.min(100, e + 15))
        setPossession('player')
      } else {
        addLog(move === 'steal_attempt' ? '❌ Reach foul! Free throws for AI.' : '❌ Foul! Free throws for AI.')
        setFreethrows(2)
        setPhase('freethrow')
        doAIFreethrows(2)
      }
      setShootingMove(null)
      return
    }

    // Start shot meter
    setShotMeter(0)
    if (meterRef.current) clearInterval(meterRef.current)
    meterRef.current = setInterval(() => {
      setShotMeter(v => {
        if (v >= 100) {
          clearInterval(meterRef.current!)
          resolveShot(move, 100) // missed timing — too late
          return 0
        }
        return v + 3.5
      })
    }, 30)
  }

  const tapShot = () => {
    if (!shootingMove || !meterRef.current) return
    clearInterval(meterRef.current)
    const meter = shotMeter
    resolveShot(shootingMove, meter)
    setShotMeter(0)
    setShootingMove(null)
  }

  const resolveShot = (move: MoveType, meterVal: number) => {
    const m = MOVES[move]
    if (!m.shot) return

    // Perfect zone: 45-75 on the meter
    const inZone = meterVal >= 45 && meterVal <= 75
    const close = meterVal >= 35 && meterVal <= 85
    const baseShot = SHOTS[m.shot]

    let finalPct = baseShot.pct
    if (inZone) finalPct = Math.min(0.95, baseShot.pct + 0.3)
    else if (close) finalPct = baseShot.pct + 0.1
    else finalPct = Math.max(0.05, baseShot.pct - 0.25)

    if (move === 'dunk') finalPct = inZone ? 0.95 : 0.6

    const made = Math.random() < finalPct
    const pts = baseShot.points

    if (made) {
      const result = inZone ? `🎯 SWISH! ${pts} points!` : `✅ ${baseShot.label} — ${pts} pts`
      setScore(s => ({ ...s, player: s.player + pts }))
      addLog(result)
      setShotResult(inZone ? '🎯 PERFECT!' : '✅ MADE!')
      setEnergy(e => Math.min(100, e + (inZone ? 20 : 8)))
    } else {
      const miss = meterVal > 75 ? '📵 Too late — bricked!' : meterVal < 45 ? '📵 Too early — short!' : '📵 Off the rim!'
      addLog(miss)
      setShotResult('📵 MISS')
      setEnergy(e => Math.max(0, e - 5))
    }

    setTimeout(() => {
      setShotResult(null)
      setPossession('ai')
      aiTurn()
    }, 1200)
  }

  const aiTurn = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const aiMoves: ShotZone[] = ['paint','midrange','three','paint','midrange']
      const zone = aiMoves[Math.floor(Math.random() * aiMoves.length)]
      const shot = SHOTS[zone]
      // AI difficulty scales with energy
      const difficulty = energy > 70 ? 0.85 : energy > 40 ? 1.0 : 1.2
      const made = Math.random() < (shot.pct / difficulty)

      if (made) {
        setScore(s => ({ ...s, ai: s.ai + shot.points }))
        addLog(`🤖 AI scores! ${shot.label} — ${shot.points} pts`)
        setEnergy(e => Math.max(0, e - 10))
      } else {
        addLog(`🛡 AI missed! Your ball.`)
        setEnergy(e => Math.min(100, e + 5))
      }
      setPossession('player')
    }, 1800)
  }

  const doAIFreethrows = (count: number) => {
    setTimeout(() => {
      let made = 0
      for (let i = 0; i < count; i++) if (Math.random() > 0.25) made++
      setScore(s => ({ ...s, ai: s.ai + made }))
      addLog(`🤖 AI FT: ${made}/${count}`)
      setPossession('player')
      setFreethrows(0)
      setPhase('playing')
    }, 2000)
  }

  const formatClock = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  return (
    <div style={{ width:'100%',height:'100%',background:'#05020a',fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none' }}>
      {/* Scoreboard */}
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid #ff880033',background:'rgba(5,0,10,0.95)' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <div style={{ flex:1,display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'center' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ff8800',fontSize:22,fontWeight:900 }}>{score.player}</div>
            <div style={{ color:'#888',fontSize:10 }}>{store.player.name||'YOU'}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffd700',fontSize:13,fontWeight:700 }}>Q{quarter} · {formatClock(clock)}</div>
            <div style={{ color:'#555',fontSize:10 }}>Energy {Math.round(energy)}%</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#aaa',fontSize:22,fontWeight:900 }}>{score.ai}</div>
            <div style={{ color:'#888',fontSize:10 }}>CITY STARS</div>
          </div>
        </div>
      </div>

      {/* Court */}
      <div style={{ flex:1,position:'relative',background:'linear-gradient(180deg,#1a0a00 0%,#0d0500 100%)' }}>
        {/* Court lines */}
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.25 }} viewBox="0 0 300 200">
          <rect x="10" y="10" width="280" height="180" fill="none" stroke="#ff8800" strokeWidth="2"/>
          <circle cx="150" cy="100" r="30" fill="none" stroke="#ff8800" strokeWidth="1"/>
          <line x1="150" y1="10" x2="150" y2="190" stroke="#ff8800" strokeWidth="1"/>
          <rect x="10" y="50" width="70" height="100" fill="none" stroke="#ff8800" strokeWidth="1"/>
          <rect x="220" y="50" width="70" height="100" fill="none" stroke="#ff8800" strokeWidth="1"/>
          <path d="M 10 40 Q 80 100 10 160" fill="none" stroke="#ff8800" strokeWidth="1"/>
          <path d="M 290 40 Q 220 100 290 160" fill="none" stroke="#ff8800" strokeWidth="1"/>
        </svg>

        {/* Players */}
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'space-around' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:40,filter:`drop-shadow(0 0 ${possession==='player'?'16px':'4px'} #ff8800)`,transition:'filter 0.3s' }}>🏃</div>
            <div style={{ color:'#ff8800',fontSize:10,fontWeight:700 }}>{possession==='player'?'🏀 YOU':'YOU'}</div>
            <div style={{ width:60,height:4,background:'#111',borderRadius:2,marginTop:4 }}>
              <div style={{ background:'#ff8800',height:'100%',width:`${stamina}%`,borderRadius:2,transition:'width 0.3s' }} />
            </div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:40,filter:`drop-shadow(0 0 ${possession==='ai'?'16px':'4px'} #aaa)`,transition:'filter 0.3s' }}>🤖</div>
            <div style={{ color:'#aaa',fontSize:10,fontWeight:700 }}>{possession==='ai'?'🏀 AI':'AI'}</div>
          </div>
        </div>

        {/* Shot meter */}
        {shootingMove && (
          <div style={{ position:'absolute',bottom:'20%',left:'50%',transform:'translateX(-50%)',textAlign:'center',zIndex:10 }}>
            <div style={{ color:'#ffd700',fontSize:13,marginBottom:6,fontWeight:700 }}>TAP TO SHOOT!</div>
            <div style={{ width:200,height:14,background:'#111',borderRadius:7,border:'1px solid #333',overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${shotMeter}%`,background:shotMeter>=45&&shotMeter<=75?'#00cc44':shotMeter>=35&&shotMeter<=85?'#ffaa00':'#ff4400',borderRadius:7,transition:'width 0.02s' }} />
            </div>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:9,color:'#555',marginTop:2,width:200 }}>
              <span>EARLY</span><span style={{ color:'#00cc44' }}>PERFECT ZONE</span><span>LATE</span>
            </div>
            <button onClick={tapShot} style={{ marginTop:10,background:'#ff880022',border:'2px solid #ff8800',color:'#ff8800',borderRadius:8,padding:'10px 30px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:16 }}>
              TAP! 🏀
            </button>
          </div>
        )}

        {/* Shot result */}
        {shotResult && (
          <div style={{ position:'absolute',top:'25%',left:'50%',transform:'translate(-50%,-50%)',fontSize:24,fontWeight:900,color:shotResult.includes('MISS')?'#ff4400':shotResult.includes('PERFECT')?'#ffd700':'#00cc44',textShadow:`0 0 20px currentColor` }}>
            {shotResult}
          </div>
        )}

        {/* Energy bar */}
        <div style={{ position:'absolute',top:8,right:8 }}>
          <div style={{ color:'#555',fontSize:9,marginBottom:2 }}>CROWD ENERGY</div>
          <div style={{ width:80,height:6,background:'#111',borderRadius:3 }}>
            <div style={{ height:'100%',width:`${energy}%`,background:energy>60?'#ff8800':energy>30?'#ffaa00':'#ff4400',borderRadius:3,transition:'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Log */}
      <div style={{ height:48,overflowY:'auto',padding:'4px 12px',background:'rgba(5,0,10,0.95)',borderTop:'1px solid #ff880022' }}>
        {log.slice(-2).map((l,i)=><div key={i} style={{ fontSize:11,color:l.includes('AI')?'#aaa':l.includes('SWISH')||l.includes('STEAL')||l.includes('BLOCK')?'#ffd700':'#ff8800' }}>{l}</div>)}
      </div>

      {/* Controls */}
      <div style={{ padding:'8px 10px',background:'rgba(5,0,10,0.98)',borderTop:'1px solid #ff880033' }}>
        {phase === 'pregame' && (
          <button onClick={() => { setPhase('playing'); addLog('Tip-off! You got possession.') }}
            style={{ width:'100%',background:'#ff880022',border:'2px solid #ff8800',color:'#ff8800',borderRadius:8,padding:'14px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:16 }}>
            🏀 TIP OFF!
          </button>
        )}
        {phase === 'playing' && possession === 'player' && !shootingMove && (
          <div>
            <div style={{ color:'#555',fontSize:10,marginBottom:6,letterSpacing:2 }}>YOUR MOVE · STA {Math.round(stamina)}%</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6 }}>
              {(Object.entries(MOVES) as [MoveType,typeof MOVES[MoveType]][]).map(([key,m])=>(
                <button key={key} onClick={()=>startShot(key)}
                  disabled={stamina<m.staminaCost||(key==='dunk'&&energy<70)}
                  style={{ background:stamina>=m.staminaCost?'#ff880011':'transparent',border:`1px solid ${stamina>=m.staminaCost?'#ff880055':'#222'}`,borderRadius:6,padding:'7px 4px',cursor:stamina>=m.staminaCost?'pointer':'default',fontFamily:'monospace',textAlign:'center' }}>
                  <div style={{ fontSize:16 }}>{m.emoji}</div>
                  <div style={{ color:stamina>=m.staminaCost?'#ff8800':'#333',fontSize:10,fontWeight:700 }}>{m.label}</div>
                  <div style={{ color:'#555',fontSize:9 }}>{m.staminaCost} STA</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {phase === 'playing' && possession === 'ai' && (
          <div style={{ textAlign:'center',color:'#888',fontSize:13,padding:10 }}>🤖 AI has ball — watch for the shot...</div>
        )}
        {(phase === 'halftime') && (
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffd700',fontSize:15,fontWeight:700,marginBottom:8 }}>HALFTIME · You {score.player} – AI {score.ai}</div>
            <button onClick={() => { setQuarter(3); setClock(90); setPossession('player'); setPhase('playing'); addLog('2nd half!') }}
              style={{ background:'#ff880022',border:'1px solid #ff8800',color:'#ff8800',borderRadius:6,padding:'10px 30px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>
              START 2ND HALF
            </button>
          </div>
        )}
        {phase === 'gameover' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ color:score.player>score.ai?'#ffd700':'#ff4400',fontSize:16,fontWeight:900,marginBottom:8 }}>
              {score.player>score.ai?'🏆 HOLY HOOPS WIN!':'😤 L. Practice more.'}
            </div>
            <div style={{ color:'#888',fontSize:13,marginBottom:10 }}>Final: {score.player} – {score.ai}</div>
            <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
              <button onClick={()=>{setScore({player:0,ai:0});setQuarter(1);setClock(90);setPhase('pregame');setStamina(100);setEnergy(100);setLog(['Tip-off! You got possession.'])}} style={{ background:'#ff880022',border:'1px solid #ff8800',color:'#ff8800',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>REMATCH</button>
              <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
