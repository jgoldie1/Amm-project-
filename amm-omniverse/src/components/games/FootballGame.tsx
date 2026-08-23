import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

type PlayType = 'short_pass' | 'deep_pass' | 'run_left' | 'run_right' | 'run_middle' | 'screen' | 'hail_mary'
type DefenseType = 'blitz' | 'zone' | 'man' | 'prevent' | 'nickel'
type GamePhase = 'pregame' | 'play_call' | 'snap' | 'result' | 'score_update' | 'halftime' | 'gameover'
type Quarter = 1 | 2 | 3 | 4

interface PlayResult {
  yards: number
  type: 'complete' | 'incomplete' | 'sack' | 'interception' | 'run' | 'touchdown' | 'fumble'
  description: string
}

const PLAYS: Record<PlayType, { label: string; emoji: string; baseYards: [number,number]; desc: string }> = {
  short_pass:  { label: 'Short Pass',  emoji: '🎯', baseYards: [3, 12],  desc: 'Quick 5-yard route. Safe, reliable.' },
  deep_pass:   { label: 'Deep Pass',   emoji: '🏈', baseYards: [0, 35],  desc: 'Downfield shot. High risk, high reward.' },
  run_left:    { label: 'Run Left',    emoji: '👈', baseYards: [1, 8],   desc: 'Off-tackle run to the left side.' },
  run_right:   { label: 'Run Right',   emoji: '👉', baseYards: [1, 8],   desc: 'Off-tackle run to the right side.' },
  run_middle:  { label: 'Run Middle',  emoji: '⬆️', baseYards: [0, 6],   desc: 'Power run up the gut.' },
  screen:      { label: 'Screen Pass', emoji: '🏃', baseYards: [2, 18],  desc: 'RB catches behind the line. Hits big if blocks set.' },
  hail_mary:   { label: 'Hail Mary',   emoji: '🙏', baseYards: [0, 50],  desc: 'End zone heave. 1 in 10 chance.' },
}

const DEFENSES: Record<DefenseType, { label: string; counters: PlayType[]; vulnerableTo: PlayType[] }> = {
  blitz:   { label: 'BLITZ',   counters: ['deep_pass','hail_mary'], vulnerableTo: ['short_pass','screen','run_left','run_right'] },
  zone:    { label: 'ZONE',    counters: ['short_pass','screen'],   vulnerableTo: ['deep_pass','run_middle'] },
  man:     { label: 'MAN',     counters: ['screen','run_left'],     vulnerableTo: ['deep_pass','short_pass'] },
  prevent: { label: 'PREVENT', counters: ['hail_mary','deep_pass'], vulnerableTo: ['run_middle','run_left','run_right','screen'] },
  nickel:  { label: 'NICKEL',  counters: ['run_left','run_right'],  vulnerableTo: ['short_pass','deep_pass'] },
}

function resolvePlay(play: PlayType, defense: DefenseType): PlayResult {
  const p = PLAYS[play]
  const d = DEFENSES[defense]
  const isCountered = d.counters.includes(play)
  const isVulnerable = d.vulnerableTo.includes(play)

  // Sack on blitz vs drop-back passes
  if (defense === 'blitz' && (play === 'deep_pass' || play === 'hail_mary') && Math.random() < 0.35) {
    return { yards: -7, type: 'sack', description: `💥 SACK! The blitz got home — lost 7 yards!` }
  }
  // Interception on bad pass plays vs good defense
  if ((play === 'deep_pass' || play === 'hail_mary') && isCountered && Math.random() < 0.25) {
    return { yards: 0, type: 'interception', description: `🚨 INTERCEPTION! Picked off!` }
  }
  // Fumble on runs vs blitz
  if ((play === 'run_left' || play === 'run_right' || play === 'run_middle') && defense === 'blitz' && Math.random() < 0.1) {
    return { yards: 0, type: 'fumble', description: `💀 FUMBLE! Ball lost!` }
  }

  const [min, max] = p.baseYards
  let yards = min + Math.floor(Math.random() * (max - min + 1))

  if (isVulnerable) yards = Math.floor(yards * 1.6)
  if (isCountered)  yards = Math.floor(yards * 0.4)
  yards = Math.max(0, yards)

  if (yards === 0 && (play === 'deep_pass' || play === 'hail_mary')) {
    return { yards: 0, type: 'incomplete', description: `📵 Incomplete pass — fell incomplete.` }
  }
  if (yards >= 20 && (play === 'deep_pass' || play === 'hail_mary')) {
    return { yards, type: 'complete', description: `🔥 DEEP STRIKE! ${yards} yards downfield!` }
  }

  const descriptions: Record<PlayType, string[]> = {
    short_pass:  [`✅ Caught for ${yards} yards`, `✅ Short completion — ${yards} yards`],
    deep_pass:   [`🏈 Deep shot gains ${yards} yards`, `📡 Downfield — ${yards} yards`],
    run_left:    [`🏃 Cuts left for ${yards} yards`, `👈 Off tackle — ${yards}`],
    run_right:   [`🏃 Bounces right — ${yards} yards`, `👉 Gains ${yards} outside`],
    run_middle:  [`💪 Power run — ${yards} yards`, `⬆️ Up the gut — ${yards}`],
    screen:      [`🏃 Screen sets up — ${yards} yards`, `Screen pass gains ${yards}`],
    hail_mary:   [`🙏 Hail Mary — ${yards} yards!`, `Last resort gains ${yards}!`],
  }

  const type = play.includes('pass') || play === 'hail_mary' || play === 'screen' ? 'complete' : 'run'
  const desc = descriptions[play][Math.floor(Math.random() * 2)]
  return { yards, type, description: desc }
}

