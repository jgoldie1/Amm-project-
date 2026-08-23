// AMM Hero Realms — Original Fantasy RPG
// NOT copying Fable, Elder Scrolls, Zelda, or Final Fantasy
// Original world: Omniverse Kingdom · Original classes, spells, enemies, locations

import { useState, useCallback } from 'react'
import { useGameStore } from '../../game/state/useGameStore'
import { hollywoodSounds } from '../../game/engine/HollywoodEngine'

type HeroClass = 'faith_warrior'|'sound_mage'|'earth_builder'|'light_runner'|'scroll_keeper'
type Town = 'amm_city'|'judah_village'|'saturn_station'|'shadow_keep'|'sound_delta'
type QuestId = 'first_light'|'void_corruption'|'missing_scroll'|'feast_restore'|'boss_hunt'
type EnemyType = 'shadow_wisp'|'void_drone'|'corrupted_elder'|'dark_captain'|'void_empress'
type SpellId = 'covenant_shield'|'shofar_wave'|'stone_wall'|'void_purge'|'saturn_time'|'ancient_word'|'gospel_thunder'|'faith_walk'

interface HeroStats {
  class: HeroClass; name: string
  hp: number; maxHp: number; mp: number; maxMp: number
  str: number; spd: number; wis: number; faith: number
  level: number; xp: number; xpNext: number
  gold: number; faithScore: number; voidScore: number
  inventory: string[]; spells: SpellId[]; completedQuests: QuestId[]
}

interface Enemy {
  id: number; type: EnemyType; name: string; emoji: string
  hp: number; maxHp: number; atk: number; reward: { xp: number; gold: number }
  weakness?: SpellId; special?: string
}

interface Quest {
  id: QuestId; title: string; desc: string; reward: { xp: number; gold: number; item?: string }
  completed: boolean; available: boolean; emoji: string
}

interface NPCDialogue {
  name: string; emoji: string; lines: string[]
}

const HERO_CLASSES: Record<HeroClass, {
  name: string; emoji: string; color: string
  stats: { str:number; spd:number; wis:number; faith:number }
  startSpell: SpellId; hp: number; mp: number; desc: string
}> = {
  faith_warrior:  { name:'Faith Warrior',  emoji:'⚔️', color:'#ffd700', stats:{str:8,spd:6,wis:5,faith:10}, startSpell:'covenant_shield', hp:120, mp:60,  desc:'Melee fighter blessed with divine protection. High HP and faith.' },
  sound_mage:     { name:'Sound Mage',     emoji:'🎵', color:'#00ccff', stats:{str:4,spd:8,wis:10,faith:8}, startSpell:'shofar_wave',     hp:75,  mp:120, desc:'Wields sound as a weapon. High spell damage and speed.' },
  earth_builder:  { name:'Earth Builder',  emoji:'🪨', color:'#00cc44', stats:{str:10,spd:4,wis:7,faith:7}, startSpell:'stone_wall',      hp:140, mp:70,  desc:'Creates barriers and deals crushing physical damage.' },
  light_runner:   { name:'Light Runner',   emoji:'⚡', color:'#ffaa00', stats:{str:5,spd:10,wis:6,faith:9}, startSpell:'faith_walk',      hp:85,  mp:80,  desc:'Fastest hero. Teleport, dodge, and hit-and-run tactics.' },
  scroll_keeper:  { name:'Scroll Keeper',  emoji:'📜', color:'#c084fc', stats:{str:3,spd:5,wis:10,faith:10},startSpell:'ancient_word',   hp:70,  mp:150, desc:'Master of ancient texts. Highest magic power in the game.' },
}

const SPELLS: Record<SpellId, { name:string; emoji:string; dmg:number; cost:number; color:string; effect:string }> = {
  covenant_shield: { name:'Covenant Shield', emoji:'🛡️', dmg:0,  cost:20, color:'#ffd700', effect:'Block all dmg 3 turns + heal 15 HP' },
  shofar_wave:     { name:'Shofar Wave',     emoji:'📯', dmg:55, cost:35, color:'#ffaa00', effect:'Stun all enemies 2 turns + 55 dmg' },
  stone_wall:      { name:'Stone Wall',      emoji:'🪨', dmg:0,  cost:25, color:'#00cc44', effect:'Create barrier — reduce dmg 50% for 4 turns' },
  void_purge:      { name:'Void Purge',      emoji:'✨', dmg:40, cost:30, color:'#ffffff', effect:'Remove curses + deal 40 holy damage' },
  saturn_time:     { name:'Saturn Time',     emoji:'🪐', dmg:0,  cost:50, color:'#ffaa00', effect:'Slow all enemies 80% for 3 turns' },
  ancient_word:    { name:'Ancient Word',    emoji:'📖', dmg:80, cost:40, color:'#c084fc', effect:'Deal 80 holy damage from ancient text' },
  gospel_thunder:  { name:'Gospel Thunder',  emoji:'⚡', dmg:65, cost:45, color:'#00ccff', effect:'Lightning strikes all enemies — 65 dmg each' },
  faith_walk:      { name:'Faith Walk',      emoji:'🌟', dmg:0,  cost:15, color:'#ffd700', effect:'Teleport + dodge next 2 attacks' },
}

