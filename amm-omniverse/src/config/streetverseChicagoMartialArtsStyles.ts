export type StreetVerseMartialStyleId='green-dragon-reconstruction'|'black-dragon-reconstruction'|'neutral-dojo'
export type StreetVerseMartialAction='GUARD'|'STEP'|'FLOW'|'COUNTER'|'BURST'|'RECOVER'

export const STREETVERSE_CHICAGO_MARTIAL_STYLES={
  'green-dragon-reconstruction':{
    id:'green-dragon-reconstruction' as const,
    label:'Green Dragon • Flow Reconstruction',
    evidence:'fictionalized-gameplay',
    historyNote:'Inspired by Chicago dojo-war history. No complete verified historical Green Dragon technical syllabus is claimed.',
    fantasy:'Mobile, evasive, rhythm-first style focused on spacing, redirection and counters.',
    strengths:['mobility','counter-window','stamina-efficiency','crowd-control-score'],
    tradeoffs:['lower-burst-score','requires-timing'],
    actionBias:{GUARD:1.0,STEP:1.25,FLOW:1.35,COUNTER:1.3,BURST:.8,RECOVER:1.2},
    signatureGameMoves:[
      {id:'emerald-step',label:'Emerald Step',input:['STEP','FLOW'],effect:'grants a short evade window and style meter'},
      {id:'river-counter',label:'River Counter',input:['GUARD','COUNTER'],effect:'scores bonus only after a successful timed guard'},
      {id:'dragon-circle',label:'Dragon Circle',input:['FLOW','STEP','FLOW'],effect:'repositions avatar and resets crowd-pressure meter'},
    ],
  },
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
} as const
