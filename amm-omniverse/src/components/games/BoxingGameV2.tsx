// AMM Boxing Game V2 — Real playable, visual fighters, animated punches
// Features: Visual fighter SVG sprites, real combo chains, stamina management,
// AI that telegraphs moves, split-second dodge/block windows, crowd reactions,
// championship belt progression, real-time health bars with shake animations

import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

type Move = 'jab'|'cross'|'hook'|'uppercut'|'body'|'block'|'dodge_left'|'dodge_right'
type FighterState = 'idle'|'jab'|'cross'|'hook'|'uppercut'|'blocking'|'dodging'|'stunned'|'knockdown'|'ko'
type RoundResult = { player: number; ai: number; knockdowns: number }

interface Fighter {
  name: string
  hp: number
  maxHp: number
  stamina: number
  state: FighterState
  combo: number
  lastMove: Move | null
  isBlocking: boolean
  isDodging: boolean
  stunFrames: number
  knockdowns: number
  totalDamage: number
  accuracy: number
  totalThrown: number
  color: string
  style: string
}

// Combo chains with names, multipliers, and conditions
const COMBOS: Record<string, { name: string; mult: number; color: string }> = {
  'jab,cross':                 { name: '1-2 COMBO',        mult: 1.3, color: '#00ccff' },
  'jab,cross,hook':            { name: '1-2-3 COMBO',      mult: 1.6, color: '#ff8800' },
  'jab,jab,cross':             { name: 'DOUBLE JAB',       mult: 1.4, color: '#00ccff' },
  'hook,uppercut':             { name: 'HAYMAKER',         mult: 1.7, color: '#ff4400' },
  'body,hook':                 { name: 'BODY-HEAD',        mult: 1.5, color: '#ff8800' },
  'dodge_left,cross':          { name: '⚡ SLIP COUNTER',  mult: 2.1, color: '#ffd700' },
  'dodge_right,cross':         { name: '⚡ SLIP COUNTER',  mult: 2.1, color: '#ffd700' },
  'block,uppercut':            { name: '🛡 PARRY BLAST',   mult: 1.8, color: '#00cc44' },
  'jab,cross,hook,uppercut':   { name: '🔥 OMNIVERSE COMBO', mult: 2.5, color: '#ffd700' },
  'body,body,hook':            { name: '💥 BODY ATTACK',   mult: 2.0, color: '#ff4400' },
}

const MOVE_DATA: Record<Move, { label: string; emoji: string; damage: number; staminaCost: number; speed: number; counters: Move[] }> = {
  jab:         { label:'JAB',       emoji:'👊', damage:8,  staminaCost:6,  speed:1,   counters:['hook','uppercut'] },
  cross:       { label:'CROSS',     emoji:'🤜', damage:14, staminaCost:12, speed:2,   counters:['body'] },
  hook:        { label:'HOOK',      emoji:'🥊', damage:18, staminaCost:16, speed:3,   counters:['jab','cross'] },
  uppercut:    { label:'UPPERCUT',  emoji:'⬆️', damage:22, staminaCost:20, speed:3,   counters:['dodge_left','dodge_right'] },
  body:        { label:'BODY',      emoji:'🎯', damage:12, staminaCost:10, speed:2,   counters:['block'] },
  block:       { label:'BLOCK',     emoji:'🛡️', damage:0,  staminaCost:4,  speed:0,   counters:[] },
  dodge_left:  { label:'DODGE ←',  emoji:'◀️', damage:0,  staminaCost:8,  speed:0,   counters:[] },
  dodge_right: { label:'DODGE →',  emoji:'▶️', damage:0,  staminaCost:8,  speed:0,   counters:[] },
}