export default function FootballGame({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [phase, setPhase] = useState<GamePhase>('pregame')
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [quarter, setQuarter] = useState<Quarter>(1)
  const [clock, setClock] = useState(120) // 2 min per quarter
  const [down, setDown] = useState(1)
  const [toGo, setToGo] = useState(10)
  const [fieldPos, setFieldPos] = useState(20) // yards from own end zone
  const [selectedPlay, setSelectedPlay] = useState<PlayType | null>(null)
  const [aiDefense, setAiDefense] = useState<DefenseType>('zone')
  const [lastResult, setLastResult] = useState<PlayResult | null>(null)
  const [log, setLog] = useState<string[]>(['Game starting...'])
  const [showPlaybook, setShowPlaybook] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [possession, setPossession] = useState<'player' | 'ai'>('player')

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-6), msg])

  useEffect(() => {
    if (phase !== 'play_call') return
    timerRef.current = setInterval(() => {
      setClock(c => {
        if (c <= 0) { advanceQuarter(); return 120 }
        return c - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const advanceQuarter = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (quarter === 2) { setPhase('halftime'); return }
    if (quarter === 4) { setPhase('gameover'); return }
    setQuarter(q => (q + 1) as Quarter)
    setClock(120)
    setPhase('play_call')
  }

  const callPlay = (play: PlayType) => {
    setSelectedPlay(play)
    // AI picks defense — tries to counter your tendencies
    const defenses: DefenseType[] = ['blitz','zone','man','prevent','nickel']
    const aiDef = defenses[Math.floor(Math.random() * defenses.length)]
    setAiDefense(aiDef)
    setPhase('snap')

    setTimeout(() => {
      const result = resolvePlay(play, aiDef)
      setLastResult(result)

      if (result.type === 'interception' || result.type === 'fumble') {
        addLog(result.description)
        setPossession('ai')
        setDown(1); setToGo(10); setFieldPos(80 - fieldPos)
        setPhase('result')
        // AI drives
        setTimeout(doAIDrive, 1500)
        return
      }

      const newFieldPos = Math.min(100, fieldPos + result.yards)
      setFieldPos(newFieldPos)

      if (newFieldPos >= 100) {
        setScore(s => ({ ...s, player: s.player + 7 }))
        addLog(`🏆 TOUCHDOWN! 7-0 to you! Kickoff...`)
        setDown(1); setToGo(10); setFieldPos(20)
        setPhase('score_update')
        setTimeout(() => setPhase('play_call'), 2000)
        return
      }

      const newToGo = Math.max(0, toGo - result.yards)
      addLog(result.description)

      if (result.yards >= toGo) {
        setDown(1); setToGo(10)
        addLog(`✅ FIRST DOWN!`)
      } else if (down === 4) {
        addLog(`📵 Turnover on downs!`)
        setPossession('ai')
        setDown(1); setToGo(10); setFieldPos(100 - newFieldPos)
        doAIDrive()
      } else {
        setDown(d => d + 1)
        setToGo(newToGo)
      }
      setFieldPos(newFieldPos)
      setPhase('result')
      setTimeout(() => setPhase('play_call'), 1500)
    }, 800)
  }

  const doAIDrive = () => {
    let aiPos = 20
    let aiDown = 1
    let aiToGo = 10
    let attempts = 0
    const drive = () => {
      if (attempts++ > 8) {
        addLog(`🛡 You stopped the AI drive!`)
        setPossession('player')
        setDown(1); setToGo(10); setFieldPos(20)
        setPhase('play_call')
        return
      }
      const aiPlays: PlayType[] = ['short_pass','run_middle','run_left','deep_pass','screen']
      const aiPlay = aiPlays[Math.floor(Math.random() * aiPlays.length)]
      const playerDef: DefenseType[] = ['zone','man','nickel']
      const def = playerDef[Math.floor(Math.random() * playerDef.length)]
      const result = resolvePlay(aiPlay, def)

      if (result.type === 'interception' || result.type === 'fumble') {
        addLog(`🎉 Turnover! You got the ball!`)
        setPossession('player'); setDown(1); setToGo(10); setFieldPos(100 - aiPos)
        setPhase('play_call'); return
      }

      aiPos = Math.min(100, aiPos + result.yards)
      addLog(`🤖 AI: ${result.description}`)

      if (aiPos >= 100) {
        setScore(s => ({ ...s, ai: s.ai + 7 }))
        addLog(`😤 AI scores! 7 points!`)
        setPossession('player'); setDown(1); setToGo(10); setFieldPos(20)
        setPhase('play_call'); return
      }

      if (result.yards >= aiToGo) { aiDown = 1; aiToGo = 10 }
      else if (aiDown === 4) {
        addLog(`📵 AI punts!`)
        setPossession('player'); setDown(1); setToGo(10); setFieldPos(20)
        setPhase('play_call'); return
      } else { aiDown++; aiToGo -= result.yards }
      setTimeout(drive, 1200)
    }
    setTimeout(drive, 1000)
  }

  const won = score.player > score.ai
  const formatClock = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  return (
    <div style={{ width:'100%',height:'100%',background:'#020a02',fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none' }}>
      {/* Scoreboard */}
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid #00cc4433',background:'rgba(0,10,0,0.9)' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <div style={{ flex:1,display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#00ffcc',fontSize:20,fontWeight:900 }}>{score.player}</div>
            <div style={{ color:'#888',fontSize:10 }}>{store.player.name || 'YOU'}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffd700',fontSize:13,fontWeight:700 }}>Q{quarter} · {formatClock(clock)}</div>
            <div style={{ color:'#555',fontSize:10 }}>Down {down} & {toGo}</div>
            <div style={{ color:'#888',fontSize:10 }}>Ball on {possession==='player'?'your':'AI'} {Math.min(50,Math.max(1,possession==='player'?fieldPos:100-fieldPos))} yd line</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ff4400',fontSize:20,fontWeight:900 }}>{score.ai}</div>
            <div style={{ color:'#888',fontSize:10 }}>AI DEFENSE</div>
          </div>
        </div>
      </div>

      {/* Field */}
      <div style={{ flex:1,position:'relative',overflow:'hidden' }}>
        {/* Field visualization */}
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column' }}>
          {/* End zones */}
          <div style={{ height:'15%',background:'rgba(0,100,0,0.3)',borderBottom:'2px solid #00cc44',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span style={{ color:'#00cc44',fontSize:11,letterSpacing:4,opacity:0.5 }}>END ZONE</span>
          </div>
          {/* Main field */}
          <div style={{ flex:1,position:'relative',background:'rgba(0,50,0,0.2)' }}>
            {/* Yard lines */}
            {[10,20,30,40,50,60,70,80,90].map(y => (
              <div key={y} style={{ position:'absolute',top:`${100-y}%`,left:0,right:0,height:1,background:'rgba(0,204,68,0.15)' }}>
                <span style={{ position:'absolute',right:4,top:-8,color:'#00cc4466',fontSize:9 }}>{y > 50 ? 100-y : y}</span>
              </div>
            ))}
            {/* Ball position */}
            <div style={{ position:'absolute',left:`${Math.min(94,fieldPos)}%`,top:'50%',transform:'translate(-50%,-50%)',transition:'left 0.5s ease' }}>
              <div style={{ fontSize:24,filter:'drop-shadow(0 0 8px #ffd700)' }}>🏈</div>
              <div style={{ width:2,height:20,background:'#ffd700',margin:'2px auto' }} />
            </div>
            {/* First down marker */}
            {possession === 'player' && (
              <div style={{ position:'absolute',left:`${Math.min(98,fieldPos+toGo)}%`,top:0,bottom:0,width:2,background:'#ffaa0088',transition:'left 0.5s' }} />
            )}
          </div>
          <div style={{ height:'15%',background:'rgba(100,0,0,0.2)',borderTop:'2px solid #ff4400',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span style={{ color:'#ff440066',fontSize:11,letterSpacing:4 }}>AI END ZONE</span>
          </div>
        </div>

        {/* Last result overlay */}
        {lastResult && phase === 'result' && (
          <div style={{ position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(0,0,0,0.85)',border:`1px solid ${lastResult.type==='touchdown'?'#ffd700':lastResult.type==='interception'||lastResult.type==='sack'?'#ff4400':'#00cc44'}`,borderRadius:10,padding:'14px 24px',textAlign:'center',zIndex:10 }}>
            <div style={{ fontSize:24,marginBottom:6 }}>
              {lastResult.type==='touchdown'?'🏆':lastResult.type==='interception'?'🚨':lastResult.type==='sack'?'💥':lastResult.type==='incomplete'?'📵':lastResult.yards>15?'🔥':'✅'}
            </div>
            <div style={{ color:'#fff',fontWeight:700,fontSize:15 }}>{lastResult.description}</div>
            {lastResult.yards > 0 && <div style={{ color:'#ffd700',fontSize:20,fontWeight:900,marginTop:4 }}>+{lastResult.yards} YDS</div>}
          </div>
        )}
      </div>

      {/* Battle log */}
      <div style={{ height:56,overflowY:'auto',padding:'4px 12px',background:'rgba(0,5,0,0.9)',borderTop:'1px solid #00cc4422' }}>
        {log.slice(-3).map((l,i) => <div key={i} style={{ fontSize:11,color:l.includes('TOUCHDOWN')||l.includes('First')?'#ffd700':l.includes('AI')?'#ff4400':'#00cc44' }}>{l}</div>)}
      </div>

      {/* Play calling */}
      <div style={{ padding:'10px 12px',background:'rgba(0,8,0,0.97)',borderTop:'1px solid #00cc4433' }}>
        {phase === 'pregame' && (
          <button onClick={() => setPhase('play_call')} style={{ width:'100%',background:'#00cc4422',border:'2px solid #00cc44',color:'#00cc44',borderRadius:8,padding:'14px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:16 }}>
            🏈 KICK OFF — START GAME
          </button>
        )}
        {phase === 'play_call' && possession === 'player' && (
          <div>
            <div style={{ color:'#555',fontSize:10,marginBottom:6,letterSpacing:2 }}>CALL YOUR PLAY · AI DEFENSE: UNKNOWN</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6 }}>
              {(Object.entries(PLAYS) as [PlayType, typeof PLAYS[PlayType]][]).map(([key, play]) => (
                <button key={key} onClick={() => callPlay(key)}
                  style={{ background:'#00cc4411',border:'1px solid #00cc4455',borderRadius:6,padding:'8px 4px',cursor:'pointer',fontFamily:'monospace',textAlign:'center' }}>
                  <div style={{ fontSize:16 }}>{play.emoji}</div>
                  <div style={{ color:'#00cc44',fontSize:10,fontWeight:700 }}>{play.label}</div>
                  <div style={{ color:'#555',fontSize:9 }}>{play.baseYards[0]}-{play.baseYards[1]} yds</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {phase === 'play_call' && possession === 'ai' && (
          <div style={{ textAlign:'center',color:'#ff4400',fontSize:13 }}>🤖 AI has the ball — defending...</div>
        )}
        {phase === 'snap' && (
          <div style={{ textAlign:'center',padding:14 }}>
            <div style={{ color:'#ffd700',fontSize:16,fontWeight:700 }}>⚡ SNAP!</div>
            <div style={{ color:'#888',fontSize:12 }}>AI defense: {DEFENSES[aiDefense].label}</div>
          </div>
        )}
        {phase === 'halftime' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffd700',fontSize:15,fontWeight:700,marginBottom:8 }}>HALFTIME · {score.player}–{score.ai}</div>
            <button onClick={() => { setQuarter(3); setClock(120); setPhase('play_call'); addLog('2nd half underway!') }}
              style={{ background:'#00cc4422',border:'1px solid #00cc44',color:'#00cc44',borderRadius:6,padding:'10px 30px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>
              START 2ND HALF
            </button>
          </div>
        )}
        {phase === 'gameover' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ color:won?'#ffd700':'#ff4400',fontSize:16,fontWeight:900,marginBottom:6 }}>
              {won ? '🏆 OMNIVERSE BOWL WINNER!' : '😤 Tough game. Rematch?'}
            </div>
            <div style={{ color:'#888',fontSize:13,marginBottom:10 }}>Final: You {score.player} – AI {score.ai}</div>
            {won && <div style={{ color:'#00cc44',fontSize:12,marginBottom:10 }}>+$2,000 · +500 XP · Creator League points!</div>}
            <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
              <button onClick={() => { setScore({player:0,ai:0}); setQuarter(1); setClock(120); setDown(1); setToGo(10); setFieldPos(20); setLog(['Game starting...']); setPhase('pregame') }}
                style={{ background:'#00cc4422',border:'1px solid #00cc44',color:'#00cc44',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>REMATCH</button>
              <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
