import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'
import {hasTemplateAuthority,validateTemplateListing,publicTemplate,CUSTOM_TEMPLATE_ID} from '../_lib/template-listing.js'
const TABLE='tryamm_website_templates'
export function createTemplateCatalogHandler({rest=adminRest,userFor=requireUser,ownerFor=hasTemplateAuthority}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(!['GET','POST','PATCH'].includes(req.method))return json(res,405,{error:'Method not allowed'})
  try{
   const manage=String(req.query?.manage||'')==='1'||req.method!=='GET'
   let user
   if(manage){user=await userFor(req,res);if(!user)return;if(!ownerFor(user))return json(res,403,{ok:false,error:'An authorized template-owner account is required to save or publish listings.'})}
   if(req.method==='GET'){
    const rows=await rest(TABLE,{query:{...(manage?{}:{status:'eq.published'}),order:'created_at.asc',limit:200}})
    const templates=(rows||[]).map(row=>{const t=publicTemplate(row);return t?(manage?{...t,status:row.status,rightsConfirmed:row.rights_confirmed}:t):null}).filter(Boolean)
    return json(res,200,{ok:true,templates,...(manage?{canPublish:true}:{}),checkoutEnabled:false})
   }
   const body=req.body
   if(!body||typeof body!=='object'||JSON.stringify(body).length>16000)return json(res,400,{error:'The listing must be smaller than 16 KB.'})
   const validation=validateTemplateListing(body.listing)
   if(!validation.ok)return json(res,400,{error:validation.error})
   const listing=validation.data,id=listing.id,status=body.status
   if(!CUSTOM_TEMPLATE_ID.test(id)||!['draft','published','archived'].includes(status))return json(res,400,{error:'Choose draft, published or archived.'})
   if(status==='published'&&(body.rightsConfirmed!==true||body.demoReviewed!==true))return json(res,400,{error:'Review the current demo and confirm your rights to sell the supplied content before publishing.'})
   const common={data:listing,status,rights_confirmed:body.rightsConfirmed===true,updated_at:new Date().toISOString(),updated_by:user.id}
   let row
   if(req.method==='POST'){
    if(body.expectedRevision!==0)return json(res,409,{error:'A new listing must start at revision zero.'})
    try{row=(await rest(TABLE,{method:'POST',body:{...common,id,owner_user_id:user.id,revision:1}}))?.[0]}
    catch(error){if(error?.details?.code==='23505')return json(res,409,{error:'This listing already exists. Reload your saved listings before editing.'});throw error}
   }else{
    if(!Number.isSafeInteger(body.expectedRevision)||body.expectedRevision<1)return json(res,400,{error:'The saved listing revision is required.'})
    row=(await rest(TABLE,{method:'PATCH',query:{id:'eq.'+id,revision:'eq.'+body.expectedRevision},body:{...common,revision:body.expectedRevision+1}}))?.[0]
    if(!row)return json(res,409,{error:'The listing changed or no longer exists. Reload it before saving so another edit is not overwritten.'})
   }
   const saved=row&&publicTemplate(row)
   if(!saved)throw new Error('listing_not_confirmed')
   return json(res,req.method==='POST'?201:200,{ok:true,template:{...saved,status:row.status,rightsConfirmed:row.rights_confirmed},checkoutEnabled:false})
  }catch{return json(res,503,{ok:false,error:'Template storage is unavailable. Keep your downloaded draft. A save or publication has not been confirmed; reload saved listings before retrying.'})}
 }
}
export default createTemplateCatalogHandler()
