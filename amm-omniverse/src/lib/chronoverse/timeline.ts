export type ChronoEvidence='scientific'|'primary-source'|'documented-history'|'oral-history'|'scholarly-interpretation'|'reconstruction'|'faithverse-interpretation'|'legend'|'alternate-history'

export type ChronoEra={
 id:string
 title:string
 range:string
 lens:'science'|'history'|'faithverse'|'future'|'speculative'
 evidence:ChronoEvidence[]
 modes:Array<'learn'|'live'|'mission'>
 safety?:'observer-lock'|'guided'
}

export const CHRONOVERSE_ERAS:ChronoEra[]=[
 {id:'cosmic-origin',title:'Cosmic Origin',range:'deep time',lens:'science',evidence:['scientific'],modes:['learn','mission'],safety:'observer-lock'},
 {id:'early-earth',title:'Earth Formation & First Life',range:'deep time',lens:'science',evidence:['scientific','reconstruction'],modes:['learn','live','mission'],safety:'observer-lock'},
 {id:'dinosaurs',title:'Age of Dinosaurs',range:'Mesozoic',lens:'science',evidence:['scientific','reconstruction'],modes:['learn','live','mission'],safety:'observer-lock'},
 {id:'extinctions',title:'Extinction Events',range:'deep time',lens:'science',evidence:['scientific','reconstruction'],modes:['learn','mission'],safety:'observer-lock'},
 {id:'early-humans',title:'Early Humanity',range:'prehistory',lens:'science',evidence:['scientific','scholarly-interpretation','reconstruction'],modes:['learn','live','mission']},
 {id:'ancient',title:'Ancient Civilizations',range:'ancient world',lens:'history',evidence:['primary-source','documented-history','scholarly-interpretation','reconstruction'],modes:['learn','live','mission']},
 {id:'faithverse',title:'FaithVerse Sacred Timeline',range:'sacred chronology',lens:'faithverse',evidence:['faithverse-interpretation','documented-history','reconstruction'],modes:['learn','live','mission']},
 {id:'slavery',title:'Atlantic Slave Trade & American Slavery',range:'historical era',lens:'history',evidence:['primary-source','documented-history','oral-history','scholarly-interpretation','reconstruction'],modes:['learn','live','mission'],safety:'guided'},
 {id:'reconstruction',title:'Emancipation & Reconstruction',range:'1860s–1870s',lens:'history',evidence:['primary-source','documented-history','scholarly-interpretation','reconstruction'],modes:['learn','live','mission']},
 {id:'jim-crow',title:'Jim Crow & Great Migration',range:'late 19th–20th century',lens:'history',evidence:['primary-source','documented-history','oral-history','reconstruction'],modes:['learn','live','mission']},
 {id:'civil-rights',title:'Civil Rights Movement',range:'20th century',lens:'history',evidence:['primary-source','documented-history','oral-history','scholarly-interpretation','reconstruction'],modes:['learn','live','mission']},
 {id:'modern',title:'Modern & Digital Era',range:'present era',lens:'history',evidence:['documented-history'],modes:['learn','live','mission']},
 {id:'space-age',title:'Space Age',range:'modern–future',lens:'future',evidence:['documented-history','scientific'],modes:['learn','live','mission']},
 {id:'future',title:'Future Worlds & StarVerse',range:'future',lens:'speculative',evidence:['reconstruction','alternate-history'],modes:['live','mission']},
 {id:'dimensions',title:'Alternate Dimensions',range:'branch timelines',lens:'speculative',evidence:['legend','alternate-history'],modes:['live','mission']}
]

export const CHRONO_TRAVEL_STAGES=['checkpoint','evidence-policy','predictive-preload','time-warp','spawn','verify-state'] as const
export const CHRONO_LEARNING_LOOP=['observe','listen','communicate','learn','mission','knowledge-check','chrono-archive'] as const
export const CHRONO_COMMUNICATION_MODES=['learn','translate','immersion'] as const

export const HISTORICAL_SAFETY={
 slavery:{
  principle:'Historically grounded embodied learning must never claim a game can reproduce what enslavement felt like.',
  focus:['humanity','family','community','culture','forced-labor','resistance','escape','abolition','emancipation','reconstruction'],
  prohibit:['suffering-as-entertainment','rewarding-abuse','invented-facts-presented-as-history']
 },
 evidenceLabels:['PRIMARY SOURCE','DOCUMENTED HISTORY','ORAL HISTORY','SCHOLARLY INTERPRETATION','RECONSTRUCTION','DRAMATIZATION','FAITHVERSE INTERPRETATION','LEGEND / MYTH','ALTERNATE HISTORY']
} as const
