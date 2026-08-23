import{adminRest,json}from'../_lib/supabase-admin.js';
const LEVELS=['identity','evidence','tryamm_authenticated','authoritative'];
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
 try{
  const b=req.body||{};const ownerUserId=String(b.ownerUserId||'').trim();const category=String(b.category||'').trim();const title=String(b.title||'').trim();
  if(!ownerUserId||!category||!title)return json(res,400,{error:'ownerUserId_category_title_required'});
  const serial=String(b.serialOrIdentifier||'').trim().slice(0,180)||null;
  const evidence=Array.isArray(b.evidenceRefs)?b.evidenceRefs.filter(x=>typeof x==='string').slice(0,30):[];
  const row={owner_user_id:ownerUserId,asset_type:'product',category,title,brand:String(b.brand||'').slice(0,120)||null,model:String(b.model||'').slice(0,160)||null,serial_or_identifier:serial,verification_level:'identity',verification_status:'pending',risk_score:null,evidence_refs:evidence,condition_report:b.conditionReport&&typeof b.conditionReport==='object'?b.conditionReport:{},metadata:{source:'tryamm_omnipassport',requestedLevel:LEVELS.includes(b.requestedLevel)?b.requestedLevel:'evidence'},created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const data=await adminRest('omni_passports',{method:'POST',body:row});
  return json(res,201,{passport:data?.[0]||data,note:'AI/photo analysis is triage only. TRYAMM Authenticated and Authoritative badges require the corresponding human/partner/manufacturer evidence.'});
 }catch(e){return json(res,e.status||503,{error:e.message||'product_verification_intake_failed'})}
}
