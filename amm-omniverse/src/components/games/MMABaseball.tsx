import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

// ─── MMA GAME ───────────────────────────────────────────────────────────────

type MMAPosition = 'standing' | 'clinch' | 'ground_top' | 'ground_bottom'
type MMAMove = 'jab'|'hook'|'kick'|'knee'|'takedown'|'sprawl'|'guard_pass'|'submission_attempt'|'get_up'|'block'

const MMA_MOVES: Record<MMAMove, {
  label:string; emoji:string; damage:number; stamina:number
  validFrom:MMAPosition[]; resultsIn?:MMAPosition; desc:string
}> = {
  jab:                { label:'Jab',          emoji:'👊', damage:8,  stamina:6,  validFrom:['standing','clinch'],          desc:'Quick strike standing' },
  hook:               { label:'Hook',          emoji:'🥊', damage:15, stamina:12, validFrom:['standing','clinch'],          desc:'Power punch' },
  kick:               { label:'Low Kick',      emoji:'🦵', damage:12, stamina:10, validFrom:['standing'],                  desc:'Leg attack — chip HP' },
  knee:               { label:'Knee',          emoji:'🦿', damage:18, stamina:14, validFrom:['clinch'],                   desc:'Brutal in the clinch' },
  takedown:           { label:'Takedown',      emoji:'⬇️', damage:5,  stamina:18, validFrom:['standing','clinch'],         resultsIn:'ground_top', desc:'Shoot for a double leg' },
  sprawl:             { label:'Sprawl',        emoji:'🛡️', damage:0,  stamina:10, validFrom:['standing'],                  resultsIn:'standing',   desc:'Defend the takedown' },
  guard_pass:         { label:'Pass Guard',    emoji:'➡️', damage:5,  stamina:15, validFrom:['ground_top'],               desc:'Advance position' },
  submission_attempt: { label:'Submit!',       emoji:'🔒', damage:30, stamina:22, validFrom:['ground_top','ground_bottom'], desc:'Go for the tap!' },
  get_up:             { label:'Stand Up',      emoji:'⬆️', damage:0,  stamina:12, validFrom:['ground_bottom'],            resultsIn:'standing',   desc:'Fight back to feet' },
  block:              { label:'Block',         emoji:'🛡️', damage:0,  stamina:5,  validFrom:['standing','clinch','ground_bottom','ground_top'], desc:'Defend strikes' },
}

