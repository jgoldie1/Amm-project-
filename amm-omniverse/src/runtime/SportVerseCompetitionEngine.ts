import {SPORTVERSE_WORLD_GAMES,type SportVerseCompetitionStage} from '../data/sportVerseWorldGames'

export type SportVerseEntryType='individual'|'team'|'mixed'
export type SportVerseCompetitionSession=Readonly<{
 id:string
 sportId:string
 eventId:string
 stage:SportVerseCompetitionStage
 entryType:SportVerseEntryType
 division:'open'|'women'|'men'|'mixed'|'youth'|'adaptive'
 participants:number
 status:'registration'|'active'|'awaiting-validation'|'complete'
 createdAt:string
}>

export const SPORTVERSE_STAGE_ORDER=[...SPORTVERSE_WORLD_GAMES.competitionFlow]

export function createSportVerseCompetition(input:{
 sportId:string;eventId:string;entryType?:SportVerseEntryType;division?:SportVerseCompetitionSession['division'];participants?:number
}):SportVerseCompetitionSession{
 return{
  id:'svg-'+input.sportId+'-'+Date.now(),
  sportId:input.sportId,
  eventId:input.eventId,
  stage:'training',
  entryType:input.entryType||'individual',
  division:input.division||'open',
  participants:Math.max(1,input.participants||1),
  status:'registration',
  createdAt:new Date().toISOString(),
 }
}

export const nextSportVerseStage=(stage:SportVerseCompetitionStage)=>{
 const i=SPORTVERSE_STAGE_ORDER.indexOf(stage)
 return SPORTVERSE_STAGE_ORDER[Math.min(SPORTVERSE_STAGE_ORDER.length-1,i+1)]
}

export const requestSportVerseCompetitionStart=(session:SportVerseCompetitionSession)=>
 window.dispatchEvent(new CustomEvent('tryamm:sportverse-competition-start-request',{detail:{session,serverValidate:true}}))

export const requestSportVerseResult=(detail:{
 sessionId:string;sportId:string;eventId:string;stage:SportVerseCompetitionStage;score?:number;timeMs?:number;placement?:number;metadata?:Record<string,unknown>
})=>{
 window.dispatchEvent(new CustomEvent('tryamm:sportverse-result-request',{detail:{...detail,serverValidate:true,antiCheat:true}}))
 window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'sportverse-result',sportId:detail.sportId,eventId:detail.eventId,stage:detail.stage}}))
}

export const requestSportVerseMedalValidation=(detail:{
 sessionId:string;sportId:string;eventId:string;placements:readonly {entryId:string;place:1|2|3}[]
})=>window.dispatchEvent(new CustomEvent('tryamm:sportverse-medal-validation-request',{detail:{...detail,serverValidate:true,medals:['gold','silver','bronze']}}))
