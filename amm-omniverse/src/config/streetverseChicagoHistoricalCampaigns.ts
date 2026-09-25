export type ChicagoHistoryEvidence='documented'|'mixed'|'legend'|'fictionalized-gameplay'

export const STREETVERSE_CHICAGO_HISTORY_CAMPAIGNS = [
  {
    id:'prohibition-chicago',
    title:'Prohibition Chicago',
    era:'1920–1931',
    evidence:'documented' as ChicagoHistoryEvidence,
    historicalFigures:['Al Capone','John Torrio','Eliot Ness'],
    themes:['Prohibition','organized-crime history','law enforcement','press','neighborhood life','economics'],
    routes:{
      A:'ACTION — navigate a fictionalized evidence-recovery / law-enforcement pursuit scenario without teaching real criminal methods.',
      B:'BUILD / BUSINESS — keep a legitimate neighborhood business operating through a turbulent Prohibition economy.',
      C:'LEARN / TEST — compare archive records, headlines and later legend; identify what is documented.',
    },
    unlocks:['Prohibition Archivist title','vintage creator prop','historical dialogue','1920s Reel filter'],
  },
  {
    id:'chicago-dojo-wars',
    title:'Chicago Kung Fu / Dojo Wars',
    era:'1960s–1970',
    evidence:'mixed' as ChicagoHistoryEvidence,
    historicalFigures:['John Keehan / Count Dante'],
    historicalGroups:['Black Dragons','Green Dragons'],
    themes:['Chicago martial arts','dojo rivalries','tournaments','promotion culture','fact-versus-legend'],
    routes:{
      A:'ACTION — nonlethal tournament / sparring challenge focused on timing, defense and discipline.',
      B:'BUILD / BUSINESS — operate a dojo, recruit students, schedule classes, organize a safe tournament and build reputation.',
      C:'LEARN / TEST — interview simulated witnesses, compare accounts and classify evidence versus legend.',
    },
    unlocks:['Chicago Martial Arts Historian title','dojo mentor bond','dragon tournament patch','alternate combat-training missions'],
    safety:'Do not recreate lethal assaults as a player instruction set; disputed stories remain labeled as disputed.',
  },
  {
    id:'chicago-martial-arts-legacy',
    title:'Chicago Martial Arts Legacy',
    era:'1950s–1970s',
    evidence:'documented' as ChicagoHistoryEvidence,
    themes:['boxing gyms','karate schools','full-contact tournament history','neighborhood training culture'],
    routes:{
      A:'ACTION — skill/timing tests.',
      B:'BUILD / BUSINESS — dojo management and community training.',
      C:'LEARN / TEST — archive/history route.',
    },
    unlocks:['mentor dialogue','historic-gym creator set','training-emote pack','community tournament event'],
  },
] as const

export const STREETVERSE_TIME_MACHINE_PRESENT_DAY_EFFECTS = {
  rule:'Historical missions do not change real history; they change the player present through knowledge, relationships, unlocks and fictional StreetVerse consequences.',
  effects:[
    'present-day NPC dialogue remembers completed historical runs',
    'creator tools receive era-specific props/filters/lore cards',
    'new A/B/C missions unlock in present-day Chicago',
    'neighborhood reputation can gain history/heritage affinity',
    'permanent non-pay-to-win titles and convenience boosts unlock',
    'hidden cross-era Easter eggs can alter fictional present-day rooms, signage or puzzles',
    'World Memory records the player chronology and return checkpoints',
  ],
} as const

export const STREETVERSE_HISTORY_SOURCE_RULES = {
  realPeopleRequireSources:true,
  disputedAccountsStayAttributed:true,
  legendsAreNotPresentedAsFacts:true,
  noSyntheticQuotePresentedAsHistorical:true,
  fictionalCombatSeparatedFromDocumentaryFacts:true,
  noRealWorldCrimeInstruction:true,
} as const
