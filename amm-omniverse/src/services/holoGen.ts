import { getComfyHealth, submitComfyJob } from './comfyProvider'
export type HoloGenMode='text'|'world'|'reel'|'image'|'simulation'
export type HoloGenRequest={mode:HoloGenMode;prompt:string;context?:Record<string,unknown>;sessionId?:string}
export type HoloGenResult={ok:boolean;mode:HoloGenMode;provider:string;degraded:boolean;output?:unknown;message:string}
async function readJson(r:Response){const text=await r.text();try{return text?JSON.parse(text):{}}catch{return {error:text||`API ${r.status}`}}}
function dispatch(name:string,detail:Record<string,unknown>){if(typeof window==='undefined')return false;window.dispatchEvent(new CustomEvent(name,{detail}));return true}
export async function runHoloGen(req:HoloGenRequest):Promise<HoloGenResult>{
 const prompt=req.prompt.trim();if(!prompt)return {ok:false,mode:req.mode,provider:'none',degraded:true,message:'Prompt is required.'}
 if(req.mode==='text'){
  try{const r=await fetch('/api/ai/answer',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:prompt,history:[],holoGen:{mode:req.mode,context:req.context||{},sessionId:req.sessionId}})});const d=await readJson(r);if(!r.ok)throw new Error(d.error||`AI API ${r.status}`);return {ok:true,mode:req.mode,provider:d.provider||'hologpt',degraded:Boolean(d.degraded),output:d.answer,message:d.degraded?'Generated through HoloGPT recovery mode.':'Generated through the unified HoloGPT provider.'}}catch(e:any){return {ok:false,mode:req.mode,provider:'local-recovery',degraded:true,message:e?.message||'Holo Gen text provider unavailable.'}}
 }
 if(req.mode==='image'||req.mode==='reel'){
  try{const job=await submitComfyJob({kind:req.mode==='image'?'image':'video',prompt,workflow:String(req.context?.workflow||'')||undefined});return {ok:true,mode:req.mode,provider:'comfy',degraded:job.status!=='submitted',output:job,message:job.status==='submitted'?'Holo Gen submitted the visual job to Comfy.':'Comfy is registered but gated until its endpoint is configured.'}}catch(e:any){return {ok:false,mode:req.mode,provider:'comfy',degraded:true,message:e?.message||'Comfy visual provider unavailable.'}}
 }
 const event=req.mode==='world'?'tryamm:hologen-world':'tryamm:hologen-simulation';dispatch(event,{prompt,context:req.context||{},sessionId:req.sessionId||null,source:'holo-gen'});return {ok:true,mode:req.mode,provider:'holo-router',degraded:true,output:{event},message:'Holo Gen request was routed to the local TRYAMM generation pipeline.'}
}
export async function getHoloGenHealth(){try{const r=await fetch('/api/ai/health',{cache:'no-store'});const d=await readJson(r);return {ok:r.ok&&d.ok&&!d.degraded,provider:d.provider||'diagnostic',degraded:Boolean(d.degraded),providers:{...(d.providers||{}),comfy:getComfyHealth().configured},model:d.model||null}}catch{return {ok:false,provider:'offline',degraded:true,providers:{comfy:getComfyHealth().configured},model:null}}}
