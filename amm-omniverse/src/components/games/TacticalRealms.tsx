// AMM Tactical Realms — Original Shooter Game
// NOT copying CoD, Fortnite, GTA, Apex, Battlefield
// All original: Faith Warrior universe, original weapons, original maps

import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../../game/state/useGameStore'
import { hollywoodSounds } from '../../game/engine/HollywoodEngine'

type WeaponId = 'faith_blade'|'scroll_cannon'|'shofar_burst'|'light_arc'|'shadow_trap'|'cosmic_lance'
type MapId = 'amm_city_night'|'judah_highlands'|'saturn_ring'|'shadow_corridors'|'marketplace_chase'|'faith_temple'
type GameMode = 'training'|'team_battle'|'capture'|'survival'|'ranked'
type SquadRole = 'vanguard'|'support'|'tactician'|'scout'|'guardian'

interface Weapon {
  id: WeaponId; name: string; emoji: string; type: string
  dmg: number; range: number; cooldown: number; ammo: number; maxAmmo: number
  color: string; desc: string; special: string
}

interface Enemy {
  id: number; x: number; y: number; hp: number; maxHp: number
  type: 'shadow_drone'|'void_stalker'|'corrupted_guard'|'boss'
  emoji: string; speed: number; dmg: number; reward: number
}

interface MapDef {
  id: MapId; name: string; emoji: string; theme: string
  color: string; enemyTypes: Enemy['type'][]; desc: string
}

const WEAPONS: Record<WeaponId, Weapon> = {
  faith_blade:   { id:'faith_blade',   name:'Faith Blade',      emoji:'⚔️', type:'melee',   dmg:35, range:1,  cooldown:400,  ammo:999, maxAmmo:999, color:'#ffd700', desc:'Ancient blade blessed at Shavuot. Close range. No reload.', special:'Righteous Strike: every 5th hit deals 2× damage' },
  scroll_cannon: { id:'scroll_cannon', name:'Scroll Cannon',    emoji:'📜', type:'ranged',  dmg:22, range:8,  cooldown:600,  ammo:20,  maxAmmo:20,  color:'#00ccff', desc:'Fires energy bolts from ancient scrolls.', special:'Wisdom Shot: consecutive hits stack +5 dmg' },
  shofar_burst:  { id:'shofar_burst',  name:'Shofar Burst',     emoji:'📯', type:'special', dmg:60, range:5,  cooldown:8000, ammo:3,   maxAmmo:3,   color:'#ffaa00', desc:'Area blast. Stuns all enemies in radius 2 seconds.', special:'Feast Power: +30% radius during Hebrew feast season' },
  light_arc:     { id:'light_arc',     name:'Light Arc',        emoji:'✨', type:'ranged',  dmg:18, range:6,  cooldown:150,  ammo:30,  maxAmmo:30,  color:'#ffffff', desc:'Rapid-fire holy energy. High DPS, low accuracy.', special:'Holy Beam: hold to charge for 3× burst' },
  shadow_trap:   { id:'shadow_trap',   name:'Shadow Trap',      emoji:'🕳️', type:'trap',    dmg:45, range:0,  cooldown:2000, ammo:5,   maxAmmo:5,   color:'#8800ff', desc:'Place on ground, enemies trigger it. Lasts 60 seconds.', special:'Shadow Chain: traps 2 enemies in sequence' },
  cosmic_lance:  { id:'cosmic_lance',  name:'El Saturn Lance',  emoji:'🔱', type:'sniper',  dmg:95, range:20, cooldown:3000, ammo:8,   maxAmmo:8,   color:'#ffaa00', desc:'Long range. 1.5s charge. Penetrates barriers.', special:'Saturn Ring: charged shot pierces through all enemies in line' },
}