// Visual fighter component
function FighterSprite({ state, flipped, color, knockdownAnim }: {
  state: FighterState; flipped: boolean; color: string; knockdownAnim: boolean
}) {
  const scale = flipped ? -1 : 1
  const lean = state === 'jab' ? 15 : state === 'cross' ? 20 : state === 'hook' ? -10 : state === 'stunned' ? -20 : state === 'knockdown' ? 45 : 0
  const armRaise = state === 'uppercut' ? -40 : state === 'blocking' ? 20 : 0
  return (
    <svg width="80" height="120" viewBox="0 0 80 120"
      style={{ transform:`scaleX(${scale}) rotate(${knockdownAnim?-30:0}deg)`, transition:'transform 0.15s', filter:`drop-shadow(0 0 8px ${color})` }}>
      {/* Body */}
      <ellipse cx="40" cy="60" rx="18" ry="28" fill={color} opacity="0.9"/>
      {/* Head */}
      <circle cx="40" cy="22" r="16" fill={color}/>
      {/* Eyes */}
      <ellipse cx={flipped?46:34} cy="20" rx="3" ry="3" fill={state==='stunned'?'#fff':'#111'}/>
      <ellipse cx={flipped?34:46} cy="20" rx="3" ry="3" fill={state==='stunned'?'#fff':'#111'}/>
      {/* Gloves */}
      <circle cx={state==='jab'?65:state==='blocking'?28:20} cy={state==='jab'?35:state==='uppercut'?10:45}
        r="10" fill={color} opacity="0.9"/>
      <circle cx={state==='cross'?5:60} cy={state==='cross'?30:45} r="10" fill={color} opacity="0.9"/>
      {/* Shorts stripe */}
      <rect x="26" y="72" width="28" height="12" rx="2" fill="rgba(0,0,0,0.3)"/>
      {/* Legs */}
      <rect x="25" y="84" width="12" height="24" rx="4" fill={color} opacity="0.8"/>
      <rect x="43" y="84" width="12" height="24" rx="4" fill={color} opacity="0.8"/>
      {/* State indicator */}
      {state==='blocking' && <path d="M20,40 L60,40 L60,70 L20,70 Z" fill="rgba(0,200,255,0.3)" stroke="#00ccff" strokeWidth="2"/>}
      {state==='stunned' && <>
        <text x="32" y="5" fontSize="12" fill="#ffd700">★</text>
        <text x="42" y="5" fontSize="12" fill="#ffd700">★</text>
        <text x="52" y="5" fontSize="12" fill="#ffd700">★</text>
      </>}
    </svg>
  )
}

