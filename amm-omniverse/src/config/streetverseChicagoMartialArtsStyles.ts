export type StreetVerseMartialStyleId=
  |'green-dragon-reconstruction'
  |'green-panther'
  |'green-leopard'
  |'green-boar'
  |'green-snake'
  |'green-mantis'
  |'green-crane'
  |'green-eagle'
  |'green-tiger'
  |'green-dragon'
  |'green-monkey'
  |'green-bear'
  |'green-wolf'
  |'green-hawk'
  |'green-ape'
  |'green-fox'
  |'green-horse'
  |'black-dragon-reconstruction'
  |'neutral-dojo'

export type StreetVerseMartialAction='GUARD'|'STEP'|'FLOW'|'COUNTER'|'BURST'|'RECOVER'

const greenNote='StreetVerse Green Dragon game-canon reconstruction. The exact animal-style syllabus is not asserted as verified historical fact.'
const reconstructed=(id:StreetVerseMartialStyleId,label:string,fantasy:string,strengths:string[],tradeoffs:string[],bias:Record<StreetVerseMartialAction,number>,signatureGameMoves:{id:string;label:string;input:StreetVerseMartialAction[];effect:string}[])=>({
  id,label,evidence:'user-canon-plus-fictionalized-gameplay',historyNote:greenNote,fantasy,strengths,tradeoffs,actionBias:bias,signatureGameMoves
})

