import {generateStarterDistrict,validateStarterDistrict,STREETVERSE_STARTER_CITIES} from '../data/StreetVerseLivingCityGenerator'
import {createStreetVerseMyceliumNetwork} from './StreetVerseMyceliumNetwork'
import {createMyceliumTimeline} from './StreetVerseMyceliumTimelineRuntime'
import {getAccessToken} from '../services/supabaseClient'

export type SubmissionTestResult = {
  status:'preview-passed'|'backend-verified'|'blocked'|'failed';
  checks:string[]; missing:string[]; cityId:string;
  featureCount:number; eventNodes:string[]; jobId?:string;
};
function countryCode(country:string){
 return country==='Nigeria'?'ng':country==='Ethiopia'?'et':'us'
}
/** One click is a non-publishing TEST; financial/provider actions remain gated. */
export async function runStreetVerseSubmissionTest(cityId:string):Promise<SubmissionTestResult>{
 const city=STREETVERSE_STARTER_CITIES.find(c=>c.id===cityId);
 if(!city)return {status:'failed',cityId,checks:[],missing:['Unknown city'],featureCount:0,eventNodes:[]};
 const checks:string[]=[],missing:string[]=[];
 const district=generateStarterDistrict(cityId);
 const errors=validateStarterDistrict(district);
 if(errors.length)return {status:'failed',cityId,checks,missing:errors,featureCount:district.features.length,eventNodes:[]};
 checks.push('District plan generated and validated: roads, bridge, transit, mission and buildings');
 const network=createStreetVerseMyceliumNetwork({persistLocal:true});
 const event={id:`district-preview:${cityId}:${district.seed}`,kind:'district-preview' as const,cityId,source:'streetverse' as const,payload:{features:district.features.length,starter:city.starterDistrict}};
 const receipt=network.publish(event),duplicate=network.publish(event);
 if(!duplicate.duplicate||receipt.delivered.length!==8)return {status:'failed',cityId,checks,missing:['Mycelium event routing/replay check failed'],featureCount:district.features.length,eventNodes:[...receipt.delivered]};
 checks.push('Mycelium event routing and replay receipts saved locally (simulation only)');
 const timeline=createMyceliumTimeline('streetverse:'+cityId);
 const inserted=timeline.record({id:event.id,kind:event.kind,payload:{featureCount:district.features.length},at:0});
 if(!inserted||timeline.history().length!==1||timeline.record({id:event.id,kind:event.kind,payload:{featureCount:district.features.length},at:0}))return {status:'failed',cityId,checks,missing:['Mycelium timeline replay failed'],featureCount:district.features.length,eventNodes:[...receipt.delivered]};
 checks.push('Recovered Mycelium timeline recorded one persistent-in-session event without replay');
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-district-preview',{detail:{cityId,district,receipt,source:'one-button-integration-test',rendered:false}}));
 window.dispatchEvent(new CustomEvent('tryamm:ai-cafe-task',{detail:{workstream:'streetverse',title:`Review ${city.name} district preview and attach licensed assets / geometry`,priority:'normal',source:'mycelium-submission-test'}}));
 checks.push('Preview event emitted to StreetVerse and AI Café task queue');
 missing.push('3D renderer/physics/NPC and real GLB integration not certified by this preview');
 missing.push('MLP adapter receives routing metadata only; model behavior not verified');
 const result:SubmissionTestResult={status:'preview-passed',checks,missing,cityId,featureCount:district.features.length,eventNodes:[...receipt.delivered]};
 let token:string|null=null;
 try{token=await getAccessToken()}catch{}
 if(!token){result.status='blocked';result.missing.push('Backend submission not attempted: sign in with authorized Supabase studio account');return result}
 try{
  const response=await fetch('/api/agents/jobs',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({
   kind:'city-build-plan',requestKey:crypto.randomUUID(),input:{
    cityId:`sv-${countryCode(city.country)}-${cityId}`,district:city.starterDistrict,assets:[],
    publish:false,allowPaidGeneration:false
   }
  })});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok||!payload.job?.id){result.status='blocked';result.missing.push(`Backend submission blocked (HTTP ${response.status}); verify studio role, database migration and API environment`);return result}
  result.jobId=payload.job.id;
  result.checks.push('Authenticated backend accepted a city-build-plan job');
  const execute=await fetch('/api/agents/jobs',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({id:result.jobId})});
  if(!execute.ok){result.status='blocked';result.missing.push(`Backend execution blocked (HTTP ${execute.status}); inspect job queue`);return result}
  const verify=await fetch(`/api/agents/jobs?id=${encodeURIComponent(result.jobId!)}`,{headers:{Authorization:`Bearer ${token}`}});
  const stored=await verify.json().catch(()=>({}));
  const job=Array.isArray(stored.jobs)?stored.jobs.find((j:{id?:string})=>j.id===result.jobId):null;
  if(!verify.ok||job?.status!=='succeeded'||!job?.output?.plan){result.status='blocked';result.missing.push('Backend job was queued but no completed, stored plan was verified');return result}
  result.status='backend-verified';
  result.checks.push('Backend execution and stored, read-back plan verified');
  return result;
 }catch{
  result.status='blocked';
  result.missing.push('Network/API unavailable; preview passed but backend submission unverified');
  return result;
 }
}