const TOWNS: Record<Town, {
  name:string; emoji:string; color:string; desc:string
  services: string[]; npc: NPCDialogue; enemies: EnemyType[]
}> = {
  amm_city:      { name:'AMM City Square',    emoji:'🌆', color:'#00ffcc', desc:'The beating heart of the Omniverse. Markets, missions, and mayhem.', services:['Market','Quest Board','Faith Shrine','Inn'], npc:{name:'Mayor Prime',  emoji:'👑',lines:['Welcome, hero. The Shadow Corruption spreads from the eastern corridors.','We need Faith Warriors to push back the Void.','Rest at the inn — $30 per night. Full HP+MP restored.']}, enemies:['shadow_wisp','void_drone'] },
  judah_village: { name:'Judah Village',      emoji:'🏘️', color:'#ffd700', desc:'Ancient village of the Judah Realm. Home of the Scroll Keepers.', services:['Elder','Scroll Shop','Prayer Well'],            npc:{name:'Elder Abram', emoji:'🧙', lines:['The ancient scrolls speak of a hero who will restore the feasts.','Visit the Prayer Well to raise your faith score.','Our scroll shop has Ancient Word for those wise enough to use it.']}, enemies:['shadow_wisp','corrupted_elder'] },
  saturn_station:{ name:'El Saturn Station',  emoji:'🪐', color:'#ffaa00', desc:'Cosmic outpost on Saturn\'s ring. High-tech meets ancient faith.', services:['NFT Forge','Portal','Gear Upgrade'],              npc:{name:'Captain Orbit',emoji:'🚀',lines:['The Saturn Ring holds secrets the Void cannot corrupt.','Upgrade your gear here — double your damage output.','The portal connects to all other realms. Be careful.']}, enemies:['void_drone','dark_captain'] },
  shadow_keep:   { name:'Shadow Keep',        emoji:'🏰', color:'#8800ff', desc:'Dark fortress. Risk is high but rewards are the best in the game.', services:['Black Market','Gear Upgrade'],                   npc:{name:'Shade Dealer', emoji:'🌑',lines:['You have courage coming here. Or ignorance.','The Black Market has things no one else sells. Price is steep.','The Void Empress dwells deeper in. No one returns from that fight... usually.']}, enemies:['corrupted_elder','dark_captain','void_empress'] },
  sound_delta:   { name:'Sound River Delta',  emoji:'🎵', color:'#00ccff', desc:'Musical haven. Gospel Mages train here. Sound heals here.', services:['Recording Studio','Music Guild','Healer'],            npc:{name:'Maestro Lyra', emoji:'🎼',lines:['Every note is a prayer. Every prayer, a weapon.','The Sound Mage class unlocks Gospel Thunder here — ask at the guild.','Our healer can restore MP for $20. Worth it for a long journey.']}, enemies:['shadow_wisp'] },
}

const ENEMY_DEFS: Record<EnemyType, Omit<Enemy,'id'|'hp'>> = {
  shadow_wisp:     { type:'shadow_wisp',    name:'Shadow Wisp',     emoji:'👾', maxHp:40,  atk:8,  reward:{xp:30,  gold:15},  weakness:'void_purge',   special:'Drains 5 MP per turn' },
  void_drone:      { type:'void_drone',     name:'Void Drone',      emoji:'🤖', maxHp:70,  atk:15, reward:{xp:60,  gold:30},  weakness:'gospel_thunder' },
  corrupted_elder: { type:'corrupted_elder',name:'Corrupted Elder', emoji:'👴', maxHp:120, atk:25, reward:{xp:120, gold:60},  weakness:'ancient_word', special:'Casts Shadow Curse — -20 faith' },
  dark_captain:    { type:'dark_captain',   name:'Dark Captain',    emoji:'⚔️', maxHp:200, atk:35, reward:{xp:250, gold:150}, weakness:'shofar_wave',  special:'Parry — blocks 1 attack per round' },
  void_empress:    { type:'void_empress',   name:'Void Empress',    emoji:'👑', maxHp:800, atk:60, reward:{xp:2000,gold:1000},weakness:'covenant_shield', special:'FINAL BOSS — all spells do ×2 during feast season' },
}

const QUESTS: Record<QuestId, Quest> = {
  first_light:    { id:'first_light',    title:'First Light',           desc:'Clear 5 Shadow Wisps from AMM City Square.',  reward:{xp:100, gold:50},              completed:false, available:true,  emoji:'🌅' },
  void_corruption:{ id:'void_corruption',title:'The Void Corruption',   desc:'Find the source of corruption in Shadow Keep.', reward:{xp:300, gold:200, item:'Void Shard'}, completed:false, available:true,  emoji:'🌑' },
  missing_scroll: { id:'missing_scroll', title:'The Missing Scroll',    desc:'Recover the Ancient Scroll from Corrupted Elder.', reward:{xp:200, gold:100, item:'Ancient Scroll'}, completed:false, available:true, emoji:'📜' },
  feast_restore:  { id:'feast_restore',  title:'Restore the Feast',     desc:'Complete a feast cycle — visit Prayer Well at feast time.', reward:{xp:500, gold:300, item:'Feast Blessing'}, completed:false, available:true, emoji:'🕯️' },
  boss_hunt:      { id:'boss_hunt',      title:'End the Void Empress',  desc:'Defeat the Void Empress in Shadow Keep dungeon.', reward:{xp:5000,gold:3000, item:'Omniverse Crown'}, completed:false, available:false, emoji:'👑' },
}

function createHero(cls: HeroClass, name: string): HeroStats {
  const c = HERO_CLASSES[cls]
  return {
    class: cls, name,
    hp: c.hp, maxHp: c.hp, mp: c.mp, maxMp: c.mp,
    str: c.stats.str, spd: c.stats.spd, wis: c.stats.wis, faith: c.stats.faith,
    level: 1, xp: 0, xpNext: 100, gold: 50,
    faithScore: 50, voidScore: 0,
    inventory: ['Health Potion', 'Scroll of Light'],
    spells: [c.startSpell],
    completedQuests: [],
  }
}

