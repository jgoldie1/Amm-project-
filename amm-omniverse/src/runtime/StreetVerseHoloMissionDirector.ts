import {BUSINESSVERSE_VENUES,type BusinessTemplate,type JobStep} from '../data/streetverseBusinessVerseRegistry'
/** Offline, deterministic HoloGPT mission guidance fallback.
 * Does not impersonate a live AI service or authorize game rewards. */
export type MissionGuide={businessId:string;step:JobStep;instruction:string;trainingOnly:true;holoSearchQuery:string;holoLabRoute:'/holo-lab';xrRoute:'/xr'}
const INSTRUCTIONS:Partial<Record<JobStep,string>>={
 check_in:'Check in at the staff desk to start your shift.',
 accept_order:'Read the customer order and confirm the items.',
 collect_ingredients:'Collect the correct ingredients from the pantry.',
 prepare:'Prepare the ingredients at the workstation.',
 cook:'Use the cooking station and follow the on-screen timer.',
 bake:'Place the prepared item in the oven and watch the timer.',
 plate:'Plate the finished order before serving.',
 package:'Pack the completed order for pickup or delivery.',
 deliver:'Follow the destination marker and confirm delivery.',
 serve:'Bring the finished order to the service counter.',
 clean:'Clean the workstation and finish the shift.',
 inspect:'Inspect the marked equipment and record the result.',
 dispatch:'Select the next delivery assignment.',
 perform:'Use the performance station to begin the scheduled set.',
 checkout:'Review the simulated transaction. Real purchases require verified checkout.'
}
export function guideBusinessStep(businessId:string,step:JobStep):MissionGuide{
 const venue:BusinessTemplate|undefined=BUSINESSVERSE_VENUES.find(v=>v.id===businessId)
 if(!venue||!venue.missionSteps.includes(step))throw Error('UNSUPPORTED_BUSINESS_MISSION_STEP')
 return {businessId,step,instruction:INSTRUCTIONS[step]||'Follow the highlighted workstation.',trainingOnly:true,holoSearchQuery:venue.name+' '+step.replaceAll('_',' '),holoLabRoute:'/holo-lab',xrRoute:'/xr'}
}