const MAPS: MapDef[] = [
  { id:'amm_city_night',    name:'AMM City Night',          emoji:'🌃', theme:'Urban holographic', color:'#00ffcc', enemyTypes:['shadow_drone','void_stalker'], desc:'Neon-lit streets of AMM City at night. Portals glow. Tight alleys.' },
  { id:'judah_highlands',   name:'Judah Highlands',         emoji:'🏔️', theme:'Ancient Realm',    color:'#ffd700', enemyTypes:['corrupted_guard','void_stalker'], desc:'Ancient highlands of the Judah Realm. Open sightlines. Sacred ruins.' },
  { id:'saturn_ring',       name:'El Saturn Ring Station',  emoji:'🪐', theme:'Cosmic Platform',  color:'#ffaa00', enemyTypes:['shadow_drone','boss'], desc:'Zero-gravity platform on Saturn\'s ring. Cosmic energy everywhere.' },
  { id:'shadow_corridors',  name:'Shadow Corridors',        emoji:'🌑', theme:'Dark Maze',        color:'#8800ff', enemyTypes:['void_stalker','corrupted_guard'], desc:'Dark Shadow Realm maze. Low visibility. Traps everywhere.' },
  { id:'marketplace_chase', name:'Marketplace Chase',       emoji:'🛒', theme:'Parkour Urban',    color:'#00cc44', enemyTypes:['shadow_drone','corrupted_guard'], desc:'Parkour through AMM Marketplace rooftops. Vertical movement.' },
  { id:'faith_temple',      name:'Temple of Faith',         emoji:'✝️', theme:'Sacred',           color:'#ffffff', enemyTypes:['corrupted_guard','boss'], desc:'Sacred temple. No destructible objects. Final boss arena.' },
]

const SQUAD_ROLES: Record<SquadRole, { name: string; emoji: string; bonus: string; color: string }> = {
  vanguard:   { name:'Vanguard',   emoji:'⚔️', bonus:'+25% damage dealt', color:'#ff4400' },
  support:    { name:'Support',    emoji:'💚', bonus:'+40 team HP heal per kill', color:'#00cc44' },
  tactician:  { name:'Tactician', emoji:'🧠', bonus:'Traps deal +50% dmg', color:'#00ccff' },
  scout:      { name:'Scout',      emoji:'👁️', bonus:'+30% movement speed', color:'#ffaa00' },
  guardian:   { name:'Guardian',   emoji:'🛡️', bonus:'-30% damage taken', color:'#8800ff' },
}

const ENEMY_DEFS: Record<Enemy['type'], Partial<Enemy>> = {
  shadow_drone:     { emoji:'👾', speed:2, dmg:8,  maxHp:30,  reward:50  },
  void_stalker:     { emoji:'👻', speed:3, dmg:15, maxHp:50,  reward:100 },
  corrupted_guard:  { emoji:'🤖', speed:1, dmg:25, maxHp:100, reward:200 },
  boss:             { emoji:'💀', speed:1, dmg:40, maxHp:500, reward:1000 },
}

function spawnEnemy(id: number, mapId: MapId): Enemy {
  const map = MAPS.find(m => m.id === mapId)!
  const type = map.enemyTypes[Math.floor(Math.random() * map.enemyTypes.length)]
  const def = ENEMY_DEFS[type]
  return {
    id, x: 30 + Math.random() * 60, y: 10 + Math.random() * 60,
    type, emoji: def.emoji!, speed: def.speed!, dmg: def.dmg!,
    hp: def.maxHp!, maxHp: def.maxHp!, reward: def.reward!
  }
}