function spawnEnemy(type: EnemyType, id: number): Enemy {
  const def = ENEMY_DEFS[type]
  return { ...def, id, hp: def.maxHp }
}

type Screen = 'char_create'|'overworld'|'town'|'combat'|'quest_log'|'inventory'|'gameover'

export default function HeroRealms({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [screen, setScreen] = useState<Screen>('char_create')
  const [hero, setHero] = useState<HeroStats | null>(null)
  const [selectedClass, setSelectedClass] = useState<HeroClass>('faith_warrior')
  const [heroName, setHeroName] = useState('')
  const [currentTown, setCurrentTown] = useState<Town>('amm_city')
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [combatLog, setCombatLog] = useState<{id:number;text:string;color:string}[]>([])
  const [turn, setTurn] = useState<'player'|'enemy'>('player')
  const [shielded, setShielded] = useState(false)
  const [slowed, setSlowed] = useState(false)
  const [quests, setQuests] = useState({ ...QUESTS })
  const [npcOpen, setNpcOpen] = useState(false)
  const [npcLine, setNpcLine] = useState(0)
  const [shopOpen, setShopOpen] = useState(false)
  const [logId, setLogId] = useState(0)
  const [combatResult, setCombatResult] = useState<'win'|'lose'|null>(null)
  const [dialogueOpen, setDialogueOpen] = useState(false)

  const addLog = useCallback((text: string, color = '#00ffcc') => {
    setLogId(id => {
      setCombatLog(prev => [...prev.slice(-8), { id: id + 1, text, color }])
      return id + 1
    })
  }, [])

  const createHeroAction = () => {
    if (!heroName.trim()) return
    const h = createHero(selectedClass, heroName.trim())
    setHero(h)
    setScreen('overworld')
  }

  const travelTo = (town: Town) => {
    setCurrentTown(town)
    setScreen('town')
    if (hero) addLog(`🗺️ Arrived at ${TOWNS[town].name}`, TOWNS[town].color)
  }

  const startCombat = (types?: EnemyType[]) => {
    const town = TOWNS[currentTown]
    const pool = types || town.enemies
    const count = 1 + Math.floor(Math.random() * 2)
    const newEnemies = Array.from({ length: count }, (_, i) =>
      spawnEnemy(pool[Math.floor(Math.random() * pool.length)], i)
    )
    setEnemies(newEnemies)
    setCombatLog([])
    setTurn('player')
    setShielded(false)
    setSlowed(false)
    setCombatResult(null)
    setScreen('combat')
    addLog(`⚔️ Combat begins! ${newEnemies.map(e => e.emoji + ' ' + e.name).join(', ')}`, '#ff4400')
  }

  const attack = () => {
    if (!hero || turn !== 'player' || combatResult) return
    const alive = enemies.filter(e => e.hp > 0)
    if (!alive.length) return
    const target = alive[0]
    const dmg = Math.floor((hero.str * 4 + 10) * (0.85 + Math.random() * 0.3))
    hollywoodSounds.punch(dmg > 30 ? 'heavy' : 'medium')
    addLog(`⚔️ ${hero.name} attacks ${target.emoji} ${target.name} — ${dmg} damage!`, '#ffd700')

    const newEnemies = enemies.map(e => e.id === target.id ? { ...e, hp: Math.max(0, e.hp - dmg) } : e)
    setEnemies(newEnemies)

    const defeated = newEnemies.filter(e => e.hp <= 0)
    defeated.forEach(e => {
      addLog(`💀 ${e.emoji} ${e.name} defeated! +${e.reward.xp} XP, +${e.reward.gold} gold`, '#00cc44')
      setHero(h => h ? {
        ...h, xp: h.xp + e.reward.xp, gold: h.gold + e.reward.gold,
        faithScore: Math.min(100, h.faithScore + 5),
        level: (h.xp + e.reward.xp >= h.xpNext) ? h.level + 1 : h.level,
        xpNext: (h.xp + e.reward.xp >= h.xpNext) ? h.xpNext * 2 : h.xpNext,
        maxHp: (h.xp + e.reward.xp >= h.xpNext) ? h.maxHp + 10 : h.maxHp,
      } : h)
      store.earnCash(e.reward.gold)
      store.earnXp(e.reward.xp)
    })

    if (newEnemies.every(e => e.hp <= 0)) {
      setCombatResult('win')
      hollywoodSounds.victoryFanfare()
      addLog('🏆 ALL ENEMIES DEFEATED — VICTORY!', '#ffd700')
      return
    }
    setTurn('enemy')
    setTimeout(() => enemyTurn(newEnemies), 800)
  }

  const castSpell = (spellId: SpellId) => {
    if (!hero || turn !== 'player' || combatResult) return
    const spell = SPELLS[spellId]
    if (hero.mp < spell.cost) { addLog(`❌ Not enough MP! Need ${spell.cost}`, '#ff4400'); return }

    hollywoodSounds.shofar()
    addLog(`✨ ${hero.name} casts ${spell.emoji} ${spell.name}!`, spell.color)

    setHero(h => {
      if (!h) return h
      let newHp = h.hp, newMp = h.mp - spell.cost
      if (spellId === 'covenant_shield') { setShielded(true); newHp = Math.min(h.maxHp, h.hp + 15); addLog('🛡️ Divine Shield active! +15 HP', '#ffd700') }
      if (spellId === 'stone_wall') { setShielded(true); addLog('🪨 Stone Wall erected! 50% damage reduction', '#00cc44') }
      if (spellId === 'faith_walk') { addLog('🌟 Faith Walk — next 2 attacks dodged!', '#ffd700') }
      if (spellId === 'void_purge') { addLog('✨ Curses removed + 40 holy damage!', '#ffffff') }
      if (spellId === 'saturn_time') { setSlowed(true); addLog('🪐 Time slows — enemies at 20% speed!', '#ffaa00') }
      return { ...h, hp: newHp, mp: newMp }
    })

    if (spell.dmg > 0) {
      const newEnemies = enemies.map(e => {
        if (e.hp <= 0) return e
        const bonus = e.weakness === spellId ? 1.5 : 1.0
        const dmg = Math.floor(spell.dmg * bonus * (hero.wis / 5))
        addLog(`${spell.emoji} ${e.emoji} takes ${dmg} damage${bonus > 1 ? ' (WEAKNESS!)' : ''}`, spell.color)
        return { ...e, hp: Math.max(0, e.hp - dmg) }
      })
      setEnemies(newEnemies)
      if (newEnemies.every(e => e.hp <= 0)) {
        setCombatResult('win'); hollywoodSounds.victoryFanfare()
        addLog('🏆 ALL ENEMIES DEFEATED!', '#ffd700')
        const totalReward = enemies.reduce((s, e) => ({ xp: s.xp + e.reward.xp, gold: s.gold + e.reward.gold }), { xp: 0, gold: 0 })
        setHero(h => h ? { ...h, xp: h.xp + totalReward.xp, gold: h.gold + totalReward.gold } : h)
        store.earnCash(totalReward.gold)
        return
      }
    }

    setTurn('enemy')
    setTimeout(() => enemyTurn(enemies), 1000)
  }

  const usePotion = () => {
    if (!hero) return
    if (!hero.inventory.includes('Health Potion')) { addLog('❌ No Health Potions!', '#ff4400'); return }
    const healAmt = 40 + hero.faith * 2
    setHero(h => h ? { ...h, hp: Math.min(h.maxHp, h.hp + healAmt), inventory: h.inventory.filter((item, i) => !(item === 'Health Potion' && i === h.inventory.indexOf('Health Potion'))) } : h)
    addLog(`💊 Potion used! +${healAmt} HP`, '#00cc44')
  }

  const enemyTurn = (currentEnemies: Enemy[]) => {
    const alive = currentEnemies.filter(e => e.hp > 0)
    if (!alive.length) return

    alive.forEach(enemy => {
      if (slowed && Math.random() < 0.8) { addLog(`🪐 ${enemy.emoji} slowed — attack fails!`, '#ffaa00'); return }
      const baseDmg = enemy.atk
      const actualDmg = shielded ? Math.floor(baseDmg * 0.5) : baseDmg
      const finalDmg = Math.floor(actualDmg * (0.8 + Math.random() * 0.4))
      addLog(`${enemy.emoji} ${enemy.name} attacks for ${finalDmg} damage${shielded ? ' (🛡️ halved)' : ''}!`, '#ff4400')
      hollywoodSounds.punch('light')

      setHero(h => {
        if (!h) return h
        const newHp = Math.max(0, h.hp - finalDmg)
        if (newHp <= 0) {
          setCombatResult('lose')
          addLog('💀 Your hero has fallen...', '#ff4400')
        }
        return { ...h, hp: newHp }
      })
    })

    setShielded(false)
    setTurn('player')
  }

  const flee = () => {
    addLog('🏃 Fled from combat!', '#888')
    setHero(h => h ? { ...h, hp: Math.max(1, h.hp - 10) } : h)
    setScreen('town')
  }

  const buyPotion = () => {
    if (!hero || hero.gold < 25) { addLog('❌ Need 25 gold for a Health Potion', '#ff4400'); return }
    setHero(h => h ? { ...h, gold: h.gold - 25, inventory: [...h.inventory, 'Health Potion'] } : h)
    addLog('💊 Bought Health Potion for 25 gold', '#00cc44')
  }

  const learnSpell = (spellId: SpellId, cost: number) => {
    if (!hero) return
    if (hero.gold < cost) { addLog(`❌ Need ${cost} gold`, '#ff4400'); return }
    if (hero.spells.includes(spellId)) { addLog('Already known!', '#555'); return }
    setHero(h => h ? { ...h, gold: h.gold - cost, spells: [...h.spells, spellId] } : h)
    addLog(`✨ Learned ${SPELLS[spellId].name}!`, '#c084fc')
  }

  const restAtInn = () => {
    if (!hero || hero.gold < 30) { addLog('❌ Inn costs 30 gold', '#ff4400'); return }
    setHero(h => h ? { ...h, hp: h.maxHp, mp: h.maxMp, gold: h.gold - 30 } : h)
    addLog('😴 Rested at inn. HP + MP fully restored!', '#00cc44')
  }

  const town = TOWNS[currentTown]
  const cls = hero ? HERO_CLASSES[hero.class] : null

  // ── CHARACTER CREATE ────────────────────────────────────────────────
  if (screen === 'char_create') return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',overflowY:'auto',padding:16 }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16,borderBottom:'1px solid #1a1a3e',paddingBottom:10 }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <span style={{ color:'#c084fc',fontWeight:900,fontSize:14 }}>🏰 HERO REALMS — OMNIVERSE KINGDOM</span>
      </div>
      <div style={{ textAlign:'center',marginBottom:20 }}>
        <div style={{ color:'#c084fc',fontSize:18,fontWeight:900,marginBottom:4 }}>Create Your Hero</div>
        <p style={{ color:'#555',fontSize:12 }}>Choose your class. Enter your name. Begin your quest.</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:16 }}>
        {(Object.entries(HERO_CLASSES) as [HeroClass, typeof HERO_CLASSES[HeroClass]][]).map(([id, c]) => (
          <div key={id} onClick={() => setSelectedClass(id)} style={{ background:selectedClass===id?`${c.color}15`:'#09091c',border:`2px solid ${selectedClass===id?c.color:'#222'}`,borderRadius:10,padding:12,cursor:'pointer' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
              <span style={{ fontSize:24 }}>{c.emoji}</span>
              <span style={{ color:c.color,fontWeight:700,fontSize:12 }}>{c.name}</span>
            </div>
            <div style={{ fontSize:10,color:'#666',marginBottom:6 }}>{c.desc}</div>
            <div style={{ display:'flex',gap:8,fontSize:10,color:'#555' }}>
              <span>STR:{c.stats.str}</span><span>SPD:{c.stats.spd}</span><span>WIS:{c.stats.wis}</span><span>FAITH:{c.stats.faith}</span>
            </div>
            <div style={{ marginTop:6,fontSize:10,color:c.color }}>Start spell: {SPELLS[c.startSpell].emoji} {SPELLS[c.startSpell].name}</div>
            <div style={{ fontSize:10,color:'#555',marginTop:2 }}>HP:{c.hp} · MP:{c.mp}</div>
          </div>
        ))}
      </div>
      <input value={heroName} onChange={e => setHeroName(e.target.value)} placeholder="Enter your hero's name..." style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'12px 14px',fontFamily:'monospace',fontSize:13,marginBottom:10 }} />
      <button onClick={createHeroAction} disabled={!heroName.trim()} style={{ width:'100%',background:heroName.trim()?'rgba(192,132,252,0.15)':'#09091c',border:`2px solid ${heroName.trim()?'#c084fc':'#333'}`,color:heroName.trim()?'#c084fc':'#555',borderRadius:10,padding:14,cursor:heroName.trim()?'pointer':'default',fontFamily:'monospace',fontWeight:900,fontSize:14 }}>
        ⚔️ BEGIN YOUR QUEST
      </button>
    </div>
  )

  // ── OVERWORLD MAP ───────────────────────────────────────────────────
  if (screen === 'overworld' && hero) return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderBottom:'1px solid #1a1a3e',background:'rgba(0,0,0,0.9)' }}>
        <button onClick={onExit} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>EXIT</button>
        <span style={{ color:'#c084fc',fontWeight:700,fontSize:12 }}>🗺️ OMNIVERSE KINGDOM</span>
        <span style={{ marginLeft:'auto',color:'#ffd700',fontSize:11 }}>💰{hero.gold} · Lv{hero.level} · {cls?.emoji}{hero.name}</span>
      </div>
      <div style={{ flex:1,padding:14,overflowY:'auto' }}>
        <div style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:10,padding:12,marginBottom:14 }}>
          <div style={{ display:'flex',gap:16,alignItems:'center',marginBottom:8 }}>
            <span style={{ fontSize:28 }}>{cls?.emoji}</span>
            <div>
              <div style={{ color:cls?.color,fontWeight:700 }}>{hero.name} — {HERO_CLASSES[hero.class].name}</div>
              <div style={{ fontSize:11,color:'#555' }}>Level {hero.level} · {hero.xp}/{hero.xpNext} XP</div>
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6 }}>
            <div>
              <div style={{ fontSize:10,color:'#555',marginBottom:2 }}>HP {hero.hp}/{hero.maxHp}</div>
              <div style={{ background:'#111',borderRadius:3,height:6 }}><div style={{ background:hero.hp/hero.maxHp>0.5?'#00cc44':hero.hp/hero.maxHp>0.25?'#ffaa00':'#ff4400',height:'100%',width:`${(hero.hp/hero.maxHp)*100}%`,borderRadius:3 }}/></div>
            </div>
            <div>
              <div style={{ fontSize:10,color:'#555',marginBottom:2 }}>MP {hero.mp}/{hero.maxMp}</div>
              <div style={{ background:'#111',borderRadius:3,height:6 }}><div style={{ background:'#00ccff',height:'100%',width:`${(hero.mp/hero.maxMp)*100}%`,borderRadius:3 }}/></div>
            </div>
          </div>
          <div style={{ display:'flex',gap:12,marginTop:8,fontSize:11 }}>
            <span style={{ color:'#ffd700' }}>⭐ Faith: {hero.faithScore}</span>
            <span style={{ color:'#8800ff' }}>🌑 Void: {hero.voidScore}</span>
            <span style={{ color:'#555' }}>📦 Items: {hero.inventory.length}</span>
          </div>
          {hero.faithScore >= 70 && <div style={{ marginTop:6,fontSize:10,color:'#ffd700' }}>✨ HIGH FAITH — Shops 15% discount · Light spells +30% power</div>}
        </div>
        <div style={{ fontSize:11,color:'#555',marginBottom:10,letterSpacing:2 }}>CHOOSE DESTINATION</div>
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {(Object.entries(TOWNS) as [Town, typeof TOWNS[Town]][]).map(([id, t]) => (
            <div key={id} onClick={() => travelTo(id)} style={{ background:`${t.color}08`,border:`1px solid ${t.color}33`,borderRadius:10,padding:12,cursor:'pointer',display:'flex',gap:12,alignItems:'center' }}>
              <span style={{ fontSize:28 }}>{t.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ color:t.color,fontWeight:700,fontSize:12 }}>{t.name}</div>
                <div style={{ color:'#555',fontSize:10,marginTop:2 }}>{t.desc}</div>
                <div style={{ fontSize:9,color:'#444',marginTop:3 }}>Services: {t.services.join(' · ')}</div>
              </div>
              <span style={{ color:t.color,fontSize:16 }}>→</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',gap:8,marginTop:14 }}>
          <button onClick={() => setScreen('quest_log')} style={{ flex:1,background:'rgba(250,204,21,0.08)',border:'1px solid #ffd70033',color:'#ffd700',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>📋 Quest Log</button>
          <button onClick={() => setScreen('inventory')} style={{ flex:1,background:'rgba(0,204,68,0.08)',border:'1px solid #00cc4433',color:'#00cc44',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>🎒 Inventory</button>
        </div>
      </div>
    </div>
  )

  // ── TOWN ─────────────────────────────────────────────────────────────
  if (screen === 'town' && hero) {
    const npc = town.npc
    return (
      <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderBottom:`1px solid ${town.color}33`,background:'rgba(0,0,0,0.9)' }}>
          <button onClick={() => setScreen('overworld')} style={{ background:'none',border:`1px solid ${town.color}44`,color:town.color,borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← MAP</button>
          <span style={{ fontSize:16 }}>{town.emoji}</span>
          <span style={{ color:town.color,fontWeight:700,fontSize:12 }}>{town.name}</span>
          <span style={{ marginLeft:'auto',color:'#ffd700',fontSize:11 }}>💰{hero.gold}</span>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:14 }}>
          {/* NPC dialogue */}
          {!npcOpen ? (
            <div onClick={() => { setNpcOpen(true); setNpcLine(0) }} style={{ background:`${town.color}08`,border:`1px solid ${town.color}33`,borderRadius:10,padding:12,cursor:'pointer',marginBottom:12,display:'flex',gap:10,alignItems:'center' }}>
              <span style={{ fontSize:28 }}>{npc.emoji}</span>
              <div><div style={{ color:town.color,fontWeight:700,fontSize:12 }}>{npc.name}</div><div style={{ color:'#555',fontSize:10 }}>Tap to speak</div></div>
            </div>
          ) : (
            <div style={{ background:`${town.color}08`,border:`1px solid ${town.color}`,borderRadius:10,padding:14,marginBottom:12 }}>
              <div style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:10 }}>
                <span style={{ fontSize:28 }}>{npc.emoji}</span>
                <div>
                  <div style={{ color:town.color,fontWeight:700,fontSize:11,marginBottom:4 }}>{npc.name}</div>
                  <div style={{ color:'#ccc',fontSize:12,lineHeight:1.6 }}>"{npc.lines[npcLine]}"</div>
                </div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                {npcLine < npc.lines.length - 1 ? (
                  <button onClick={() => setNpcLine(l => l + 1)} style={{ flex:1,background:`${town.color}15`,border:`1px solid ${town.color}`,color:town.color,borderRadius:6,padding:'8px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>Continue →</button>
                ) : (
                  <button onClick={() => setNpcOpen(false)} style={{ flex:1,background:'#111',border:'1px solid #333',color:'#555',borderRadius:6,padding:'8px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>Farewell</button>
                )}
              </div>
            </div>
          )}
          {/* Actions */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
            <button onClick={() => startCombat()} style={{ background:'rgba(255,68,0,0.1)',border:'1px solid #ff440044',color:'#ff4400',borderRadius:8,padding:'12px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:12,fontWeight:700 }}>
              ⚔️ Explore &amp; Fight<br/><span style={{ fontSize:9,color:'#555' }}>Encounter enemies</span>
            </button>
            {town.services.includes('Inn') && (
              <button onClick={restAtInn} style={{ background:'rgba(0,204,68,0.08)',border:'1px solid #00cc4433',color:'#00cc44',borderRadius:8,padding:'12px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:12,fontWeight:700 }}>
                😴 Rest at Inn<br/><span style={{ fontSize:9,color:'#555' }}>Full HP+MP (30g)</span>
              </button>
            )}
            <button onClick={() => setShopOpen(!shopOpen)} style={{ background:'rgba(255,215,0,0.08)',border:'1px solid #ffd70033',color:'#ffd700',borderRadius:8,padding:'12px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:12,fontWeight:700 }}>
              🛒 Shop<br/><span style={{ fontSize:9,color:'#555' }}>Buy items &amp; spells</span>
            </button>
            <button onClick={() => setScreen('quest_log')} style={{ background:'rgba(0,204,255,0.08)',border:'1px solid #00ccff33',color:'#00ccff',borderRadius:8,padding:'12px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:12,fontWeight:700 }}>
              📋 Quest Log<br/><span style={{ fontSize:9,color:'#555' }}>View &amp; track quests</span>
            </button>
          </div>
          {/* Shop */}
          {shopOpen && (
            <div style={{ background:'#0d0d24',border:`1px solid ${town.color}33`,borderRadius:10,padding:12,marginBottom:12 }}>
              <div style={{ color:town.color,fontWeight:700,fontSize:12,marginBottom:10 }}>🛒 Shop — Your gold: {hero.gold}g</div>
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #1a1a3e' }}>
                  <span style={{ fontSize:12 }}>💊 Health Potion (+40HP)</span>
                  <button onClick={buyPotion} style={{ background:'rgba(0,204,68,0.15)',border:'1px solid #00cc4444',color:'#00cc44',borderRadius:4,padding:'4px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>25g BUY</button>
                </div>
                {/* Spell shop - show unlearned spells */}
                {Object.entries(SPELLS).filter(([id]) => !hero.spells.includes(id as SpellId)).slice(0,3).map(([id, spell]) => (
                  <div key={id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #1a1a3e' }}>
                    <span style={{ fontSize:12 }}>{spell.emoji} {spell.name} <span style={{ color:'#555',fontSize:10 }}>{spell.effect}</span></span>
                    <button onClick={() => learnSpell(id as SpellId, 80)} style={{ background:`${spell.color}15`,border:`1px solid ${spell.color}44`,color:spell.color,borderRadius:4,padding:'4px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:10,flexShrink:0 }}>80g LEARN</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* HP/MP display */}
          <div style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:8,padding:10 }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:11 }}>
              <div><div style={{ color:'#555',marginBottom:2 }}>HP {hero.hp}/{hero.maxHp}</div><div style={{ background:'#111',borderRadius:2,height:5 }}><div style={{ background:hero.hp/hero.maxHp>0.5?'#00cc44':'#ff4400',height:'100%',width:`${(hero.hp/hero.maxHp)*100}%`,borderRadius:2 }}/></div></div>
              <div><div style={{ color:'#555',marginBottom:2 }}>MP {hero.mp}/{hero.maxMp}</div><div style={{ background:'#111',borderRadius:2,height:5 }}><div style={{ background:'#00ccff',height:'100%',width:`${(hero.mp/hero.maxMp)*100}%`,borderRadius:2 }}/></div></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── COMBAT ────────────────────────────────────────────────────────────
  if (screen === 'combat' && hero) {
    const alive = enemies.filter(e => e.hp > 0)
    return (
      <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
        {/* Combat HUD */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',padding:'8px 12px',borderBottom:'1px solid #ff440033',background:'rgba(0,0,0,0.95)',gap:8 }}>
          <div>
            <div style={{ color:cls?.color,fontSize:12,fontWeight:700 }}>{cls?.emoji} {hero.name}</div>
            <div style={{ fontSize:10,color:hero.hp/hero.maxHp>0.5?'#00cc44':'#ff4400' }}>HP {hero.hp}/{hero.maxHp}</div>
            <div style={{ background:'#111',borderRadius:2,height:4,width:80,marginTop:2 }}><div style={{ background:hero.hp/hero.maxHp>0.5?'#00cc44':'#ff4400',height:'100%',width:`${(hero.hp/hero.maxHp)*100}%`,borderRadius:2 }}/></div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ff4400',fontSize:11,fontWeight:700 }}>⚔️ COMBAT</div>
            <div style={{ color:turn==='player'?'#00cc44':'#ff4400',fontSize:10 }}>{turn==='player'?'YOUR TURN':'ENEMY TURN'}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:'#00ccff',fontSize:10 }}>MP {hero.mp}/{hero.maxMp}</div>
            <div style={{ fontSize:10,color:'#555' }}>Enemies: {alive.length}</div>
          </div>
        </div>
        {/* Enemies */}
        <div style={{ padding:12,borderBottom:'1px solid #1a1a3e',display:'flex',gap:10,justifyContent:'center' }}>
          {enemies.map(e => (
            <div key={e.id} style={{ textAlign:'center',opacity:e.hp<=0?0.3:1 }}>
              <div style={{ fontSize:36,filter:e.hp>0?'drop-shadow(0 0 10px #ff4400)':'none' }}>{e.hp<=0?'💀':e.emoji}</div>
              <div style={{ fontSize:10,color:e.hp>0?'#ff4400':'#333',marginTop:2 }}>{e.name}</div>
              {e.hp > 0 && (<><div style={{ background:'#111',width:60,height:5,borderRadius:2,margin:'3px auto' }}><div style={{ background:'#ff4400',height:'100%',width:`${(e.hp/e.maxHp)*100}%`,borderRadius:2 }}/></div><div style={{ fontSize:9,color:'#555' }}>{e.hp}/{e.maxHp}</div></>)}
            </div>
          ))}
        </div>
        {/* Combat log */}
        <div style={{ flex:1,overflowY:'auto',padding:'8px 12px',background:'#0a0a1a' }}>
          {combatLog.slice(-8).map(l => <div key={l.id} style={{ fontSize:11,color:l.color,marginBottom:3 }}>{l.text}</div>)}
          {combatResult === 'win' && (
            <div style={{ textAlign:'center',padding:16 }}>
              <div style={{ color:'#ffd700',fontSize:18,fontWeight:900 }}>🏆 VICTORY!</div>
              <button onClick={() => setScreen('town')} style={{ marginTop:10,background:'rgba(255,215,0,0.15)',border:'1px solid #ffd700',color:'#ffd700',borderRadius:8,padding:'10px 24px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>Continue →</button>
            </div>
          )}
          {combatResult === 'lose' && (
            <div style={{ textAlign:'center',padding:16 }}>
              <div style={{ color:'#ff4400',fontSize:16,fontWeight:900 }}>💀 DEFEATED</div>
              <button onClick={() => { setHero(h => h ? { ...h, hp: Math.floor(h.maxHp * 0.3), mp: Math.floor(h.maxMp * 0.5) } : h); setScreen('town') }} style={{ marginTop:10,background:'rgba(255,68,0,0.15)',border:'1px solid #ff4400',color:'#ff4400',borderRadius:8,padding:'10px 24px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>Respawn (30% HP)</button>
            </div>
          )}
        </div>
        {/* Combat actions */}
        {!combatResult && (
          <div style={{ padding:'8px 10px',background:'rgba(0,0,0,0.98)',borderTop:'1px solid #ff440033' }}>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:5,marginBottom:6 }}>
              <button onClick={attack} disabled={turn!=='player'} style={{ background:turn==='player'?'rgba(255,68,0,0.15)':'#09091c',border:`1px solid ${turn==='player'?'#ff4400':'#222'}`,color:turn==='player'?'#ff4400':'#555',borderRadius:6,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>⚔️ ATTACK</button>
              <button onClick={usePotion} style={{ background:'rgba(0,204,68,0.1)',border:'1px solid #00cc4433',color:'#00cc44',borderRadius:6,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontSize:12 }}>💊 POTION ({hero.inventory.filter(i=>i==='Health Potion').length})</button>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5,marginBottom:5 }}>
              {hero.spells.map(spellId => {
                const spell = SPELLS[spellId]
                const canCast = hero.mp >= spell.cost && turn === 'player'
                return (
                  <button key={spellId} onClick={() => castSpell(spellId)} disabled={!canCast} style={{ background:canCast?`${spell.color}10`:'#0a0a0a',border:`1px solid ${canCast?spell.color+'44':'#222'}`,color:canCast?spell.color:'#333',borderRadius:6,padding:'7px 4px',cursor:'pointer',fontFamily:'monospace',fontSize:10,textAlign:'center' }}>
                    {spell.emoji}<br/>{spell.name.split(' ')[0]}<br/><span style={{ fontSize:8,color:'#555' }}>{spell.cost}MP</span>
                  </button>
                )
              })}
            </div>
            <button onClick={flee} style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#555',borderRadius:6,padding:'7px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>🏃 Flee (-10 HP)</button>
          </div>
        )}
      </div>
    )
  }

  // ── QUEST LOG ─────────────────────────────────────────────────────────
  if (screen === 'quest_log' && hero) return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',overflowY:'auto',padding:16 }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
        <button onClick={() => setScreen('overworld')} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← BACK</button>
        <span style={{ color:'#ffd700',fontWeight:700 }}>📋 Quest Log</span>
        <span style={{ marginLeft:'auto',color:'#555',fontSize:10 }}>Completed: {hero.completedQuests.length}/{Object.keys(quests).length}</span>
      </div>
      {Object.values(quests).map(q => (
        <div key={q.id} style={{ background:q.completed?'#0d1a0d':q.available?'#09091c':'#0a0a0a',border:`1px solid ${q.completed?'#00cc4433':q.available?'#ffd70033':'#222'}`,borderRadius:10,padding:12,marginBottom:8,opacity:q.available||q.completed?1:0.5 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
            <span style={{ fontSize:20 }}>{q.completed?'✅':q.available?q.emoji:'🔒'}</span>
            <div>
              <div style={{ color:q.completed?'#00cc44':q.available?'#ffd700':'#555',fontWeight:700,fontSize:12 }}>{q.title}</div>
              <div style={{ color:'#555',fontSize:10 }}>{q.completed?'COMPLETED':'AVAILABLE'}</div>
            </div>
            <div style={{ marginLeft:'auto',textAlign:'right',fontSize:10,color:'#444' }}>
              <div>+{q.reward.xp} XP</div>
              <div>+{q.reward.gold}g</div>
              {q.reward.item && <div style={{ color:'#c084fc' }}>{q.reward.item}</div>}
            </div>
          </div>
          <div style={{ color:'#666',fontSize:11 }}>{q.desc}</div>
        </div>
      ))}
    </div>
  )

  // ── INVENTORY ─────────────────────────────────────────────────────────
  if (screen === 'inventory' && hero) return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',overflowY:'auto',padding:16 }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
        <button onClick={() => setScreen('overworld')} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← BACK</button>
        <span style={{ color:'#00cc44',fontWeight:700 }}>🎒 Inventory</span>
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:11,color:'#555',marginBottom:8 }}>STATS</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,fontSize:11 }}>
          {[['STR',hero.str,'#ff4400'],['SPD',hero.spd,'#ffaa00'],['WIS',hero.wis,'#00ccff'],['FAITH',hero.faith,'#ffd700']].map(([stat,val,col])=>(
            <div key={String(stat)} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:6,padding:'8px',textAlign:'center' }}>
              <div style={{ color:String(col),fontWeight:700,fontSize:14 }}>{val}</div>
              <div style={{ color:'#555',fontSize:9 }}>{stat}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:11,color:'#555',marginBottom:8 }}>KNOWN SPELLS ({hero.spells.length})</div>
        <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
          {hero.spells.map(id => {
            const s = SPELLS[id]
            return <div key={id} style={{ background:`${s.color}08`,border:`1px solid ${s.color}33`,borderRadius:8,padding:10,display:'flex',gap:8,alignItems:'center' }}>
              <span style={{ fontSize:20 }}>{s.emoji}</span>
              <div><div style={{ color:s.color,fontSize:11,fontWeight:700 }}>{s.name}</div><div style={{ color:'#555',fontSize:10 }}>{s.effect} · {s.cost}MP</div></div>
            </div>
          })}
        </div>
      </div>
      <div>
        <div style={{ fontSize:11,color:'#555',marginBottom:8 }}>ITEMS ({hero.inventory.length})</div>
        {hero.inventory.length === 0 ? <div style={{ color:'#333',fontSize:11 }}>No items. Buy from a shop.</div> : (
          <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
            {hero.inventory.map((item, i) => (
              <div key={i} style={{ background:'#0d1a0d',border:'1px solid #00cc4433',borderRadius:6,padding:'6px 12px',fontSize:11,color:'#00cc44' }}>{item}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return null
}