export const STREETVERSE_CHICAGO_MARTIAL_STYLES={
  'green-dragon-reconstruction':reconstructed(
    'green-dragon-reconstruction','Green Dragon • Animal System',
    'Adaptive Green Dragon curriculum that lets the player switch among animal-inspired gameplay forms.',
    ['style-switching','mobility','counter-window','mastery-progression'],['requires-style-knowledge'],
    {GUARD:1.0,STEP:1.2,FLOW:1.3,COUNTER:1.2,BURST:1.0,RECOVER:1.15},
    [
      {id:'animal-shift',label:'Animal Shift',input:['FLOW','STEP'],effect:'opens the one-hand animal style selector'},
      {id:'emerald-counter',label:'Emerald Counter',input:['GUARD','COUNTER'],effect:'timing bonus after a successful guard'},
      {id:'dragon-cycle',label:'Dragon Cycle',input:['FLOW','STEP','FLOW'],effect:'style meter and positioning bonus'},
    ]
  ),

  'green-panther':reconstructed('green-panther','Green Dragon • Panther','Explosive mobility and angle-change game style.',
    ['burst-movement','evasion','pressure'],['lower-guard-efficiency'],
    {GUARD:.9,STEP:1.35,FLOW:1.2,COUNTER:1.05,BURST:1.3,RECOVER:1.0},
    [{id:'panther-shadow',label:'Panther Shadow',input:['STEP','FLOW'],effect:'evasion/style bonus'},{id:'panther-burst',label:'Panther Burst',input:['STEP','BURST'],effect:'spectacle and momentum bonus'}]),

  'green-leopard':reconstructed('green-leopard','Green Dragon • Leopard','Fast-combination, precision and mobility game style.',
    ['speed','precision','mobility'],['higher-stamina-use'],
    {GUARD:.95,STEP:1.3,FLOW:1.15,COUNTER:1.15,BURST:1.25,RECOVER:.95},
    [{id:'leopard-rush',label:'Leopard Rush',input:['FLOW','BURST'],effect:'combo meter bonus'},{id:'leopard-line',label:'Leopard Line',input:['STEP','COUNTER'],effect:'precision counter bonus'}]),

  'green-boar':reconstructed('green-boar','Green Dragon • Boar','Stable forward-pressure and guard game style.',
    ['stability','pressure','guard'],['lower-evasion'],
    {GUARD:1.35,STEP:1.0,FLOW:.85,COUNTER:1.0,BURST:1.3,RECOVER:1.0},
    [{id:'boar-wall',label:'Boar Wall',input:['GUARD','GUARD'],effect:'discipline/guard bonus'},{id:'boar-drive',label:'Boar Drive',input:['GUARD','BURST'],effect:'momentum bonus'}]),

  'green-snake':reconstructed('green-snake','Green Dragon • Snake','Timing, feint and precision game style.',
    ['timing','feints','precision'],['lower-power-score'],
    {GUARD:1.0,STEP:1.15,FLOW:1.3,COUNTER:1.4,BURST:.8,RECOVER:1.1},
    [{id:'snake-coil',label:'Snake Coil',input:['FLOW','COUNTER'],effect:'counter-window bonus'},{id:'snake-slip',label:'Snake Slip',input:['STEP','FLOW'],effect:'evasion bonus'}]),

  'green-mantis':reconstructed('green-mantis','Green Dragon • Mantis','Counter-window, rhythm and control game style.',
    ['countering','control','rhythm'],['requires-timing'],
    {GUARD:1.2,STEP:1.0,FLOW:1.2,COUNTER:1.5,BURST:.85,RECOVER:1.0},
    [{id:'mantis-read',label:'Mantis Read',input:['GUARD','COUNTER'],effect:'large timing bonus'},{id:'mantis-catch',label:'Mantis Catch',input:['FLOW','COUNTER'],effect:'control meter bonus'}]),

  'green-crane':reconstructed('green-crane','Green Dragon • Crane','Balance, spacing and evasive game style.',
    ['balance','spacing','evasion'],['lower-burst-score'],
    {GUARD:1.15,STEP:1.35,FLOW:1.3,COUNTER:1.05,BURST:.75,RECOVER:1.2},
    [{id:'crane-step',label:'Crane Step',input:['GUARD','STEP'],effect:'spacing/evasion bonus'},{id:'crane-wing',label:'Crane Wing',input:['FLOW','STEP'],effect:'balance meter bonus'}]),

  'green-eagle':reconstructed('green-eagle','Green Dragon • Eagle','Range-awareness, positioning and focus game style.',
    ['range','positioning','focus'],['less-close-pressure'],
    {GUARD:1.0,STEP:1.25,FLOW:1.1,COUNTER:1.3,BURST:1.05,RECOVER:1.0},
    [{id:'eagle-line',label:'Eagle Line',input:['STEP','COUNTER'],effect:'range/timing bonus'},{id:'eagle-rise',label:'Eagle Rise',input:['FLOW','BURST'],effect:'spectacle bonus'}]),

  'green-tiger':reconstructed('green-tiger','Green Dragon • Tiger','Power, confidence and pressure game style.',
    ['power','pressure','spectacle'],['higher-stamina-cost'],
    {GUARD:1.05,STEP:1.0,FLOW:.9,COUNTER:1.0,BURST:1.5,RECOVER:.9},
    [{id:'tiger-drive',label:'Tiger Drive',input:['STEP','BURST'],effect:'power/momentum bonus'},{id:'tiger-roar',label:'Tiger Roar',input:['BURST','FLOW'],effect:'crowd-energy bonus'}]),

  'green-dragon':reconstructed('green-dragon','Green Dragon • Dragon','Mastery style built around adaptation and switching among learned animal forms.',
    ['adaptation','style-switching','all-round-mastery'],['advanced'],
    {GUARD:1.2,STEP:1.2,FLOW:1.4,COUNTER:1.25,BURST:1.2,RECOVER:1.2},
    [{id:'dragon-shift',label:'Dragon Shift',input:['FLOW','FLOW'],effect:'style-switch/mastery bonus'},{id:'dragon-circle',label:'Dragon Circle',input:['FLOW','STEP','FLOW'],effect:'position reset and style bonus'}]),

  'green-monkey':reconstructed('green-monkey','Green Dragon • Monkey','Unpredictable movement and rhythm game reconstruction.',
    ['mobility','rhythm','evasion'],['lower-power-score'],
    {GUARD:.9,STEP:1.4,FLOW:1.4,COUNTER:1.05,BURST:.95,RECOVER:1.1},
    [{id:'monkey-switch',label:'Monkey Switch',input:['STEP','FLOW'],effect:'unpredictability bonus'}]),

  'green-bear':reconstructed('green-bear','Green Dragon • Bear','Guard, stability and power game reconstruction.',
    ['guard','stability','power'],['lower-speed'],
    {GUARD:1.45,STEP:.85,FLOW:.8,COUNTER:1.0,BURST:1.35,RECOVER:1.05},
    [{id:'bear-wall',label:'Bear Wall',input:['GUARD','RECOVER'],effect:'stamina/guard bonus'}]),

  'green-wolf':reconstructed('green-wolf','Green Dragon • Wolf','Tracking, team synergy and pressure game reconstruction.',
    ['team-bonus','tracking','pressure'],['less-solo-specialization'],
    {GUARD:1.0,STEP:1.25,FLOW:1.15,COUNTER:1.15,BURST:1.2,RECOVER:1.0},
    [{id:'wolf-pack',label:'Wolf Pack',input:['STEP','BURST'],effect:'crew/sparring-partner bonus'}]),

  'green-hawk':reconstructed('green-hawk','Green Dragon • Hawk','Spacing, reaction and movement game reconstruction.',
    ['reaction','spacing','movement'],['lower-guard-score'],
    {GUARD:.9,STEP:1.4,FLOW:1.2,COUNTER:1.3,BURST:1.05,RECOVER:1.0},
    [{id:'hawk-line',label:'Hawk Line',input:['STEP','COUNTER'],effect:'reaction bonus'}]),

  'green-ape':reconstructed('green-ape','Green Dragon • Ape','Strength, balance and momentum game reconstruction.',
    ['strength','balance','momentum'],['lower-evasion'],
    {GUARD:1.3,STEP:.95,FLOW:.85,COUNTER:1.0,BURST:1.45,RECOVER:1.0},
    [{id:'ape-force',label:'Ape Force',input:['GUARD','BURST'],effect:'momentum bonus'}]),

  'green-fox':reconstructed('green-fox','Green Dragon • Fox','Feint, evasion and mind-game reconstruction.',
    ['feints','evasion','rhythm'],['lower-power-score'],
    {GUARD:.95,STEP:1.35,FLOW:1.4,COUNTER:1.25,BURST:.8,RECOVER:1.1},
    [{id:'fox-switch',label:'Fox Switch',input:['FLOW','STEP'],effect:'feint/evasion bonus'}]),

  'green-horse':reconstructed('green-horse','Green Dragon • Horse','Endurance, balance and movement game reconstruction.',
    ['endurance','balance','movement'],['lower-counter-specialization'],
    {GUARD:1.1,STEP:1.3,FLOW:1.1,COUNTER:.95,BURST:1.05,RECOVER:1.35},
    [{id:'horse-run',label:'Horse Run',input:['STEP','RECOVER'],effect:'stamina/movement bonus'}]),

  'black-dragon-reconstruction':{
    id:'black-dragon-reconstruction' as const,
    label:'Black Dragon • Pressure Reconstruction',
    evidence:'mixed-history-plus-fictionalized-gameplay',
    historyNote:'Inspired by documented Chicago Black Dragon / Count Dante-era full-contact culture; this is not presented as an authentic surviving syllabus.',
    fantasy:'Forward-pressure tournament style with momentum, commitment and dramatic movement.',
    strengths:['burst-score','momentum','guard-pressure','spectator-energy'],
    tradeoffs:['higher-stamina-cost','mistimed-burst-vulnerability'],
    actionBias:{GUARD:1.05,STEP:1.05,FLOW:.85,COUNTER:1.0,BURST:1.4,RECOVER:.9},
    signatureGameMoves:[
      {id:'midnight-rush',label:'Midnight Rush',input:['STEP','BURST'],effect:'builds momentum and spectacle score'},
      {id:'black-wing',label:'Black Wing',input:['GUARD','STEP','BURST'],effect:'converts a defended exchange into arena position'},
      {id:'dragon-pressure',label:'Dragon Pressure',input:['BURST','FLOW','BURST'],effect:'high score chain with extra stamina cost'},
    ],
  },

  'neutral-dojo':{
    id:'neutral-dojo' as const,
    label:'Chicago Dojo • Balanced',
    evidence:'fictionalized-gameplay',
    historyNote:'Original StreetVerse training style used as a neutral learning lane.',
    fantasy:'Balanced accessibility-first style for new players.',
    strengths:['easy-timing','balanced-stamina','training'],
    tradeoffs:['no-specialization'],
    actionBias:{GUARD:1.0,STEP:1.0,FLOW:1.0,COUNTER:1.0,BURST:1.0,RECOVER:1.0},
    signatureGameMoves:[
      {id:'city-basics',label:'City Basics',input:['GUARD','STEP'],effect:'basic defensive movement score'},
      {id:'clean-counter',label:'Clean Counter',input:['GUARD','COUNTER'],effect:'timing bonus'},
      {id:'reset-breath',label:'Reset & Recover',input:['FLOW','RECOVER'],effect:'restores game stamina'},
    ],
  },
} as const

export const STREETVERSE_MARTIAL_ARTS_RULES={
  oneHand:true,
  nonlethalGameScoring:true,
  injurySimulation:'abstract-only',
  realWorldInstruction:false,
  noTargetAnatomyInstruction:true,
  noWeaponTechniqueInstruction:true,
  controls:['GUARD','STEP','FLOW','COUNTER','BURST','RECOVER'] as StreetVerseMartialAction[],
  scoring:['timing','spacing','defense','rhythm','stamina','sportsmanship','crowd-energy'],
  greenDragonCore:['Panther','Leopard','Boar','Snake','Mantis','Crane','Eagle','Tiger','Dragon'],
  greenDragonExtended:['Monkey','Bear','Wolf','Hawk','Ape','Fox','Horse'],
  dragonStyleRole:'adaptive mastery / style switching',
} as const
