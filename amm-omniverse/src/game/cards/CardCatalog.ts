// AMM Omniverse Card Catalog — 100 original cards
// NO Yu-Gi-Oh IP. 100% original lore, names, abilities.

export type CardType = 'warrior'|'beast'|'spirit'|'tech'|'spell'|'trap'|'realm'|'fusion'|'champion'|'scroll'
export type Realm = 'judah'|'fire'|'water'|'sky'|'earth'|'light'|'shadow'|'sound'|'tech'|'saturn'
export type Rarity = 'common'|'uncommon'|'rare'|'epic'|'legend'|'scroll'
export type HolidayCard = 'passover'|'unleavened'|'firstfruits'|'shavuot'|'trumpets'|'atonement'|'sukkot'|'hanukkah'|'purim'|'newmoon'

export interface OmniCard {
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
}

export const CARD_CATALOG: OmniCard[] = [

  // ── REALM OF JUDAH ────────────────────────────────────────────────────────

  { id:'j01', name:'Lion of Judah', type:'warrior', realm:'judah', rarity:'epic', crystalCost:6, atk:2800, def:2100,
    description:'Cannot be destroyed by Shadow cards. Gains +300 ATK for each Hebrew feast card in your graveyard.',
    special:'Roar of Zion: All enemy warriors lose 500 ATK for 2 turns.', emoji:'🦁', color:'#ffd700' },

  { id:'j02', name:'Tribe Champion', type:'warrior', realm:'judah', rarity:'rare', crystalCost:4, atk:2100, def:1600,
    description:'When summoned, draw 1 card. ATK +200 for each other Judah card on your field.',
    emoji:'👑', color:'#ffd700' },

  { id:'j03', name:'Ancient Elder', type:'spirit', realm:'judah', rarity:'uncommon', crystalCost:2, atk:800, def:1400,
    description:'Protects your weakest card from direct attack.',
    emoji:'🧙', color:'#ffd700' },

  { id:'j04', name:'Scroll Keeper', type:'scroll', realm:'judah', rarity:'scroll', crystalCost:9, atk:3500, def:3000,
    description:'VICTORY CARD: If this is on the field for 3 full turns, you win the duel.',
    special:'Eternal Covenant: Cannot be targeted by spells.', emoji:'📜', color:'#ffffff' },

  // ── HEBREW FEAST CARDS (Lottie animated) ─────────────────────────────────

  { id:'hf01', name:'Exodus Shield', type:'spell', realm:'judah', rarity:'legend', crystalCost:5,
    description:'Passover gift card. Your field is immune to all attacks this turn.',
    special:'Parted Sea: Push all enemy warriors to defense mode.',
    lottieKey:'passover_glow', holiday:'passover', emoji:'🛡️', color:'#c8a000' },

  { id:'hf02', name:'Pure Heart Blessing', type:'spell', realm:'light', rarity:'rare', crystalCost:3,
    description:'Unleavened Bread feast card. Remove all corruption and negative effects from your field.',
    lottieKey:'bread_glow', holiday:'unleavened', emoji:'🍞', color:'#fffacd' },

  { id:'hf03', name:'Harvest Warrior', type:'warrior', realm:'earth', rarity:'epic', crystalCost:5, atk:2000, def:1500,
    description:'First Fruits feast card. Gains +200 ATK at the start of each of your turns.',
    special:'Abundant Harvest: When destroyed, summon 2 Common Earth tokens.',
    lottieKey:'harvest_glow', holiday:'firstfruits', emoji:'🌾', color:'#f0c060' },

  { id:'hf04', name:'Torah Flame', type:'spell', realm:'fire', rarity:'epic', crystalCost:4,
    description:'Shavuot feast card. The next spell you play this turn has double effect.',
    special:'Covenant Fire: Add 1 Realm card from your deck to your hand.',
    lottieKey:'flame_scroll', holiday:'shavuot', emoji:'🔥', color:'#ff6600' },

  { id:'hf05', name:'Shofar Blast', type:'spell', realm:'sound', rarity:'legend', crystalCost:6,
    description:'Feast of Trumpets card. All opponent warriors are stunned for 1 turn and cannot attack.',
    special:'Awakening Call: Draw 2 cards. Opponent skips their next Strategy Phase.',
    lottieKey:'shofar_wave', holiday:'trumpets', emoji:'📯', color:'#ffaa00' },

  { id:'hf06', name:'Atonement Light', type:'spell', realm:'light', rarity:'epic', crystalCost:5,
    description:'Day of Atonement card. Restore 3000 Life Energy. Remove 1 corrupted card from play.',
    special:'White Veil: Your champion cannot be targeted this turn.',
    lottieKey:'white_glow', holiday:'atonement', emoji:'✨', color:'#ffffff' },

  { id:'hf07', name:'Sukkah Fortress', type:'realm', realm:'earth', rarity:'rare', crystalCost:4,
    description:'Feast of Tabernacles realm card. All your warriors gain DEF +500 for 3 turns. Stars appear above your field.',
    lottieKey:'sukkah_stars', holiday:'sukkot', emoji:'⭐', color:'#4488ff' },

  { id:'hf08', name:'Menorah Light Burst', type:'spell', realm:'light', rarity:'legend', crystalCost:7,
    description:'Hanukkah gift card (8 nights). Draw 8 cards at once — discard to 7 at end of turn.',
    special:'Eight Flames: Deal 800 damage for each Hanukkah card previously used this duel.',
    lottieKey:'menorah_light', holiday:'hanukkah', emoji:'🕎', color:'#4488ff' },

  { id:'hf09', name:"Esther's Reversal Crown", type:'trap', realm:'judah', rarity:'epic', crystalCost:4,
    description:"Purim gift card. Activate when opponent uses a trap against you — reverse the trap's effect back to them.",
    special:"Hamman's Defeat: Opponent loses 500 LE per card they hold when this activates.",
    lottieKey:'crown_scroll', holiday:'purim', emoji:'👸', color:'#8800ff' },

  { id:'hf10', name:'New Moon Cycle', type:'spell', realm:'saturn', rarity:'rare', crystalCost:3,
    description:'New Moon (Rosh Chodesh) card. Draw 3 extra cards. The moon phase shifts your field element for 2 turns.',
    lottieKey:'moon_phases', holiday:'newmoon', emoji:'🌙', color:'#aaaaff' },

  // ── REALM OF FIRE ────────────────────────────────────────────────────────

  { id:'f01', name:'Inferno Drake', type:'beast', realm:'fire', rarity:'epic', crystalCost:6, atk:2600, def:1400,
    description:'Burns 300 LE per turn to all enemies. Cannot be blocked by Water beasts.',
    special:'Wildfire Wing: Destroy 1 spell/trap card on field when summoned.', emoji:'🔥', color:'#ff4400' },

  { id:'f02', name:'Magma Titan', type:'warrior', realm:'fire', rarity:'rare', crystalCost:5, atk:2300, def:2000,
    description:'When destroyed, deals 1000 burn damage to opponent.',
    emoji:'🌋', color:'#ff4400' },

  { id:'f03', name:'Ember Scout', type:'warrior', realm:'fire', rarity:'common', crystalCost:2, atk:900, def:600,
    description:'Fast attack: can attack the same turn it is summoned.',
    emoji:'💥', color:'#ff8800' },

  { id:'f04', name:'Phoenix Reborn', type:'beast', realm:'fire', rarity:'legend', crystalCost:7, atk:3000, def:2200,
    description:'When destroyed, return to the field at 1000 ATK at the start of your next turn.',
    special:'Rebirth Flame: Fully restore ATK if Life Energy drops below 2000.', emoji:'🦅', color:'#ff4400' },

  { id:'f05', name:'Flame Veil', type:'spell', realm:'fire', rarity:'uncommon', crystalCost:2,
    description:'All your fire warriors gain +400 ATK this turn.',
    emoji:'🔶', color:'#ff8800' },

  // ── REALM OF WATER ───────────────────────────────────────────────────────

  { id:'w01', name:'Tide Guardian', type:'warrior', realm:'water', rarity:'rare', crystalCost:4, atk:1600, def:2400,
    description:'Restore 500 LE each time a Water card you control deals battle damage.',
    emoji:'🌊', color:'#0088ff' },

  { id:'w02', name:'Deep Sea Oracle', type:'spirit', realm:'water', rarity:'epic', crystalCost:5, atk:1400, def:1800,
    description:'Look at opponent hand. Rearrange opponent deck top 3 cards in any order.',
    special:'Depths Vision: Negate 1 attack per duel.', emoji:'🔮', color:'#0044cc' },

  { id:'w03', name:'Rain Caller', type:'spell', realm:'water', rarity:'common', crystalCost:2,
    description:'Restore 1500 LE. If used during Sukkot season, restore 2000 LE instead.',
    emoji:'🌧️', color:'#0088ff' },

  { id:'w04', name:'Frost Trap', type:'trap', realm:'water', rarity:'rare', crystalCost:3,
    description:'Freeze attacking warrior — it cannot attack for 2 turns.',
    emoji:'❄️', color:'#aaddff' },

  { id:'w05', name:'Leviathan King', type:'champion', realm:'water', rarity:'legend', crystalCost:9, atk:3400, def:2800,
    description:'Cannot be targeted by spells. At end of each turn, deal 500 damage to all opponents.',
    fusionRequires:['w01','w02'], emoji:'🐋', color:'#0044cc' },

  // ── REALM OF SKY ─────────────────────────────────────────────────────────

  { id:'sk01', name:'Wind Blade Archer', type:'warrior', realm:'sky', rarity:'rare', crystalCost:3, atk:1800, def:1000,
    description:'Can attack directly if opponent has no flying/sky warriors.',
    emoji:'🏹', color:'#88ccff' },

  { id:'sk02', name:'Storm Eagle Rider', type:'beast', realm:'sky', rarity:'epic', crystalCost:5, atk:2400, def:1400,
    description:'Evades all non-sky traps. ATK +300 for each Sky card in your hand.',
    emoji:'🦅', color:'#4488ff' },

  { id:'sk03', name:'Cloud Veil', type:'spell', realm:'sky', rarity:'uncommon', crystalCost:2,
    description:'All your cards become untargetable by spells for 1 turn.',
    emoji:'☁️', color:'#88ccff' },

  { id:'sk04', name:'Skyfall Champion', type:'champion', realm:'sky', rarity:'legend', crystalCost:8, atk:3200, def:2600,
    description:'Wins all battles against grounded warriors. First attack each duel is unblockable.',
    fusionRequires:['sk01','sk02'], emoji:'⚡', color:'#4488ff' },

  // ── REALM OF EARTH ───────────────────────────────────────────────────────

  { id:'e01', name:'Stone Wall Guardian', type:'warrior', realm:'earth', rarity:'common', crystalCost:3, atk:900, def:2200,
    description:'Cannot be destroyed by battle when in defense mode.',
    emoji:'🏔️', color:'#886644' },

  { id:'e02', name:'Earthquake Beast', type:'beast', realm:'earth', rarity:'rare', crystalCost:5, atk:2200, def:1800,
    description:'When summoned, deal 400 damage to all opponent cards on field.',
    emoji:'🌍', color:'#664422' },

  { id:'e03', name:'Ancient Mountain', type:'realm', realm:'earth', rarity:'rare', crystalCost:4,
    description:'All Earth warriors gain DEF +600. Fire cards lose ATK -300 while this realm is active.',
    emoji:'⛰️', color:'#886644' },

  { id:'e04', name:'Terra Titan', type:'champion', realm:'earth', rarity:'epic', crystalCost:7, atk:2800, def:3200,
    description:'Cannot be destroyed by effects. When attacked, the attacker loses ATK equal to its own defense.',
    fusionRequires:['e01','e02'], emoji:'🗿', color:'#664422' },

  // ── REALM OF LIGHT ───────────────────────────────────────────────────────

  { id:'l01', name:'Holy Blade Knight', type:'warrior', realm:'light', rarity:'rare', crystalCost:4, atk:2000, def:1600,
    description:'Immune to Shadow cards. Gains +500 ATK when battling corrupted cards.',
    emoji:'⚔️', color:'#fffacd' },

  { id:'l02', name:'Seraphim Wing', type:'spirit', realm:'light', rarity:'legend', crystalCost:8, atk:2600, def:2400,
    description:'Cannot be targeted by Shadow traps. Restores 800 LE each time it destroys an enemy.',
    special:'Divine Veil: Negate the first spell played against you each turn.', emoji:'👼', color:'#ffffff' },

  { id:'l03', name:'Light Prism Shield', type:'trap', realm:'light', rarity:'uncommon', crystalCost:2,
    description:'Negate 1 attack. If the attacking card is Shadow-type, destroy it.',
    emoji:'🔆', color:'#fffacd' },

  { id:'l04', name:'Crown of Righteousness', type:'scroll', realm:'light', rarity:'scroll', crystalCost:10, atk:4000, def:3500,
    description:'SCROLL VICTORY: If this card remains on field for 3 turns, you win instantly. Cannot be touched by Shadow.',
    emoji:'👑', color:'#ffd700' },

  // ── REALM OF SHADOW ──────────────────────────────────────────────────────

  { id:'sh01', name:'Night Stalker', type:'beast', realm:'shadow', rarity:'uncommon', crystalCost:3, atk:1600, def:1000,
    description:'Ignores DEF — deals full ATK as damage regardless of defense mode.',
    emoji:'🐆', color:'#330066' },

  { id:'sh02', name:'Void Wraith', type:'spirit', realm:'shadow', rarity:'rare', crystalCost:4, atk:1800, def:1400,
    description:'When opponent draws a card, this card gains +100 ATK.',
    emoji:'👻', color:'#220044' },

  { id:'sh03', name:'Corruption Trap', type:'trap', realm:'shadow', rarity:'rare', crystalCost:3,
    description:'Activate when opponent summons a warrior. It loses 800 ATK permanently.',
    emoji:'🕳️', color:'#330066' },

  { id:'sh04', name:'Shadow Tyrant', type:'champion', realm:'shadow', rarity:'legend', crystalCost:8, atk:3300, def:2400,
    description:'Destroys all Light cards on field when summoned. Immune to holy effects.',
    fusionRequires:['sh01','sh02'], emoji:'💀', color:'#220044' },

  // ── REALM OF SOUND ───────────────────────────────────────────────────────

  { id:'so01', name:'Bass Wave Warrior', type:'warrior', realm:'sound', rarity:'common', crystalCost:2, atk:1200, def:800,
    description:'Rhythm hit: attack counts as 2 if opponent has fewer than 3 cards on field.',
    emoji:'🎸', color:'#00ccff' },

  { id:'so02', name:'Gospel Choir Spirit', type:'spirit', realm:'sound', rarity:'epic', crystalCost:5, atk:1600, def:1800,
    description:'All your cards gain +200 ATK/DEF while this is on field. Enemies with Shadow type lose 300 ATK.',
    special:'Harmony Surge: Once per turn, restore 500 LE when a Sound card deals damage.', emoji:'🎵', color:'#00ccff' },

  { id:'so03', name:'Beat Drop Spell', type:'spell', realm:'sound', rarity:'rare', crystalCost:3,
    description:'Deal 1000 direct damage to opponent. If opponent has more cards than you, deal 1500 instead.',
    emoji:'🎧', color:'#00ccff' },

  { id:'so04', name:'Silence Trap', type:'trap', realm:'sound', rarity:'uncommon', crystalCost:2,
    description:'Opponent cannot activate spells for 1 full turn cycle.',
    emoji:'🔇', color:'#008899' },

  { id:'so05', name:'Omni Conductor', type:'champion', realm:'sound', rarity:'legend', crystalCost:9, atk:3000, def:2600,
    description:'For each Sound card in your graveyard, deal 300 direct damage at start of each turn.',
    fusionRequires:['so01','so02'], emoji:'🎼', color:'#00ccff' },

  // ── REALM OF TECH ────────────────────────────────────────────────────────

  { id:'t01', name:'AI Battle Drone', type:'tech', realm:'tech', rarity:'uncommon', crystalCost:3, atk:1500, def:1200,
    description:'At the end of each turn, scan opponent field — reveal 1 face-down card.',
    emoji:'🤖', color:'#44ff88' },

  { id:'t02', name:'Quantum Hacker', type:'tech', realm:'tech', rarity:'rare', crystalCost:4, atk:1800, def:1600,
    description:'Steal 1 Spell card from opponent graveyard and add it to your hand.',
    emoji:'💻', color:'#00ff88' },

  { id:'t03', name:'Code Breaker Trap', type:'trap', realm:'tech', rarity:'rare', crystalCost:3,
    description:'When opponent activates a Tech card, negate it and add it to your hand.',
    emoji:'🔐', color:'#44ff88' },

  { id:'t04', name:'Mech Colossus', type:'champion', realm:'tech', rarity:'legend', crystalCost:9, atk:3400, def:3000,
    description:'Cannot be targeted by traps. Gains +200 ATK for each Tech card in your graveyard.',
    fusionRequires:['t01','t02'], emoji:'⚙️', color:'#44ff88' },

  { id:'t05', name:'Neural Override', type:'spell', realm:'tech', rarity:'epic', crystalCost:5,
    description:'Take control of 1 opponent warrior this turn. It attacks its own field.',
    emoji:'🧠', color:'#00ff88' },

  // ── REALM OF SATURN ─────────────────────────────────────────────────────

  { id:'sa01', name:'El Saturn Rider', type:'warrior', realm:'saturn', rarity:'epic', crystalCost:6, atk:2500, def:2000,
    description:'Cosmic warrior. Can attack twice per turn if opponent has fewer Life Energy than you.',
    special:'Saturn Ring Slash: When attacking, deal 200 damage to all opponent field cards.', emoji:'🪐', color:'#ffaa00' },

  { id:'sa02', name:'Cosmic Chain Beast', type:'beast', realm:'saturn', rarity:'rare', crystalCost:5, atk:2200, def:1800,
    description:'NFT-linked card. When used in tournaments, earns AMM token rewards.',
    special:'Chain Link: If opponent has NFT cards, this card gains +500 ATK.', emoji:'⛓️', color:'#ffaa00' },

  { id:'sa03', name:'Time Freeze Spell', type:'spell', realm:'saturn', rarity:'legend', crystalCost:6,
    description:'Opponent skips their entire next turn. This spell cannot be countered.',
    emoji:'⏱️', color:'#ffaa00' },

  { id:'sa04', name:'Quantum Omniverse Lord', type:'scroll', realm:'saturn', rarity:'scroll', crystalCost:10, atk:4500, def:4000,
    description:'SCROLL VICTORY: All Saturn cards gain +1000 ATK. Cannot be destroyed by any means. If this battles the Scroll Keeper, the duel resets with your LE at 8000.',
    fusionRequires:['sa01','sa02'], emoji:'🌌', color:'#ffffff' },

  // ── FUSION CHAMPIONS ─────────────────────────────────────────────────────

  { id:'fc01', name:'Omni King Amari', type:'champion', realm:'judah', rarity:'legend', crystalCost:10, atk:3800, def:3400,
    description:'The hero champion. Requires Lion of Judah + Holy Blade Knight. Cannot be destroyed while Life Energy is above 3000.',
    special:"Champion's Decree: All opponent cards lose 300 ATK/DEF. Your cards gain 300 ATK/DEF.",
    fusionRequires:['j01','l01'], emoji:'⚡', color:'#ffd700' },

  { id:'fc02', name:'Fire Water Titan', type:'fusion', realm:'fire', rarity:'epic', crystalCost:8, atk:3100, def:2700,
    description:'Fire + Water fusion. Deals burn damage AND restores LE simultaneously.',
    fusionRequires:['f01','w01'], emoji:'💠', color:'#ff6600' },

  { id:'fc03', name:'Shadow Light Paradox', type:'fusion', realm:'shadow', rarity:'legend', crystalCost:9, atk:3600, def:3200,
    description:'Shadow + Light fusion. Immune to both Shadow AND Light cards. Destroys 1 card on field when summoned.',
    fusionRequires:['sh01','l01'], emoji:'☯️', color:'#888888' },

  // ── GENERAL SPELLS & TRAPS ────────────────────────────────────────────────

  { id:'sp01', name:'Omniverse Portal', type:'spell', realm:'saturn', rarity:'rare', crystalCost:4,
    description:'Swap 1 card from your deck into your hand. Shuffle deck.',
    emoji:'🌀', color:'#8800ff' },

  { id:'sp02', name:'Creator Power Boost', type:'spell', realm:'judah', rarity:'uncommon', crystalCost:2,
    description:'1 warrior gains +800 ATK this turn.',
    emoji:'💪', color:'#ffd700' },

  { id:'sp03', name:'Marketplace Shield', type:'trap', realm:'tech', rarity:'common', crystalCost:1,
    description:'Reduce battle damage to 0 once per duel.',
    emoji:'🛡️', color:'#44ff88' },

  { id:'sp04', name:'Realm Collapse', type:'spell', realm:'shadow', rarity:'epic', crystalCost:5,
    description:'Destroy the active Realm card. All field-boosted cards lose their bonuses.',
    emoji:'💣', color:'#330066' },

  { id:'sp05', name:'Ancient Decree', type:'scroll', realm:'judah', rarity:'scroll', crystalCost:8,
    description:'Draw 4 cards. All your cards are immune to effects this turn.',
    emoji:'📜', color:'#ffd700' },

  { id:'sp06', name:'Ancestor Memory', type:'spell', realm:'judah', rarity:'rare', crystalCost:3,
    description:'Return 1 destroyed warrior from graveyard to field with 1000 ATK.',
    emoji:'🙏', color:'#ffd700' },

  { id:'sp07', name:'AMM Token Rush', type:'spell', realm:'tech', rarity:'uncommon', crystalCost:3,
    description:'Summon 3 common AMM Token warriors (500 ATK / 500 DEF) to your field instantly.',
    emoji:'🪙', color:'#00cc44' },

  { id:'sp08', name:'Faith Counter Trap', type:'trap', realm:'light', rarity:'rare', crystalCost:3,
    description:'Negate 1 spell or trap. Restore LE equal to that card cost × 200.',
    emoji:'✝️', color:'#fffacd' },

  { id:'sp09', name:'Boomerang Decree', type:'trap', realm:'judah', rarity:'epic', crystalCost:4,
    description:'Return 1 opponent warrior to their hand. They must pay double cost to re-summon it.',
    emoji:'↩️', color:'#ffd700' },

  { id:'sp10', name:'Creator Economy Field', type:'realm', realm:'tech', rarity:'rare', crystalCost:4,
    description:'All players earn +1 Crystal per turn. Marketplace cards cost 1 less Crystal.',
    emoji:'🏪', color:'#00cc44' },

  // ── STARTER DECK COMMONS ─────────────────────────────────────────────────

  { id:'c01', name:'Street Warrior', type:'warrior', realm:'earth', rarity:'common', crystalCost:1, atk:700, def:600,
    description:'Basic warrior. No special effects.', emoji:'🥋', color:'#886644' },

  { id:'c02', name:'City Shield', type:'trap', realm:'earth', rarity:'common', crystalCost:1,
    description:'Negate the first attack this turn.', emoji:'🏙️', color:'#664422' },

  { id:'c03', name:'Healer Potion', type:'spell', realm:'water', rarity:'common', crystalCost:1,
    description:'Restore 800 LE.', emoji:'💊', color:'#0088ff' },

  { id:'c04', name:'Scout Runner', type:'warrior', realm:'sky', rarity:'common', crystalCost:1, atk:600, def:400,
    description:'Fast. Can attack turn summoned.', emoji:'🏃', color:'#88ccff' },

  { id:'c05', name:'Iron Fist Brawler', type:'warrior', realm:'earth', rarity:'common', crystalCost:2, atk:1100, def:900,
    description:'Standard brawler.', emoji:'👊', color:'#886644' },

  { id:'c06', name:'Spark Bomb', type:'spell', realm:'fire', rarity:'common', crystalCost:1,
    description:'Deal 500 damage to opponent directly.', emoji:'💥', color:'#ff4400' },

  { id:'c07', name:'Vision Spy', type:'tech', realm:'tech', rarity:'common', crystalCost:2, atk:800, def:700,
    description:'Reveal opponent top card.', emoji:'👁️', color:'#44ff88' },

  { id:'c08', name:'Forest Beast', type:'beast', realm:'earth', rarity:'common', crystalCost:2, atk:1300, def:1000,
    description:'Standard beast.', emoji:'🐻', color:'#664422' },

  { id:'c09', name:'River Spirit', type:'spirit', realm:'water', rarity:'common', crystalCost:2, atk:900, def:1200,
    description:'Restore 200 LE when you take battle damage.', emoji:'💧', color:'#0088ff' },

  { id:'c10', name:'AMM Defender', type:'warrior', realm:'judah', rarity:'common', crystalCost:2, atk:1000, def:1300,
    description:'The platform guardian. Starter card for all new duelists.', emoji:'🛡️', color:'#ffd700' },

  // ── STORY MODE BOSS CARDS ────────────────────────────────────────────────

  { id:'boss01', name:'Corrupted Pharaoh', type:'champion', realm:'shadow', rarity:'legend', crystalCost:9, atk:3600, def:3000,
    description:'BOSS: Realm 1 boss. Cannot be destroyed by Judah cards alone — requires Light + Judah fusion.',
    special:'Shadow Plague: Deals 500 damage to all your cards each turn.', emoji:'💀', color:'#330066' },

  { id:'boss02', name:'Void Empress', type:'champion', realm:'shadow', rarity:'legend', crystalCost:10, atk:4000, def:3600,
    description:'BOSS: Final arc. Absorbs 1 destroyed card per turn to boost ATK by 300.',
    special:'Entropy Wave: All spell cards in your hand are nullified for 2 turns.', emoji:'🌑', color:'#110022' },

  { id:'boss03', name:'False Prophet', type:'warrior', realm:'shadow', rarity:'epic', crystalCost:7, atk:2900, def:2200,
    description:'Villain card. Copies the last spell card used against you.',
    special:'Deception: When summoned, opponent reveals their full hand.', emoji:'🎭', color:'#550000' },

]

// Starter deck for new players (20 cards)
export const STARTER_DECK_IDS = [
  'c01','c01','c02','c03','c04','c05',
  'c06','c07','c08','c09','c10',
  'j03','f03','w03','l03','so01',
  'sp02','sp03','sp06','hf02'
]

export function getCard(id: string): OmniCard | undefined {
  return CARD_CATALOG.find(c => c.id === id)
}

export function getCardsByRealm(realm: Realm): OmniCard[] {
  return CARD_CATALOG.filter(c => c.realm === realm)
}

export function getHolidayCards(): OmniCard[] {
  return CARD_CATALOG.filter(c => c.holiday)
}

export function getCardsByType(type: CardType): OmniCard[] {
  return CARD_CATALOG.filter(c => c.type === type)
}
