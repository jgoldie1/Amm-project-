import crypto from 'node:crypto';
import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser,audit} from '../_lib/security.js';

const STATUS=new Set(['pending','verified','rejected']);
const safeKey=value=>{
  const v=String(value||'').trim().toLowerCase();
  return /^[a-z0-9][a-z0-9_-]{2,95}$/.test(v)?v:'asset-'+crypto.randomUUID();
};
const trim=(value,max=500)=>String(value||'').trim().slice(0,max);
const publicAsset=row=>({
  id:row.id,
  assetKey:row.asset_key,
  title:row.title,
  sourceUri:row.source_uri||null,
  provenanceStatus:row.provenance_status,
  rightsStatus:row.rights_status,
  certificationStatus:row.certification_status,
  reviewReference:row.review_reference||null,
  metadata:row.metadata||{},
  createdAt:row.created_at,
  updatedAt:row.updated_at,
});

function internalAuthorized(req){
  const expected=String(process.env.TRYAMM_INTERNAL_COMPLIANCE_SECRET||'');
  const supplied=String(req.headers['x-tryamm-compliance-secret']||'');
  if(!expected||!supplied)return false;
  const a=Buffer.from(expected),b=Buffer.from(supplied);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}

export default async function handler(req,res){
  if(req.method==='GET'){
    const user=await requireUser(req,res);if(!user)return;
    try{
      const rows=await adminRest('commerce_asset_registry',{query:{owner_user_id:'eq.'+user.id,order:'created_at.desc',limit:100}});
      return json(res,200,{ok:true,assets:(rows||[]).map(publicAsset)});
    }catch(error){
      await audit(user.id,'commerce_asset_registry_read_failed','high',{error:String(error?.message||error)});
      return json(res,500,{error:'Unable to load asset registry'});
    }
  }

  if(req.method==='POST'){
    const user=await requireUser(req,res);if(!user)return;
    const title=trim(req.body?.title,160);
    const sourceUri=trim(req.body?.sourceUri,1000)||null;
    const assetKey=safeKey(req.body?.assetKey);
    const licenseScope=trim(req.body?.licenseScope,80)||'tryamm-worlds';
    const notes=trim(req.body?.notes,1000);
    if(title.length<2)return json(res,400,{error:'Asset title is required'});
    try{
      const prior=await adminRest('commerce_asset_registry',{query:{asset_key:'eq.'+assetKey,limit:1}});
      if(prior?.[0])return json(res,409,{error:'Asset key already exists'});
      const rows=await adminRest('commerce_asset_registry',{method:'POST',body:{
        owner_user_id:user.id,
        asset_key:assetKey,
        title,
        source_uri:sourceUri,
        provenance_status:'pending',
        rights_status:'pending',
        certification_status:'pending',
        metadata:{licenseScope,notes,submittedBy:user.id,submissionVersion:1},
      }});
      const asset=rows?.[0];
      if(!asset)throw new Error('asset_registry_create_failed');
      await audit(user.id,'commerce_asset_registered','info',{assetId:asset.id,assetKey});
      return json(res,201,{ok:true,state:'ASSET_REVIEW_PENDING',asset:publicAsset(asset),message:'Asset registered. Publishing remains blocked until provenance, rights, and certification are verified by TRYAMM.'});
    }catch(error){
      await audit(user.id,'commerce_asset_registry_create_failed','high',{assetKey,error:String(error?.message||error)});
      return json(res,500,{error:'Unable to register asset'});
    }
  }

  if(req.method==='PATCH'){
    if(!process.env.TRYAMM_INTERNAL_COMPLIANCE_SECRET)return json(res,503,{error:'Compliance review service is not configured'});
    if(!internalAuthorized(req))return json(res,403,{error:'Compliance authorization required'});
    const assetId=trim(req.body?.assetId,80);
    const provenanceStatus=trim(req.body?.provenanceStatus,20);
    const rightsStatus=trim(req.body?.rightsStatus,20);
    const certificationStatus=trim(req.body?.certificationStatus,20);
    const reviewReference=trim(req.body?.reviewReference,240);
    if(!assetId)return json(res,400,{error:'assetId is required'});
    if(!STATUS.has(provenanceStatus)||!STATUS.has(rightsStatus)||!STATUS.has(certificationStatus)){
      return json(res,400,{error:'Invalid review status'});
    }
    if(!reviewReference)return json(res,400,{error:'reviewReference is required'});
    try{
      const rows=await adminRest('commerce_asset_registry',{method:'PATCH',query:{id:'eq.'+assetId},body:{
        provenance_status:provenanceStatus,
        rights_status:rightsStatus,
        certification_status:certificationStatus,
        review_reference:reviewReference,
        updated_at:new Date().toISOString(),
      }});
      const asset=rows?.[0];
      if(!asset)return json(res,404,{error:'Asset not found'});
      await audit(asset.owner_user_id,'commerce_asset_reviewed','info',{assetId,provenanceStatus,rightsStatus,certificationStatus,reviewReference});
      return json(res,200,{ok:true,asset:publicAsset(asset)});
    }catch{
      return json(res,500,{error:'Unable to update asset review'});
    }
  }

  return json(res,405,{error:'Method not allowed'});
}