export default function TacticalRealms({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [phase, setPhase] = useState<'lobby'|'playing'|'gameover'>('lobby')
  const [selectedMap, setSelectedMap] = useState<MapDef>(MAPS[0])
  const [selectedMode, setSelectedMode] = useState<GameMode>('training')
  const [selectedRole, setSelectedRole] = useState<SquadRole>('vanguard')
  const [weapon, setWeapon] = useState<Weapon>(WEAPONS.scroll_cannon)
  const [altWeapon, setAltWeapon] = useState<Weapon>(WEAPONS.faith_blade)
  const [playerHP, setPlayerHP] = useState(100)
  const [playerMaxHP] = useState(100)
  const [ammo, setAmmo] = useState(WEAPONS.scroll_cannon.maxAmmo)
  const [score, setScore] = useState(0)
  const [kills, setKills] = useState(0)
  const [wave, setWave] = useState(1)
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [cooldown, setCooldown] = useState(false)
  const [specialCd, setSpecialCd] = useState(false)
  const [comboCount, setComboCount] = useState(0)
  const [comboDmg, setComboDmg] = useState(0)
  const [trapCount, setTrapCount] = useState(WEAPONS.shadow_trap.maxAmmo)
  const [objective, setObjective] = useState('')
  const [log, setLog] = useState<{id:number;text:string;color:string}[]>([])
  const [missionTimer, setMissionTimer] = useState(90)
  const [traps, setTraps] = useState<{id:number;x:number;y:number}[]>([])
  const [playerX, setPlayerX] = useState(50)
  const [playerY, setPlayerY] = useState(80)
  const [shields, setShields] = useState(0)
  const logId = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)

  const addLog = useCallback((text: string, color = '#00ffcc') => {
    setLog(prev => [...prev.slice(-6), { id: logId.current++, text, color }])
  }, [])

  const startGame = () => {
    const roleBonus = SQUAD_ROLES[selectedRole]
    setPlayerHP(selectedRole === 'guardian' ? 130 : 100)
    setAmmo(weapon.maxAmmo)
    setScore(0); setKills(0); setWave(1); setComboCount(0)
    setMissionTimer(selectedMode === 'training' ? 999 : 90)
    setEnemies(Array.from({ length: 3 + wave }, (_, i) => spawnEnemy(i, selectedMap.id)))
    setObjective(
      selectedMode === 'training'   ? 'Eliminate all waves. Learn your weapon.' :
      selectedMode === 'team_battle'? 'Reach 500 score before timer runs out.' :
      selectedMode === 'capture'    ? 'Hold the sacred zone for 30 seconds.' :
      selectedMode === 'survival'   ? 'Survive 5 waves of increasing enemies.' :
      'Ranked — no checkpoints. Score determines rank.'
    )
    addLog(`🗺️ ${selectedMap.name} loaded. ${roleBonus.emoji} ${roleBonus.name}: ${roleBonus.bonus}`, selectedMap.color)
    addLog(`⚔️ Primary: ${weapon.name} | Secondary: ${altWeapon.name}`, '#888')
    setPhase('playing')
  }

  // Game timer
  useEffect(() => {
    if (phase !== 'playing') return
    if (selectedMode === 'training') return
    timerRef.current = setInterval(() => {
      setMissionTimer(t => {
        if (t <= 1) { endGame(score >= 500 ? 'win' : 'lose', 'Time\'s up!'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, selectedMode])

  // Enemy AI tick
  useEffect(() => {
    if (phase !== 'playing') return
    const ai = setInterval(() => {
      setEnemies(prev => {
        const updated = prev.map(e => {
          const dx = playerX - e.x, dy = playerY - e.y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 8) {
            // Attack player
            const actualDmg = Math.floor(e.dmg * (selectedRole === 'guardian' ? 0.7 : 1.0))
            setPlayerHP(hp => {
              const nh = Math.max(0, hp - actualDmg - (shields > 0 ? -10 : 0))
              if (nh <= 0) endGame('lose', 'Your Faith Warrior fell in battle.')
              return nh
            })
            return e
          }
          // Move toward player
          const speed = e.speed * 0.4
          return {
            ...e,
            x: e.x + (dx / dist) * speed,
            y: e.y + (dy / dist) * speed,
          }
        })
        return updated
      })

      // Check traps
      setTraps(prevTraps => {
        let trapsUpdated = [...prevTraps]
        setEnemies(prev => prev.map(e => {
          const trap = trapsUpdated.find(t => Math.abs(t.x - e.x) < 5 && Math.abs(t.y - e.y) < 5)
          if (trap) {
            const trapDmg = Math.floor(WEAPONS.shadow_trap.dmg * (selectedRole === 'tactician' ? 1.5 : 1.0))
            trapsUpdated = trapsUpdated.filter(t => t.id !== trap.id)
            addLog(`🕳️ TRAP TRIGGERED! ${trapDmg} dmg to ${e.emoji}`, '#8800ff')
            hollywoodSounds.explosion('small')
            return { ...e, hp: e.hp - trapDmg }
          }
          return e
        }))
        return trapsUpdated
      })
    }, 200)
    return () => clearInterval(ai)
  }, [phase, playerX, playerY, selectedRole, shields])

  // Next wave when all enemies dead
  useEffect(() => {
    if (phase !== 'playing') return
    if (enemies.filter(e => e.hp > 0).length === 0 && enemies.length > 0) {
      const nextWave = wave + 1
      setWave(nextWave)
      const waveReward = wave * 200
      setScore(s => s + waveReward)
      store.earnCash(waveReward)
      addLog(`🌊 WAVE ${nextWave} INCOMING! +$${waveReward} reward!`, '#ffd700')
      hollywoodSounds.victoryFanfare()
      setTimeout(() => {
        setEnemies(Array.from({ length: 3 + nextWave }, (_, i) => spawnEnemy(i + nextWave * 10, selectedMap.id)))
        if (nextWave > 5 && selectedMode === 'survival') endGame('win', `Survived ${wave} waves!`)
      }, 2000)
    }
  }, [enemies, phase])

  const fire = useCallback(() => {
    if (cooldown || phase !== 'playing') return
    if (ammo <= 0 && weapon.type !== 'melee') { addLog('🔴 RELOAD! No ammo.', '#ff4400'); return }

    setCooldown(true)
    setTimeout(() => setCooldown(false), weapon.cooldown)

    if (weapon.type !== 'melee' && weapon.type !== 'trap') {
      setAmmo(a => Math.max(0, a - 1))
    }

    // Find nearest enemy in range
    let hit = false
    setEnemies(prev => {
      const sorted = [...prev.filter(e => e.hp > 0)].sort((a, b) => {
        const da = Math.sqrt((a.x-playerX)**2 + (a.y-playerY)**2)
        const db = Math.sqrt((b.x-playerX)**2 + (b.y-playerY)**2)
        return da - db
      })
      if (sorted.length === 0) return prev

      const target = sorted[0]
      const dist = Math.sqrt((target.x-playerX)**2 + (target.y-playerY)**2)
      if (dist > weapon.range * 8) { addLog(`📏 Out of range — ${weapon.name} needs closer target`, '#555'); return prev }

      const newCombo = comboCount + 1
      setComboCount(newCombo)
      const roleMulti = selectedRole === 'vanguard' ? 1.25 : 1.0
      const comboMulti = newCombo >= 5 ? 1.5 : newCombo >= 3 ? 1.2 : 1.0
      const actualDmg = Math.floor(weapon.dmg * roleMulti * comboMulti * (0.85 + Math.random() * 0.3))
      setComboDmg(actualDmg)
      hit = true

      const newHp = target.hp - actualDmg
      hollywoodSounds.punch(actualDmg > 30 ? 'heavy' : actualDmg > 15 ? 'medium' : 'light')

      const comboLabel = comboMulti >= 1.5 ? '🔥 COMBO ×1.5! ' : comboMulti >= 1.2 ? '⚡ COMBO ×1.2! ' : ''
      addLog(`${weapon.emoji} ${comboLabel}${weapon.name} — ${actualDmg} dmg → ${target.emoji}`, selectedMap.color)

      if (newHp <= 0) {
        const earnedScore = target.reward * (newCombo >= 5 ? 2 : 1)
        setScore(s => s + earnedScore)
        setKills(k => k + 1)
        setComboCount(0)
        if (selectedRole === 'support') setPlayerHP(hp => Math.min(playerMaxHP, hp + 40))
        addLog(`💀 ${target.emoji} eliminated! +${earnedScore} pts`, '#00cc44')
        store.earnXp(target.reward / 10)
        if (target.type === 'boss') {
          hollywoodSounds.explosion('large')
          addLog('🏆 BOSS ELIMINATED! Massive rewards!', '#ffd700')
          setScore(s => s + 2000); store.earnCash(5000)
        }
      }

      setTimeout(() => setComboCount(0), 2000)
      return prev.map(e => e.id === target.id ? { ...e, hp: newHp } : e)
    })

    if (!hit) addLog(`${weapon.emoji} ${weapon.name} — miss!`, '#555')
  }, [cooldown, phase, ammo, weapon, comboCount, playerX, playerY, selectedRole, selectedMap])

  const useSpecial = () => {
    if (specialCd || phase !== 'playing') return
    setSpecialCd(true)
    hollywoodSounds.shofar()
    setEnemies(prev => {
      const stunned = prev.map(e => {
        const dist = Math.sqrt((e.x-playerX)**2 + (e.y-playerY)**2)
        if (dist < 40) return { ...e, hp: Math.max(0, e.hp - WEAPONS.shofar_burst.dmg) }
        return e
      })
      addLog(`📯 SHOFAR BLAST! ${WEAPONS.shofar_burst.dmg} dmg to all nearby enemies!`, '#ffaa00')
      return stunned
    })
    setTimeout(() => setSpecialCd(false), WEAPONS.shofar_burst.cooldown)
  }

  const placeTrap = () => {
    if (trapCount <= 0 || phase !== 'playing') return
    setTrapCount(t => t - 1)
    setTraps(prev => [...prev, { id: Date.now(), x: playerX + (Math.random()-0.5)*10, y: playerY + (Math.random()-0.5)*10 }])
    addLog(`🕳️ Shadow Trap placed at position!`, '#8800ff')
  }

  const reload = () => {
    if (weapon.type === 'melee') return
    setAmmo(weapon.maxAmmo)
    addLog(`🔄 Reloaded ${weapon.name}`, '#888')
  }

  const endGame = (result: 'win'|'lose', reason: string) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('gameover')
    if (result === 'win') {
      const total = score + kills * 100
      store.earnCash(total); store.earnXp(kills * 50)
      hollywoodSounds.victoryFanfare()
      store.setNotif(`🏆 TACTICAL WIN! +$${total} +${kills*50}XP`)
    }
    addLog(result === 'win' ? `🏆 VICTORY — ${reason}` : `💀 DEFEATED — ${reason}`, result === 'win' ? '#ffd700' : '#ff4400')
  }

  const map = selectedMap
  const liveEnemies = enemies.filter(e => e.hp > 0)

  // ── LOBBY ──────────────────────────────────────────────────────────
  if (phase === 'lobby') return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',overflowY:'auto' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderBottom:'1px solid #1a1a3e' }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <span style={{ color:'#00ffcc',fontWeight:900,fontSize:14,letterSpacing:2 }}>⚔️ TACTICAL REALMS — FAITH WARRIOR</span>
      </div>
      <div style={{ padding:16 }}>
        {/* Map select */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>SELECT MAP</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6 }}>
            {MAPS.map(m => (
              <div key={m.id} onClick={() => setSelectedMap(m)} style={{ background:selectedMap.id===m.id?`${m.color}15`:'#09091c',border:`1px solid ${selectedMap.id===m.id?m.color:'#222'}`,borderRadius:8,padding:10,cursor:'pointer',textAlign:'center' }}>
                <div style={{ fontSize:24 }}>{m.emoji}</div>
                <div style={{ color:m.color,fontSize:10,fontWeight:700,marginTop:4 }}>{m.name}</div>
                <div style={{ color:'#555',fontSize:9,marginTop:2 }}>{m.theme}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Game mode */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>GAME MODE</div>
          <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
            {(['training','team_battle','capture','survival','ranked'] as GameMode[]).map(m => (
              <button key={m} onClick={() => setSelectedMode(m)} style={{ background:selectedMode===m?'rgba(0,255,204,0.12)':'transparent',border:`1px solid ${selectedMode===m?'#00ffcc':'#333'}`,color:selectedMode===m?'#00ffcc':'#888',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:11,textTransform:'capitalize' }}>
                {m.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Squad role */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>SQUAD ROLE</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6 }}>
            {(Object.entries(SQUAD_ROLES) as [SquadRole, typeof SQUAD_ROLES[SquadRole]][]).map(([id, role]) => (
              <div key={id} onClick={() => setSelectedRole(id)} style={{ background:selectedRole===id?`${role.color}15`:'#09091c',border:`1px solid ${selectedRole===id?role.color:'#222'}`,borderRadius:8,padding:8,cursor:'pointer',textAlign:'center' }}>
                <div style={{ fontSize:20 }}>{role.emoji}</div>
                <div style={{ color:role.color,fontSize:9,fontWeight:700,marginTop:3 }}>{role.name}</div>
                <div style={{ color:'#555',fontSize:8,marginTop:2 }}>{role.bonus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weapons */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>PRIMARY WEAPON</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6 }}>
            {(Object.values(WEAPONS) as Weapon[]).map(w => (
              <div key={w.id} onClick={() => setWeapon(w)} style={{ background:weapon.id===w.id?`${w.color}15`:'#09091c',border:`1px solid ${weapon.id===w.id?w.color:'#222'}`,borderRadius:8,padding:10,cursor:'pointer' }}>
                <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:4 }}>
                  <span style={{ fontSize:18 }}>{w.emoji}</span>
                  <span style={{ color:w.color,fontSize:10,fontWeight:700 }}>{w.name}</span>
                </div>
                <div style={{ color:'#555',fontSize:9 }}>{w.type.toUpperCase()} · {w.dmg} DMG · {w.range}m range</div>
                <div style={{ color:'#444',fontSize:8,marginTop:3 }}>{w.special}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={startGame} style={{ width:'100%',background:`${map.color}22`,border:`2px solid ${map.color}`,color:map.color,borderRadius:10,padding:16,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:16,letterSpacing:2 }}>
          {map.emoji} DEPLOY TO {map.name.toUpperCase()}
        </button>
      </div>
    </div>
  )

  // ── GAME OVER ──────────────────────────────────────────────────────────
  if (phase === 'gameover') {
    const won = playerHP > 0 && score > 0
    return (
      <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
        <div style={{ fontSize:64,marginBottom:12 }}>{won?'🏆':'💀'}</div>
        <div style={{ color:won?'#ffd700':'#ff4400',fontSize:22,fontWeight:900,marginBottom:8 }}>{won?'VICTORY — REALM SECURED':'DEFEATED — REALM LOST'}</div>
        <div style={{ color:'#888',fontSize:13,marginBottom:4 }}>Score: {score.toLocaleString()} · Kills: {kills} · Wave: {wave}</div>
        <div style={{ color:'#555',fontSize:11,marginBottom:20 }}>Weapon: {weapon.name} · Map: {selectedMap.name} · Role: {SQUAD_ROLES[selectedRole].name}</div>
        <div style={{ display:'flex',gap:10 }}>
          <button onClick={() => { setPhase('lobby'); setScore(0); setKills(0); setWave(1); setEnemies([]); setTraps([]) }} style={{ background:`${selectedMap.color}22`,border:`1px solid ${selectedMap.color}`,color:selectedMap.color,borderRadius:8,padding:'10px 24px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>DEPLOY AGAIN</button>
          <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:8,padding:'10px 24px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
        </div>
      </div>
    )
  }

  // ── PLAYING ────────────────────────────────────────────────────────────
  return (
    <div style={{ width:'100%',height:'100%',background:`linear-gradient(180deg,${map.color}08,#020212)`,fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none' }}>
      {/* HUD */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,padding:'6px 12px',borderBottom:`1px solid ${map.color}33`,background:'rgba(0,0,0,0.9)' }}>
        <div>
          <div style={{ color:'#00cc44',fontSize:14,fontWeight:900 }}>HP {playerHP}/{playerMaxHP}</div>
          <div style={{ background:'#111',borderRadius:3,height:5,marginTop:2 }}><div style={{ background:playerHP>50?'#00cc44':playerHP>25?'#ffaa00':'#ff4400',height:'100%',width:`${(playerHP/playerMaxHP)*100}%`,borderRadius:3 }}/></div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:map.color,fontSize:11,fontWeight:700 }}>{map.emoji} {map.name} · Wave {wave}</div>
          {selectedMode !== 'training' && <div style={{ color:missionTimer<30?'#ff4400':'#888',fontSize:11 }}>⏱ {missionTimer}s</div>}
          <div style={{ color:'#ffd700',fontSize:11 }}>⭐ {score.toLocaleString()} pts</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:weapon.color,fontSize:13,fontWeight:700 }}>{weapon.emoji} {weapon.name}</div>
          <div style={{ color:ammo>5?'#888':'#ff4400',fontSize:11 }}>AMMO {weapon.type==='melee'?'∞':ammo}/{weapon.maxAmmo}</div>
          <div style={{ color:'#555',fontSize:10 }}>💀 {kills} kills</div>
        </div>
      </div>

      {/* Battlefield */}
      <div style={{ flex:1,position:'relative',overflow:'hidden',background:`radial-gradient(ellipse at 50% 80%,${map.color}06,#020212)` }}>
        {/* Grid lines */}
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:.06,pointerEvents:'none' }}>
          {[10,20,30,40,50,60,70,80,90].map(p=><>
            <line key={`h${p}`} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={map.color} strokeWidth=".5"/>
            <line key={`v${p}`} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke={map.color} strokeWidth=".5"/>
          </>)}
        </svg>

        {/* Traps */}
        {traps.map(t => (
          <div key={t.id} style={{ position:'absolute',left:`${t.x}%`,top:`${t.y}%`,fontSize:16,transform:'translate(-50%,-50%)',filter:'drop-shadow(0 0 6px #8800ff)' }}>🕳️</div>
        ))}

        {/* Enemies */}
        {liveEnemies.map(e => (
          <div key={e.id} style={{ position:'absolute',left:`${e.x}%`,top:`${e.y}%`,transform:'translate(-50%,-50%)',textAlign:'center',cursor:'pointer' }} onClick={() => {
            if (cooldown) return
            const dist = Math.sqrt((e.x-playerX)**2 + (e.y-playerY)**2)
            if (dist > weapon.range * 8) { addLog(`📏 ${e.emoji} out of range!`,'#555'); return }
            setCooldown(true); setTimeout(()=>setCooldown(false), weapon.cooldown)
            if (weapon.type !== 'melee') setAmmo(a=>Math.max(0,a-1))
            const actualDmg = Math.floor(weapon.dmg*(selectedRole==='vanguard'?1.25:1)*(0.85+Math.random()*.3))
            hollywoodSounds.punch(actualDmg>30?'heavy':actualDmg>15?'medium':'light')
            setEnemies(prev=>prev.map(en=>en.id===e.id?{...en,hp:en.hp-actualDmg}:{...en}))
            addLog(`${weapon.emoji} ${actualDmg} → ${e.emoji}`, map.color)
            if(e.hp-actualDmg<=0){setScore(s=>s+e.reward);setKills(k=>k+1);store.earnXp(e.reward/10)}
          }}>
            <div style={{ fontSize:28,filter:`drop-shadow(0 0 8px ${e.type==='boss'?'#ff0000':'#ff4400'})` }}>{e.emoji}</div>
            <div style={{ background:'#111',width:30,height:4,borderRadius:2,margin:'2px auto' }}>
              <div style={{ background:e.hp/e.maxHp>0.5?'#ff4400':'#ff8800',height:'100%',width:`${(e.hp/e.maxHp)*100}%`,borderRadius:2 }}/>
            </div>
          </div>
        ))}

        {/* Player */}
        <div style={{ position:'absolute',left:`${playerX}%`,top:`${playerY}%`,transform:'translate(-50%,-50%)',textAlign:'center' }}>
          <div style={{ fontSize:28,filter:`drop-shadow(0 0 12px ${map.color})` }}>⚔️</div>
          <div style={{ color:map.color,fontSize:8,fontFamily:'monospace' }}>{SQUAD_ROLES[selectedRole].name}</div>
        </div>

        {/* Combo display */}
        {comboCount > 1 && (
          <div style={{ position:'absolute',top:'15%',left:'50%',transform:'translateX(-50%)',color:'#ffd700',fontSize:comboCount>=5?20:16,fontWeight:900,textShadow:'0 0 16px #ffd700',pointerEvents:'none' }}>
            {comboCount}× COMBO! {comboDmg > 0 && `${comboDmg} DMG`}
          </div>
        )}

        {/* Wave clear */}
        {liveEnemies.length === 0 && enemies.length > 0 && (
          <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',pointerEvents:'none' }}>
            <div style={{ color:'#ffd700',fontSize:22,fontWeight:900 }}>WAVE CLEARED! ⚔️</div>
          </div>
        )}
      </div>

      {/* Combat log */}
      <div style={{ height:52,overflowY:'auto',padding:'3px 12px',background:'rgba(0,0,5,0.95)',borderTop:`1px solid ${map.color}22` }}>
        {log.slice(-4).map(l=><div key={l.id} style={{ fontSize:10,color:l.color,marginBottom:1 }}>{l.text}</div>)}
      </div>

      {/* Controls */}
      <div style={{ padding:'8px 10px',background:'rgba(0,0,5,0.98)',borderTop:`1px solid ${map.color}44` }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4,marginBottom:5 }}>
          <button onClick={() => setPlayerY(y=>Math.max(5,y-8))} style={{ background:`${map.color}15`,border:`1px solid ${map.color}44`,color:map.color,borderRadius:5,padding:'7px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>⬆ MOVE UP</button>
          <button onClick={() => setPlayerY(y=>Math.min(90,y+8))} style={{ background:`${map.color}15`,border:`1px solid ${map.color}44`,color:map.color,borderRadius:5,padding:'7px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>⬇ MOVE DOWN</button>
          <button onClick={() => setPlayerX(x=>Math.max(5,x-8))} style={{ background:`${map.color}15`,border:`1px solid ${map.color}44`,color:map.color,borderRadius:5,padding:'7px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>◀ MOVE LEFT</button>
          <button onClick={() => setPlayerX(x=>Math.min(95,x+8))} style={{ background:`${map.color}15`,border:`1px solid ${map.color}44`,color:map.color,borderRadius:5,padding:'7px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>▶ MOVE RIGHT</button>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5 }}>
          <button onClick={fire} disabled={cooldown} style={{ background:cooldown?'#0a0005':weapon.type==='melee'?'#ff440022':'rgba(0,255,204,0.12)',border:`2px solid ${cooldown?'#333':weapon.color}`,color:cooldown?'#333':weapon.color,borderRadius:6,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:11 }}>
            {weapon.emoji}<br/><span style={{fontSize:9}}>{cooldown?'COOLING':'FIRE'}</span>
          </button>
          <button onClick={useSpecial} disabled={specialCd} style={{ background:specialCd?'#0a0005':'rgba(255,170,0,0.12)',border:`1px solid ${specialCd?'#333':'#ffaa00'}`,color:specialCd?'#333':'#ffaa00',borderRadius:6,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:11 }}>
            📯<br/><span style={{fontSize:9}}>{specialCd?'CHARGING':'SHOFAR'}</span>
          </button>
          <button onClick={placeTrap} disabled={trapCount<=0} style={{ background:trapCount>0?'rgba(136,0,255,0.12)':'#0a0005',border:`1px solid ${trapCount>0?'#8800ff':'#333'}`,color:trapCount>0?'#8800ff':'#333',borderRadius:6,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:11 }}>
            🕳️<br/><span style={{fontSize:9}}>TRAP ({trapCount})</span>
          </button>
          <button onClick={reload} style={{ background:'rgba(255,255,255,0.05)',border:'1px solid #333',color:'#888',borderRadius:6,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>
            🔄<br/><span style={{fontSize:9}}>RELOAD</span>
          </button>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',marginTop:4,fontSize:9,color:'#333' }}>
          <span>TAP ENEMIES TO SHOOT · MOVE TO DODGE</span>
          <button onClick={onExit} style={{ background:'none',border:'none',color:'#333',cursor:'pointer',fontFamily:'monospace',fontSize:9 }}>EXIT</button>
        </div>
      </div>
    </div>
  )
}
