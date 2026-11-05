import type {StreetVerseOrganState} from './StreetVerseAnatomySimulation'

/** Fictional game animation parameters; not physiological predictions or medical advice. */
export type LivingBodyFeedback={
 paceMultiplier:number
 breathingEffort:number
 limpStrength:number
 steadiness:number
 canSprint:boolean
 collapse:boolean
 rescueRecommended:boolean
}
const clamp=(v:number,min=0,max=1)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min))
export function calculateLivingBodyFeedback(body:StreetVerseOrganState):LivingBodyFeedback{
 const mobility=clamp(body.mobility/100)
 const breathing=clamp(body.breathing/100)
 const stamina=clamp(body.stamina/100)
 const awareness=clamp(body.integrity.brain/100)
 const collapse=body.consciousness==='downed'
 const paceMultiplier=collapse?0:clamp(.40+.60*mobility,.4,1)
 const breathingEffort=clamp((1-breathing)*.75+(1-stamina)*.25)
 const limpStrength=clamp((1-mobility)*1.25)
 const steadiness=clamp(awareness*.65+stamina*.35)
 return {paceMultiplier,breathingEffort,limpStrength,steadiness,
  canSprint:!collapse&&body.consciousness==='alert'&&mobility>=.75&&breathing>=.55&&stamina>=.25,
  collapse,rescueRecommended:collapse||body.needsRescue}
}
