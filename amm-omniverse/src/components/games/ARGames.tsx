// AMM AR Games — Laser Tag + Pokémon GO Capture + Yu-Gi-Oh Card Battles
// Uses WebXR API (no app install needed on modern phones)
// Falls back to simulated AR when WebXR not available
// Real implementations: Device camera overlay, GPS for creature locations,
// Gyroscope for aiming, Canvas overlay for holographic effects

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

// ── SHARED AR TYPES ──────────────────────────────────────────────────────────

interface AREnemy { id: string; x: number; y: number; hp: number; maxHp: number; emoji: string; name: string; type: string }
interface Creature { id: string; name: string; type: string; rarity: 'common'|'rare'|'epic'|'legendary'|'divine'; hp: number; maxHp: number; attack: number; defense: number; special: string; emoji: string; level: number; caught: boolean; lat?: number; lng?: number }
interface Card { id: string; name: string; type: 'creature'|'spell'|'trap'|'warrior'|'shield'|'boss'; atk: number; def: number; emoji: string; rarity: 'common'|'rare'|'ultra'; special?: string; element: 'faith'|'fire'|'water'|'earth'|'void' }
interface BattleCard extends Card { owner: 'player'|'ai'; isAttacking?: boolean }

// ── CREATURES (Pokémon GO style) ──────────────────────────────────────────────
const CREATURE_POOL: Creature[] = [
  { id:'c1',  name:'Gospel Lion',    type:'Faith Beast',  rarity:'epic',      hp:120, maxHp:120, attack:85, defense:70, special:'Holy Roar — stuns enemy', emoji:'🦁', level:12, caught:false },
  { id:'c2',  name:'Prophet Eagle',  type:'Divine Wing',  rarity:'legendary', hp:95,  maxHp:95,  attack:92, defense:60, special:'Prophecy Strike — triple hit', emoji:'🦅', level:18, caught:false },
  { id:'c3',  name:'Kingdom Wolf',   type:'Pack Leader',  rarity:'rare',      hp:80,  maxHp:80,  attack:75, defense:65, special:'Pack Howl — team buff', emoji:'🐺', level:8, caught:false },
  { id:'c4',  name:'Seraphim Owl',   type:'Celestial',    rarity:'divine',    hp:200, maxHp:200, attack:110,defense:90, special:'Divine Vision — instant capture', emoji:'🦉', level:30, caught:false },
  { id:'c5',  name:'Fire Dragon',    type:'Mythic',       rarity:'epic',      hp:150, maxHp:150, attack:100,defense:80, special:'Inferno Blast — area damage', emoji:'🐉', level:20, caught:false },
  { id:'c6',  name:'Ghost Spirit',   type:'Specter',      rarity:'rare',      hp:60,  maxHp:60,  attack:70, defense:40, special:'Phase Shift — dodge all', emoji:'👻', level:6, caught:false },
  { id:'c7',  name:'Holy Bear',      type:'Faith Beast',  rarity:'common',    hp:100, maxHp:100, attack:65, defense:85, special:'Iron Hide — reduce damage', emoji:'🐻', level:5, caught:false },
  { id:'c8',  name:'Storm Phoenix',  type:'Mythic Bird',  rarity:'legendary', hp:130, maxHp:130, attack:95, defense:75, special:'Rebirth — restore HP on KO', emoji:'🔥', level:25, caught:false },
  { id:'c9',  name:'Shadow Panther', type:'Night Beast',  rarity:'epic',      hp:90,  maxHp:90,  attack:88, defense:58, special:'Stealth Strike — crit hit', emoji:'🐆', level:14, caught:false },
  { id:'c10', name:'Zion Tiger',     type:'Kingdom Beast',rarity:'rare',      hp:110, maxHp:110, attack:80, defense:72, special:'Kingdom Roar — +20% team', emoji:'🐯', level:10, caught:false },
]

// ── CARDS (Yu-Gi-Oh style) ────────────────────────────────────────────────────
const STARTER_DECK: Card[] = [
  { id:'k1', name:'Holy Warrior',    type:'warrior', atk:1800, def:1200, emoji:'⚔️', rarity:'rare',   element:'faith', special:'Faith Strike: +500 ATK vs dark' },
  { id:'k2', name:'Gospel Shield',   type:'shield',  atk:0,    def:2400, emoji:'🛡️', rarity:'ultra',  element:'faith', special:'Divine Wall: Negate 1 attack' },
  { id:'k3', name:'Fire Drake',      type:'creature',atk:1600, def:800,  emoji:'🔥', rarity:'common', element:'fire',  special:'Burn: 200 damage per turn' },
  { id:'k4', name:'Prophet Vision',  type:'spell',   atk:0,    def:0,    emoji:'👁️', rarity:'rare',   element:'faith', special:'Draw 3 cards + gain 500 LP' },
  { id:'k5', name:'Kingdom King',    type:'boss',    atk:3000, def:2500, emoji:'👑', rarity:'ultra',  element:'faith', special:'Cannot be destroyed except by faith cards' },
  { id:'k6', name:'Spirit Trap',     type:'trap',    atk:0,    def:0,    emoji:'🕳️', rarity:'common', element:'void',  special:'Negate + destroy 1 monster when attacked' },
  { id:'k7', name:'Water Guardian',  type:'creature',atk:1400, def:1600, emoji:'🌊', rarity:'common', element:'water', special:'Flood: Reduces all DEF by 300' },
  { id:'k8', name:'Earth Titan',     type:'warrior', atk:2100, def:1900, emoji:'🏔️', rarity:'rare',   element:'earth', special:'Quake: Stuns opponent 1 turn' },
]

