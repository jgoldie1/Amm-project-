export type GameRelease={id:string;title:string;genre:string;releaseOrder:number;status:'foundation'|'playable-shell'|'production-gated';required:string[]}

export const GAMEVERSE_RELEASES:GameRelease[]=[
  {id:'streetverse',title:'StreetVerse',genre:'Living city / open-world social',releaseOrder:1,status:'production-gated',required:['movement','missions','vehicles','shared-state','clip-capture','save','accessibility','multiplayer']},
  {id:'gridiron-x',title:'Gridiron X',genre:'Football',releaseOrder:2,status:'foundation',required:['teams','playbook','physics','AI','multiplayer','replay']},
  {id:'court-kings',title:'Court Kings',genre:'Basketball',releaseOrder:3,status:'foundation',required:['court','ball-physics','AI','multiplayer','career','replay']},
  {id:'diamond-legends',title:'Diamond Legends',genre:'Baseball',releaseOrder:4,status:'foundation',required:['pitching','batting','fielding','AI','multiplayer','replay']},
  {id:'ice-storm',title:'Ice Storm',genre:'Hockey',releaseOrder:5,status:'foundation',required:['skating','puck-physics','AI','multiplayer','career','replay']},
  {id:'world-pitch',title:'World Pitch',genre:'Soccer',releaseOrder:6,status:'foundation',required:['football-physics','teams','AI','multiplayer','career','replay']},
  {id:'fight-night-holo',title:'Fight Night Holo',genre:'Boxing / combat sport',releaseOrder:7,status:'foundation',required:['combat','stamina','AI','multiplayer','career','replay']},
  {id:'battlefront-zero',title:'Battlefront Zero',genre:'Original action arena',releaseOrder:8,status:'foundation',required:['movement','combat','teams','arena','AI','multiplayer','anti-cheat']},
  {id:'yogihoo-arena',title:'Yogihoo Arena',genre:'Creature / arena strategy',releaseOrder:9,status:'foundation',required:['creatures','abilities','arena','AI','multiplayer','collection']},
  {id:'volcano-racers',title:'Volcano Racers',genre:'Racing',releaseOrder:10,status:'foundation',required:['vehicles','tracks','physics','AI','multiplayer','time-trial','replay']},
  {id:'kingdom-builders',title:'Kingdom Builders',genre:'Persistent builder / strategy',releaseOrder:11,status:'foundation',required:['building','resources','NPCs','missions','persistence','multiplayer','economy']},
]

export const SHARED_GAME_CONTRACT=[
  'one-user','one-avatar','shared-xp-level','shared-inventory','world-checkpoints','accessibility-passport','language-runtime',
  'save-resume','multiplayer','matchmaking','leaderboards','replay','clip-capture','moderation','anti-cheat','creator-attribution'
] as const

export const PRODUCTION_GATE=['build-green','auth-live','database-live','multiplayer-live','save-live','device-controls-tested','accessibility-tested','performance-budget','release-sha-proven'] as const