export function MMAGame({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [position, setPosition] = useState<MMAPosition>('standing')
  const [playerHp, setPlayerHp] = useState(100)
  const [aiHp, setAiHp] = useState(100)
  const [playerSta, setPlayerSta] = useState(100)
  const [round, setRound] = useState(1)
  const [roundTime, setRoundTime] = useState(90)
  const [phase, setPhase] = useState<'pregame'|'fight'|'roundEnd'|'gameover'>('pregame')
  const [log, setLog] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<string|null>(null)
  const [isBlocking, setIsBlocking] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const aiTimerRef = useRef<ReturnType<typeof setInterval>|null>(null)

  const addLog = (msg:string) => setLog(p=>[...p.slice(-5),msg])

  useEffect(() => {
    if (phase !== 'fight') return
    timerRef.current = setInterval(() => {
      setRoundTime(t => {
        if (t <= 0) { endRound(); return 90 }
        return t - 1
      })
      setPlayerSta(s => Math.min(100, s + 2))
    }, 1000)
    aiTimerRef.current = setInterval(() => doAI(), 2200)
    return () => { clearInterval(timerRef.current!); clearInterval(aiTimerRef.current!) }
  }, [phase, position])

  const doMove = (move: MMAMove) => {
    if (phase !== 'fight') return
    const m = MMA_MOVES[move]
    if (!m.validFrom.includes(position)) { addLog(`Can't ${m.label} from ${position.replace('_',' ')}!`); return }
    if (playerSta < m.stamina) { addLog('⚡ Out of stamina!'); return }
    setPlayerSta(s => s - m.stamina)

    if (move === 'block') { setIsBlocking(true); setTimeout(() => setIsBlocking(false), 1200); addLog('🛡 Blocking...'); return }

    if (m.resultsIn) { setPosition(m.resultsIn); addLog(`${m.emoji} ${m.label}! Position: ${m.resultsIn.replace(/_/g,' ')}`); }

    if (move === 'submission_attempt') {
      const success = Math.random() > (position === 'ground_top' ? 0.45 : 0.75)
      if (success) {
        setAiHp(0); setPhase('gameover')
        store.earnCash(3000); store.earnXp(800)
        addLog('🔒 TAP! SUBMISSION WIN! +$3,000'); return
      } else { addLog('❌ Submission escaped!') }
    }

    if (m.damage > 0) {
      const dmg = Math.floor(m.damage * (0.8 + Math.random() * 0.4))
      setAiHp(h => { const n = Math.max(0, h - dmg); if (n <= 0) { endByKO('player'); } return n })
      setLastMove(`${m.emoji} ${dmg}`)
      addLog(`${m.emoji} ${m.label} — ${dmg} dmg`)
    }
  }

  const doAI = () => {
    const validMoves = (Object.keys(MMA_MOVES) as MMAMove[]).filter(k => MMA_MOVES[k].validFrom.includes(position))
    const move = validMoves[Math.floor(Math.random() * validMoves.length)]
    const m = MMA_MOVES[move]
    if (m.resultsIn) {
      setPosition(m.resultsIn)
      if (m.resultsIn === 'ground_top') setPosition('ground_bottom')
      if (m.resultsIn === 'ground_bottom') setPosition('ground_top')
    }
    if (move === 'submission_attempt' && Math.random() > 0.7) {
      setPlayerHp(0); endByKO('ai')
      return
    }
    const dmg = isBlocking ? Math.floor(m.damage * 0.1) : Math.floor(m.damage * (0.7 + Math.random() * 0.3))
    setPlayerHp(h => { const n = Math.max(0, h - dmg); if (n <= 0) endByKO('ai'); return n })
    if (dmg > 0) addLog(`🤖 AI ${m.label} — ${dmg} dmg`)
  }

  const endByKO = (winner: 'player'|'ai') => {
    clearInterval(timerRef.current!); clearInterval(aiTimerRef.current!)
    setPhase('gameover')
    if (winner === 'player') { store.earnCash(3000); store.earnXp(800); addLog('🥊 KO! YOU WIN! +$3,000') }
    else addLog('💀 KO! You lost. Rematch?')
  }

  const endRound = () => {
    clearInterval(timerRef.current!); clearInterval(aiTimerRef.current!)
    if (round >= 3 || playerHp <= 0 || aiHp <= 0) {
      setPhase('gameover')
      const won = playerHp > aiHp
      if (won) { store.earnCash(3000); store.earnXp(800) }
    } else {
      setRound(r => r + 1); setRoundTime(90); setPosition('standing')
      setPlayerHp(h => Math.min(100, h+20)); setAiHp(h => Math.min(100, h+15))
      addLog(`End of Round ${round}`)
      setPhase('roundEnd')
      setTimeout(() => setPhase('fight'), 2000)
    }
  }

  const validMoves = (Object.keys(MMA_MOVES) as MMAMove[]).filter(k => MMA_MOVES[k].validFrom.includes(position))

  return (
    <div style={{ width:'100%',height:'100%',background:'#0a0008',fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid #8800ff33' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <div style={{ flex:1,display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'center' }}>
          <div>
            <div style={{ color:'#8800ff',fontSize:18,fontWeight:900 }}>{Math.round(playerHp)} HP</div>
            <div style={{ width:'100%',height:6,background:'#111',borderRadius:3,marginTop:2 }}>
              <div style={{ background:'#8800ff',height:'100%',width:`${playerHp}%`,borderRadius:3,transition:'width 0.2s' }} />
            </div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffd700',fontSize:12,fontWeight:700 }}>R{round} · {roundTime}s</div>
            <div style={{ color:'#555',fontSize:10 }}>{position.replace(/_/g,' ').toUpperCase()}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:'#ff4400',fontSize:18,fontWeight:900 }}>{Math.round(aiHp)} HP</div>
            <div style={{ width:'100%',height:6,background:'#111',borderRadius:3,marginTop:2 }}>
              <div style={{ background:'#ff4400',height:'100%',width:`${aiHp}%`,borderRadius:3,marginLeft:'auto',transition:'width 0.2s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Cage */}
      <div style={{ flex:1,position:'relative',background:'radial-gradient(ellipse at 50% 50%,#1a0020 0%,#080010 100%)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ display:'flex',gap:40,alignItems:'flex-end' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:56,filter:`drop-shadow(0 0 12px #8800ff)`,transform:position.includes('ground')?'rotate(90deg)':'none',transition:'transform 0.3s' }}>🥋</div>
            <div style={{ color:'#8800ff',fontSize:10 }}>YOU · STA {Math.round(playerSta)}%</div>
            {lastMove && <div style={{ color:'#ffd700',fontSize:16,fontWeight:900 }}>{lastMove}</div>}
          </div>
          <div style={{ color:'#555',fontSize:18 }}>VS</div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:56,filter:'drop-shadow(0 0 12px #ff4400)',transform:position.includes('ground')?'rotate(90deg)':'none',transition:'transform 0.3s',display:'inline-block' }}>🤖</div>
            <div style={{ color:'#ff4400',fontSize:10 }}>AI FIGHTER</div>
          </div>
        </div>
        {phase === 'gameover' && (
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
            <div style={{ fontSize:48,marginBottom:8 }}>{playerHp>aiHp?'🏆':'💀'}</div>
            <div style={{ color:playerHp>aiHp?'#ffd700':'#ff4400',fontSize:22,fontWeight:900,marginBottom:8 }}>{playerHp>aiHp?'SUBMISSION WIN!':'TKO LOSS'}</div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>{setPlayerHp(100);setAiHp(100);setPlayerSta(100);setRound(1);setRoundTime(90);setPosition('standing');setPhase('pregame');setLog([])}} style={{ background:'#8800ff22',border:'1px solid #8800ff',color:'#8800ff',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>REMATCH</button>
              <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ height:40,overflowY:'auto',padding:'4px 10px',background:'rgba(8,0,12,0.95)',borderTop:'1px solid #8800ff22' }}>
        {log.slice(-2).map((l,i)=><div key={i} style={{ fontSize:11,color:l.includes('AI')?'#ff4400':l.includes('SUBMIT')||l.includes('KO')?'#ffd700':'#8800ff' }}>{l}</div>)}
      </div>

      <div style={{ padding:'8px 10px',background:'rgba(8,0,12,0.98)',borderTop:'1px solid #8800ff33' }}>
        {phase === 'pregame' && <button onClick={()=>setPhase('fight')} style={{ width:'100%',background:'#8800ff22',border:'2px solid #8800ff',color:'#8800ff',borderRadius:8,padding:'14px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:16 }}>🥋 ENTER THE CAGE</button>}
        {phase === 'fight' && (
          <div>
            <div style={{ color:'#555',fontSize:9,marginBottom:5,letterSpacing:2 }}>POSITION: {position.replace(/_/g,' ').toUpperCase()} · STA {Math.round(playerSta)}%</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5 }}>
              {validMoves.map(k=>{
                const m=MMA_MOVES[k]
                return <button key={k} onClick={()=>doMove(k)} disabled={playerSta<m.stamina}
                  style={{ background:playerSta>=m.stamina?'#8800ff11':'transparent',border:`1px solid ${playerSta>=m.stamina?'#8800ff55':'#222'}`,borderRadius:6,padding:'7px 3px',cursor:playerSta>=m.stamina?'pointer':'default',fontFamily:'monospace',textAlign:'center' }}>
                  <div style={{ fontSize:16 }}>{m.emoji}</div>
                  <div style={{ color:playerSta>=m.stamina?'#8800ff':'#333',fontSize:9,fontWeight:700 }}>{m.label}</div>
                </button>
              })}
            </div>
          </div>
        )}
        {phase === 'roundEnd' && <div style={{ textAlign:'center',color:'#ffd700',padding:10 }}>End of Round {round-1} — corner break...</div>}
      </div>
    </div>
  )
}

// ─── BASEBALL GAME ───────────────────────────────────────────────────────────

type PitchType = 'fastball'|'curveball'|'slider'|'changeup'|'splitter'
type SwingZone = 'high'|'mid'|'low'|'outside'|'inside'

export function BaseballGame({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [inning, setInning] = useState(1)
  const [outs, setOuts] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [balls, setBalls] = useState(0)
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [bases, setBases] = useState([false,false,false]) // 1st 2nd 3rd
  const [batting, setBatting] = useState<'player'|'ai'>('player')
  const [phase, setPhase] = useState<'pregame'|'pitch_incoming'|'swing_or_take'|'result'|'gameover'>('pregame')
  const [pitchType, setPitchType] = useState<PitchType|null>(null)
  const [pitchZone, setPitchZone] = useState<SwingZone|null>(null)
  const [pitchVisible, setPitchVisible] = useState(false)
  const [result, setResult] = useState<string|null>(null)
  const [log, setLog] = useState<string[]>(['Play ball!'])
  const pitchTimer = useRef<ReturnType<typeof setTimeout>|null>(null)

  const addLog = (msg:string) => setLog(p=>[...p.slice(-5),msg])

  const throwPitch = () => {
    if (phase !== 'swing_or_take' && phase !== 'pitch_incoming') return
    const pitches: PitchType[] = ['fastball','curveball','slider','changeup','splitter']
    const zones: SwingZone[] = ['high','mid','low','outside','inside']
    const p = pitches[Math.floor(Math.random()*pitches.length)]
    const z = zones[Math.floor(Math.random()*zones.length)]
    setPitchType(p); setPitchZone(z)
    setPitchVisible(false)
    setPhase('pitch_incoming')

    // Reveal pitch after 400ms (reaction time)
    pitchTimer.current = setTimeout(() => {
      setPitchVisible(true)
      setPhase('swing_or_take')
      // Auto-miss if no swing in 1.2 seconds
      pitchTimer.current = setTimeout(() => {
        resolveAtBat('take', p, z)
      }, 1200)
    }, 400 + Math.random() * 300)
  }

  const swing = (zone: SwingZone) => {
    if (phase !== 'swing_or_take') return
    clearTimeout(pitchTimer.current!)
    resolveAtBat('swing', pitchType!, pitchZone!, zone)
  }

  const take = () => {
    if (phase !== 'swing_or_take') return
    clearTimeout(pitchTimer.current!)
    resolveAtBat('take', pitchType!, pitchZone!)
  }

  const resolveAtBat = (action: 'swing'|'take', pitch: PitchType, zone: SwingZone, swingZone?: SwingZone) => {
    const inStrike = zone === 'mid' || zone === 'high' || zone === 'inside'

    if (action === 'take') {
      if (inStrike) {
        const newStrikes = strikes + 1
        if (newStrikes >= 3) { addLog('⚾ Strikeout looking!'); recordOut() }
        else { setStrikes(newStrikes); addLog(`🔴 Strike ${newStrikes}`) }
      } else {
        const newBalls = balls + 1
        if (newBalls >= 4) { addLog('🟢 Walk! Take your base.'); advanceBase(false) }
        else { setBalls(newBalls); addLog(`🟡 Ball ${newBalls}`) }
      }
      setPhase('result')
      setTimeout(() => setPhase('swing_or_take'), 800)
      return
    }

    // Swing
    const zoneMatch = swingZone === zone
    const pitchDiff: Record<PitchType,number> = { fastball:0.1, curveball:0.3, slider:0.25, changeup:0.2, splitter:0.35 }
    let hitChance = zoneMatch ? 0.72 : 0.35
    hitChance -= pitchDiff[pitch]

    const contactRoll = Math.random()
    if (contactRoll < hitChance) {
      const powerRoll = Math.random()
      if (powerRoll > 0.85) {
        const hr = Math.floor(bases.filter(Boolean).length) + 1
        setScore(s => ({...s, player: s.player + hr}))
        addLog(`💥 HOME RUN! ${hr} run${hr>1?'s':''}!`)
        setBases([false,false,false])
      } else if (powerRoll > 0.6) {
        addLog('🏃 DOUBLE! Two bases.')
        advanceBase(true, 2)
      } else {
        addLog('✅ SINGLE! On base.')
        advanceBase(true, 1)
      }
    } else {
      const newStrikes = strikes + 1
      if (newStrikes >= 3) { addLog(`⚾ Strikeout! ${pitch} fooled you.`); recordOut() }
      else { setStrikes(newStrikes); addLog(`❌ Swing and miss — ${newStrikes} strikes`) }
    }
    setPitchVisible(false)
    setPhase('result')
    setTimeout(() => setPhase('swing_or_take'), 1200)
  }

  const advanceBase = (hasRunner:boolean, bases2=1) => {
    if (!hasRunner) { setScore(s=>({...s,player:s.player+0})); return }
    setBases(prev => {
      const newBases = [...prev]
      // Score runners
      let scored = 0
      for (let i=2;i>=0;i--) { if (newBases[i] && i+bases2>=3) scored++ }
      if (scored > 0) setScore(s=>({...s,player:s.player+scored}))
      const shifted=[false,false,false]
      for (let i=0;i<3;i++) { if (newBases[i] && i+bases2<3) shifted[i+bases2]=true }
      if (bases2>=1) shifted[bases2-1]=true
      return shifted as [boolean,boolean,boolean]
    })
    resetCount()
  }

  const recordOut = () => {
    const newOuts = outs + 1
    if (newOuts >= 3) {
      if (inning >= 9) { setPhase('gameover'); const won=score.player>score.ai; if(won){store.earnCash(1000);store.earnXp(300)} return }
      setBatting(b=>b==='player'?'ai':'player')
      setInning(i=>i+1); setOuts(0); setBases([false,false,false])
      addLog(`3 outs — end of half-inning`)
      // Simple AI batting
      const aiRuns = Math.floor(Math.random() * 3)
      setScore(s=>({...s,ai:s.ai+aiRuns}))
      addLog(`🤖 AI bats — scores ${aiRuns} run${aiRuns!==1?'s':''}`)
      setBatting('player')
    } else { setOuts(newOuts) }
    resetCount()
  }

  const resetCount = () => { setStrikes(0); setBalls(0) }

  const pitchEmoji: Record<PitchType,string> = { fastball:'🔴',curveball:'🔵',slider:'🟡',changeup:'🟢',splitter:'🟣' }

  return (
    <div style={{ width:'100%',height:'100%',background:'#020805',fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none' }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid #00ccff33',background:'rgba(0,8,5,0.95)' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <div style={{ flex:1,display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'center' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#00ccff',fontSize:20,fontWeight:900 }}>{score.player}</div>
            <div style={{ color:'#888',fontSize:10 }}>YOU</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffd700',fontSize:12,fontWeight:700 }}>INN {inning} · {outs} OUT</div>
            <div style={{ color:'#555',fontSize:10 }}>⚾{strikes} 🟡{balls}</div>
            <div style={{ color:'#00cc44',fontSize:11 }}>{bases.map((b,i)=>b?['1B','2B','3B'][i]:'').filter(Boolean).join(' ')||'bases empty'}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#aaa',fontSize:20,fontWeight:900 }}>{score.ai}</div>
            <div style={{ color:'#888',fontSize:10 }}>AI TEAM</div>
          </div>
        </div>
      </div>

      {/* Stadium */}
      <div style={{ flex:1,position:'relative',background:'radial-gradient(ellipse at 50% 70%,#0a2208 0%,#020a03 100%)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <svg viewBox="0 0 200 140" width="280" style={{ opacity:0.4 }}>
          <polygon points="100,10 30,100 170,100" fill="none" stroke="#00cc44" strokeWidth="1"/>
          <rect x="85" y="85" width="30" height="20" fill="#8B4513" opacity="0.4"/>
          <circle cx="100" cy="95" r="3" fill="#ffffff"/>
          {[40,76,124,160].map((x,i)=><circle key={i} cx={x} cy={i%2===0?90:95} r="2.5" fill={bases[i<2?i:i-1]&&i<3?'#ffd700':'#555'}/>)}
        </svg>

        {/* Pitch visualization */}
        {pitchVisible && pitchType && pitchZone && (
          <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div style={{ textAlign:'center',animation:'pitchIn 0.3s ease-out' }}>
              <div style={{ fontSize:48 }}>{pitchEmoji[pitchType]}</div>
              <div style={{ color:'#fff',fontSize:14,fontWeight:700 }}>{pitchType.toUpperCase()}</div>
              <div style={{ color:'#ffd700',fontSize:12 }}>Zone: {pitchZone.toUpperCase()}</div>
            </div>
          </div>
        )}

        {result && (
          <div style={{ position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',color:'#ffd700',fontSize:20,fontWeight:900,textShadow:'0 0 20px #ffd700' }}>{result}</div>
        )}

        {phase === 'gameover' && (
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
            <div style={{ fontSize:44,marginBottom:8 }}>{score.player>score.ai?'🏆':'😤'}</div>
            <div style={{ color:score.player>score.ai?'#ffd700':'#ff4400',fontSize:20,fontWeight:900 }}>{score.player>score.ai?'CREATOR LEAGUE WIN!':'Tough loss.'}</div>
            <div style={{ color:'#888',marginBottom:12 }}>Final: You {score.player} – AI {score.ai}</div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>{setScore({player:0,ai:0});setInning(1);setOuts(0);setStrikes(0);setBalls(0);setBases([false,false,false]);setPhase('pregame');setLog(['Play ball!'])}} style={{ background:'#00ccff22',border:'1px solid #00ccff',color:'#00ccff',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>REMATCH</button>
              <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
            </div>
          </div>
        )}
      </div>

      {/* Log */}
      <div style={{ height:44,overflowY:'auto',padding:'4px 12px',background:'rgba(0,8,5,0.95)',borderTop:'1px solid #00ccff22' }}>
        {log.slice(-2).map((l,i)=><div key={i} style={{ fontSize:11,color:l.includes('HOME')||l.includes('DOUBLE')?'#ffd700':l.includes('Strike')||l.includes('Out')?'#ff4400':'#00ccff' }}>{l}</div>)}
      </div>

      {/* Controls */}
      <div style={{ padding:'8px 10px',background:'rgba(0,8,5,0.98)',borderTop:'1px solid #00ccff33' }}>
        {phase === 'pregame' && <button onClick={()=>{ setPhase('swing_or_take'); throwPitch() }} style={{ width:'100%',background:'#00ccff22',border:'2px solid #00ccff',color:'#00ccff',borderRadius:8,padding:'14px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:16 }}>⚾ PLAY BALL!</button>}
        {(phase === 'swing_or_take' || phase === 'pitch_incoming') && (
          <div>
            <div style={{ color:'#555',fontSize:10,marginBottom:6,letterSpacing:2 }}>
              {!pitchVisible ? '🔴 PITCH INCOMING...' : `${pitchEmoji[pitchType!]} ${pitchType?.toUpperCase()} — SWING OR TAKE!`}
            </div>
            {pitchVisible && (
              <div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5,marginBottom:6 }}>
                  {(['high','mid','low','outside','inside'] as SwingZone[]).map(z=>(
                    <button key={z} onClick={()=>swing(z)}
                      style={{ background:z===pitchZone?'#00ccff22':'#00ccff08',border:`1px solid ${z===pitchZone?'#00ccff':'#00ccff44'}`,borderRadius:6,padding:'8px 3px',cursor:'pointer',fontFamily:'monospace',textAlign:'center' }}>
                      <div style={{ color:z===pitchZone?'#00ccff':'#555',fontSize:11,fontWeight:700 }}>SWING</div>
                      <div style={{ color:'#555',fontSize:9 }}>{z.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
                <button onClick={take} style={{ width:'100%',background:'transparent',border:'1px solid #555',color:'#888',borderRadius:6,padding:'7px',cursor:'pointer',fontFamily:'monospace',fontSize:12 }}>
                  TAKE (let it go)
                </button>
              </div>
            )}
          </div>
        )}
        {phase === 'result' && <div style={{ textAlign:'center',color:'#888',padding:10,fontSize:12 }}>Next pitch...</div>}
      </div>
    </div>
  )
}
