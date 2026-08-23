import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

function sb(){const c=getSupabaseClient();if(!c)throw new Error('Supabase not configured');return c}
async function uid(){const id=await getAuthenticatedUserId();if(!id)throw new Error('Authentication required');return id}

export interface PressPublication { id:string; title:string; format:string; status:string; editorial_status:string; source_verification_status:string; edition:string; metadata:Record<string,unknown> }
export interface EditorialTask { id:string; publication_id:string; task_type:string; status:string; notes:string }
export interface PublicationRight { id:string; publication_id:string; rights_scope:string; territories:string[]; formats:string[]; adaptation_allowed:boolean; agreement_status:string }
export interface CafeMenuItem { id:string; cafe_id:string; item_key:string; name:string; category:string; description:string; price:number; active:boolean }
export interface PrintProvider { id:string; provider_key:string; name:string; ownership_tags:string[]; capabilities:string[]; website:string|null; fulfillment:boolean; pod:boolean; api_available:boolean; verification_status:string; notes:string }
export interface PrintEdition { id:string; publication_id:string; owner_id:string; trim_size:string; binding:string; paper:string; interior_color:string; bleed_mm:number; page_count:number|null; isbn:string|null; barcode_value:string|null; preflight_status:string; proof_status:string; provider_status:string }

export async function listMyPublications():Promise<PressPublication[]>{
  const id=await uid();const {data,error}=await sb().from('publications').select('*').eq('owner_id',id).order('updated_at',{ascending:false});if(error)throw error;return (data??[]) as PressPublication[]
}
export async function ensurePressWorkflow(publication:PressPublication){
  const id=await uid()
  const tasks=['developmental-edit','copy-edit','source-check','rights-review','accessibility','translation','formatting']
  const existing=await sb().from('editorial_tasks').select('*').eq('publication_id',publication.id).eq('owner_id',id)
  if(existing.error)throw existing.error
  if(!(existing.data??[]).length){const rows=tasks.map(task_type=>({publication_id:publication.id,owner_id:id,task_type,status:'todo'}));const ins=await sb().from('editorial_tasks').insert(rows);if(ins.error)throw ins.error}
  const right=await sb().from('publication_rights').select('*').eq('publication_id',publication.id).eq('owner_id',id).maybeSingle();if(right.error)throw right.error
  if(!right.data){const ins=await sb().from('publication_rights').insert({publication_id:publication.id,owner_id:id,rights_scope:'creator-owned',territories:['worldwide'],formats:[publication.format],adaptation_allowed:false,agreement_status:'draft'});if(ins.error)throw ins.error}
  return getPressWorkflow(publication.id)
}
export async function getPressWorkflow(publicationId:string){const id=await uid();const [tasks,rights]=await Promise.all([sb().from('editorial_tasks').select('*').eq('publication_id',publicationId).eq('owner_id',id).order('created_at'),sb().from('publication_rights').select('*').eq('publication_id',publicationId).eq('owner_id',id).maybeSingle()]);if(tasks.error)throw tasks.error;if(rights.error)throw rights.error;return {tasks:(tasks.data??[]) as EditorialTask[],rights:rights.data as PublicationRight|null}}
export async function completeEditorialTask(taskId:string){const id=await uid();const {data,error}=await sb().from('editorial_tasks').update({status:'complete',completed_at:new Date().toISOString()}).eq('id',taskId).eq('owner_id',id).select('*').single();if(error)throw error;return data as EditorialTask}
export async function updatePublicationRights(rightsId:string,adaptationAllowed:boolean,formats:string[]){const id=await uid();const {data,error}=await sb().from('publication_rights').update({adaptation_allowed:adaptationAllowed,formats,agreement_status:'accepted',updated_at:new Date().toISOString()}).eq('id',rightsId).eq('owner_id',id).select('*').single();if(error)throw error;return data as PublicationRight}
export async function scheduleAuthorEvent(publicationId:string,title:string){const id=await uid();const starts=new Date(Date.now()+7*24*3600*1000).toISOString();const {data,error}=await sb().from('author_events').insert({publication_id:publicationId,owner_id:id,event_type:'reading',title,venue_type:'hybrid',starts_at:starts,metadata:{broadcast:'tryamm',venue:'ai-cafe/living-world'}}).select('*').single();if(error)throw error;return data}

export async function listPrintProviders():Promise<PrintProvider[]>{const {data,error}=await sb().from('print_providers').select('*').neq('verification_status','disabled');if(error)throw error;return ((data??[]) as PrintProvider[]).sort((a,b)=>{const ap=a.ownership_tags?.includes('black-owned')?0:1,bp=b.ownership_tags?.includes('black-owned')?0:1;return ap-bp||a.name.localeCompare(b.name)})}
export async function ensurePrintEdition(publicationId:string):Promise<PrintEdition>{const id=await uid();const existing=await sb().from('print_editions').select('*').eq('publication_id',publicationId).eq('owner_id',id).maybeSingle();if(existing.error)throw existing.error;if(existing.data)return existing.data as PrintEdition;const {data,error}=await sb().from('print_editions').insert({publication_id:publicationId,owner_id:id}).select('*').single();if(error)throw error;return data as PrintEdition}
export async function createPrintQuoteRequest(editionId:string,providerKeys:string[],quantity=25){const id=await uid();const {data,error}=await sb().from('print_quote_requests').insert({edition_id:editionId,owner_id:id,quantity,requested_provider_keys:providerKeys,status:'draft'}).select('*').single();if(error)throw error;return data}

export async function getCafeMenu():Promise<CafeMenuItem[]>{const {data,error}=await sb().from('cafe_menu_items').select('*').eq('active',true).order('category').order('name');if(error)throw error;return (data??[]) as CafeMenuItem[]}
export async function placeSimulatedCafeOrder(cafeId:string,items:CafeMenuItem[]){const id=await uid();const subtotal=items.reduce((n,x)=>n+Number(x.price),0);const {data,error}=await sb().from('cafe_orders').insert({user_id:id,cafe_id:cafeId,status:'placed',items:items.map(x=>({id:x.id,item_key:x.item_key,name:x.name,price:x.price})),subtotal,simulation:true}).select('*').single();if(error)throw error;return data}
export async function advanceCafeOrder(orderId:string,status:'preparing'|'ready'|'completed'){const id=await uid();const {data,error}=await sb().from('cafe_orders').update({status,completed_at:status==='completed'?new Date().toISOString():null}).eq('id',orderId).eq('user_id',id).select('*').single();if(error)throw error;return data}
