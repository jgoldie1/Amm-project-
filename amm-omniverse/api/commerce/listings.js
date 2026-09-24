import crypto from 'node:crypto';
import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser,audit} from '../_lib/security.js';

const trim=(value,max=500)=>String(value||'').trim().slice(0,max);
const priceNumber=value=>{
  const n=Number(value);
  return Number.isFinite(n)?Math.round(n*100)/100:NaN;
};
const verifiedAsset=row=>row&&row.provenance_status==='verified'&&row.rights_status==='verified'&&row.certification_status==='verified';

function internalAuthorized(req){
  const expected=String(process.env.TRYAMM_INTERNAL_COMPLIANCE_SECRET||'');
  const supplied=String(req.headers['x-tryamm-compliance-secret']||'');
  if(!expected||!supplied)return false;
  const a=Buffer.from(expected),b=Buffer.from(supplied);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}

const publicListing=row=>({
  id:row.id,
  title:row.title,
  description:row.description||'',
  currency:String(row.currency||'USD').toUpperCase(),
  price:Number(row.price||0),
  status:row.status,
  listingType:row.listing_type,
  sku:row.sku||null,
  media:Array.isArray(row.media)?row.media:[],
  attributes:row.attributes||{},
  fulfillment:row.fulfillment||{},
  createdAt:row.created_at,
  updatedAt:row.updated_at,
});

async function loadOwnedAsset(assetRegistryId,userId){
  const rows=await adminRest('commerce_asset_registry',{query:{id:'eq.'+assetRegistryId,owner_user_id:'eq.'+userId,limit:1}});
  return rows?.[0]||null;
}

export default async function handler(req,res){
  if(req.method==='GET'){
    const mine=String(req.query?.mine||'')==='1';
    try{
      if(mine){
        const user=await requireUser(req,res);if(!user)return;
        const rows=await adminRest('commerce_listings',{query:{seller_user_id:'eq.'+user.id,order:'updated_at.desc',limit:100}});
        return json(res,200,{ok:true,listings:(rows||[]).map(publicListing)});
      }
      const rows=await adminRest('commerce_listings',{query:{status:'eq.published',order:'updated_at.desc',limit:100}});
      const safe=(rows||[]).filter(row=>row?.safety_flags?.blocked!==true);
      return json(res,200,{ok:true,listings:safe.map(publicListing)});
    }catch{
      return json(res,500,{error:'Unable to load listings'});
    }
  }

  if(req.method==='POST'){
    const user=await requireUser(req,res);if(!user)return;
    const kind=trim(req.body?.kind,24);
    if(kind!=='asset')return json(res,400,{error:'This release accepts certified digital asset listings only'});
    const assetRegistryId=trim(req.body?.assetRegistryId,80);
    const title=trim(req.body?.title,160);
    const description=trim(req.body?.description,2000);
    const licenseScope=trim(req.body?.licenseScope,80)||'tryamm-worlds';
    const price=priceNumber(req.body?.price);
    if(!assetRegistryId||!title)return json(res,400,{error:'assetRegistryId and title are required'});
    if(!Number.isFinite(price)||price<1||price>5000)return json(res,400,{error:'Asset price must be between $1 and $5,000'});
    try{
      const asset=await loadOwnedAsset(assetRegistryId,user.id);
      if(!asset)return json(res,404,{error:'Asset registry record not found'});
      if(!verifiedAsset(asset))return json(res,423,{ok:false,state:'ASSET_NOT_CERTIFIED',assetId:asset.id,message:'Publishing is blocked until provenance, rights, and certification are all verified.'});
      const rows=await adminRest('commerce_listings',{method:'POST',body:{
        seller_user_id:user.id,
        title,
        description,
        listing_type:'fixed',
        status:'review',
        currency:'USD',
        price,
        quantity_available:null,
        sku:('ASSET-'+asset.asset_key).slice(0,120),
        media:asset.source_uri?[{type:'asset',url:asset.source_uri}]:[],
        attributes:{
          commerceKind:'asset',
          assetRegistryId:asset.id,
          assetKey:asset.asset_key,
          licenseScope,
          rightsReviewReference:asset.review_reference,
          revenueSplit:{sellerBasisPoints:4000,platformBasisPoints:4000,reserveBasisPoints:2000},
        },
        fulfillment:{type:'digital',delivery:'entitlement'},
        safety_flags:{blocked:false,rightsVerified:true,certified:true},
      }});
      const listing=rows?.[0];
      if(!listing)throw new Error('listing_create_failed');
      await audit(user.id,'commerce_asset_listing_submitted','info',{listingId:listing.id,assetId:asset.id,price});
      return json(res,201,{ok:true,state:'LISTING_REVIEW',listing:publicListing(listing),message:'Listing is server-priced and held in review until publication approval.'});
    }catch(error){
      await audit(user.id,'commerce_asset_listing_create_failed','high',{assetRegistryId,error:String(error?.message||error)});
      return json(res,500,{error:'Unable to create asset listing'});
    }
  }

  if(req.method==='PATCH'){
    if(!process.env.TRYAMM_INTERNAL_COMPLIANCE_SECRET)return json(res,503,{error:'Compliance review service is not configured'});
    if(!internalAuthorized(req))return json(res,403,{error:'Compliance authorization required'});
    const listingId=trim(req.body?.listingId,80);
    const status=trim(req.body?.status,20);
    if(!listingId||!['published','suspended','retired'].includes(status))return json(res,400,{error:'listingId and a valid status are required'});
    try{
      const rows=await adminRest('commerce_listings',{query:{id:'eq.'+listingId,limit:1}});
      const listing=rows?.[0];if(!listing)return json(res,404,{error:'Listing not found'});
      if(status==='published'){
        const assetRegistryId=String(listing?.attributes?.assetRegistryId||'');
        const assets=await adminRest('commerce_asset_registry',{query:{id:'eq.'+assetRegistryId,owner_user_id:'eq.'+listing.seller_user_id,limit:1}});
        if(!verifiedAsset(assets?.[0]))return json(res,423,{error:'Asset certification is no longer valid'});
      }
      const updated=await adminRest('commerce_listings',{method:'PATCH',query:{id:'eq.'+listingId},body:{status,updated_at:new Date().toISOString()}});
      return json(res,200,{ok:true,listing:publicListing(updated?.[0]||listing)});
    }catch{
      return json(res,500,{error:'Unable to update listing status'});
    }
  }

  return json(res,405,{error:'Method not allowed'});
}
