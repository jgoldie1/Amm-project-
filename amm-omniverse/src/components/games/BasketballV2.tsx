// AMM Basketball v2 — NBA 2K25-level mechanics
// Features: Rhythm Shooting (2K25 ProPlay), Shot Timing Profiles,
// Momentum system, Defensive cutoff, Signature Go-To moves, MyCareer arc

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

// ── Types ────────────────────────────────────────────────────────────────────

type ShotType = 'floater' | 'pull_up' | 'stepback' | 'catch_shoot' | 'post_hook' | 'alley_oop' | 'and_one' | 'clutch_three'
type DefenseAction = 'contest' | 'steal' | 'block' | 'body_up' | 'help_D' | 'deny'
type OffAction = 'drive_left' | 'drive_right' | 'iso' | 'pick_roll' | 'spot_up' | 'cut' | 'post_up' | 'transition'
type GameMode = 'pregame' | 'live' | 'timeout' | 'halftime' | 'ot' | 'final'
type Quarter = 1 | 2 | 3 | 4 | 5 // 5 = OT

// ── Rhythm Shooting (2K25-inspired) ──────────────────────────────────────────
// Rhythm has 3 phases: rise, peak, release
// Each phase needs input. Miss a phase = penalty. Hit all 3 = perfect shot.

interface RhythmPhase { label: string; window: [number,number]; hit: boolean | null }

const BASE_SHOT_PCT: Record<ShotType,number> = {
  floater: 0.52, pull_up: 0.46, stepback: 0.38, catch_shoot: 0.56,
  post_hook: 0.55, alley_oop: 0.72, and_one: 0.60, clutch_three: 0.34,
}

const SHOT_POINTS: Record<ShotType,number> = {
  floater:2, pull_up:2, stepback:3, catch_shoot:3,
  post_hook:2, alley_oop:2, and_one:2, clutch_three:3,
}

// ── Player archetypes (MyCareer builder) ─────────────────────────────────────
const ARCHETYPES = [
  { id:'two_way',   label:'Two-Way',        emoji:'⚔️', off:70, def:85, speed:82, rebnd:74, pass:72, three:65 },
  { id:'shot_crtr', label:'Shot Creator',   emoji:'🎯', off:90, def:58, speed:78, rebnd:65, pass:75, three:85 },
  { id:'playmaker', label:'Playmaker',      emoji:'🎪', off:72, def:66, speed:88, rebnd:60, pass:95, three:72 },
  { id:'slasher',   label:'Slasher',        emoji:'⚡', off:85, def:70, speed:94, rebnd:68, pass:65, three:55 },
  { id:'big',       label:'Glass Cleaner',  emoji:'💪', off:78, def:88, speed:62, rebnd:95, pass:58, three:42 },
  { id:'sharp',     label:'Sharpshooter',   emoji:'🏹', off:80, def:60, speed:75, rebnd:60, pass:70, three:95 },
]

type ArchetypeId = typeof ARCHETYPES[number]['id']

interface PlayerBuild {
  archetype: ArchetypeId
  name: string
  overall: number
  badges: string[]
  stats: { off:number; def:number; speed:number; rebnd:number; pass:number; three:number }
}

