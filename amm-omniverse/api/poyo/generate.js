import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';

const POYO_SUBMIT='https://api.poyo.ai/api/generate/submit';
const ALLOWED_KEYS=new Set(['prompt','size','resolution','aspect_ratio','duration','generate_audio','seed','image_url','image_urls','video_url','video_urls','audio_url','upload_url','title','tags','negative_tags','instrumental','continue_at','mv','source_language','target_language','scale_factor','output_format','background_color','keep_audio','reference_image_url','reference_image_urls','strength','quality']);

function cleanInput(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return {};
  const out={};
  for(const [key,raw] of Object.entries(value)){
    if(!ALLOWED_KEYS.has(key)||raw===undefined||raw===null)continue;
    if(typeof raw==='string')out[key]=raw.slice(0,key==='prompt'?6000:2000);
    else if(typeof raw==='number'&&Number.isFinite(raw))out[key]=raw;
    else if(typeof raw==='boolean')out[key]=raw;
    else if(Array.isArray(raw))out[key]=raw.filter(v=>typeof v==='string').slice(0,8).map(v=>v.slice(0,2000));
  }
  return out;
}

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    const key=String(process.env.POYO_API_KEY||'').trim();
    if(!key)return json(res,503,{error:'poyo_provider_not_configured',message:'POYO_API_KEY is not configured in this deployment.'});
    const model=String(req.body?.model||'').trim().slice(0,120);
    const consent=Boolean(req.body?.consent);
    const input=cleanInput(req.body?.input);
    if(!model||!input.prompt&&Object.keys(input).length===0)return json(res,400,{error:'model_and_input_required'});
    if(!consent)return json(res,400,{error:'consent_required',message:'Confirm that uploaded/referenced people, voices, brands and media are yours or authorized for this generation.'});

    const response=await fetch(POYO_SUBMIT,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,input})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||Number(data?.code||200)>=400)return json(res,response.status||502,{error:'poyo_submit_failed',providerStatus:response.status,provider:data});
    return json(res,202,{ok:true,schema:'tryamm.poyo-generation.v1',ownerId:user.id,provider:'poyo.ai',model,task:data?.data||data});
  }catch(error){return json(res,error.status||500,{error:error.message||'poyo_generation_failed'});}
}