export default function BoxingGameV2({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [round, setRound] = useState(1)
  const [maxRounds] = useState(5)
  const [phase, setPhase] = useState<'intro'|'fight'|'roundEnd'|'gameover'>('intro')
  const [player, setPlayer] = useState<Fighter>({
    name: store.player.name || 'Champion', hp:100, maxHp:100, stamina:100,
    state:'idle', combo:0, lastMove:null, isBlocking:false, isDodging:false,
    stunFrames:0, knockdowns:0, totalDamage:0, accuracy:0, totalThrown:0,
    color:'#00ffcc', style:'Technical Boxer'
  })
  const [ai, setAI] = useState<Fighter>({
    name:'Iron Shade', hp:100, maxHp:100, stamina:100,
    state:'idle', combo:0, lastMove:null, isBlocking:false, isDodging:false,
    stunFrames:0, knockdowns:0, totalDamage:0, accuracy:0, totalThrown:0,
    color:'#ff4400', style:'Power Puncher'
  })
  const [roundTimer, setRoundTimer] = useState(60)
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [activeCombo, setActiveCombo] = useState<string|null>(null)
  const [roundScores, setRoundScores] = useState<RoundResult[]>([])
  const [lastHit, setLastHit] = useState<{side:'player'|'ai'; dmg:number; label:string}|null>(null)
  const [crowdMeter, setCrowdMeter] = useState(50) // 0=ai winning, 100=player winning
  const [aiTelegraph, setAiTelegraph] = useState<string|null>(null) // AI shows intent briefly
  const [knockdownAnim, setKnockdownAnim] = useState<'player'|'ai'|null>(null)
  const [log, setLog] = useState<string[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const aiCooldown = useRef(0)
  const playerMoveHistory = useRef<Move[]>([])
  const logId = useRef(0)

  const addLog = useCallback((msg: string) => setLog(p => [...p.slice(-5), msg]), [])

  useEffect(() => {
    if (phase !== 'fight') return
    timerRef.current = setInterval(() => {
      setRoundTimer(t => {
        if (t <= 0) { endRound(); return 60 }
        return t - 1
      })
      setPlayer(p => ({ ...p, stamina: Math.min(100, p.stamina + 3), stunFrames: Math.max(0, p.stunFrames - 1) }))
      setAI(a => ({ ...a, stamina: Math.min(100, a.stamina + 2.5), stunFrames: Math.max(0, a.stunFrames - 1) }))
      aiCooldown.current++
      if (aiCooldown.current >= 2 + Math.floor(Math.random() * 2)) {
        aiCooldown.current = 0
        doAIMove()
      }
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const doPlayerMove = useCallback((move: Move) => {
    if (phase !== 'fight') return
    setPlayer(prev => {
      if (prev.stamina < MOVE_DATA[move].staminaCost) { addLog('⚡ Out of stamina!'); return prev }
      if (prev.stunFrames > 0) { addLog('😵 You are stunned!'); return prev }

      const newHist = [...playerMoveHistory.current, move].slice(-4)
      playerMoveHistory.current = newHist

      if (move === 'block') {
        addLog('🛡️ Blocking...')
        return { ...prev, state:'blocking', isBlocking:true, stamina:prev.stamina-4 }
      }
      if (move === 'dodge_left' || move === 'dodge_right') {
        addLog(`${move==='dodge_left'?'◀️':'▶️'} Dodge!`)
        return { ...prev, state:'dodging', isDodging:true, stamina:prev.stamina-8 }
      }

      // Check combo
      const comboKey = newHist.join(',')
      let comboMult = 1
      let comboName: string|null = null
      let comboColor = '#fff'
      for (const [chain, data] of Object.entries(COMBOS)) {
        if (comboKey.endsWith(chain) || comboKey === chain) {
          comboMult = data.mult; comboName = data.name; comboColor = data.color; break
        }
      }
      if (comboName) {
        setActiveCombo(comboName)
        setTimeout(() => setActiveCombo(null), 1200)
      }

      const baseDmg = MOVE_DATA[move].damage
      let dmg = Math.floor(baseDmg * comboMult * (0.85 + Math.random() * 0.3))

      setAI(a => {
        if (a.isBlocking && MOVE_DATA[move].counters.includes('block')) { dmg = Math.floor(dmg * 0.1) }
        if (a.isDodging) { dmg = 0; addLog(`🏃 AI dodged!`) }
        const newHp = Math.max(0, a.hp - dmg)
        const stunned = dmg > 25 && Math.random() > 0.6
        if (newHp <= 0) {
          setKnockdownAnim('ai')
          setTimeout(() => { setKnockdownAnim(null); endRound() }, 1500)
        }
        if (dmg > 0) {
          setLastHit({ side:'ai', dmg, label: comboName ?? MOVE_DATA[move].label })
          setTimeout(() => setLastHit(null), 600)
          setCrowdMeter(m => Math.min(100, m + (comboMult > 1.5 ? 15 : 8)))
        }
        const msg = comboName ? `🔥 ${comboName}! ${dmg} dmg!` : `${MOVE_DATA[move].emoji} ${MOVE_DATA[move].label} — ${dmg}`
        addLog(msg)
        return { ...a, hp:newHp, state: stunned ? 'stunned' : 'idle', stunFrames: stunned ? 2 : 0, totalDamage:a.totalDamage+dmg }
      })

      return { ...prev, state:move as FighterState, stamina:prev.stamina-MOVE_DATA[move].staminaCost, totalThrown:prev.totalThrown+1, lastMove:move }
    })
    setTimeout(() => setPlayer(p => ({ ...p, state:'idle', isBlocking:false, isDodging:false })), 300)
  }, [phase])

  const doAIMove = useCallback(() => {
    // AI telegraphs its move briefly before executing
    const moves: Move[] = ['jab','cross','hook','uppercut','body','block','dodge_left','jab','cross']
    const chosen = moves[Math.floor(Math.random() * moves.length)]
    setAiTelegraph(MOVE_DATA[chosen].emoji)
    setTimeout(() => setAiTelegraph(null), 400)

    setTimeout(() => {
      setAI(prev => {
        if (prev.stamina < MOVE_DATA[chosen].staminaCost || prev.stunFrames > 0) return prev
        if (chosen === 'block' || chosen === 'dodge_left' || chosen === 'dodge_right') {
          return { ...prev, state: (chosen === 'dodge_left' || chosen === 'dodge_right') ? 'dodging' : 'blocking', isBlocking:chosen==='block', isDodging:chosen!=='block', stamina:prev.stamina-MOVE_DATA[chosen].staminaCost }
        }
        let dmg = Math.floor(MOVE_DATA[chosen].damage * (0.7 + Math.random() * 0.4))
        setPlayer(p => {
          if (p.isBlocking) dmg = Math.floor(dmg * 0.1)
          if (p.isDodging) { dmg = 0 }
          const newHp = Math.max(0, p.hp - dmg)
          const stunned = dmg > 20 && Math.random() > 0.7
          if (newHp <= 0) {
            setKnockdownAnim('player')
            setTimeout(() => { setKnockdownAnim(null); endRound() }, 1500)
          }
          if (dmg > 0) {
            setLastHit({ side:'player', dmg, label:MOVE_DATA[chosen].label })
            setTimeout(() => setLastHit(null), 600)
            setCrowdMeter(m => Math.max(0, m - 8))
          }
          addLog(`🤖 AI ${MOVE_DATA[chosen].label} — ${dmg}`)
          return { ...p, hp:newHp, state:stunned?'stunned':'idle', stunFrames:stunned?2:0 }
        })
        return { ...prev, state:chosen as FighterState, stamina:prev.stamina-MOVE_DATA[chosen].staminaCost }
      })
      setTimeout(() => setAI(a => ({ ...a, state:'idle', isBlocking:false, isDodging:false })), 350)
    }, 500)
  }, [])

  const endRound = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRoundScores(s => [...s, { player:player.hp, ai:ai.hp, knockdowns:player.knockdowns }])
    const playerWon = player.hp > ai.hp

    if (round >= maxRounds || player.hp <= 0 || ai.hp <= 0) {
      setPhase('gameover')
      const won = player.hp > ai.hp
      if (won) { store.earnCash(3500 + round * 500); store.earnXp(800); store.completeMission('m3') }
      store.setNotif(won ? `🏆 BOXING CHAMPION! +$${3500+round*500} +800 XP` : '❌ Defeated. Train harder.')
    } else {
      setPhase('roundEnd')
      setTimeout(() => {
        setRound(r => r + 1)
        setPlayer(p => ({ ...p, hp:Math.min(100,p.hp+20), stamina:100, state:'idle', stunFrames:0 }))
        setAI(a => ({ ...a, hp:Math.min(100,a.hp+15), stamina:100, state:'idle', stunFrames:0 }))
        setRoundTimer(60)
        playerMoveHistory.current = []
        addLog(`Round ${round + 1} — FIGHT!`)
        setPhase('fight')
      }, 3000)
    }
  }, [round, maxRounds, player.hp, ai.hp])

  const pct = (v: number, max: number) => `${Math.max(0,(v/max)*100)}%`

  return (
    <div style={{ width:'100%',height:'100%',background:'linear-gradient(180deg,#0a0005 0%,#020008 100%)',fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none' }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderBottom:'1px solid #ff440033' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <span style={{ color:'#ff4400',fontWeight:900,fontSize:14,letterSpacing:3 }}>🥊 OMNIVERSE BOXING</span>
        <span style={{ color:'#888',fontSize:11,marginLeft:'auto' }}>Round {round}/{maxRounds} · ⏱ {roundTimer}s</span>
      </div>

      {/* Fighter stat bars */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:10,padding:'8px 12px',alignItems:'center' }}>
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
            <span style={{ color:'#00ffcc',fontWeight:700,fontSize:12 }}>👑 {player.name}</span>
            <span style={{ color:'#888',fontSize:10 }}>{player.hp}HP</span>
          </div>
          <div style={{ background:'#111',borderRadius:4,height:8,marginBottom:2 }}>
            <div style={{ background:player.hp>50?'#00cc44':player.hp>25?'#ffaa00':'#ff4400',height:'100%',width:pct(player.hp,100),borderRadius:4,transition:'width 0.2s',boxShadow:knockdownAnim==='player'?'0 0 10px #ff4400':'' }} />
          </div>
          <div style={{ background:'#111',borderRadius:4,height:4 }}>
            <div style={{ background:'#0088ff',height:'100%',width:pct(player.stamina,100),borderRadius:4,transition:'width 0.3s' }} />
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'#ff4400',fontSize:18,fontWeight:900 }}>VS</div>
          <div style={{ color:'#555',fontSize:9 }}>{phase==='fight'?'⚔️ LIVE':'⏸'}</div>
          {aiTelegraph && <div style={{ color:'#ff8800',fontSize:20,animation:'pulseIn 0.2s' }}>{aiTelegraph}</div>}
        </div>
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
            <span style={{ color:'#888',fontSize:10 }}>{ai.hp}HP</span>
            <span style={{ color:'#ff4400',fontWeight:700,fontSize:12 }}>{ai.name} 🤖</span>
          </div>
          <div style={{ background:'#111',borderRadius:4,height:8,marginBottom:2 }}>
            <div style={{ background:ai.hp>50?'#ff4400':ai.hp>25?'#ff8800':'#ff0000',height:'100%',width:pct(ai.hp,100),borderRadius:4,marginLeft:'auto',transition:'width 0.2s' }} />
          </div>
          <div style={{ background:'#111',borderRadius:4,height:4 }}>
            <div style={{ background:'#ff4400',height:'100%',width:pct(ai.stamina,100),borderRadius:4,marginLeft:'auto',transition:'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Crowd meter */}
      <div style={{ padding:'0 12px' }}>
        <div style={{ background:'#111',borderRadius:4,height:6,position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',left:0,top:0,bottom:0,width:`${crowdMeter}%`,background:'linear-gradient(90deg,#00ffcc,#00cc44)',transition:'width 0.5s' }} />
          <div style={{ position:'absolute',right:0,top:0,bottom:0,width:`${100-crowdMeter}%`,background:'linear-gradient(90deg,#ff8800,#ff4400)' }} />
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:8,color:'#555',marginTop:1 }}>
          <span>YOUR CROWD</span><span>AI CROWD</span>
        </div>
      </div>

      {/* Fight arena */}
      <div style={{ flex:1,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% 60%,#1a0010 0%,#0a0005 70%)' }}>
        {/* Canvas floor / ring */}
        <div style={{ position:'absolute',bottom:'15%',left:'10%',right:'10%',height:3,background:'rgba(255,68,0,0.2)',borderRadius:2 }} />
        <div style={{ position:'absolute',bottom:'12%',left:'5%',right:'5%',height:2,background:'rgba(255,68,0,0.1)',borderRadius:2 }} />

        {/* Fighters */}
        <div style={{ display:'flex',gap:40,alignItems:'flex-end',position:'relative' }}>
          {/* Player */}
          <div style={{ textAlign:'center',transition:'transform 0.1s',transform:player.state==='stunned'?'rotate(-10deg)':player.state==='cross'||player.state==='jab'?'translateX(8px)':knockdownAnim==='player'?'rotate(-40deg) translateY(30px)':'none' }}>
            <FighterSprite state={player.state} flipped={false} color={player.color} knockdownAnim={knockdownAnim==='player'} />
            <div style={{ color:'#00ffcc',fontSize:9,marginTop:4 }}>{player.name}</div>
          </div>

          {/* Hit flash */}
          <div style={{ position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',minWidth:100,textAlign:'center' }}>
            {lastHit && (
              <div style={{ color:lastHit.side==='ai'?'#00ffcc':'#ff4400',fontSize:lastHit.dmg>20?22:16,fontWeight:900,textShadow:`0 0 12px currentColor` }}>
                {lastHit.dmg > 0 ? `-${lastHit.dmg}` : 'MISS!'}
                {lastHit.dmg > 20 && <div style={{ fontSize:11 }}>{lastHit.label}</div>}
              </div>
            )}
            {activeCombo && (
              <div style={{ color:'#ffd700',fontSize:14,fontWeight:900,textShadow:'0 0 16px #ffd700',marginTop:4 }}>
                {activeCombo}!
              </div>
            )}
          </div>

          {/* AI */}
          <div style={{ textAlign:'center',transition:'transform 0.1s',transform:ai.state==='stunned'?'rotate(10deg)':ai.state==='cross'||ai.state==='jab'?'translateX(-8px)':knockdownAnim==='ai'?'rotate(40deg) translateY(30px)':'none' }}>
            <FighterSprite state={ai.state} flipped={true} color={ai.color} knockdownAnim={knockdownAnim==='ai'} />
            <div style={{ color:'#ff4400',fontSize:9,marginTop:4 }}>{ai.name}</div>
          </div>
        </div>

        {/* Phase overlays */}
        {phase==='intro' && (
          <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.88)' }}>
            <div style={{ color:'#ff4400',fontSize:28,fontWeight:900,marginBottom:6 }}>🥊 ROUND {round}</div>
            <div style={{ color:'#888',fontSize:12,marginBottom:6 }}>Chain combos for massive damage</div>
            <div style={{ color:'#555',fontSize:11,marginBottom:16,textAlign:'center',maxWidth:260 }}>
              JAB→CROSS (1.3×) · JAB→CROSS→HOOK (1.6×) · HOOK→UPPER (1.7×) · DODGE→CROSS (2.1×) · BLOCK→UPPER (1.8×) · FULL COMBO (2.5×)
            </div>
            <button onClick={() => setPhase('fight')} style={{ background:'#ff440022',border:'2px solid #ff4400',color:'#ff4400',borderRadius:8,padding:'14px 44px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:18 }}>
              FIGHT!
            </button>
          </div>
        )}
        {phase==='roundEnd' && (
          <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.8)' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ color:player.hp>ai.hp?'#00ffcc':'#ff4400',fontSize:20,fontWeight:900 }}>
                {player.hp>ai.hp?'ROUND WIN 🏆':'ROUND LOSS'}
              </div>
              <div style={{ color:'#888',marginTop:6,fontSize:12 }}>Corner break... Next round in 3s</div>
            </div>
          </div>
        )}
        {phase==='gameover' && (
          <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.93)' }}>
            <div style={{ fontSize:56,marginBottom:10 }}>{player.hp>=ai.hp?'🏆':'💀'}</div>
            <div style={{ color:player.hp>=ai.hp?'#ffd700':'#ff4400',fontSize:24,fontWeight:900,marginBottom:6 }}>
              {player.hp>=ai.hp?'OMNIVERSE CHAMPION!':'DECISION LOSS'}
            </div>
            {player.hp>=ai.hp && <div style={{ color:'#00cc44',fontSize:13,marginBottom:8 }}>+$3,500 · +800 XP · Belt earned!</div>}
            <div style={{ color:'#555',fontSize:11,marginBottom:6 }}>Rounds: {round-1}/{maxRounds} · Your HP: {player.hp} · AI HP: {ai.hp}</div>
            <div style={{ color:'#555',fontSize:10,marginBottom:16 }}>Total Damage: {player.totalDamage} · Knockdowns: {ai.knockdowns}</div>
            {/* Round scorecards */}
            <div style={{ display:'flex',gap:8,marginBottom:16 }}>
              {roundScores.map((r,i) => (
                <div key={i} style={{ background:r.player>r.ai?'rgba(0,204,68,0.15)':'rgba(255,68,0,0.15)',border:`1px solid ${r.player>r.ai?'#00cc44':'#ff4400'}`,borderRadius:4,padding:'4px 8px',textAlign:'center',fontSize:9 }}>
                  <div style={{ color:'#888' }}>R{i+1}</div>
                  <div style={{ color:'#00ffcc' }}>{r.player}</div>
                  <div style={{ color:'#ff4400' }}>{r.ai}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={() => { setRound(1); setPhase('intro'); setPlayer(p=>({...p,hp:100,stamina:100,state:'idle',knockdowns:0,totalDamage:0,totalThrown:0})); setAI(a=>({...a,hp:100,stamina:100,state:'idle',knockdowns:0,totalDamage:0})); setRoundScores([]); setRoundTimer(60); setCrowdMeter(50); playerMoveHistory.current=[] }}
                style={{ background:'#ff440022',border:'1px solid #ff4400',color:'#ff4400',borderRadius:6,padding:'10px 24px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>REMATCH</button>
              <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:6,padding:'10px 24px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
            </div>
          </div>
        )}
      </div>

      {/* Battle log */}
      <div style={{ height:52,overflowY:'auto',padding:'3px 12px',borderTop:'1px solid #1a000a',background:'rgba(0,0,5,0.9)' }}>
        {log.slice(-3).map((l,i)=><div key={i} style={{ fontSize:10,color:l.includes('AI')||l.includes('stunned')?'#ff4400':l.includes('🔥')||l.includes('⚡')||l.includes('🛡')?'#ffd700':l.includes('stamina')?'#888':'#00ffcc' }}>{l}</div>)}
      </div>

      {/* Move buttons */}
      <div style={{ padding:'8px 10px',background:'rgba(0,0,5,0.98)',borderTop:'1px solid #ff440033' }}>
        <div style={{ color:'#333',fontSize:9,marginBottom:5,letterSpacing:2 }}>ATTACK · DEFEND · CHAIN COMBOS</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginBottom:5 }}>
          {(['jab','cross','hook','uppercut'] as Move[]).map(m => (
            <button key={m} onClick={() => doPlayerMove(m)} disabled={player.stamina<MOVE_DATA[m].staminaCost||phase!=='fight'}
              style={{ background:player.stamina>=MOVE_DATA[m].staminaCost&&phase==='fight'?'#ff440022':'#0a0005',border:`1px solid ${player.stamina>=MOVE_DATA[m].staminaCost&&phase==='fight'?'#ff4400':'#222'}`,color:player.stamina>=MOVE_DATA[m].staminaCost&&phase==='fight'?'#ff4400':'#333',borderRadius:6,padding:'9px 4px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>
              <div style={{ fontSize:18 }}>{MOVE_DATA[m].emoji}</div>
              <div style={{ fontSize:10 }}>{MOVE_DATA[m].label}</div>
              <div style={{ fontSize:8,color:'#555' }}>{MOVE_DATA[m].staminaCost}STA</div>
            </button>
          ))}
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5 }}>
          {(['body','block','dodge_left','dodge_right'] as Move[]).map(m => (
            <button key={m} onClick={() => doPlayerMove(m)} disabled={player.stamina<MOVE_DATA[m].staminaCost||phase!=='fight'}
              style={{ background:m==='block'||m.startsWith('dodge')?'#00ffcc11':'#ff880011',border:`1px solid ${m==='block'||m.startsWith('dodge')?'#00ffcc44':'#ff880044'}`,color:m==='block'||m.startsWith('dodge')?'#00ffcc':'#ff8800',borderRadius:6,padding:'9px 4px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>
              <div style={{ fontSize:18 }}>{MOVE_DATA[m].emoji}</div>
              <div style={{ fontSize:10 }}>{MOVE_DATA[m].label}</div>
              <div style={{ fontSize:8,color:'#555' }}>{MOVE_DATA[m].staminaCost}STA</div>
            </button>
          ))}
        </div>
        <div style={{ color:'#222',fontSize:8,marginTop:4,textAlign:'center' }}>
          JAB→CROSS→HOOK→UPPER = 🔥 OMNIVERSE COMBO (2.5×) · DODGE→CROSS = ⚡ SLIP COUNTER (2.1×)
        </div>
      </div>
    </div>
  )
}
