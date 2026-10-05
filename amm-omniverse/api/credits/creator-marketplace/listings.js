import crypto from 'node:crypto'
import {adminRest,json} from '../../_lib/supabase-admin.js'
import {requireUser,audit} from '../../_lib/security.js'

const CATEGORIES=new Set(['lottie-gift','holo-gift-pack','stage-skin','sound-pack','rp-scene','animation-pack','crossverse-room','pocket-dimension-room','broadcast-graphics','creator-tool','world-skin'])
const clean=(v,max=500)=>String(v||'').trim().slice(0,max)

const publicListing=row=>({
 id:row.id,creatorUserId:row.creator_user_id,assetRegistryId:row.asset_registry_id,
 title:row.title,description:row.description,category:row.category,creditPriceUnits:Number(row.credit_price_units||0),
 state:row.state,licenseScope:row.license_scope,metadata:row.metadata||{},createdAt:row.created_at,updatedAt:row.updated_at
})

export default async function handler(req,res){
 const user=await requireUser(req,res);if(!user)return

 if(req.method==='GET'){
  const mine=String(req.query?.mine||'')==='1'
  try{
   const rows=await adminRest('tryamm_creator_credit_listings',{query:mine?{creator_user_id:'eq.'+user.id,order:'created_at.desc',limit:100}:{state:'eq.published',order:'created_at.desc',limit:100}})
   return json(res,200,{ok:true,listings:(rows||[]).map(publicListing),mode:mine?'creator':'market'})
  }catch(error){
   await audit(user.id,'creator_credit_listings_read_failed','medium',{error:String(error?.message||error)})
   return json(res,500,{error:'Unable to load creator credit listings'})
  }
 }

 if(req.method==='POST'){
  const assetRegistryId=clean(req.body?.assetRegistryId,80)
  const title=clean(req.body?.title,160)
  const description=clean(req.body?.description,1000)
  const category=clean(req.body?.category,80)
  const licenseScope=clean(req.body?.licenseScope,80)||'tryamm-worlds'
  const creditPriceUnits=Math.floor(Number(req.body?.creditPriceUnits||0))
  if(!assetRegistryId||title.length<2||!CATEGORIES.has(category)||creditPriceUnits<10||creditPriceUnits>100000){
   return json(res,400,{error:'Valid certified asset, title, category, and credit price (10–100000) are required'})
  }
  try{
   const assets=await adminRest('commerce_asset_registry',{query:{id:'eq.'+assetRegistryId,owner_user_id:'eq.'+user.id,limit:1}})
   const asset=assets?.[0]
   if(!asset)return json(res,404,{error:'Asset not found or not owned by this creator'})
   if(asset.provenance_status!=='verified'||asset.rights_status!=='verified'||asset.certification_status!=='verified'){
    return json(res,409,{state:'ASSET_REVIEW_REQUIRED',error:'Creator credit listings require verified provenance, rights, and certification'})
   }
   const rows=await adminRest('tryamm_creator_credit_listings',{method:'POST',body:{
    creator_user_id:user.id,asset_registry_id:asset.id,title,description,category,credit_price_units:creditPriceUnits,
    state:'published',license_scope:licenseScope,metadata:{assetKey:asset.asset_key,certified:true,payoutFromEarnedHolo:false,splitPolicy:'40-40-20-verified-play-net'}
   }})
   const listing=rows?.[0]
   if(!listing)throw new Error('creator_credit_listing_create_failed')
   await audit(user.id,'creator_credit_listing_published','info',{listingId:listing.id,assetRegistryId:asset.id,creditPriceUnits,category})
   return json(res,201,{ok:true,state:'PUBLISHED',listing:publicListing(listing)})
  }catch(error){
   await audit(user.id,'creator_credit_listing_create_failed','high',{assetRegistryId,error:String(error?.message||error)})
   return json(res,500,{error:'Unable to publish creator credit listing'})
  }
 }

 if(req.method==='PATCH'){
  const listingId=clean(req.body?.listingId,80)
  const state=clean(req.body?.state,20)
  if(!listingId||!['published','retired'].includes(state))return json(res,400,{error:'listingId and published/retired state are required'})
  try{
   const prior=await adminRest('tryamm_creator_credit_listings',{query:{id:'eq.'+listingId,creator_user_id:'eq.'+user.id,limit:1}})
   if(!prior?.[0])return json(res,404,{error:'Listing not found'})
   const rows=await adminRest('tryamm_creator_credit_listings',{method:'PATCH',query:{id:'eq.'+listingId,creator_user_id:'eq.'+user.id},body:{state,updated_at:new Date().toISOString()}})
   await audit(user.id,'creator_credit_listing_state_changed','info',{listingId,state})
   return json(res,200,{ok:true,listing:publicListing(rows?.[0]||prior[0])})
  }catch(error){
   return json(res,500,{error:'Unable to update creator credit listing'})
  }
 }

 return json(res,405,{error:'Method not allowed'})
}
