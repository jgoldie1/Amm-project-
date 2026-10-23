import {createHash} from 'node:crypto';
const ID=/^[a-z]{2}-[a-z]{2,3}-[a-z0-9-]{2,60}$/;
const phases=['assets','geometry','living-city','commerce','broadcast','travel','certification'];
export function normalizeCityBuild(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('invalid_input');
 const cityId=String(input.cityId||'');
 if(!ID.test(cityId))throw Error('invalid_input');
 const district=String(input.district||'Downtown').trim();
 if(!district||district.length>90||/[<>]/.test(district))throw Error('invalid_input');
 if(input.allowPaidGeneration===true||input.publish===true)throw Error('approval_required');
 return {cityId,district,mode:'preview-only',allowPaidGeneration:false,publish:false};
}
export function validateCityAssets(assets){
 if(!Array.isArray(assets)||assets.length>60)throw Error('invalid_assets');
 return assets.map(a=>{
  if(!a||typeof a!=='object')throw Error('invalid_assets');
  const {name,license,sourceUrl,triangleCount,textureMaxPx,bytes}=a;
  if(typeof name!=='string'||!/^[-\w .]{1,100}$/.test(name))throw Error('invalid_assets');
  if(!['CC0','CC-BY-4.0','owned','licensed'].includes(license)||typeof sourceUrl!=='string'||!/^https:\/\//.test(sourceUrl)||sourceUrl.length>600)throw Error('unverified_rights');
  for(const v of [triangleCount,textureMaxPx,bytes])if(!Number.isSafeInteger(v)||v<0)throw Error('invalid_assets');
  if(triangleCount>50000||textureMaxPx>2048||bytes>12*1024*1024)throw Error('mobile_budget_exceeded');
  return {name,license,sourceUrl,triangleCount,textureMaxPx,bytes,validated:'metadata-only'};
 });
}
export function buildCityPlan(input){
 const d=normalizeCityBuild(input);const assets=validateCityAssets(input.assets||[]);
 const plan={...d,assets,phases:phases.map((name,i)=>({order:i+1,name,status:'pending',evidenceRequired:true})),release:{rendererConnected:false,passportVerified:false,qaPassed:false,ownerApproved:false,playable:false},note:'Validated deterministic build plan, not generated 3D assets or executable city'};
 return {plan,sha256:createHash('sha256').update(JSON.stringify(plan)).digest('hex'),renderer:'ai-cafe-city-plan-v1',modelCalls:0,externalCostUsd:0};
}
