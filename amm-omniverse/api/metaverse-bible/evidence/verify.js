import crypto from 'node:crypto'
import {adminRest,json} from '../../_lib/supabase-admin.js'

function internalAuthorized(req){
 const expected=String(process.env.TRYAMM_WORLD_EVIDENCE_SECRET||process.env.TRYAMM_WORLD_PUBLISH_SECRET||process.env.TRYAMM_INTERNAL_COMPLIANCE_SECRET||'')
 const supplied=String(req.headers['x-tryamm-evidence-secret']||req.headers['x-tryamm-world-secret']||req.headers['x-tryamm-compliance-secret']||'')
 if(!expected||!supplied)return false
 const a=Buffer.from(expected),b=Buffer.from(supplied)
 return a.length===b.length&&crypto.timingSafeEqual(a,b)
}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
 if(!internalAuthorized(req))return json(res,403,{error:'Internal world-evidence authorization required'})
 const ids=Array.isArray(req.body?.evidenceIds)?req.body.evidenceIds.map(String).filter(Boolean).slice(0,100):[]
 const action=String(req.body?.action||'verify')
 const reference=String(req.body?.reference||'').trim().slice(0,500)
 const reviewedBy=String(req.body?.reviewedBy||'internal-release-guardian').trim().slice(0,160)
 if(!ids.length||!['verify','reject'].includes(action)||!reference)return json(res,400,{error:'evidenceIds, reference and verify/reject action are required'})
 try{
  const state=action==='verify'?'verified':'rejected'
  const out=[]
  for(const id of ids){
   const rows=await adminRest('tryamm_bible_world_evidence',{method:'PATCH',query:{id:'eq.'+id},body:{
    state,verified_at:new Date().toISOString(),verified_by:reviewedBy,updated_at:new Date().toISOString(),
    notes:'verification:'+reference
   }})
   if(rows?.[0])out.push(rows[0])
  }
  return json(res,200,{ok:true,state:state.toUpperCase(),count:out.length,evidence:out})
 }catch(error){
  return json(res,500,{error:String(error?.message||'Unable to verify Bible world evidence')})
 }
}
