export type CombatDisciplineId =
  | 'mma'|'boxing'|'kickboxing'|'muay-thai'|'wrestling'|'judo'
  | 'bjj'|'karate'|'taekwondo'|'sanda'|'animal-arts'

export type CombatDiscipline={
  id:CombatDisciplineId
  label:string
  family:'mixed'|'striking'|'grappling'|'traditional'|'streetverse'
  sportFocus:string[]
  oneHandActions:string[]
  streetVerseStyleCarryover:boolean
}

export const SPORTVERSE_COMBAT_DISCIPLINES:CombatDiscipline[]=[
  {id:'mma',label:'MMA',family:'mixed',sportFocus:['position','timing','stamina','striking-score','grappling-score'],oneHandActions:['MOVE','GUARD','STRIKE','CLINCH','GRAPPLE','RESET'],streetVerseStyleCarryover:true},
  {id:'boxing',label:'Boxing',family:'striking',sportFocus:['timing','guard','footwork','ring-control'],oneHandActions:['MOVE','GUARD','STRIKE','COUNTER','RESET'],streetVerseStyleCarryover:true},
  {id:'kickboxing',label:'Kickboxing',family:'striking',sportFocus:['range','timing','combination-score','movement'],oneHandActions:['MOVE','GUARD','STRIKE','KICK-SCORE','RESET'],streetVerseStyleCarryover:true},
  {id:'muay-thai',label:'Muay Thai',family:'striking',sportFocus:['ring-control','clinch-score','timing','stamina'],oneHandActions:['MOVE','GUARD','STRIKE','CLINCH','RESET'],streetVerseStyleCarryover:true},
  {id:'wrestling',label:'Wrestling',family:'grappling',sportFocus:['position','control','escape','takedown-score'],oneHandActions:['MOVE','DEFEND','CONTROL','TAKEDOWN-SCORE','RESET'],streetVerseStyleCarryover:false},
  {id:'judo',label:'Judo',family:'grappling',sportFocus:['balance','position','throw-score','control'],oneHandActions:['MOVE','GRIP-SCORE','THROW-SCORE','CONTROL','RESET'],streetVerseStyleCarryover:true},
  {id:'bjj',label:'Brazilian Jiu-Jitsu',family:'grappling',sportFocus:['position','guard-score','pass-score','submission-score'],oneHandActions:['POSITION','DEFEND','PASS-SCORE','SUBMISSION-SCORE','RESET'],streetVerseStyleCarryover:false},
  {id:'karate',label:'Karate',family:'traditional',sportFocus:['timing','distance','precision','discipline'],oneHandActions:['MOVE','GUARD','STRIKE','COUNTER','RESET'],streetVerseStyleCarryover:true},
  {id:'taekwondo',label:'Taekwondo',family:'traditional',sportFocus:['range','movement','kick-score','timing'],oneHandActions:['MOVE','GUARD','KICK-SCORE','COUNTER','RESET'],streetVerseStyleCarryover:true},
  {id:'sanda',label:'Sanda',family:'mixed',sportFocus:['striking-score','throw-score','ring-control','timing'],oneHandActions:['MOVE','GUARD','STRIKE','THROW-SCORE','RESET'],streetVerseStyleCarryover:true},
  {id:'animal-arts',label:'StreetVerse Animal Arts',family:'streetverse',sportFocus:['style-mastery','timing','defense','movement','sportsmanship'],oneHandActions:['STYLE','GUARD','STEP','FLOW','COUNTER','BURST'],streetVerseStyleCarryover:true},
]

export const COMBAT_PASSPORT_RULES={
  sharedAcross:['StreetVerse','SportVerse','GameVerse'],
  persistentStyleXp:true,
  persistentDisciplineXp:true,
  oneHand:true,
  leftRightControlPlacement:true,
  nonlethalCompetitionScoring:true,
  realWorldInstruction:false,
  noTargetAnatomyInstruction:true,
  noWeaponTechniqueInstruction:true,
  realMoneyPayoutFromClient:false,
  animalStyleCarryover:'Animal style mastery changes game attributes, cosmetics, intros, tournament AI and mission options; it does not grant real-world fighting instruction.',
} as const

export type CombatPassportState={
  selectedDiscipline:CombatDisciplineId
  selectedAnimalStyle:string
  disciplineXp:Record<string,number>
  styleXp:Record<string,number>
  titles:string[]
  wins:number
  losses:number
}

export const defaultCombatPassport=():CombatPassportState=>({
  selectedDiscipline:'mma',
  selectedAnimalStyle:'green-panther',
  disciplineXp:{},
  styleXp:{},
  titles:[],
  wins:0,
  losses:0,
})