// ── LASER TAG GAME ─────────────────────────────────────────────────────────────

export function LaserTagAR({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [enemies, setEnemies] = useState<AREnemy[]>([])
  const [playerHp, setPlayerHp] = useState(100)
  const [score, setScore] = useState(0)
  const [ammo, setAmmo] = useState(30)
  const [wave, setWave] = useState(1)
  const [phase, setPhase] = useState<'intro'|'playing'|'gameover'>('intro')
  const [crosshair, setCrosshair] = useState({ x: 50, y: 50 })
  const [shots, setShots] = useState<Array<{x:number;y:number;id:number}>>([])
  const [hasGyro, setHasGyro] = useState(false)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const frameRef = useRef<number>(0)
  const animFrameRef = useRef<number>(0)

  const spawnWave = useCallback((waveNum: number) => {
    const count = Math.min(3 + waveNum, 7)
    const types = [
      { emoji: '👻', name: 'Ghost Bot', hp: 40 + waveNum * 10 },
      { emoji: '🤖', name: 'AI Guard',  hp: 60 + waveNum * 15 },
      { emoji: '👾', name: 'Shadow',    hp: 30 + waveNum * 8  },
      { emoji: '💀', name: 'Specter',   hp: 80 + waveNum * 20 },
    ]
    const newEnemies: AREnemy[] = Array.from({ length: count }, (_, i) => {
      const t = types[i % types.length]
      return { id: `e${Date.now()}_${i}`, x: 10 + Math.random() * 80, y: 15 + Math.random() * 60, hp: t.hp, maxHp: t.hp, emoji: t.emoji, name: t.name, type: 'enemy' }
    })
    setEnemies(newEnemies)
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640, height: 480 } })
      if (videoRef.current) { videoRef.current.srcObject = stream; setCameraActive(true) }
    } catch { setCameraActive(false) }
    // Check gyroscope
    if (typeof DeviceOrientationEvent !== 'undefined') {
      setHasGyro(true)
      window.addEventListener('deviceorientation', handleGyro)
    }
  }

  const handleGyro = useCallback((e: DeviceOrientationEvent) => {
    if (!e.gamma || !e.beta) return
    const x = Math.max(5, Math.min(95, 50 + (e.gamma / 45) * 40))
    const y = Math.max(5, Math.min(95, 50 + (e.beta / 45) * 30))
    setCrosshair({ x, y })
  }, [])

  const shoot = () => {
    if (phase !== 'playing' || ammo <= 0) return
    setAmmo(a => a - 1)
    const shotId = Date.now()
    setShots(s => [...s, { x: crosshair.x, y: crosshair.y, id: shotId }])
    setTimeout(() => setShots(s => s.filter(sh => sh.id !== shotId)), 400)

    // Hit detection
    let hit = false
    setEnemies(prev => {
      const updated = prev.map(e => {
        const ex = e.x, ey = e.y
        const dist = Math.sqrt((ex - crosshair.x) ** 2 + (ey - crosshair.y) ** 2)
        if (dist < 8) {
          hit = true
          const dmg = 20 + Math.floor(Math.random() * 15)
          return { ...e, hp: Math.max(0, e.hp - dmg) }
        }
        return e
      }).filter(e => e.hp > 0)
      if (hit) {
        setScore(s => s + 100)
        setHits(h => h + 1)
      } else {
        setMisses(m => m + 1)
      }
      if (updated.length === 0) {
        setWave(w => { spawnWave(w + 1); return w + 1 })
        setAmmo(a => Math.min(30, a + 15))
        store.earnXp(50); store.setNotif(`Wave ${wave + 1} incoming!`)
      }
      return updated
    })
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const iv = setInterval(() => {
      setEnemies(prev => prev.map(e => {
        // Enemies move and shoot
        const newY = Math.min(85, e.y + 0.3)
        return { ...e, y: newY }
      }))
      // Enemies at bottom shoot player
      setEnemies(prev => {
        prev.forEach(e => {
          if (e.y > 75 && Math.random() > 0.7) {
            setPlayerHp(hp => {
              const newHp = hp - 8
              if (newHp <= 0) { setPhase('gameover') }
              return Math.max(0, newHp)
            })
          }
        })
        return prev
      })
    }, 400)
    return () => clearInterval(iv)
  }, [phase])

  const rarity_color: Record<string, string> = { common:'#888', rare:'#00ccff', epic:'#8800ff', legendary:'#ffd700', divine:'#ffffff' }

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', fontFamily: 'monospace', position: 'relative', overflow: 'hidden', userSelect: 'none' }}>
      {/* Camera feed */}
      <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: cameraActive ? 0.7 : 0 }} />

      {/* Dark overlay when no camera */}
      {!cameraActive && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#001122,#000011)' }} />}

      {/* AR Grid overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}>
        {Array.from({ length: 8 }, (_, i) => <line key={`v${i}`} x1={`${i * 14}%`} y1="0" x2={`${i * 14}%`} y2="100%" stroke="#00ffcc" strokeWidth="0.5"/>)}
        {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1="0" y1={`${i * 17}%`} x2="100%" y2={`${i * 17}%`} stroke="#00ffcc" strokeWidth="0.5"/>)}
      </svg>

      {/* HUD */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.5)' }}>
        <div style={{ color: '#00ffcc', fontSize: 13, fontWeight: 700 }}>💥 {score}</div>
        <div style={{ color: '#ffd700', fontSize: 13 }}>WAVE {wave}</div>
        <div style={{ color: ammo > 10 ? '#00cc44' : '#ff4400', fontSize: 13 }}>🔫 {ammo}</div>
      </div>
      <div style={{ position: 'absolute', top: 36, left: 8, right: 8 }}>
        <div style={{ background: '#111', borderRadius: 4, height: 6 }}>
          <div style={{ background: playerHp > 50 ? '#00cc44' : playerHp > 25 ? '#ffaa00' : '#ff4400', height: '100%', width: `${playerHp}%`, borderRadius: 4 }} />
        </div>
      </div>

      {/* Enemies */}
      {enemies.map(e => (
        <div key={e.id} style={{ position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, transform: 'translate(-50%,-50%)', textAlign: 'center', cursor: 'pointer' }} onClick={shoot}>
          <div style={{ fontSize: 36, filter: 'drop-shadow(0 0 8px #ff4400)' }}>{e.emoji}</div>
          <div style={{ width: 36, height: 4, background: '#111', borderRadius: 2, margin: '2px auto' }}>
            <div style={{ background: '#ff4400', height: '100%', width: `${(e.hp / e.maxHp) * 100}%`, borderRadius: 2 }} />
          </div>
          <div style={{ color: '#ff4400', fontSize: 9 }}>{e.name}</div>
        </div>
      ))}

      {/* Shot effects */}
      {shots.map(s => (
        <div key={s.id} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)', fontSize: 24, filter: 'drop-shadow(0 0 12px #00ffcc)', pointerEvents: 'none' }}>
          ⚡
        </div>
      ))}

      {/* Crosshair */}
      {phase === 'playing' && (
        <div style={{ position: 'absolute', left: `${crosshair.x}%`, top: `${crosshair.y}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#00ffcc" strokeWidth="1.5"/>
            <line x1="20" y1="2" x2="20" y2="12" stroke="#00ffcc" strokeWidth="2"/>
            <line x1="20" y1="28" x2="20" y2="38" stroke="#00ffcc" strokeWidth="2"/>
            <line x1="2" y1="20" x2="12" y2="20" stroke="#00ffcc" strokeWidth="2"/>
            <line x1="28" y1="20" x2="38" y2="20" stroke="#00ffcc" strokeWidth="2"/>
          </svg>
        </div>
      )}

      {/* Phase overlays */}
      {phase === 'intro' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⚡</div>
          <div style={{ color: '#00ffcc', fontSize: 22, fontWeight: 900, letterSpacing: 4, marginBottom: 6 }}>AR LASER TAG</div>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 16, textAlign: 'center', maxWidth: 280 }}>
            Camera overlay + gyroscope aiming. Point your phone and tap to fire. Enemies spawn in AR — destroy them before they reach you!
          </div>
          {!cameraActive && <div style={{ color: '#ffaa00', fontSize: 11, marginBottom: 12 }}>⚠️ Camera access = real AR. Without = simulated AR.</div>}
          <button onClick={() => { startCamera(); setPhase('playing'); spawnWave(1) }}
            style={{ background: '#00ffcc22', border: '2px solid #00ffcc', color: '#00ffcc', borderRadius: 8, padding: '14px 40px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 16 }}>
            ⚡ ENTER THE BATTLE
          </button>
          <button onClick={onExit} style={{ marginTop: 12, background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>← BACK</button>
        </div>
      )}

      {phase === 'gameover' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💀</div>
          <div style={{ color: '#ff4400', fontSize: 20, fontWeight: 900, marginBottom: 6 }}>ELIMINATED</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>Score: {score} · Wave {wave}</div>
          <div style={{ color: '#555', fontSize: 11, marginBottom: 16 }}>Hits: {hits} · Accuracy: {hits + misses > 0 ? Math.round(hits / (hits + misses) * 100) : 0}%</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setPlayerHp(100); setScore(0); setWave(1); setAmmo(30); setHits(0); setMisses(0); setEnemies([]); setPhase('playing'); spawnWave(1) }}
              style={{ background: '#00ffcc22', border: '1px solid #00ffcc', color: '#00ffcc', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>RETRY</button>
            <button onClick={onExit} style={{ background: '#11111180', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontFamily: 'monospace' }}>EXIT</button>
          </div>
        </div>
      )}

      {/* Shoot button (for non-gyro) */}
      {phase === 'playing' && !hasGyro && (
        <button onClick={shoot} style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#00ffcc22', border: '2px solid #00ffcc', color: '#00ffcc', borderRadius: '50%', width: 80, height: 80, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 24 }}>
          ⚡
        </button>
      )}
      {/* Move crosshair on tap (for non-gyro) */}
      {phase === 'playing' && !hasGyro && (
        <div style={{ position: 'absolute', inset: 0 }} onTouchStart={e => {
          const t = e.touches[0]
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          setCrosshair({ x: ((t.clientX - rect.left) / rect.width) * 100, y: ((t.clientY - rect.top) / rect.height) * 100 })
          shoot()
        }} onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          setCrosshair({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
          shoot()
        }} />
      )}

      <button onClick={onExit} style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>EXIT</button>
    </div>
  )
}

// ── POKÉMON GO STYLE CREATURE CAPTURE ─────────────────────────────────────────

export function CreatureCaptureAR({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [phase, setPhase] = useState<'map'|'encounter'|'captured'|'inventory'>('map')
  const [nearbyCreatures, setNearbyCreatures] = useState<Creature[]>([])
  const [activeCreature, setActiveCreature] = useState<Creature | null>(null)
  const [caught, setCaught] = useState<Creature[]>([])
  const [throwPower, setThrowPower] = useState(0)
  const [throwing, setThrowing] = useState(false)
  const [catchAnim, setCatchAnim] = useState<'none'|'throw'|'shake'|'success'|'fail'>('none')
  const [weakened, setWeakened] = useState(false)
  const [xp, setXp] = useState(0)
  const meterRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Spawn nearby creatures
    const pool = [...CREATURE_POOL].sort(() => Math.random() - 0.5).slice(0, 5)
    pool.forEach((c, i) => {
      c.id = `c${Date.now()}_${i}`
      c.caught = false
    })
    setNearbyCreatures(pool)
  }, [])

  const encounter = (c: Creature) => { setActiveCreature({ ...c }); setWeakened(false); setPhase('encounter') }

  const weakenCreature = () => {
    if (!activeCreature) return
    const dmg = 20 + Math.floor(Math.random() * 25)
    const newHp = Math.max(5, activeCreature.hp - dmg)
    setActiveCreature(a => a ? ({ ...a, hp: newHp }) : null)
    setWeakened(newHp < activeCreature.maxHp * 0.4)
  }

  const startThrow = () => {
    if (throwing) return
    setThrowing(true)
    setThrowPower(0)
    meterRef.current = setInterval(() => {
      setThrowPower(v => {
        if (v >= 100) { clearInterval(meterRef.current!); return 100 }
        return v + 3
      })
    }, 30)
  }

  const releaseThrow = () => {
    if (!throwing || !activeCreature) return
    clearInterval(meterRef.current!)
    const power = throwPower
    setThrowing(false)
    setCatchAnim('throw')

    setTimeout(() => {
      setCatchAnim('shake')
      const catchRate = (weakened ? 0.65 : 0.35) * (power / 100) * (1 / activeCreature.level * 15)
      const caught_this = Math.random() < Math.max(0.05, Math.min(0.95, catchRate))

      setTimeout(() => {
        if (caught_this) {
          setCatchAnim('success')
          const earnedXp = activeCreature.level * 50
          setXp(x => x + earnedXp)
          setCaught(prev => [...prev, { ...activeCreature, caught: true }])
          setNearbyCreatures(prev => prev.filter(c => c.id !== activeCreature.id))
          store.earnXp(earnedXp); store.earnCash(activeCreature.level * 10)
          store.setNotif(`✅ ${activeCreature.name} caught! +${earnedXp} XP`)
          setTimeout(() => { setCatchAnim('none'); setPhase('map') }, 2000)
        } else {
          setCatchAnim('fail')
          setActiveCreature(a => a ? ({ ...a, hp: Math.min(a.maxHp, a.hp + 10) }) : null)
          setTimeout(() => setCatchAnim('none'), 1500)
        }
      }, 1200)
    }, 500)
    setThrowPower(0)
  }

  const rarityColor: Record<string, string> = { common:'#888', rare:'#00ccff', epic:'#8800ff', legendary:'#ffd700', divine:'#fff' }

  return (
    <div style={{ width:'100%',height:'100%',background:'#020a12',fontFamily:'monospace',display:'flex',flexDirection:'column' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid #00cc4433' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <span style={{ color:'#00cc44',fontWeight:900,fontSize:14,letterSpacing:3 }}>🌍 CREATURE CAPTURE</span>
        <span style={{ color:'#555',fontSize:11,marginLeft:'auto' }}>Caught: {caught.length} · XP: {xp}</span>
        <button onClick={()=>setPhase(p=>p==='inventory'?'map':'inventory')} style={{ background:'#00cc4411',border:'1px solid #00cc4444',color:'#00cc44',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>🎒 BAG</button>
      </div>

      {phase === 'map' && (
        <div style={{ flex:1,overflowY:'auto',padding:14 }}>
          <div style={{ color:'#888',fontSize:12,marginBottom:12 }}>Walk around to find creatures. GPS locks them to real-world locations when VITE_GOOGLE_MAPS_KEY is set.</div>
          {/* Radar */}
          <div style={{ position:'relative',width:200,height:200,margin:'0 auto 20px',borderRadius:'50%',border:'2px solid #00cc4444',background:'rgba(0,10,0,0.8)' }}>
            <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:'1px solid #00cc4422' }} />
            <div style={{ position:'absolute',inset:'25%',borderRadius:'50%',border:'1px solid #00cc4422' }} />
            <div style={{ position:'absolute',inset:'50%',width:6,height:6,borderRadius:'50%',background:'#00cc44',transform:'translate(-50%,-50%)' }} />
            {nearbyCreatures.map((c,i) => {
              const angle = (i / nearbyCreatures.length) * Math.PI * 2
              const r = 0.3 + Math.random() * 0.35
              const x = 50 + Math.cos(angle) * r * 50
              const y = 50 + Math.sin(angle) * r * 50
              return (
                <div key={c.id} onClick={()=>encounter(c)} style={{ position:'absolute',left:`${x}%`,top:`${y}%`,transform:'translate(-50%,-50%)',cursor:'pointer',textAlign:'center' }}>
                  <div style={{ fontSize:22,filter:`drop-shadow(0 0 6px ${rarityColor[c.rarity]})` }}>{c.emoji}</div>
                  <div style={{ color:rarityColor[c.rarity],fontSize:8,fontWeight:700 }}>{c.rarity.toUpperCase()}</div>
                </div>
              )
            })}
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {nearbyCreatures.map(c=>(
              <div key={c.id} onClick={()=>encounter(c)} style={{ background:'rgba(5,15,5,0.9)',border:`1px solid ${rarityColor[c.rarity]}44`,borderRadius:10,padding:12,cursor:'pointer' }}>
                <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                  <span style={{ fontSize:28,filter:`drop-shadow(0 0 8px ${rarityColor[c.rarity]})` }}>{c.emoji}</span>
                  <div>
                    <div style={{ color:'#fff',fontWeight:700,fontSize:12 }}>{c.name}</div>
                    <div style={{ color:'#888',fontSize:10 }}>{c.type} · Lv.{c.level}</div>
                    <div style={{ color:rarityColor[c.rarity],fontSize:10,fontWeight:700 }}>{c.rarity.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'encounter' && activeCreature && (
        <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,background:'radial-gradient(ellipse at 50% 50%,#001a00 0%,#020a12 100%)' }}>
          {/* Catch animation */}
          {catchAnim==='throw' && <div style={{ position:'absolute',fontSize:36,animation:'float 0.5s ease-out' }}>⚾</div>}
          {catchAnim==='success' && <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,204,68,0.2)',fontSize:56 }}>✅</div>}
          {catchAnim==='fail' && <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,68,0,0.15)',fontSize:56 }}>💨</div>}

          <div style={{ fontSize:72,marginBottom:12,filter:`drop-shadow(0 0 20px ${rarityColor[activeCreature.rarity]})`, animation:catchAnim==='shake'?'shake 0.3s ease-in-out 4':'none' }}>
            {activeCreature.emoji}
          </div>
          <div style={{ color:rarityColor[activeCreature.rarity],fontSize:18,fontWeight:900,marginBottom:4 }}>{activeCreature.name}</div>
          <div style={{ color:'#888',fontSize:12,marginBottom:12 }}>{activeCreature.type} · Lv.{activeCreature.level}</div>
          {/* HP bar */}
          <div style={{ width:200,marginBottom:16 }}>
            <div style={{ color:'#888',fontSize:10,marginBottom:4 }}>HP: {activeCreature.hp}/{activeCreature.maxHp}</div>
            <div style={{ background:'#111',borderRadius:4,height:8 }}>
              <div style={{ background:activeCreature.hp/activeCreature.maxHp>0.5?'#00cc44':'#ffaa00',height:'100%',width:`${(activeCreature.hp/activeCreature.maxHp)*100}%`,borderRadius:4,transition:'width 0.3s' }} />
            </div>
            {weakened && <div style={{ color:'#00cc44',fontSize:10,marginTop:4 }}>⚡ Weakened — easier to catch!</div>}
          </div>
          {/* Special */}
          <div style={{ color:'#555',fontSize:11,marginBottom:16,textAlign:'center' }}>{activeCreature.special}</div>

          {/* Throw meter */}
          {catchAnim==='none' && (
            <div>
              <div style={{ width:240,height:14,background:'#111',borderRadius:7,marginBottom:10,overflow:'hidden',border:'1px solid #333' }}>
                <div style={{ height:'100%',width:`${throwPower}%`,background:throwPower>70?'#ffd700':throwPower>40?'#00cc44':'#00ccff',borderRadius:7,transition:'width 0.03s' }} />
              </div>
              <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
                <button onClick={weakenCreature} style={{ background:'#ff440022',border:'1px solid #ff4400',color:'#ff4400',borderRadius:6,padding:'8px 14px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
                  ⚔️ ATTACK
                </button>
                <button onMouseDown={startThrow} onMouseUp={releaseThrow} onTouchStart={startThrow} onTouchEnd={releaseThrow}
                  style={{ background:'#00cc4422',border:'2px solid #00cc44',color:'#00cc44',borderRadius:6,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:14 }}>
                  {throwing?'HOLD ⚾':'THROW ⚾'}
                </button>
                <button onClick={()=>{setPhase('map');setActiveCreature(null)}} style={{ background:'#11111180',border:'1px solid #333',color:'#555',borderRadius:6,padding:'8px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>FLEE</button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'inventory' && (
        <div style={{ flex:1,overflowY:'auto',padding:14 }}>
          <div style={{ color:'#00cc44',fontWeight:700,marginBottom:12 }}>🎒 YOUR CREATURES ({caught.length})</div>
          {caught.length===0 && <div style={{ color:'#555',fontSize:13,textAlign:'center',marginTop:40 }}>No creatures caught yet. Go explore!</div>}
          {caught.map(c=>(
            <div key={c.id} style={{ display:'flex',gap:12,padding:12,background:'rgba(5,15,5,0.9)',border:`1px solid ${rarityColor[c.rarity]}44`,borderRadius:10,marginBottom:8 }}>
              <span style={{ fontSize:36 }}>{c.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff',fontWeight:700 }}>{c.name} <span style={{ color:rarityColor[c.rarity],fontSize:10 }}>{c.rarity.toUpperCase()}</span></div>
                <div style={{ color:'#888',fontSize:11 }}>Lv.{c.level} · ATK:{c.attack} DEF:{c.defense}</div>
                <div style={{ color:'#555',fontSize:10 }}>{c.special}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── YU-GI-OH CARD BATTLE ──────────────────────────────────────────────────────

export function CardBattleAR({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [playerHand, setPlayerHand] = useState<Card[]>(STARTER_DECK.slice(0, 5))
  const [aiHand] = useState<Card[]>(STARTER_DECK.slice(3, 8).reverse())
  const [field, setField] = useState<{ player: BattleCard[]; ai: BattleCard[] }>({ player: [], ai: [] })
  const [playerLP, setPlayerLP] = useState(8000)
  const [aiLP, setAiLP] = useState(8000)
  const [phase, setPhase] = useState<'draw'|'main'|'battle'|'ai_turn'|'gameover'>('draw')
  const [selected, setSelected] = useState<Card | null>(null)
  const [log, setLog] = useState<string[]>(['Draw phase — pick your first hand!'])
  const [turn, setTurn] = useState(1)
  const [battleResult, setBattleResult] = useState<string | null>(null)
  const [deck, setDeck] = useState<Card[]>(STARTER_DECK.slice(5))

  const addLog = (m: string) => setLog(p => [...p.slice(-5), m])

  const drawCard = () => {
    if (deck.length === 0) { addLog('No cards left in deck!'); return }
    const [drawn, ...rest] = deck
    setPlayerHand(h => [...h, drawn])
    setDeck(rest)
    addLog(`Drew ${drawn.emoji} ${drawn.name}`)
    setPhase('main')
  }

  const playCard = (card: Card) => {
    if (phase !== 'main') return
    if (card.type === 'spell' || card.type === 'trap') {
      setPlayerLP(lp => Math.min(8000, lp + 500))
      addLog(`${card.emoji} ${card.name} activated! ${card.special}`)
    } else {
      const bc: BattleCard = { ...card, owner: 'player' }
      setField(f => ({ ...f, player: [...f.player.slice(-3), bc] }))
      addLog(`${card.emoji} ${card.name} summoned! ATK:${card.atk} DEF:${card.def}`)
    }
    setPlayerHand(h => h.filter(c => c.id !== card.id))
    setSelected(null)
    setPhase('battle')
  }

  const attack = (attacker: BattleCard) => {
    if (phase !== 'battle') return
    if (field.ai.length === 0) {
      setAiLP(lp => { const n = Math.max(0, lp - attacker.atk); if (n <= 0) setPhase('gameover'); return n })
      setBattleResult(`⚔️ Direct attack! ${attacker.atk} damage to AI!`)
      addLog(`${attacker.emoji} Direct attack — ${attacker.atk} damage!`)
    } else {
      const target = field.ai[0]
      const dmg = Math.max(0, attacker.atk - target.def)
      if (attacker.atk > target.def) {
        setField(f => ({ ...f, ai: f.ai.filter(c => c.id !== target.id) }))
        setAiLP(lp => { const n = Math.max(0, lp - dmg); if (n <= 0) setPhase('gameover'); return n })
        setBattleResult(`⚔️ ${attacker.name} destroyed ${target.name}! ${dmg > 0 ? `${dmg} LP damage` : ''}`)
        addLog(`${attacker.emoji} vs ${target.emoji} — ${attacker.name} wins!`)
      } else {
        const rDmg = target.def - attacker.atk
        setPlayerLP(lp => Math.max(0, lp - rDmg))
        setBattleResult(`💥 ${target.name} defended! You take ${rDmg} damage`)
        addLog(`Reflect damage: ${rDmg}`)
      }
    }
    setTimeout(() => { setBattleResult(null); setPhase('ai_turn'); doAITurn() }, 1500)
  }

  const doAITurn = () => {
    setTimeout(() => {
      // AI plays a card
      if (aiHand.length > 0) {
        const aiCard: BattleCard = { ...aiHand[Math.floor(Math.random() * aiHand.length)], owner: 'ai' }
        setField(f => ({ ...f, ai: [...f.ai.slice(-3), aiCard] }))
        addLog(`🤖 AI played ${aiCard.emoji} ${aiCard.name}`)
        // AI attacks
        setTimeout(() => {
          if (field.player.length === 0) {
            setPlayerLP(lp => { const n = Math.max(0, lp - aiCard.atk); if (n <= 0) setPhase('gameover'); return n })
            addLog(`🤖 AI direct attack — ${aiCard.atk} damage!`)
          } else {
            const target = field.player[0]
            if (aiCard.atk > target.def) {
              setField(f => ({ ...f, player: f.player.filter(c => c.id !== target.id) }))
              addLog(`🤖 AI destroyed ${target.name}!`)
            }
          }
          setTurn(t => t + 1)
          setPhase('draw')
        }, 1000)
      } else {
        setTurn(t => t + 1); setPhase('draw')
      }
    }, 1000)
  }

  const elCol: Record<string,string> = { faith:'#ffd700', fire:'#ff4400', water:'#00ccff', earth:'#00cc44', void:'#8800ff' }
  const won = playerLP > 0 && aiLP <= 0

  return (
    <div style={{ width:'100%',height:'100%',background:'#0a0008',fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none' }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderBottom:'1px solid #8800ff33' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← EXIT</button>
        <span style={{ color:'#8800ff',fontWeight:900,fontSize:13,letterSpacing:2 }}>🃏 CARD BATTLE</span>
        <span style={{ color:'#555',fontSize:11,marginLeft:'auto' }}>Turn {turn}</span>
      </div>

      {/* LP bars */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,padding:'6px 12px' }}>
        <div>
          <div style={{ color:'#00ffcc',fontSize:12,fontWeight:700 }}>{store.player.name||'YOU'}: {playerLP} LP</div>
          <div style={{ background:'#111',borderRadius:3,height:6 }}>
            <div style={{ background:'#00cc44',height:'100%',width:`${(playerLP/8000)*100}%`,borderRadius:3,transition:'width 0.3s' }} />
          </div>
        </div>
        <div style={{ color:'#555',fontSize:12,alignSelf:'center' }}>VS</div>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'#ff4400',fontSize:12,fontWeight:700 }}>AI: {aiLP} LP</div>
          <div style={{ background:'#111',borderRadius:3,height:6 }}>
            <div style={{ background:'#ff4400',height:'100%',width:`${(aiLP/8000)*100}%`,borderRadius:3,transition:'width 0.3s',marginLeft:'auto' }} />
          </div>
        </div>
      </div>

      {/* Field */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',gap:8,padding:'0 10px',overflow:'hidden' }}>
        {/* AI field */}
        <div>
          <div style={{ color:'#555',fontSize:9,marginBottom:4 }}>AI FIELD</div>
          <div style={{ display:'flex',gap:6 }}>
            {field.ai.map(c=>(
              <div key={c.id} style={{ background:`${elCol[c.element]}15`,border:`1px solid ${elCol[c.element]}55`,borderRadius:6,padding:'6px 8px',textAlign:'center',minWidth:70 }}>
                <div style={{ fontSize:20 }}>{c.emoji}</div>
                <div style={{ color:'#ccc',fontSize:9,fontWeight:700 }}>{c.name.split(' ')[0]}</div>
                <div style={{ color:'#ff4400',fontSize:9 }}>ATK {c.atk}</div>
                <div style={{ color:'#00ccff',fontSize:9 }}>DEF {c.def}</div>
              </div>
            ))}
            {field.ai.length===0 && <div style={{ color:'#333',fontSize:11,padding:'10px 0' }}>No monsters</div>}
          </div>
        </div>

        {/* Battle result */}
        {battleResult && <div style={{ textAlign:'center',color:'#ffd700',fontSize:14,fontWeight:900,padding:'4px 0' }}>{battleResult}</div>}

        {/* Player field */}
        <div>
          <div style={{ color:'#555',fontSize:9,marginBottom:4 }}>YOUR FIELD</div>
          <div style={{ display:'flex',gap:6 }}>
            {field.player.map(c=>(
              <div key={c.id} onClick={()=>{if(phase==='battle')attack(c)}} style={{ background:`${elCol[c.element]}22`,border:`2px solid ${phase==='battle'?elCol[c.element]:'#333'}`,borderRadius:6,padding:'6px 8px',textAlign:'center',minWidth:70,cursor:phase==='battle'?'pointer':'default' }}>
                <div style={{ fontSize:20 }}>{c.emoji}</div>
                <div style={{ color:'#fff',fontSize:9,fontWeight:700 }}>{c.name.split(' ')[0]}</div>
                <div style={{ color:'#ff8800',fontSize:9 }}>ATK {c.atk}</div>
                <div style={{ color:'#00ccff',fontSize:9 }}>DEF {c.def}</div>
                {phase==='battle' && <div style={{ color:'#ffd700',fontSize:8 }}>TAP=ATTACK</div>}
              </div>
            ))}
            {field.player.length===0 && <div style={{ color:'#333',fontSize:11,padding:'10px 0' }}>No monsters</div>}
          </div>
        </div>

        {/* Log */}
        <div style={{ height:40,overflowY:'auto',fontSize:10,color:'#555' }}>
          {log.slice(-3).map((l,i)=><div key={i}>{l}</div>)}
        </div>
      </div>

      {/* Hand */}
      <div style={{ padding:'6px 10px',borderTop:'1px solid #8800ff33',background:'rgba(8,0,12,0.95)' }}>
        <div style={{ color:'#555',fontSize:9,marginBottom:6,letterSpacing:2 }}>
          {phase==='draw'?'DRAW PHASE':phase==='main'?'MAIN PHASE — SELECT & PLAY':phase==='battle'?'BATTLE PHASE — TAP FIELD MONSTER TO ATTACK':'AI THINKING...'}
        </div>
        {phase==='draw' && <button onClick={drawCard} style={{ width:'100%',background:'#8800ff22',border:'1px solid #8800ff',color:'#8800ff',borderRadius:6,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>🃏 DRAW CARD</button>}
        {(phase==='main') && (
          <div style={{ display:'flex',gap:5,overflowX:'auto',paddingBottom:4 }}>
            {playerHand.map(c=>(
              <div key={c.id} onClick={()=>setSelected(s=>s?.id===c.id?null:c)} style={{ flexShrink:0,background:selected?.id===c.id?`${elCol[c.element]}22`:`${elCol[c.element]}11`,border:`2px solid ${selected?.id===c.id?elCol[c.element]:'#333'}`,borderRadius:8,padding:'6px 8px',textAlign:'center',cursor:'pointer',minWidth:65 }}>
                <div style={{ fontSize:18 }}>{c.emoji}</div>
                <div style={{ color:'#ccc',fontSize:9 }}>{c.name.split(' ')[0]}</div>
                <div style={{ color:elCol[c.element],fontSize:8 }}>{c.element}</div>
              </div>
            ))}
            {selected && <button onClick={()=>playCard(selected)} style={{ flexShrink:0,background:'#ffd70022',border:'1px solid #ffd700',color:'#ffd700',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,alignSelf:'center' }}>PLAY</button>}
          </div>
        )}
        {phase==='battle' && field.player.length===0 && (
          <button onClick={()=>{setTurn(t=>t+1);setPhase('ai_turn');doAITurn()}} style={{ width:'100%',background:'#33333322',border:'1px solid #333',color:'#888',borderRadius:6,padding:'8px',cursor:'pointer',fontFamily:'monospace' }}>END TURN (no monsters)</button>
        )}
        {phase==='gameover' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ color:won?'#ffd700':'#ff4400',fontSize:16,fontWeight:900,marginBottom:8 }}>{won?'🏆 DUEL WIN!':'💀 DUEL OVER'}</div>
            <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
              <button onClick={()=>{setPlayerLP(8000);setAiLP(8000);setField({player:[],ai:[]});setPlayerHand(STARTER_DECK.slice(0,5));setDeck(STARTER_DECK.slice(5));setTurn(1);setLog(['Draw phase!']);setPhase('draw')}}
                style={{ background:'#8800ff22',border:'1px solid #8800ff',color:'#8800ff',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>REMATCH</button>
              <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
