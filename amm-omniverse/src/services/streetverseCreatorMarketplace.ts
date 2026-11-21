import {getSupabaseClient} from './supabaseClient'
import type {ModDraft} from '../runtime/StreetVerseCreatorProgram'

/** Persistent creator listings. Supabase RLS must be deployed before use.
 * The browser can submit pending items, but must never approve its own content.
 */
export type CreatorListing={
 id:string;creator_user_id:string;category:ModDraft['category'];title:string;
 description:string;asset_path:string;license:ModDraft['license'];
 rights_confirmed:boolean;triangle_count:number;texture_bytes:number;
 reward_credits:number;price_credits:number;status:'pending'|'approved'|'rejected';
 reviewer_user_id?:string|null;review_notes?:string|null;created_at?:string;updated_at?:string
}
const TABLE='streetverse_creator_listings'
export async function creatorMarketplaceAvailable(){
 const sb=getSupabaseClient()
 if(!sb)return false
 const {data:{user},error}=await sb.auth.getUser()
 return !error&&!!user
}
export async function submitPersistentCreatorListing(draft:ModDraft){
 const sb=getSupabaseClient()
 if(!sb)throw new Error('Persistent creator marketplace is not configured; the demo remains available.')
 const {data:{user},error:authError}=await sb.auth.getUser()
 if(authError||!user)throw new Error('Sign in before submitting an original creator mod.')
 const payload={
  id:`${user.id.slice(0,8)}-${crypto.randomUUID()}`,creator_user_id:user.id,category:draft.category,title:draft.title,
  description:draft.description,asset_path:draft.assetPath,license:draft.license,
  rights_confirmed:draft.rightsConfirmed,triangle_count:draft.triangleCount,
  texture_bytes:draft.textureBytes,reward_credits:draft.rewardCredits,price_credits:draft.priceCredits,
  status:'pending' as const
 }
 const {data,error}=await sb.from(TABLE).insert(payload).select('id,status,title').single()
 if(error)throw new Error('Submission not saved: '+error.message)
 return data as Pick<CreatorListing,'id'|'status'|'title'>
}
export async function listMyCreatorSubmissions(){
 const sb=getSupabaseClient()
 if(!sb)return []
 const {data:{user},error:authError}=await sb.auth.getUser()
 if(authError||!user)return []
 const {data,error}=await sb.from(TABLE).select('id,title,status,price_credits,created_at').eq('creator_user_id',user.id).order('created_at',{ascending:false}).limit(100)
 if(error)throw new Error('Unable to load submissions: '+error.message)
 return data??[]
}
export async function listApprovedCreatorListings(){
 const sb=getSupabaseClient()
 if(!sb)return []
 const {data,error}=await sb.from(TABLE).select('id,title,category,asset_path,license,price_credits,creator_user_id').eq('status','approved').order('created_at',{ascending:false}).limit(100)
 if(error)throw new Error('Unable to load approved mods: '+error.message)
 return data??[]
}
/** Moderator authority is enforced by database policies, never by the UI. */
export async function reviewPersistentCreatorListing(id:string,decision:'approved'|'rejected',notes:string){
 if(!notes.trim())throw new Error('Document the review decision.')
 const sb=getSupabaseClient()
 if(!sb)throw new Error('Creator marketplace unavailable')
 const {data:{user},error:authError}=await sb.auth.getUser()
 if(authError||!user)throw new Error('Moderator sign-in required')
 const {data,error}=await sb.from(TABLE).update({status:decision,reviewer_user_id:user.id,review_notes:notes}).eq('id',id).eq('status','pending').select('id,status').single()
 if(error)throw new Error('Review was not authorized or could not be saved: '+error.message)
 return data
}
