import {buildCityPlan} from './ai-cafe-city-plan.js';
import {createHash} from 'node:crypto';
import {adminRest} from './supabase-admin.js';
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function normalizeDraft(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('invalid_input');
 const data={};
 for(const [key,max] of Object.entries({name:200,headline:200,description:1500,services:2000,email:200,phone:200,location:200})){
  const value=input[key]??'';
  if(typeof value!=='string'||value.length>max)throw new Error('invalid_input');
  data[key]=value.trim();
 }
 if(!data.name||!data.headline||!data.description)throw new Error('invalid_input');
 data.color=/^#[0-9a-f]{6}$/i.test(input.color||'')?input.color:'#174a39';
 data.language=typeof input.language==='string'&&/^[a-z]{2}(?:-[A-Z]{2})?$/.test(input.language)?input.language:'en';
 return data;
}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function buildDraft(input){
 const d=normalizeDraft(input),e=escape;
 const html=`<!doctype html><html lang="${e(d.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${e(d.name)}</title><style>body{font:18px/1.6 system-ui;margin:auto;padding:2rem;max-width:65ch;color:#182124;background:#fff}header{border-top:8px solid ${d.color}}h1{line-height:1.2}p{white-space:pre-wrap}a{color:#174a39}footer{margin-top:3rem;font-size:.9rem}</style></head><body><a href="#main">Skip to content</a><header><p>${e(d.name)}</p><h1>${e(d.headline)}</h1></header><main id="main"><p>${e(d.description)}</p><ul>${d.services.split('\n').filter(Boolean).map(s=>`<li>${e(s)}</li>`).join('')}</ul><address><p>${e(d.location)}</p><p>${e(d.email)}</p><p>${e(d.phone)}</p></address></main><footer>Website draft — review before publishing.</footer></body></html>`;
 return {html,sha256:createHash('sha256').update(html).digest('hex'),bytes:Buffer.byteLength(html),renderer:'ai-cafe-website-v1',modelCalls:0};
}
export const jobRpc=(name,body)=>adminRest(`rpc/${name}`,{method:'POST',body,signal:AbortSignal.timeout(10000)});
export function publicJob(j){
 if(!j)return null;
 const {id,kind,status,attempts,created_at,updated_at,error,output}=j;
 return {id,kind,status,attempts,created_at,updated_at,error,output};
}
export async function executeOne({userId=null,jobId=null,rpc=jobRpc,render=buildDraft}={}){
 const rows=await rpc('ai_cafe_claim',{p_user:userId,p_id:jobId});
 const job=rows?.[0];
 if(!job)return {executed:false};
 let output;
 try{output=job.kind==='city-build-plan'?buildCityPlan(job.input):job.kind==='website-draft'?render(job.input):(()=>{throw Error('unsupported_kind')})()}catch{
  const saved=await rpc('ai_cafe_finish',{p_id:job.id,p_token:job.lease_token,p_output:null,p_error:'job_render_failed'});
  return {executed:true,id:job.id,completed:false,saved};
 }
 // A database/network failure leaves the lease to expire. It is never reported as completion.
 const saved=await rpc('ai_cafe_finish',{p_id:job.id,p_token:job.lease_token,p_output:output,p_error:null});
 return {executed:true,id:job.id,completed:saved===true};
}
