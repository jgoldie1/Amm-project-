export type DojoAffiliation='green-dragon'|'black-dragon-reconstruction'|'independent'
export type DojoRole='OWNER'|'INSTRUCTOR'|'STUDENT'|'PROMOTER'|'HISTORIAN'|'CREATOR'

export const STREETVERSE_DOJO_BUSINESS_MODEL={
  roles:['OWNER','INSTRUCTOR','STUDENT','PROMOTER','HISTORIAN','CREATOR'] as DojoRole[],
  affiliations:[
    {id:'green-dragon' as DojoAffiliation,label:'Green Dragon Heritage Dojo',historyLabel:'Society-published animal-system heritage + StreetVerse reconstruction'},
    {id:'black-dragon-reconstruction' as DojoAffiliation,label:'Black Dragon Reconstruction Dojo',historyLabel:'Count Dante-era inspiration with fictionalized game mechanics'},
    {id:'independent' as DojoAffiliation,label:'Independent Chicago Dojo',historyLabel:'Original StreetVerse school'},
  ],
  operations:[
    {id:'class',label:'RUN CLASS',effect:'student growth + instructor reputation'},
    {id:'tournament',label:'HOST TOURNAMENT',effect:'dojo reputation + crowd energy + creator highlights'},
    {id:'heritage-night',label:'HERITAGE NIGHT',effect:'history affinity + Time Machine clues'},
    {id:'creator-night',label:'CREATOR NIGHT',effect:'reel/live hooks + sponsor-ready event inventory'},
    {id:'community-workshop',label:'COMMUNITY WORKSHOP',effect:'neighborhood trust + mentor bonds'},
  ],
  progression:{
    levels:[
      {level:1,label:'GARAGE / BACKROOM DOJO',rep:0},
      {level:2,label:'NEIGHBORHOOD SCHOOL',rep:250},
      {level:3,label:'CHICAGO DOJO',rep:750},
      {level:4,label:'CITY ACADEMY',rep:1800},
      {level:5,label:'GRANDMASTER HALL',rep:4000},
    ],
    persistent:true,
  },
  economy:{
    prototypeCurrency:'Holo Credits',
    realMoneyPayouts:'server-authoritative-only',
    localClientCannotDeclareCashPayout:true,
  },
} as const

export const STREETVERSE_DOJO_MENTOR_BONDS={
  categories:['teacher','student','rival-respect','historian','community','creator'],
  effects:['dialogue','training-mission','style-clue','tournament-invite','business-introduction','Time-Machine-archive'],
  maxBond:100,
} as const