export default function BasketballV2({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [gameMode, setGameMode] = useState<GameMode>('pregame')
  const [setupStep, setSetupStep] = useState<'build'|'ready'>('build')
  const [selectedArch, setSelectedArch] = useState<ArchetypeId>('two_way')
  const [playerBuild, setPlayerBuild] = useState<PlayerBuild | null>(null)

  const [score, setScore] = useState({ p:0, ai:0 })
  const [quarter, setQuarter] = useState<Quarter>(1)
  const [clock, setClock] = useState(150) // 2.5 min quarters
  const [shotClock, setShotClock] = useState(24)
  const [possession, setPossession] = useState<'player'|'ai'>('player')
  const [momentum, setMomentum] = useState(50) // 0=AI hot, 100=player hot
  const [playerStamina, setPlayerStamina] = useState(100)
  const [streak, setStreak] = useState(0)

  // Rhythm shooting state
  const [shootingFlow, setShootingFlow] = useState<'none'|'selecting_off'|'rhythm'|'result'>('none')
  const [pendingShot, setPendingShot] = useState<ShotType|null>(null)
  const [rhythmPhases, setRhythmPhases] = useState<RhythmPhase[]>([])
  const [rhythmStep, setRhythmStep] = useState(0)
  const [rhythmBar, setRhythmBar] = useState(0)
  const [shotResult, setShotResult] = useState<{made:boolean;pts:number;msg:string}|null>(null)

  const [pendingDef, setPendingDef] = useState<DefenseAction|null>(null)
  const [log, setLog] = useState<string[]>(['Tip off! Build your MyPlayer first.'])
  const [showStats, setShowStats] = useState(false)

  const clockRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const rhythmRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const aiTimerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const shotClockRef = useRef<ReturnType<typeof setInterval>|null>(null)

  const addLog = useCallback((msg:string) => setLog(p=>[...p.slice(-7),msg]),[])

  // Game clock
  useEffect(() => {
    if (gameMode !== 'live') return
    clockRef.current = setInterval(() => {
      setClock(c => {
        if (c <= 0) { endQuarter(); return 150 }
        return c - 1
      })
      setPlayerStamina(s => Math.min(100, s + 1.5))
    }, 1000)
    return () => clearInterval(clockRef.current!)
  }, [gameMode, quarter])

  // Shot clock
  useEffect(() => {
    if (gameMode !== 'live' || shootingFlow !== 'none') return
    setShotClock(24)
    shotClockRef.current = setInterval(() => {
      setShotClock(s => {
        if (s <= 0) {
          addLog('⏰ Shot clock violation! Ball goes to AI.')
          turnover()
          return 24
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(shotClockRef.current!)
  }, [gameMode, possession, shootingFlow])

  // AI possession
  useEffect(() => {
    if (gameMode !== 'live' || possession !== 'ai') return
    aiTimerRef.current = setTimeout(() => {
      const build = playerBuild
      const defBonus = build ? build.stats.def / 100 : 0.7
      const aiAtk = ['floater','pull_up','catch_shoot','post_hook'] as ShotType[]
      const shot = aiAtk[Math.floor(Math.random()*aiAtk.length)]
      const defense = pendingDef
      let pct = BASE_SHOT_PCT[shot]

      if (defense === 'contest') pct -= 0.18
      else if (defense === 'block') pct -= 0.28
      else if (defense === 'body_up') pct -= 0.12
      pct = Math.max(0.05, pct - (defBonus * 0.1))
      const made = Math.random() < pct

      if (made) {
        const pts = SHOT_POINTS[shot]
        setScore(s => ({...s, ai: s.ai + pts}))
        setMomentum(m => Math.max(0, m - 12))
        setStreak(0)
        addLog(`🤖 AI ${shot.replace('_',' ')} — ${pts} pts!`)
      } else {
        addLog(`🛡 AI missed! ${defense ? `(${defense.replace('_',' ')} worked!)` : 'Rebound!'}`)
        setMomentum(m => Math.min(100, m + 8))
      }
      setPendingDef(null)
      setPossession('player')
      setShotClock(24)
    }, 1800)
    return () => clearTimeout(aiTimerRef.current!)
  }, [possession, gameMode])

  const endQuarter = () => {
    clearInterval(clockRef.current!); clearInterval(aiTimerRef.current!); clearInterval(shotClockRef.current!)
    if (quarter === 2) { setGameMode('halftime'); return }
    if (quarter === 4) {
      if (score.p === score.ai) { setQuarter(5); setClock(75); setGameMode('ot'); setTimeout(()=>setGameMode('live'),2000) }
      else endGame()
      return
    }
    setQuarter(q => (q+1) as Quarter)
    setClock(150); setShotClock(24)
    addLog(`Q${quarter+1} starts!`)
  }

  const endGame = () => {
    setGameMode('final')
    const won = score.p > score.ai
    if (won) { store.earnCash(2500); store.earnXp(600); store.completeMission('m3') }
    store.setNotif(won ? '🏀 W! +$2,500 +600 XP' : '😤 L. Hit the gym.')
  }

  const turnover = () => { setPossession('ai'); setShotClock(24) }

  // ── Rhythm Shooting ─────────────────────────────────────────────────────────

  const startShot = (shot: ShotType) => {
    if (gameMode !== 'live' || possession !== 'player') return
    if (playerStamina < 8) { addLog('⚡ Too tired! Rest.'); return }
    setPlayerStamina(s => s - 10)
    setPendingShot(shot)
    clearInterval(shotClockRef.current!)

    // Generate 3 rhythm windows based on shot type
    const windows: RhythmPhase[] = [
      { label:'RISE', window:[30,55], hit:null },
      { label:'PEAK', window:[48,72], hit:null },
      { label:'RELEASE', window:[60,82], hit:null },
    ]
    if (shot === 'clutch_three' || shot === 'stepback') {
      windows[2].window = [65,80] // tighter release
    }
    setRhythmPhases(windows)
    setRhythmStep(0)
    setRhythmBar(0)
    setShootingFlow('rhythm')

    rhythmRef.current = setInterval(() => {
      setRhythmBar(v => {
        if (v >= 100) {
          clearInterval(rhythmRef.current!)
          // missed all remaining phases
          setShootingFlow('result')
          resolveRhythmShot(shot, windows)
          return 0
        }
        return v + 2.2
      })
    }, 25)
  }

  const tapRhythm = () => {
    if (shootingFlow !== 'rhythm') return
    const bar = rhythmBar
    setRhythmPhases(prev => {
      const updated = [...prev]
      const phase = updated[rhythmStep]
      if (!phase) return prev
      const inWindow = bar >= phase.window[0] && bar <= phase.window[1]
      updated[rhythmStep] = { ...phase, hit: inWindow }
      const nextStep = rhythmStep + 1
      if (nextStep >= updated.length) {
        // All phases done
        clearInterval(rhythmRef.current!)
        setShootingFlow('result')
        setTimeout(() => resolveRhythmShot(pendingShot!, updated), 100)
      } else {
        setRhythmStep(nextStep)
      }
      return updated
    })
  }

  const resolveRhythmShot = (shot: ShotType, phases: RhythmPhase[]) => {
    const hits = phases.filter(p => p.hit === true).length
    const build = playerBuild
    const archStats = build?.stats
    const threeBonus = (archStats?.three ?? 70) / 100 * 0.15
    const offBonus = (archStats?.off ?? 70) / 100 * 0.1

    let pct = BASE_SHOT_PCT[shot] + offBonus
    if (shot === 'catch_shoot' || shot === 'clutch_three') pct += threeBonus
    if (hits === 3) pct = Math.min(0.97, pct + 0.28)
    else if (hits === 2) pct += 0.10
    else if (hits === 1) pct -= 0.05
    else pct -= 0.20

    // Momentum bonus
    if (momentum > 70) pct += 0.08
    if (momentum < 30) pct -= 0.08

    const made = Math.random() < Math.max(0.02, pct)
    const pts = SHOT_POINTS[shot]
    const rhythmLabel = hits === 3 ? '🎯 PERFECT!' : hits === 2 ? '✅ GOOD' : hits === 1 ? '⚠️ OFF' : '❌ BRICKS'

    if (made) {
      const isStreak = streak >= 2
      const actualPts = isStreak && pts === 3 ? 3 : pts
      setScore(s => ({...s, p: s.p + actualPts}))
      setStreak(x => x + 1)
      setMomentum(m => Math.min(100, m + (hits===3?18:10)))
      const msg = streak >= 2 ? `🔥 ON FIRE! ${shot.replace('_',' ')} — ${actualPts} pts! ${rhythmLabel}` :
                  `${hits===3?'🎯':'✅'} ${shot.replace('_',' ')} — ${actualPts} pts! ${rhythmLabel}`
      setShotResult({ made:true, pts:actualPts, msg })
      addLog(msg)
    } else {
      setStreak(0)
      setMomentum(m => Math.max(0, m - 6))
      const msg = `${shot.replace('_',' ')} — MISS. ${rhythmLabel}`
      setShotResult({ made:false, pts:0, msg })
      addLog(`📵 ${msg}`)
    }

    setTimeout(() => {
      setShotResult(null)
      setShootingFlow('none')
      setPendingShot(null)
      setPossession('ai')
      setShotClock(24)
    }, 1400)
  }

  // ── Build screen ─────────────────────────────────────────────────────────────

  const confirmBuild = () => {
    const arch = ARCHETYPES.find(a => a.id === selectedArch)!
    const build: PlayerBuild = {
      archetype: arch.id,
      name: store.player.name || 'MyPlayer',
      overall: Math.floor((arch.off + arch.def + arch.speed + arch.rebnd + arch.pass + arch.three) / 6),
      badges: ['Limitless Range','Posterizer','Perimeter Lockdown'].slice(0, arch.three > 80 ? 3 : arch.def > 80 ? 2 : 1),
      stats: { off:arch.off, def:arch.def, speed:arch.speed, rebnd:arch.rebnd, pass:arch.pass, three:arch.three },
    }
    setPlayerBuild(build)
    setSetupStep('ready')
  }

  const startGame = () => { setGameMode('live'); addLog(`Tip off! You're a ${ARCHETYPES.find(a=>a.id===selectedArch)?.label}!`) }

  const formatClock = (s:number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`
  const arch = ARCHETYPES.find(a=>a.id===selectedArch)!

  // ── Render ───────────────────────────────────────────────────────────────────

  if (gameMode === 'pregame') {
    if (setupStep === 'build') return (
      <div style={{ width:'100%',height:'100%',background:'#050515',fontFamily:'monospace',display:'flex',flexDirection:'column',overflowY:'auto' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderBottom:'1px solid #ff880033' }}>
          <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
          <span style={{ color:'#ff8800',fontWeight:900,fontSize:14,letterSpacing:3 }}>🏀 MYPLAYER BUILDER</span>
        </div>
        <div style={{ padding:16 }}>
          <p style={{ color:'#888',fontSize:12,marginBottom:14 }}>Choose your archetype. Each unlocks different skills, badges, and shot types.</p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16 }}>
            {ARCHETYPES.map(a => (
              <div key={a.id} onClick={()=>setSelectedArch(a.id)} style={{ padding:12,borderRadius:8,cursor:'pointer',background:selectedArch===a.id?'rgba(255,136,0,0.1)':'rgba(5,5,30,0.9)',border:`2px solid ${selectedArch===a.id?'#ff8800':'#1a1a3e'}`,transition:'all 0.12s' }}>
                <div style={{ fontSize:28,marginBottom:4 }}>{a.emoji}</div>
                <div style={{ color:selectedArch===a.id?'#ff8800':'#ccc',fontWeight:700,fontSize:13 }}>{a.label}</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginTop:8 }}>
                  {Object.entries({OFF:a.off,DEF:a.def,SPD:a.speed,REB:a.rebnd,PAS:a.pass,'3PT':a.three}).map(([k,v])=>(
                    <div key={k} style={{ fontSize:10 }}>
                      <div style={{ color:'#555',marginBottom:1 }}>{k}</div>
                      <div style={{ background:'#111',borderRadius:2,height:4 }}>
                        <div style={{ background:v>85?'#00cc44':v>70?'#ff8800':'#ff4400',height:'100%',width:`${v}%`,borderRadius:2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Overall preview */}
          <div style={{ background:'rgba(255,136,0,0.08)',border:'1px solid #ff880044',borderRadius:10,padding:14,marginBottom:14 }}>
            <div style={{ color:'#ff8800',fontWeight:700,marginBottom:4 }}>{arch.emoji} {arch.label} — Overall {Math.floor((arch.off+arch.def+arch.speed+arch.rebnd+arch.pass+arch.three)/6)}</div>
            <div style={{ color:'#888',fontSize:12 }}>
              {arch.id==='shot_crtr'?'Best: Pull-up jumpers, stepbacks, catch-and-shoot. Rhythm window: wide.':
               arch.id==='slasher'?'Best: Drives, dunks, floaters. Stamina regen +20%.':
               arch.id==='playmaker'?'Best: Pick-and-roll, passing, court vision. AI teammates score 15% more.':
               arch.id==='big'?'Best: Post hooks, putbacks, alley-oops. Rebound wins.':
               arch.id==='sharp'?'Best: Catch-and-shoot, corner 3s. Rhythm window: narrow but huge reward.':
               'Balanced. Good defender and scorer. Rhythm window: standard.'}
            </div>
          </div>
          <button onClick={confirmBuild} style={{ width:'100%',background:'#ff880022',border:'2px solid #ff8800',color:'#ff8800',borderRadius:8,padding:'14px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:16 }}>
            LOCK IN BUILD →
          </button>
        </div>
      </div>
    )

    return (
      <div style={{ width:'100%',height:'100%',background:'#050515',fontFamily:'monospace',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20 }}>
        <div style={{ fontSize:48,marginBottom:12 }}>{arch.emoji}</div>
        <div style={{ color:'#ff8800',fontSize:20,fontWeight:900 }}>{playerBuild?.name}</div>
        <div style={{ color:'#888',marginBottom:4 }}>{arch.label} · {playerBuild?.overall} OVR</div>
        <div style={{ display:'flex',gap:8,marginBottom:20,flexWrap:'wrap',justifyContent:'center' }}>
          {playerBuild?.badges.map(b=>(
            <span key={b} style={{ background:'#ffd70022',border:'1px solid #ffd70044',color:'#ffd700',borderRadius:4,padding:'3px 8px',fontSize:11 }}>🏅 {b}</span>
          ))}
        </div>
        <div style={{ color:'#555',fontSize:12,marginBottom:6,textAlign:'center' }}>
          Rhythm Shooting: Tap TAP button at each highlighted phase to build shot accuracy.
        </div>
        <div style={{ color:'#555',fontSize:12,marginBottom:20,textAlign:'center' }}>
          3 perfect phases = 90%+ make rate. Miss all 3 = brick.
        </div>
        <button onClick={startGame} style={{ background:'#ff880022',border:'2px solid #ff8800',color:'#ff8800',borderRadius:8,padding:'14px 50px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:18 }}>
          🏀 TIP OFF!
        </button>
        <button onClick={()=>setSetupStep('build')} style={{ marginTop:10,background:'none',border:'none',color:'#444',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← Rebuild</button>
      </div>
    )
  }

  return (
    <div style={{ width:'100%',height:'100%',background:'#050515',fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none' }}>
      {/* Scoreboard */}
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid #ff880033',background:'rgba(0,0,10,0.95)' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>←</button>
        <div style={{ flex:1,display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'center' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ff8800',fontSize:22,fontWeight:900 }}>{score.p}</div>
            <div style={{ color:'#888',fontSize:9 }}>{playerBuild?.name||'YOU'} · {arch.emoji}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffd700',fontSize:12,fontWeight:700 }}>Q{quarter} · {formatClock(clock)}</div>
            <div style={{ color:shotClock<=5?'#ff4400':'#555',fontSize:10 }}>⏱{shotClock}s SHOT</div>
            <div style={{ color:'#555',fontSize:9 }}>{streak>=2?`🔥${streak} STREAK!`:''}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#aaa',fontSize:22,fontWeight:900 }}>{score.ai}</div>
            <div style={{ color:'#888',fontSize:9 }}>CITY STARS</div>
          </div>
        </div>
        <button onClick={()=>setShowStats(v=>!v)} style={{ background:'#00ccff11',border:'1px solid #00ccff33',color:'#00ccff',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📊</button>
      </div>

      {/* Momentum bar */}
      <div style={{ height:6,background:'#111' }}>
        <div style={{ height:'100%',width:`${momentum}%`,background:`hsl(${momentum*1.2},80%,50%)`,transition:'width 0.5s' }} />
      </div>

      {/* Court */}
      <div style={{ flex:1,position:'relative',background:'linear-gradient(180deg,#0d0800 0%,#050512 100%)',overflow:'hidden' }}>
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.15 }} viewBox="0 0 300 200">
          <rect x="10" y="10" width="280" height="180" fill="none" stroke="#ff8800" strokeWidth="1.5"/>
          <circle cx="150" cy="100" r="25" fill="none" stroke="#ff8800" strokeWidth="1"/>
          <line x1="150" y1="10" x2="150" y2="190" stroke="#ff8800" strokeWidth="0.5"/>
          <rect x="10" y="55" width="65" height="90" fill="none" stroke="#ff8800" strokeWidth="1"/>
          <rect x="225" y="55" width="65" height="90" fill="none" stroke="#ff8800" strokeWidth="1"/>
          <path d="M 270 55 Q 295 100 270 145" fill="none" stroke="#ff8800" strokeWidth="1"/>
          <path d="M 30 55 Q 5 100 30 145" fill="none" stroke="#ff8800" strokeWidth="1"/>
        </svg>

        {/* Players */}
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'space-around' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48,filter:`drop-shadow(0 0 ${possession==='player'?'20px':'6px'} #ff8800)`,transition:'filter 0.2s' }}>
              {shootingFlow==='rhythm'?'🎯':possession==='player'?'🏀':'🏃'}
            </div>
            <div style={{ color:'#ff8800',fontSize:9 }}>{possession==='player'?'● BALL':''}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48,filter:`drop-shadow(0 0 ${possession==='ai'?'20px':'6px'} #888)`,transition:'filter 0.2s' }}>
              {possession==='ai'?'🤖🏀':'🤖'}
            </div>
          </div>
        </div>

        {/* Rhythm shooting overlay */}
        {shootingFlow === 'rhythm' && (
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:20 }}>
            <div style={{ color:'#ffd700',fontSize:14,fontWeight:700,marginBottom:8 }}>{pendingShot?.replace('_',' ').toUpperCase()}</div>
            {/* Phase indicators */}
            <div style={{ display:'flex',gap:12,marginBottom:12 }}>
              {rhythmPhases.map((p,i)=>(
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ width:40,height:40,borderRadius:6,border:`2px solid ${i===rhythmStep?'#ffd700':p.hit===true?'#00cc44':p.hit===false?'#ff4400':'#333'}`,background:i===rhythmStep?'rgba(255,215,0,0.1)':p.hit===true?'rgba(0,204,68,0.15)':p.hit===false?'rgba(255,68,0,0.15)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>
                    {p.hit===true?'✅':p.hit===false?'❌':i===rhythmStep?'👆':'○'}
                  </div>
                  <div style={{ color:i===rhythmStep?'#ffd700':'#555',fontSize:10,marginTop:3 }}>{p.label}</div>
                </div>
              ))}
            </div>
            {/* Rhythm bar */}
            <div style={{ width:280,height:20,background:'#111',borderRadius:10,border:'1px solid #333',overflow:'hidden',position:'relative',marginBottom:12 }}>
              {/* Perfect window highlight */}
              {rhythmPhases[rhythmStep] && (
                <div style={{ position:'absolute',left:`${rhythmPhases[rhythmStep].window[0]}%`,width:`${rhythmPhases[rhythmStep].window[1]-rhythmPhases[rhythmStep].window[0]}%`,height:'100%',background:'rgba(0,255,100,0.3)',borderLeft:'2px solid #00cc44',borderRight:'2px solid #00cc44' }} />
              )}
              <div style={{ height:'100%',width:`${rhythmBar}%`,background:'#ffd700',borderRadius:10,transition:'width 0.02s' }} />
            </div>
            <div style={{ color:'#888',fontSize:11,marginBottom:10 }}>Tap when bar reaches green zone</div>
            <button onClick={tapRhythm} style={{ background:'#ff880022',border:'2px solid #ff8800',color:'#ff8800',borderRadius:8,padding:'12px 50px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:18 }}>
              TAP 🏀
            </button>
          </div>
        )}

        {/* Shot result */}
        {shotResult && (
          <div style={{ position:'absolute',top:'20%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center',zIndex:30 }}>
            <div style={{ fontSize:shotResult.made?32:24,fontWeight:900,color:shotResult.made?'#ffd700':'#ff4400',textShadow:`0 0 20px currentColor` }}>
              {shotResult.made?`+${shotResult.pts}`:'MISS'}
            </div>
            <div style={{ color:'#fff',fontSize:13,marginTop:4 }}>{shotResult.msg.split('!')[0]}</div>
          </div>
        )}

        {/* Halftime / Final overlays */}
        {(gameMode === 'halftime' || gameMode === 'final' || gameMode === 'ot') && (
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:40 }}>
            {gameMode==='halftime' && <>
              <div style={{ color:'#ffd700',fontSize:18,fontWeight:900,marginBottom:6 }}>HALFTIME</div>
              <div style={{ color:'#fff',fontSize:28,fontWeight:900,marginBottom:12 }}>{score.p} – {score.ai}</div>
              <button onClick={()=>{setQuarter(3);setClock(150);setPossession('player');setGameMode('live');addLog('2nd half!')}} style={{ background:'#ff880022',border:'1px solid #ff8800',color:'#ff8800',borderRadius:6,padding:'10px 30px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>START 2ND HALF</button>
            </>}
            {gameMode==='ot' && <>
              <div style={{ color:'#ff4400',fontSize:18,fontWeight:900,marginBottom:8 }}>OVERTIME!</div>
              <div style={{ color:'#888',fontSize:12 }}>Game tied at {score.p}</div>
            </>}
            {gameMode==='final' && <>
              <div style={{ fontSize:48,marginBottom:8 }}>{score.p>score.ai?'🏆':'😤'}</div>
              <div style={{ color:score.p>score.ai?'#ffd700':'#ff4400',fontSize:22,fontWeight:900,marginBottom:6 }}>{score.p>score.ai?'HOLY HOOPS CHAMPION!':'TOUGH L'}</div>
              <div style={{ color:'#888',marginBottom:16 }}>Final: {score.p} – {score.ai}</div>
              {score.p>score.ai && <div style={{ color:'#00cc44',fontSize:13,marginBottom:16 }}>+$2,500 · +600 XP</div>}
              <div style={{ display:'flex',gap:10 }}>
                <button onClick={()=>{setScore({p:0,ai:0});setQuarter(1);setClock(150);setShotClock(24);setMomentum(50);setStreak(0);setGameMode('pregame');setSetupStep('build')}} style={{ background:'#ff880022',border:'1px solid #ff8800',color:'#ff8800',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>REMATCH</button>
                <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
              </div>
            </>}
          </div>
        )}
      </div>

      {/* Log */}
      <div style={{ height:44,overflowY:'auto',padding:'4px 12px',background:'rgba(0,0,8,0.95)',borderTop:'1px solid #ff880022' }}>
        {log.slice(-2).map((l,i)=><div key={i} style={{ fontSize:11,color:l.includes('AI')||l.includes('MISS')||l.includes('violation')||l.includes('Turnover')?'#ff4400':l.includes('FIRE')||l.includes('PERFECT')||l.includes('Champion')?'#ffd700':'#ff8800' }}>{l}</div>)}
      </div>

      {/* Controls */}
      {gameMode==='live' && shootingFlow==='none' && (
        <div style={{ padding:'8px 10px',background:'rgba(0,0,8,0.98)',borderTop:'1px solid #ff880033' }}>
          {possession==='player' ? (
            <div>
              <div style={{ color:'#555',fontSize:9,marginBottom:5,letterSpacing:2 }}>
                OFFENSE · STA {Math.round(playerStamina)}% · MOMENTUM {Math.round(momentum)}%{momentum>70?' 🔥 HOT!':''}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginBottom:5 }}>
                {(['drive_left','drive_right','iso','pick_roll'] as OffAction[]).map(a=>(
                  <button key={a} onClick={()=>{
                    const shotMap: Partial<Record<OffAction,ShotType>> = { drive_left:'floater', drive_right:'floater', iso:'pull_up', pick_roll:'catch_shoot' }
                    const shot = shotMap[a]
                    if (shot) startShot(shot)
                    else addLog(`${a.replace('_',' ')} — ${arch.id==='playmaker'?'great pass!':'setting screen'}`)
                  }}
                  style={{ background:'#ff880011',border:'1px solid #ff880033',borderRadius:5,padding:'7px 3px',cursor:'pointer',fontFamily:'monospace',textAlign:'center' }}>
                    <div style={{ fontSize:14 }}>{a==='drive_left'?'👈':a==='drive_right'?'👉':a==='iso'?'🎯':'🔄'}</div>
                    <div style={{ color:'#ff8800',fontSize:9,fontWeight:700 }}>{a.replace('_',' ').toUpperCase()}</div>
                  </button>
                ))}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5 }}>
                {([['pull_up','🏀','PULL UP'],['stepback','↩️','STEPBACK'],['catch_shoot','3️⃣','SPOT UP 3'],['alley_oop','💥','ALLEY OOP']] as [ShotType,string,string][]).map(([s,e,l])=>(
                  <button key={s} onClick={()=>startShot(s)} style={{ background:'#ff880022',border:'1px solid #ff880055',borderRadius:5,padding:'7px 3px',cursor:'pointer',fontFamily:'monospace',textAlign:'center' }}>
                    <div style={{ fontSize:14 }}>{e}</div>
                    <div style={{ color:'#ffd700',fontSize:9,fontWeight:700 }}>{l}</div>
                    <div style={{ color:'#555',fontSize:8 }}>R.SHOOT</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ color:'#555',fontSize:9,marginBottom:5,letterSpacing:2 }}>DEFENSE — AI HAS BALL. CHOOSE YOUR STANCE:</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5 }}>
                {([['contest','✋','CONTEST'],['steal','🤜','STEAL'],['block','🛡️','BLOCK'],['body_up','💪','BODY UP'],['help_D','👥','HELP D'],['deny','🚫','DENY']] as [DefenseAction,string,string][]).map(([d,e,l])=>(
                  <button key={d} onClick={()=>{setPendingDef(d);addLog(`${l} — ready for AI shot`)}}
                    style={{ background:pendingDef===d?'#00ccff22':'transparent',border:`1px solid ${pendingDef===d?'#00ccff':'#333'}`,borderRadius:5,padding:'7px 3px',cursor:'pointer',fontFamily:'monospace',textAlign:'center' }}>
                    <div style={{ fontSize:14 }}>{e}</div>
                    <div style={{ color:pendingDef===d?'#00ccff':'#555',fontSize:9,fontWeight:700 }}>{l}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
