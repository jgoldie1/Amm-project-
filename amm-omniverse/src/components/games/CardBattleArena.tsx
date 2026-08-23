import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../game/state/useGameStore'
import { CARD_CATALOG, STARTER_DECK_IDS, getCard, type OmniCard, type CardType, type Realm, type Rarity, type HolidayCard } from '../../game/cards/CardCatalog'

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase = 'draw'|'energy'|'summon'|'strategy'|'battle'|'end'
type Zone = 'hand'|'field'|'graveyard'|'deck'
type GameState = 'setup'|'playing'|'victory'|'defeat'

interface FieldCard {
  // All OmniCard fields
  id: string
  name: string
  type: CardType
  realm: Realm
  rarity: Rarity
  crystalCost: number
  atk?: number
  def?: number
  lifeGain?: number
  description: string
  special?: string
  lottieKey?: string
  holiday?: HolidayCard
  emoji: string
  color: string
  fusionRequires?: string[]
  // FieldCard extras
  fieldId: string
  owner: 'player'|'ai'
  mode: 'attack'|'defense'
  hasAttacked: boolean
  tempAtkBonus: number
  tempDefBonus: number
  stunned: boolean
  statusEffects: string[]
}

interface BattleLog { id: number; text: string; type: 'player'|'ai'|'system'|'damage'|'heal'|'feast' }

// ── Helpers ───────────────────────────────────────────────────────────────────
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

const buildDeck = (ids: string[]): OmniCard[] =>
  ids.flatMap((id: string) => CARD_CATALOG.filter((card: OmniCard) => card.id === id))

const buildAIDeck = (): OmniCard[] => {
  const aiIds = ['sh01','sh01','sh02','sh03','sh04','f01','f02','f03','f05',
    'boss03','sp04','sp01','c01','c01','c06','c06','t01','t02','t03','c07']
  return buildDeck(aiIds)
}

const PHASE_LABELS: Record<Phase, string> = {
  draw:'1. DRAW', energy:'2. ENERGY', summon:'3. SUMMON',
  strategy:'4. STRATEGY', battle:'5. BATTLE', end:'6. END'
}

const REALM_COLORS: Record<string,string> = {
  judah:'#ffd700', fire:'#ff4400', water:'#0088ff', sky:'#88ccff',
  earth:'#886644', light:'#ffffcc', shadow:'#330066', sound:'#00ccff',
  tech:'#44ff88', saturn:'#ffaa00'
}

// ── Current Hebrew holiday detection ─────────────────────────────────────────
function getCurrentHoliday(): string | null {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  // Approximate Gregorian dates for the feasts
  if (month === 4 && day >= 5 && day <= 13) return 'passover'
  if (month === 6 && day >= 5 && day <= 7) return 'shavuot'
  if (month === 9 && day >= 15 && day <= 17) return 'trumpets'
  if (month === 9 && day >= 24 && day <= 25) return 'atonement'
  if (month === 9 && day >= 29 || month === 10 && day <= 6) return 'sukkot'
  if (month === 12 && day >= 7 && day <= 15) return 'hanukkah'
  if (month === 3 && day >= 13 && day <= 14) return 'purim'
  // New moon: 1st of each Hebrew month — approximate monthly
  if (day === 1) return 'newmoon'
  return null
}

