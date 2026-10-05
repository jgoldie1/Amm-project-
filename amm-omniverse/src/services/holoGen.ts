import { getComfyHealth, submitComfyJob } from './comfyProvider'
import { getHappyHorseHealth, submitHappyHorseJob } from './happyHorseProvider'
import {generateMeshyWorldArtifact,type MeshyWorldKind,type MeshyWorldQuality} from './meshyWorldArtifactProvider'
export type HoloGenMode='text'|'world'|'reel'|'image'|'simulation'
export type HoloGenRequest={mode:HoloGenMode;prompt:string;context?:Record<string,unknown>;sessionId?:string}
export type HoloGenResult={ok:boolean;mode:HoloGenMode;provider:string;degraded:boolean;output?:unknown;message:string}
async function readJson(r:Response){const text=await r.text();try{return text?JSON.parse(text):{}}catch{return {error:text||`API ${r.status}`}}}
function dispatch(name:string,detail:Record<string,unknown>){if(typeof window==='undefined')return false;window.dispatchEvent(new CustomEvent(name,{detail}));return true}
const MESHY_WORLD_KINDS=new Set<MeshyWorldKind>(['character','vehicle','building','interior','environment','prop','animal','road'])
export async function runHoloGen(req:HoloGenRequest):Promise<HoloGenResult>{
 const prompt=req.prompt.trim();if(!prompt)return {ok:false,mode:req.mode,provider:'none',degraded:true,message:'Prompt is required.'}
 if(req.mode==='text'){
  try{const r=await fetch('/api/ai/answer',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:prompt,history:[],holoGen:{mode:req.mode,context:req.context||{},sessionId:req.sessionId}})});const d=await readJson(r);if(!r.ok)throw new Error(d.error||`AI API ${r.status}`);return {ok:true,mode:req.mode,provider:d.provider||'hologpt',degraded:Boolean(d.degraded),output:d.answer,message:d.degraded?'Generated through HoloGPT recovery mode.':'Generated through the unified HoloGPT provider.'}}catch(e:any){return {ok:false,mode:req.mode,provider:'local-recovery',degraded:true,message:e?.message||'Holo Gen text provider unavailable.'}}
 }
 if(req.mode==='reel'){
  try{
   const job=await submitHappyHorseJob({
    prompt,
    modelId:String(req.context?.modelId||'')||undefined,
    imageUrl:String(req.context?.imageUrl||'')||undefined,
    aspectRatio:String(req.context?.aspectRatio||'')||undefined,
    quality:String(req.context?.quality||'')||undefined,
    duration:Number(req.context?.duration)||undefined,
    generateAudio:typeof req.context?.generateAudio==='boolean'?Boolean(req.context.generateAudio):undefined
   })
   if(job.status==='submitted')return {ok:true,mode:req.mode,provider:'happyhorse',degraded:false,output:job,message:'Holo Gen submitted the Reel video job to Happy Horse.'}
  }catch{}
  try{const job=await submitComfyJob({kind:'video',prompt,workflow:String(req.context?.workflow||'')||undefined});return {ok:true,mode:req.mode,provider:'comfy',degraded:job.status!=='submitted',output:job,message:job.status==='submitted'?'Happy Horse was unavailable, so Holo Gen submitted the Reel to Comfy.':'Happy Horse and Comfy are registered but still gated until their provider configuration is available.'}}catch(e:any){return {ok:false,mode:req.mode,provider:'visual-router',degraded:true,message:e?.message||'Happy Horse and Comfy visual providers are unavailable.'}}
 }
 if(req.mode==='image'){
  try{const job=await submitComfyJob({kind:'image',prompt,workflow:String(req.context?.workflow||'')||undefined});return {ok:true,mode:req.mode,provider:'comfy',degraded:job.status!=='submitted',output:job,message:job.status==='submitted'?'Holo Gen submitted the image job to Comfy.':'Comfy is registered but gated until its endpoint is configured.'}}catch(e:any){return {ok:false,mode:req.mode,provider:'comfy',degraded:true,message:e?.message||'Comfy visual provider unavailable.'}}
 }
 if(req.mode==='world'){
  const kind=String(req.context?.assetKind||'') as MeshyWorldKind
  const qualityTier=(String(req.context?.qualityTier||'premium') as MeshyWorldQuality)
  if(Boolean(req.context?.holoforge)&&MESHY_WORLD_KINDS.has(kind)){
   try{
    const artifact=await generateMeshyWorldArtifact({assetKind:kind,prompt,qualityTier:['mobile','premium','hero'].includes(qualityTier)?qualityTier:'premium'})
    return {ok:true,mode:req.mode,provider:'meshy.ai',degraded:false,output:{artifactUrl:artifact.glb,glb:artifact.glb,thumbnailUrl:artifact.thumbnailUrl,taskId:artifact.taskId,status:artifact.status,pbr:artifact.pbr,textured:artifact.textured,assetKind:artifact.assetKind,qualityTier:artifact.qualityTier,consumedCredits:artifact.consumedCredits},message:'Holo Gen generated a real Meshy GLB/PBR world artifact.'}
   }catch(error){
    const message=error instanceof Error?error.message:String(error)
    dispatch('tryamm:hologen-world-provider-degraded',{prompt,context:req.context||{},sessionId:req.sessionId||null,source:'holo-gen',provider:'meshy.ai',error:message})
    return {ok:true,mode:req.mode,provider:'holo-router',degraded:true,output:{event:'tryamm:hologen-world',providerAttempt:'meshy.ai',providerError:message},message:'Meshy world artifact generation was unavailable, so Holo Gen kept the request in preview-only TRYAMM recovery mode.'}
   }
  }
  const event='tryamm:hologen-world';dispatch(event,{prompt,context:req.context||{},sessionId:req.sessionId||null,source:'holo-gen'});return {ok:true,mode:req.mode,provider:'holo-router',degraded:true,output:{event},message:'Holo Gen request was routed to the local TRYAMM generation pipeline because this world request is not a supported Meshy 3D asset class.'}
 }
 const event='tryamm:hologen-simulation';dispatch(event,{prompt,context:req.context||{},sessionId:req.sessionId||null,source:'holo-gen'});return {ok:true,mode:req.mode,provider:'holo-router',degraded:true,output:{event},message:'Holo Gen request was routed to the local TRYAMM simulation pipeline.'}
}
export async function getHoloGenHealth(){
 const happyHorse=await getHappyHorseHealth()
 try{const r=await fetch('/api/ai/health',{cache:'no-store'});const d=await readJson(r);return {ok:r.ok&&d.ok&&!d.degraded,provider:d.provider||'diagnostic',degraded:Boolean(d.degraded),providers:{...(d.providers||{}),happyhorse:happyHorse.configured,comfy:getComfyHealth().configured},models:{text:d.model||null,video:happyHorse.model},model:d.model||null}}catch{return {ok:false,provider:'offline',degraded:true,providers:{happyhorse:happyHorse.configured,comfy:getComfyHealth().configured},models:{text:null,video:happyHorse.model},model:null}}
}
