import { getSupabaseClient } from './supabaseClient'

export type ExternalPlatform='tiktok'|'bigo'|'twitch'|'youtube'|'instagram'|'facebook'|'kick'|'other'
export type AgencyRole='owner'|'manager'|'recruiter'|'coach'|'creator'|'moderator'|'analyst'

function sb(){const client=getSupabaseClient();if(!client)throw new Error('Supabase is not configured');return client}
async function currentUser(){const client=sb();const {data:{user}}=await client.auth.getUser();if(!user)throw new Error('Sign in is required');return user}
export function normalizeInviteCode(code:string){return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,40)}
export function slugifyAgency(name:string){return name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)}

export async function createAgency(input:{name:string;markets?:string[];specialties?:string[]}){
 const client=sb(),user=await currentUser(),slug=slugifyAgency(input.name);if(!slug)throw new Error('Agency name is required')
 const {data,error}=await client.from('tryamm_agencies').insert({owner_user_id:user.id,name:input.name.trim().slice(0,100),slug,markets:(input.markets||[]).slice(0,20),specialties:(input.specialties||[]).slice(0,20),status:'pending',priority_lane:false}).select().single();if(error)throw error
 const {error:memberError}=await client.from('tryamm_agency_memberships').insert({agency_id:data.id,user_id:user.id,role:'owner',status:'active'});if(memberError)throw memberError
 return data
}

export async function generateAgencyInvite(input:{agencyId?:string;code:string;source:ExternalPlatform;campaign?:string;maxUses?:number|null}){
 const client=sb(),user=await currentUser(),code=normalizeInviteCode(input.code);if(code.length<4)throw new Error('Invite code must be at least 4 characters')
 const {data,error}=await client.from('tryamm_creator_invites').insert({agency_id:input.agencyId||null,inviter_user_id:user.id,code,source_platform:input.source,campaign:input.campaign?.trim().slice(0,100)||null,max_uses:input.maxUses??null}).select().single();if(error)throw error;return data
}

export async function acceptInvite(input:{code:string}){
 const client=sb();await currentUser();const code=normalizeInviteCode(input.code);if(!code)throw new Error('Invite code is required')
 const {data,error}=await client.rpc('redeem_creator_invite',{p_code:code});if(error){const m=String(error.message||error);if(m.includes('INVITE_NOT_FOUND'))throw new Error('Invite code was not found or is inactive');if(m.includes('INVITE_EXPIRED'))throw new Error('Invite code has expired');if(m.includes('INVITE_LIMIT_REACHED'))throw new Error('Invite code has reached its usage limit');if(m.includes('ATTRIBUTION_ALREADY_LOCKED'))throw new Error('Your first-touch creator attribution is already locked');throw error}
 return Array.isArray(data)?data[0]:data
}

export async function redeemFounderPriorityInvite(codeInput:string){
 const client=sb();await currentUser();const code=normalizeInviteCode(codeInput);if(!code)throw new Error('Founder priority code is required')
 const {data,error}=await client.rpc('redeem_founder_priority_invite',{p_code:code});if(error){const m=String(error.message||error);if(m.includes('PRIORITY_INVITE_NOT_FOUND'))throw new Error('Founder priority code was not found or is inactive');if(m.includes('PRIORITY_INVITE_EXPIRED'))throw new Error('Founder priority code has expired');if(m.includes('PRIORITY_INVITE_LIMIT_REACHED'))throw new Error('Founder priority code has reached its usage limit');if(m.includes('PRIORITY_ALREADY_CLAIMED'))throw new Error('A founder priority entitlement is already attached to this account');throw error}return Array.isArray(data)?data[0]:data
}

export async function createFounderPriorityAgency(input:{name:string;markets?:string[];specialties?:string[]}){
 const client=sb();await currentUser();if(!input.name.trim())throw new Error('Agency name is required')
 const {data,error}=await client.rpc('create_founder_priority_agency',{p_name:input.name.trim().slice(0,100),p_markets:(input.markets||[]).slice(0,20),p_specialties:(input.specialties||[]).slice(0,20)});if(error){const m=String(error.message||error);if(m.includes('PRIORITY_ENTITLEMENT_REQUIRED'))throw new Error('A valid founder priority entitlement is required');throw error}return Array.isArray(data)?data[0]:data
}

export async function getMyFounderPriority(){const client=sb(),user=await currentUser();const {data,error}=await client.from('tryamm_founder_priority_entitlements').select('id,status,granted_at,used_at,agency_id').eq('user_id',user.id).maybeSingle();if(error)throw error;return data}
export async function getMyAgencies(){const client=sb(),user=await currentUser();const {data,error}=await client.from('tryamm_agency_memberships').select('id,agency_id,role,status,tryamm_agencies(id,name,slug,status,priority_lane,markets,specialties)').eq('user_id',user.id);if(error)throw error;return data||[]}
export async function getMyAttribution(){const client=sb(),user=await currentUser();const {data,error}=await client.from('tryamm_creator_attribution').select('id,source_platform,agency_id,consented_at,tryamm_creator_invites(code,campaign)').eq('user_id',user.id).maybeSingle();if(error)throw error;return data}