export default function CardBattleArena({ onExit }: { onExit: () => void }) {
  const store = useGameStore()
  const [gameState, setGameState] = useState<GameState>('setup')
  const [phase, setPhase] = useState<Phase>('draw')
  const [turn, setTurn] = useState(1)
  const [playerLE, setPlayerLE] = useState(8000)
  const [aiLE, setAiLE] = useState(8000)
  const [playerCrystals, setPlayerCrystals] = useState(1)
  const [aiCrystals, setAiCrystals] = useState(1)
  const [playerHand, setPlayerHand] = useState<OmniCard[]>([])
  const [playerField, setPlayerField] = useState<FieldCard[]>([])
  const [playerGrave, setPlayerGrave] = useState<OmniCard[]>([])
  const [playerDeck, setPlayerDeck] = useState<OmniCard[]>([])
  const [aiHand, setAiHand] = useState<OmniCard[]>([])
  const [aiField, setAiField] = useState<FieldCard[]>([])
  const [aiGrave, setAiGrave] = useState<OmniCard[]>([])
  const [aiDeck, setAiDeck] = useState<OmniCard[]>([])
  const [selectedCard, setSelectedCard] = useState<OmniCard | null>(null)
  const [selectedField, setSelectedField] = useState<FieldCard | null>(null)
  const [battleLog, setBattleLog] = useState<BattleLog[]>([])
  const [showGrave, setShowGrave] = useState(false)
  const [showPhaseTip, setShowPhaseTip] = useState(true)
  const [activeLottie, setActiveLottie] = useState<string | null>(null)
  const [fusionMode, setFusionMode] = useState(false)
  const [fusionCards, setFusionCards] = useState<OmniCard[]>([])
  const [currentHoliday] = useState(getCurrentHoliday())
  const [holidayBonus, setHolidayBonus] = useState(false)
  const logId = useRef(0)

  const addLog = (text: string, type: BattleLog['type'] = 'system') => {
    const id = logId.current++
    setBattleLog(prev => [...prev.slice(-12), { id, text, type }])
  }

  const flashLottie = (key: string) => {
    setActiveLottie(key)
    setTimeout(() => setActiveLottie(null), 2000)
  }

  // ── Setup ──────────────────────────────────────────────────────────────────

  const startGame = () => {
    const pDeck = shuffle(buildDeck(STARTER_DECK_IDS))
    const aDeck = shuffle(buildAIDeck())
    setPlayerDeck(pDeck.slice(5))
    setPlayerHand(pDeck.slice(0, 5))
    setAiDeck(aDeck.slice(5))
    setAiHand(aDeck.slice(0, 5))
    setGameState('playing')
    setPhase('draw')
    setTurn(1)
    setPlayerLE(8000); setAiLE(8000)
    setPlayerCrystals(1); setAiCrystals(1)

    addLog('Duel begins! Draw your opening hand.', 'system')
    if (currentHoliday) {
      addLog(`🎉 ${currentHoliday.toUpperCase()} feast active! Holiday bonus cards unlocked!`, 'feast')
      setHolidayBonus(true)
    }
  }

  // ── Phase advancement ──────────────────────────────────────────────────────

  const nextPhase = () => {
    setShowPhaseTip(false)
    switch(phase) {
      case 'draw':
        // Draw a card
        if (playerDeck.length === 0) { endGame('defeat', 'Your deck is empty!'); return }
        const drawn = playerDeck[0]
        setPlayerHand(h => [...h, drawn])
        setPlayerDeck(d => d.slice(1))
        addLog(`Drew: ${drawn.emoji} ${drawn.name}`, 'player')
        if (holidayBonus && drawn.holiday) flashLottie(drawn.lottieKey ?? 'faith_glow')
        setPhase('energy')
        break

      case 'energy':
        setPlayerCrystals(c => Math.min(10, c + 1))
        addLog(`Energy: ${Math.min(10, playerCrystals + 1)} Crystals`, 'player')
        setPhase('summon')
        break

      case 'summon':
        addLog('Summon phase. Play a card from your hand.', 'system')
        setPhase('strategy')
        break

      case 'strategy':
        addLog('Strategy phase. Activate spells/traps.', 'system')
        setPhase('battle')
        break

      case 'battle':
        addLog('Battle phase. Select your warrior to attack!', 'system')
        break

      case 'end':
        endTurn()
        break
    }
  }

  const endBattlePhase = () => {
    // Clear temp bonuses and reset attacks
    setPlayerField(f => f.map(c => ({ ...c, hasAttacked: false, tempAtkBonus: 0, tempDefBonus: 0 })))
    setPhase('end')
    addLog('End phase. AI takes its turn...', 'system')
    setTimeout(() => doAITurn(), 1000)
  }

  // ── Play card ──────────────────────────────────────────────────────────────

  const playCard = (card: OmniCard) => {
    if (phase !== 'summon' && phase !== 'strategy') {
      addLog(`Can't play cards during ${phase} phase`, 'system'); return
    }
    if (card.crystalCost > playerCrystals) {
      addLog(`Need ${card.crystalCost} Crystals (have ${playerCrystals})`, 'system'); return
    }

    setPlayerCrystals(c => c - card.crystalCost)
    setPlayerHand(h => h.filter(c => c.id !== card.id || c === card ? h.indexOf(c) !== h.indexOf(card) : true).filter((_, i, arr) => {
      const firstIdx = arr.findIndex(x => x.id === card.id)
      return _ !== card || arr.indexOf(_) !== firstIdx
    }))

    // Remove exactly one copy
    setPlayerHand(prev => {
      const idx = prev.findIndex(c => c.id === card.id)
      if (idx === -1) return prev
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })

    if (card.type === 'spell' || card.type === 'trap' || card.type === 'scroll' && !card.atk) {
      applySpellEffect(card)
    } else if (card.type === 'realm') {
      addLog(`🌐 Realm "${card.name}" activated! ${card.description}`, 'player')
      flashLottie('realm_shift')
    } else {
      // Place on field
      const fieldCard: FieldCard = {
        ...card, fieldId: `p_${Date.now()}`, owner: 'player',
        mode: 'attack', hasAttacked: false, tempAtkBonus: 0, tempDefBonus: 0,
        stunned: false, statusEffects: []
      }
      setPlayerField(f => [...f, fieldCard])
      addLog(`Summoned: ${card.emoji} ${card.name} (ATK ${card.atk} / DEF ${card.def})`, 'player')
      flashLottie('card_summon')
    }
  }

  const applySpellEffect = (card: OmniCard) => {
    addLog(`Spell: ${card.emoji} ${card.name}`, 'player')
    flashLottie(card.lottieKey ?? 'faith_glow')

    if (card.lifeGain) {
      setPlayerLE(le => Math.min(8000, le + card.lifeGain!))
      addLog(`Restored ${card.lifeGain} Life Energy!`, 'heal')
      flashLottie('heal_burst')
    }
    if (card.id === 'sp02') { // Creator Power Boost
      setPlayerField(f => f.map(c => c.hasAttacked ? c : { ...c, tempAtkBonus: c.tempAtkBonus + 800 }))
      addLog('All your warriors gain +800 ATK this turn!', 'player')
    }
    if (card.id === 'hf05' || card.holiday === 'trumpets') { // Shofar Blast
      setAiField(f => f.map(c => ({ ...c, stunned: true })))
      addLog('⚡ SHOFAR BLAST! All enemy warriors stunned for 1 turn!', 'feast')
      flashLottie('shofar_wave')
    }
    if (card.id === 'hf06' || card.holiday === 'atonement') { // Atonement
      setPlayerLE(le => Math.min(8000, le + 3000))
      addLog('✨ ATONEMENT! Restored 3000 Life Energy!', 'feast')
      flashLottie('white_glow')
    }
    if (card.id === 'hf08' || card.holiday === 'hanukkah') { // Menorah
      const draw8 = playerDeck.slice(0, 8)
      setPlayerHand(h => [...h, ...draw8].slice(0, 10))
      setPlayerDeck(d => d.slice(8))
      addLog('🕎 MENORAH LIGHT! Drew 8 cards!', 'feast')
      flashLottie('menorah_light')
    }
    if (card.id === 'hf01' || card.holiday === 'passover') { // Exodus Shield
      addLog('🛡️ EXODUS SHIELD! Your field is immune this turn!', 'feast')
      flashLottie('passover_glow')
    }
    // Send to graveyard
    setPlayerGrave(g => [...g, card])
  }

  // ── Battle ─────────────────────────────────────────────────────────────────

  const declareAttack = (attacker: FieldCard) => {
    if (phase !== 'battle') { addLog('Not battle phase!', 'system'); return }
    if (attacker.hasAttacked) { addLog(`${attacker.name} already attacked!`, 'system'); return }
    if (attacker.stunned) { addLog(`${attacker.name} is stunned!`, 'system'); return }

    const atk = (attacker.atk ?? 0) + attacker.tempAtkBonus

    if (aiField.length === 0) {
      // Direct attack
      const dmg = atk
      setAiLE(le => {
        const n = Math.max(0, le - dmg)
        if (n <= 0) endGame('victory', 'You reduced opponent to 0 Life Energy!')
        return n
      })
      addLog(`⚔️ ${attacker.name} attacks directly! ${dmg} damage!`, 'player')
      flashLottie('life_drain')
    } else {
      // Attack first enemy on field
      const target = aiField[0]
      const targetDef = target.mode === 'defense' ? (target.def ?? 0) : (target.atk ?? 0) + target.tempAtkBonus
      const diff = atk - targetDef

      if (diff > 0) {
        if (target.mode === 'attack') {
          setAiLE(le => { const n = Math.max(0, le - diff); if (n <= 0) endGame('victory','AI Life Energy: 0!'); return n })
          addLog(`⚔️ Destroyed ${target.name}! ${diff} damage to AI!`, 'player')
        } else {
          addLog(`⚔️ ${target.name} destroyed in defense!`, 'player')
        }
        setAiField(f => f.filter(c => c.fieldId !== target.fieldId))
        setAiGrave(g => [...g, target])
        flashLottie('life_drain')
      } else if (diff < 0 && target.mode === 'attack') {
        const selfDmg = Math.abs(diff)
        setPlayerLE(le => { const n = Math.max(0, le - selfDmg); if (n <= 0) endGame('defeat','Your Life Energy reached 0!'); return n })
        addLog(`💥 ${target.name} reflects ${selfDmg} damage to you!`, 'damage')
      } else {
        addLog(`⚡ Attack tied — no damage!`, 'system')
      }
    }

    setPlayerField(f => f.map(c => c.fieldId === attacker.fieldId ? { ...c, hasAttacked: true } : c))
  }

  // ── AI Turn ────────────────────────────────────────────────────────────────

  const doAITurn = () => {
    // AI draws
    if (aiDeck.length === 0) { endGame('victory', 'AI deck is empty!'); return }
    const aiDrawn = aiDeck[0]
    setAiHand(h => [...h, aiDrawn])
    setAiDeck(d => d.slice(1))
    setAiCrystals(c => Math.min(10, c + 1))

    setTimeout(() => {
      // AI plays affordable cards
      setAiHand(prev => {
        const toPlay = prev.filter(c => c.crystalCost <= aiCrystals + 1 && c.type !== 'trap').slice(0, 1)
        toPlay.forEach(card => {
          if (card.type === 'spell') {
            addLog(`🤖 AI spell: ${card.emoji} ${card.name}`, 'ai')
          } else if (card.atk) {
            const fc: FieldCard = { ...card, fieldId:`ai_${Date.now()}`, owner:'ai', mode:'attack', hasAttacked:false, tempAtkBonus:0, tempDefBonus:0, stunned:false, statusEffects:[] }
            setAiField(f => [...f, fc])
            addLog(`🤖 AI summons ${card.emoji} ${card.name} (ATK ${card.atk})`, 'ai')
          }
        })
        return prev.filter(c => !toPlay.includes(c))
      })

      // AI attacks
      setTimeout(() => {
        setAiField(prev => {
          prev.forEach(attacker => {
            if (attacker.hasAttacked || attacker.stunned) return
            const atk = (attacker.atk ?? 0) + attacker.tempAtkBonus

            if (playerField.length === 0) {
              const dmg = atk
              setPlayerLE(le => { const n = Math.max(0, le - dmg); if (n <= 0) endGame('defeat','Your Life Energy reached 0!'); return n })
              addLog(`🤖 ${attacker.name} attacks directly! ${dmg} damage!`, 'ai')
              flashLottie('life_drain')
            } else {
              const target = playerField[0]
              const tVal = target.mode === 'defense' ? (target.def ?? 0) : (target.atk ?? 0)
              const diff = atk - tVal
              if (diff > 0) {
                if (target.mode === 'attack') {
                  setPlayerLE(le => { const n = Math.max(0, le - diff); if (n <= 0) endGame('defeat','Your Life Energy: 0!'); return n })
                  addLog(`🤖 AI destroyed ${target.name}! ${diff} damage!`, 'damage')
                } else {
                  addLog(`🤖 AI destroyed ${target.name} in defense!`, 'damage')
                }
                setPlayerField(f => f.filter(c => c.fieldId !== target.fieldId))
                setPlayerGrave(g => [...g, target])
              } else {
                addLog(`🛡 ${target.name} survived AI attack!`, 'player')
              }
            }
          })
          return prev.map(c => ({ ...c, hasAttacked: true, stunned: false }))
        })

        setTimeout(() => {
          setTurn(t => t + 1)
          setPhase('draw')
          setPlayerField(f => f.map(c => ({ ...c, hasAttacked: false, tempAtkBonus: 0, tempDefBonus: 0, stunned: false })))
          setShowPhaseTip(true)
          addLog(`--- Turn ${turn + 1} begins ---`, 'system')
        }, 800)
      }, 1200)
    }, 1000)
  }

  const endTurn = () => {
    // Trim hand to 7
    if (playerHand.length > 7) {
      const discard = playerHand.slice(7)
      setPlayerHand(h => h.slice(0, 7))
      setPlayerGrave(g => [...g, ...discard])
      addLog(`Discarded ${discard.length} card(s) to graveyard`, 'system')
    }
  }

  const endGame = (result: 'victory'|'defeat', reason: string) => {
    setGameState(result)
    addLog(`${result === 'victory' ? '🏆 VICTORY' : '💀 DEFEAT'}: ${reason}`, result === 'victory' ? 'player' : 'ai')
    if (result === 'victory') {
      store.earnCash(5000); store.earnXp(1000)
      flashLottie('scroll_victory')
      store.setNotif('🏆 DUEL WON! +$5,000 · +1,000 XP · Cards unlocked!')
    }
  }

  const C_JUDAH = '#ffd700'

  // ── Render: Setup screen ───────────────────────────────────────────────────
  if (gameState === 'setup') return (
    <div style={{ width:'100%',height:'100%',background:'#050210',fontFamily:'monospace',display:'flex',flexDirection:'column',overflowY:'auto' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderBottom:`1px solid ${C_JUDAH}33` }}>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← EXIT</button>
        <span style={{ color:C_JUDAH,fontWeight:900,fontSize:15,letterSpacing:3 }}>🃏 OMNIVERSE DUEL REALMS</span>
      </div>
      <div style={{ padding:20 }}>
        <div style={{ textAlign:'center',marginBottom:20 }}>
          <div style={{ fontSize:56,marginBottom:10,filter:`drop-shadow(0 0 20px ${C_JUDAH})` }}>📜</div>
          <div style={{ color:C_JUDAH,fontSize:22,fontWeight:900,marginBottom:4 }}>AMM CARD BATTLE ARENA</div>
          <div style={{ color:'#888',fontSize:12,marginBottom:8 }}>An original anime holographic card game · AMM Omniverse</div>
          {currentHoliday && (
            <div style={{ background:`${C_JUDAH}22`,border:`1px solid ${C_JUDAH}`,borderRadius:8,padding:'8px 16px',display:'inline-block',marginBottom:12 }}>
              <div style={{ color:C_JUDAH,fontSize:13,fontWeight:700 }}>🎉 {currentHoliday.toUpperCase()} FEAST — HOLIDAY CARDS ACTIVE!</div>
              <div style={{ color:'#888',fontSize:11 }}>Special Lottie gift cards are available this duel</div>
            </div>
          )}
        </div>
        {/* Lore */}
        <div style={{ background:'rgba(5,5,30,0.9)',border:`1px solid ${C_JUDAH}33`,borderRadius:10,padding:16,marginBottom:16 }}>
          <div style={{ color:C_JUDAH,fontWeight:700,marginBottom:8 }}>⚡ THE OMNIVERSE DUEL REALMS</div>
          <div style={{ color:'#aaa',fontSize:12,lineHeight:1.7 }}>
            In the beginning, the Most High encoded the laws of creation into ancient Holographic Scrolls.
            Ten Realms were formed. Shadow Corruption spread. Young champion AMARI must master the realms,
            battle corrupted duelists, and restore the Omniverse through discipline, faith, and strategy.
          </div>
        </div>
        {/* Hebrew feasts */}
        <div style={{ background:'rgba(5,5,30,0.9)',border:`1px solid ${C_JUDAH}33`,borderRadius:10,padding:14,marginBottom:16 }}>
          <div style={{ color:C_JUDAH,fontWeight:700,marginBottom:10 }}>🕎 HEBREW FEAST GIFT CARDS</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6 }}>
            {[
              { h:'passover',    e:'🛡️', n:'Exodus Shield' },
              { h:'shavuot',     e:'🔥', n:'Torah Flame' },
              { h:'trumpets',    e:'📯', n:'Shofar Blast' },
              { h:'atonement',   e:'✨', n:'Atonement Light' },
              { h:'sukkot',      e:'⭐', n:'Sukkah Fortress' },
              { h:'hanukkah',    e:'🕎', n:'Menorah Light' },
              { h:'purim',       e:'👸', n:"Esther's Crown" },
              { h:'firstfruits', e:'🌾', n:'Harvest Warrior' },
              { h:'unleavened',  e:'🍞', n:'Pure Heart' },
              { h:'newmoon',     e:'🌙', n:'New Moon Cycle' },
            ].map(f => (
              <div key={f.h} style={{ textAlign:'center',padding:'8px 4px',background:currentHoliday===f.h?`${C_JUDAH}22`:'transparent',border:`1px solid ${currentHoliday===f.h?C_JUDAH:'#333'}`,borderRadius:6 }}>
                <div style={{ fontSize:20 }}>{f.e}</div>
                <div style={{ color:currentHoliday===f.h?C_JUDAH:'#555',fontSize:9,marginTop:2 }}>{f.n}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Realms preview */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:16 }}>
          {Object.entries(REALM_COLORS).map(([realm,color]) => (
            <div key={realm} style={{ background:`${color}15`,border:`1px solid ${color}44`,borderRadius:6,padding:'6px 4px',textAlign:'center' }}>
              <div style={{ color,fontWeight:700,fontSize:10,textTransform:'uppercase' }}>{realm}</div>
            </div>
          ))}
        </div>
        <button onClick={startGame} style={{ width:'100%',background:`${C_JUDAH}22`,border:`2px solid ${C_JUDAH}`,color:C_JUDAH,borderRadius:10,padding:'16px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:18,letterSpacing:3 }}>
          ⚡ BEGIN DUEL
        </button>
        <div style={{ color:'#333',fontSize:10,textAlign:'center',marginTop:8 }}>100 original cards · 10 realms · Hebrew feast system · Fusion cards</div>
      </div>
    </div>
  )

  // ── Render: Playing ────────────────────────────────────────────────────────
  return (
    <div style={{ width:'100%',height:'100%',background:'#050210',fontFamily:'monospace',display:'flex',flexDirection:'column',userSelect:'none',position:'relative' }}>

      {/* Lottie flash overlay */}
      {activeLottie && (
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',zIndex:100 }}>
          <div style={{ fontSize:80,filter:`drop-shadow(0 0 30px ${C_JUDAH})`,animation:'pulseIn 0.3s ease-out' }}>
            {activeLottie.includes('shofar') ? '📯' :
             activeLottie.includes('menorah') ? '🕎' :
             activeLottie.includes('passover') ? '🛡️' :
             activeLottie.includes('white') ? '✨' :
             activeLottie.includes('scroll_victory') ? '🏆' :
             activeLottie.includes('heal') ? '💚' :
             activeLottie.includes('life_drain') ? '💥' :
             activeLottie.includes('card_summon') ? '⭐' : '✨'}
          </div>
        </div>
      )}

      {/* Header / scoreboard */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,padding:'8px 12px',borderBottom:`1px solid ${C_JUDAH}33`,background:'rgba(0,0,10,0.95)' }}>
        <div>
          <div style={{ color:'#ff4400',fontSize:18,fontWeight:900 }}>{aiLE.toLocaleString()} LE</div>
          <div style={{ background:'#111',borderRadius:3,height:5,marginTop:2 }}>
            <div style={{ background:'#ff4400',height:'100%',width:`${(aiLE/8000)*100}%`,borderRadius:3,transition:'width 0.3s' }} />
          </div>
          <div style={{ color:'#555',fontSize:9 }}>AI · 💎{aiCrystals} · 🃏{aiHand.length} cards</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:C_JUDAH,fontSize:11,fontWeight:700 }}>TURN {turn}</div>
          <div style={{ color:'#888',fontSize:10 }}>{PHASE_LABELS[phase]}</div>
          {currentHoliday && <div style={{ color:C_JUDAH,fontSize:9 }}>🎉 {currentHoliday.toUpperCase()}</div>}
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'#00cc44',fontSize:18,fontWeight:900 }}>{playerLE.toLocaleString()} LE</div>
          <div style={{ background:'#111',borderRadius:3,height:5,marginTop:2 }}>
            <div style={{ background:'#00cc44',height:'100%',width:`${(playerLE/8000)*100}%`,borderRadius:3,marginLeft:'auto',transition:'width 0.3s' }} />
          </div>
          <div style={{ color:'#555',fontSize:9 }}>YOU · 💎{playerCrystals} · 🃏{playerHand.length}</div>
        </div>
      </div>

      {/* AI field */}
      <div style={{ minHeight:80,padding:'6px 10px',borderBottom:'1px solid #1a1a3e' }}>
        <div style={{ color:'#555',fontSize:9,marginBottom:4 }}>AI FIELD ({aiField.length} cards)</div>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          {aiField.map(c => (
            <div key={c.fieldId} onClick={() => phase==='battle' && selectedField && declareAttack(selectedField)}
              style={{ background:`${REALM_COLORS[c.realm] ?? '#333'}15`,border:`1px solid ${REALM_COLORS[c.realm] ?? '#333'}`,borderRadius:6,padding:'5px 8px',textAlign:'center',minWidth:60,cursor:phase==='battle'?'pointer':'default',opacity:c.stunned?0.5:1 }}>
              <div style={{ fontSize:20 }}>{c.emoji}</div>
              <div style={{ color:'#ccc',fontSize:9,fontWeight:700 }}>{c.name.split(' ')[0]}</div>
              <div style={{ color:'#ff4400',fontSize:9 }}>ATK {(c.atk??0)+c.tempAtkBonus}</div>
              {c.stunned && <div style={{ color:'#888',fontSize:8 }}>STUNNED</div>}
            </div>
          ))}
          {aiField.length===0 && <div style={{ color:'#333',fontSize:11 }}>Open field</div>}
        </div>
      </div>

      {/* Battle log */}
      <div style={{ flex:1,overflowY:'auto',padding:'4px 10px' }}>
        {battleLog.slice(-8).map(l => (
          <div key={l.id} style={{ fontSize:11,marginBottom:2,color:
            l.type==='player'?'#00cc44':l.type==='ai'?'#ff4400':
            l.type==='damage'?'#ffaa00':l.type==='heal'?'#00ffcc':
            l.type==='feast'?C_JUDAH:'#555' }}>
            {l.text}
          </div>
        ))}
      </div>

      {/* Player field */}
      <div style={{ minHeight:80,padding:'6px 10px',borderTop:'1px solid #1a1a3e' }}>
        <div style={{ color:'#555',fontSize:9,marginBottom:4 }}>YOUR FIELD ({playerField.length} cards)</div>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          {playerField.map(c => (
            <div key={c.fieldId} onClick={() => { if (phase==='battle' && !c.hasAttacked && !c.stunned) { setSelectedField(c); declareAttack(c) } }}
              style={{ background:`${REALM_COLORS[c.realm] ?? '#333'}22`,border:`2px solid ${phase==='battle'&&!c.hasAttacked&&!c.stunned?REALM_COLORS[c.realm]:'#333'}`,borderRadius:6,padding:'5px 8px',textAlign:'center',minWidth:60,cursor:phase==='battle'&&!c.hasAttacked?'pointer':'default',opacity:c.hasAttacked?0.5:1 }}>
              <div style={{ fontSize:20 }}>{c.emoji}</div>
              <div style={{ color:'#fff',fontSize:9,fontWeight:700 }}>{c.name.split(' ')[0]}</div>
              <div style={{ color:'#00cc44',fontSize:9 }}>ATK {(c.atk??0)+c.tempAtkBonus}</div>
              {c.hasAttacked && <div style={{ color:'#555',fontSize:8 }}>ATTACKED</div>}
              {phase==='battle'&&!c.hasAttacked&&<div style={{ color:C_JUDAH,fontSize:8 }}>TAP=ATK</div>}
            </div>
          ))}
          {playerField.length===0 && <div style={{ color:'#333',fontSize:11 }}>Empty field</div>}
        </div>
      </div>

      {/* Player hand */}
      <div style={{ padding:'6px 10px',borderTop:'1px solid #1a1a3e',maxHeight:100,overflowX:'auto' }}>
        <div style={{ color:'#555',fontSize:9,marginBottom:4 }}>YOUR HAND · {phase==='summon'?'TAP TO PLAY':phase==='battle'?'SELECT FIELD WARRIOR TO ATTACK':'advance phase'}</div>
        <div style={{ display:'flex',gap:5 }}>
          {playerHand.map((c,i) => (
            <div key={`${c.id}_${i}`} onClick={() => (phase==='summon'||phase==='strategy') && playCard(c)}
              style={{ flexShrink:0,background:`${REALM_COLORS[c.realm]??'#333'}15`,border:`1px solid ${(phase==='summon'||phase==='strategy')&&c.crystalCost<=playerCrystals?REALM_COLORS[c.realm]:'#222'}`,borderRadius:6,padding:'5px 7px',textAlign:'center',minWidth:56,cursor:(phase==='summon'||phase==='strategy')&&c.crystalCost<=playerCrystals?'pointer':'default',opacity:c.crystalCost>playerCrystals?0.4:1 }}>
              <div style={{ fontSize:18 }}>{c.emoji}</div>
              <div style={{ color:'#ccc',fontSize:8,fontWeight:700 }}>{c.name.split(' ').slice(0,2).join(' ')}</div>
              <div style={{ color:REALM_COLORS[c.realm]??'#888',fontSize:8 }}>{c.crystalCost}💎</div>
              {c.holiday && <div style={{ color:C_JUDAH,fontSize:7 }}>FEAST ✨</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Phase controls */}
      <div style={{ padding:'8px 10px',borderTop:`1px solid ${C_JUDAH}33`,background:'rgba(0,0,12,0.98)',display:'flex',gap:6 }}>
        {phase !== 'battle' && phase !== 'end' && (
          <button onClick={nextPhase} style={{ flex:1,background:`${C_JUDAH}22`,border:`1px solid ${C_JUDAH}`,color:C_JUDAH,borderRadius:6,padding:'9px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
            {phase==='draw'?'📥 DRAW':phase==='energy'?'💎 GAIN ENERGY':phase==='summon'?'▶ SKIP SUMMON':phase==='strategy'?'▶ SKIP STRATEGY':'▶ NEXT'}
          </button>
        )}
        {phase==='battle' && (
          <button onClick={endBattlePhase} style={{ flex:1,background:'#ff440022',border:'1px solid #ff4400',color:'#ff4400',borderRadius:6,padding:'9px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
            ⚔️ END BATTLE → AI TURN
          </button>
        )}
        <button onClick={()=>setShowGrave(v=>!v)} style={{ background:'#33333322',border:'1px solid #333',color:'#888',borderRadius:6,padding:'9px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>
          🪦 {playerGrave.length}
        </button>
        <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#555',borderRadius:6,padding:'9px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>
          EXIT
        </button>
      </div>

      {/* Game over overlays */}
      {(gameState==='victory'||gameState==='defeat') && (
        <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.92)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:200 }}>
          <div style={{ fontSize:64,marginBottom:12 }}>{gameState==='victory'?'🏆':'💀'}</div>
          <div style={{ color:gameState==='victory'?C_JUDAH:'#ff4400',fontSize:28,fontWeight:900,marginBottom:8 }}>
            {gameState==='victory'?'OMNIVERSE CHAMPION!':'DUEL OVER'}
          </div>
          {gameState==='victory' && <div style={{ color:'#00cc44',fontSize:14,marginBottom:16 }}>+$5,000 · +1,000 XP · New cards unlocked!</div>}
          <div style={{ color:'#888',fontSize:13,marginBottom:20 }}>Your LE: {playerLE.toLocaleString()} · AI LE: {aiLE.toLocaleString()} · Turn {turn}</div>
          <div style={{ display:'flex',gap:10 }}>
            <button onClick={startGame} style={{ background:`${C_JUDAH}22`,border:`1px solid ${C_JUDAH}`,color:C_JUDAH,borderRadius:8,padding:'10px 24px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>REMATCH</button>
            <button onClick={onExit} style={{ background:'#11111180',border:'1px solid #333',color:'#888',borderRadius:8,padding:'10px 24px',cursor:'pointer',fontFamily:'monospace' }}>EXIT</button>
          </div>
        </div>
      )}
    </div>
  )
}
