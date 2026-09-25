export type AnimalStyleId =
  | 'panther'|'leopard'|'wild-boar'|'black-cobra'|'praying-mantis'
  | 'white-crane'|'eagle'|'white-tiger'|'dragon'

export type AnimalStyle = {
  id: AnimalStyleId
  name: string
  historicalLabel: 'society-published-green-dragon-animal-system'|'separate-legacy-reconstruction'
  gameIdentity: string
  strengths: string[]
  tradeoffs: string[]
  oneHandAssist: string[]
  masteryUnlocks: string[]
}

export const GREEN_DRAGON_ANIMAL_STYLES: AnimalStyle[] = [
  {
    id:'panther',name:'Black Panther',
    historicalLabel:'society-published-green-dragon-animal-system',
    gameIdentity:'mobility / stealth / angle changes',
    strengths:['fast reposition','quiet approach bonus','short burst combo window'],
    tradeoffs:['lower stagger','shorter guard window'],
    oneHandAssist:['auto-face nearest threat','single-button evade/context strike'],
    masteryUnlocks:['Panther Step emote','shadow-training mission','Panther mentor bond'],
  },
  {
    id:'leopard',name:'Leopard',
    historicalLabel:'society-published-green-dragon-animal-system',
    gameIdentity:'speed / chaining / pressure',
    strengths:['fast combo meter','quick recovery','creator-friendly flashy chains'],
    tradeoffs:['lower guard stability','less crowd control'],
    oneHandAssist:['combo continuation assist','context finisher prompt'],
    masteryUnlocks:['Leopard Chain title','speed challenge','vintage dojo patch'],
  },
  {
    id:'wild-boar',name:'Wild Boar',
    historicalLabel:'society-published-green-dragon-animal-system',
    gameIdentity:'stability / forward pressure / resilience',
    strengths:['high poise','strong block meter','push-through environmental obstacles in game'],
    tradeoffs:['slower direction changes','lower combo speed'],
    oneHandAssist:['hold-to-brace','auto-center after impact'],
    masteryUnlocks:['Boar Guard stance','resilience trial','garage-strength challenge'],
  },
  {
    id:'black-cobra',name:'Black Cobra / Snake',
    historicalLabel:'society-published-green-dragon-animal-system',
    gameIdentity:'precision / timing / counter windows',
    strengths:['large perfect-timing bonus','quick counter prompt','high focus meter gain'],
    tradeoffs:['small timing window outside assist mode','low crowd pressure'],
    oneHandAssist:['timing pulse indicator','auto-target single opponent'],
    masteryUnlocks:['Cobra Focus title','precision trial','hidden snake-route Easter egg'],
  },
  {
    id:'praying-mantis',name:'Praying Mantis',
    historicalLabel:'society-published-green-dragon-animal-system',
    gameIdentity:'parry / control / rhythm disruption',
    strengths:['parry meter','interrupt windows','mission-control bonuses'],
    tradeoffs:['requires timing','lower raw impact'],
    oneHandAssist:['hold-to-parry assist','slow-motion accessibility cue'],
    masteryUnlocks:['Mantis Rhythm trial','mentor dialogue','counter-training room'],
  },
  {
    id:'white-crane',name:'White Crane',
    historicalLabel:'society-published-green-dragon-animal-system',
    gameIdentity:'balance / evasion / spacing',
    strengths:['best balance recovery','wide evade arc','movement puzzle bonus'],
    tradeoffs:['low stagger','requires spacing'],
    oneHandAssist:['auto-recenter camera','safe-distance indicator'],
    masteryUnlocks:['Crane Balance title','rooftop balance challenge','Crane emote'],
  },
  {
    id:'eagle',name:'Eagle',
    historicalLabel:'society-published-green-dragon-animal-system',
    gameIdentity:'reach / positioning / control',
    strengths:['long interaction reach in game','strong positional control','good vertical-layer mobility challenges'],
    tradeoffs:['slower close-range chain','higher stamina use'],
    oneHandAssist:['nearest-target focus','context control prompt'],
    masteryUnlocks:['Eagle Eye title','elevated-L challenge','skyline dojo mission'],
  },
  {
    id:'white-tiger',name:'White Tiger',
    historicalLabel:'society-published-green-dragon-animal-system',
    gameIdentity:'power / courage / stagger',
    strengths:['high stagger','strong finisher meter','boss/tournament pressure'],
    tradeoffs:['slower recovery','higher stamina use'],
    oneHandAssist:['charge meter assist','large finisher button'],
    masteryUnlocks:['Tiger Spirit title','dojo championship route','Tiger mentor bond'],
  },
  {
    id:'dragon',name:'Dragon',
    historicalLabel:'separate-legacy-reconstruction',
    gameIdentity:'adaptive mastery / stance blending / boss style',
    strengths:['switch between learned animal bonuses','best mission adaptability','advanced Time Machine encounters'],
    tradeoffs:['requires multiple style masteries','no starting specialization bonus'],
    oneHandAssist:['smart-style suggestion','single-button stance cycle'],
    masteryUnlocks:['Dragon Mastery title','multi-era dragon mission','secret five-layer dojo','adaptive stance wheel'],
  },
]

export const ANIMAL_STYLE_PROGRESSION = {
  beginnerRule:'Train multiple animal styles before selecting a primary specialization.',
  primaryStyleBond:true,
  styleXpPersistent:true,
  masteryDoesNotIncreaseRealMoneyPayouts:true,
  dragonUnlockRequirement:'Master at least four documented animal styles in game, then complete the Time Machine Dragon Legacy trial.',
  crossoverSystems:[
    'A/B/C mission routes',
    'mentor bonds',
    'Time Machine history campaigns',
    'Chicago dojo tournaments',
    'one-hand accessibility controller',
    'creator highlight/reel system',
    'Easter eggs',
    'permanent non-pay-to-win unlocks',
  ],
} as const

export const EXPANDED_ANIMAL_STYLE_REGISTRY = {
  allowFutureStyles:true,
  rule:'Additional animal styles may be original StreetVerse disciplines or separately sourced historical traditions; they must not be falsely attributed to the historical Green Dragon curriculum.',
  futureSlots:['monkey','bear','wolf','horse','scorpion','phoenix'],
} as const
