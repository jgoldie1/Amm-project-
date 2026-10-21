import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'
import {hasSupportAuthority} from '../_lib/support-authority.js'
const CATEGORIES=new Set(['website-setup','technical','accessibility','billing','other'])
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const clean=(v,n)=>String(v||'').trim().slice(0,n)
const visible=row=>({id:row.id,reference:'TRY-'+row.id,subject:row.subject,category:row.category,status:row.status,createdAt:row.created_at,reply:row.public_reply||'',updatedAt:row.updated_at})
export function createTicketHandler({rest=adminRest,userFor=requireUser,enabled=()=>process.env.TRYAMM_SUPPORT_TICKETS_ENABLED==='true',operatorFor=hasSupportAuthority}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(!['GET','POST','PATCH'].includes(req.method))return json(res,405,{error:'Method not allowed'})
  if(!enabled())return json(res,503,{ok:false,state:'NOT_ACTIVATED',error:'Ticket storage and the operator console are installed. An authorized operator account and end-to-end verification are still required. Your draft has not been submitted.'})
  try{
   const user=await userFor(req,res);if(!user)return
   if(req.method==='PATCH'){
    if(!operatorFor(user))return json(res,403,{error:'Support operator access required.'})
    const id=clean(req.body?.ticketId,80),status=clean(req.body?.status,40),reply=clean(req.body?.reply,5000)
    if(!UUID.test(id)||!['open','in_review','waiting_customer','resolved'].includes(status))return json(res,400,{error:'A valid ticket ID and status are required.'})
    const rows=await rest('tryamm_support_tickets',{method:'PATCH',query:{id:'eq.'+id},body:{status,public_reply:reply,updated_at:new Date().toISOString(),updated_by:user.id}})
    if(!rows?.[0])return json(res,404,{error:'Ticket not found.'})
    return json(res,200,{ok:true,ticket:visible(rows[0])})
   }
   if(req.method==='GET'){
    const queue=String(req.query?.queue||'')==='1'
    if(queue&&!operatorFor(user))return json(res,403,{error:'Support operator access required.'})
    const rows=await rest('tryamm_support_tickets',{query:{...(queue?{}:{user_id:'eq.'+user.id}),order:'created_at.desc',limit:50}})
    return json(res,200,{ok:true,tickets:(rows||[]).map(row=>queue?{...visible(row),description:row.description}:visible(row))})
   }
   const requestId=clean(req.body?.requestId,80),subject=clean(req.body?.subject,160),description=clean(req.body?.description,5000),category=clean(req.body?.category,40)
   if(!UUID.test(requestId)||subject.length<3||description.length<10||!CATEGORIES.has(category))return json(res,400,{error:'A valid request ID, category, subject and description are required.'})
   const query={user_id:'eq.'+user.id,client_request_id:'eq.'+requestId,limit:1}
   const same=row=>row.subject===subject&&row.description===description&&row.category===category
   const existing=(await rest('tryamm_support_tickets',{query}))?.[0]
   if(existing)return same(existing)?json(res,200,{ok:true,ticket:visible(existing),replayed:true}):json(res,409,{error:'This request ID already belongs to a different ticket. Start a new ticket.'})
   let row
   try{row=(await rest('tryamm_support_tickets',{method:'POST',body:{user_id:user.id,client_request_id:requestId,subject,description,category,status:'open'}}))?.[0]}
   catch(error){
    if(error?.details?.code!=='23505')throw error
    row=(await rest('tryamm_support_tickets',{query}))?.[0]
    if(!row||!same(row))return json(res,409,{error:'Ticket request conflict. Refresh your ticket history before retrying.'})
   }
   if(!row)throw new Error('ticket_not_saved')
   return json(res,201,{ok:true,ticket:visible(row)})
  }catch{return json(res,503,{ok:false,error:'Ticket service is unavailable. Keep your draft and retry with the same request ID; it may already have been received.'})}
 }
}
export default createTicketHandler()
