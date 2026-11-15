/** HoloLab motion director for a deterministic, accessible chamber walkthrough. */
export type HoloLabMotionStage='outside'|'approaching'|'inside'|'charging'|'warping'|'arrived'
export function createHoloLabMotion(){
 let stage:HoloLabMotionStage='outside'
 const transitions:Record<HoloLabMotionStage,HoloLabMotionStage|null>={
  outside:'approaching',approaching:'inside',inside:'charging',charging:'warping',warping:'arrived',arrived:null,
 }
 return {
  stage:()=>stage,
  advance:()=>{const next=transitions[stage];if(!next)throw new Error('Motion sequence complete');stage=next;return stage},
  reset:()=>{stage='outside';return stage},
  canConfirmArrival:()=>stage==='warping',
  arrive:()=>{if(stage!=='warping')throw new Error('Warp must complete before arrival');stage='arrived';return stage},
 }
}
