import { getSupabaseClient } from './supabaseClient'

export type ExternalPlatform='tiktok'|'bigo'|'twitch'|'youtube'|'instagram'|'facebook'|'kick'|'other'
export type AgencyRole='owner'|'manager'|'recruiter'|'coach'|'creator'|'moderator'|'analyst'

function sb(){const client=getSupabaseClient();if(!client)throw new Error('Supabase is not configured');return client}
async function currentUser(){const client=sb();const {data:{user}}=await client.auth.getUser();if(!user)throw new Error('Sign in is required');return user}
export function normalizeInviteCode(code:string){return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,40)}
export function slugifyAgency(name:string){return name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)}

export async function createAgency(input:{name:string;markets?:string[];specialties?:string[]}){
 const client=sb(),user=await currentUser(),slug=slugifyAgency(input.name);if(!slug)throw new Error('Agency name is required')
 const {data,error}=await client.from('tryamm_agencies').insert({owner_user_id:user.id,name:input.name.trim().slice(0,100),slug,markets:(input.markets||[]).slice(0,20),specialties:(input.specialties||[]).slice(0,20)}).select().single();if(error)throw error
 const {error:memberError}=await client.from('tryamm_agency_memberships').insert({agency_id:data.id,user_id:user.id,role:'owner',status:'active'});if(memberError)throw memberError
 return data
}

export async function generateAgencyInvite(input:{agencyId?:string;code:string;source:ExternalPlatform;campaign?:string;maxUses?:number|null}){
 const client=sb(),user=await currentUser(),code=normalizeInviteCode(input.code);if(code.length<4)throw new Error('Invite code must be at least 4 characters')
 const {data,error}=await client.from('tryamm_creator_invites').insert({agency_id:input.agencyId||null,inviter_user_id:user.id,code,source_platform:input.source,campaign:input.campaign?.trim().slice(0,100)||null,max_uses:input.maxUses??null}).select().single();if(error)throw error;return data
}

export async function acceptInvite(input:{code:string}){
 const client=sb(),user=await currentUser(),code=normalizeInviteCode(input.code);if(!code)throw new Error('Invite code is required')
 const {data:invite,error}=await client.from('tryamm_creator_invites').select('*').eq('code',code).eq('active',true).maybeSingle();if(error)throw error;if(!invite)throw new Error('Invite code was not found or is inactive')
 if(invite.expires_at&&new Date(invite.expires_at).getTime()<Date.now())throw new Error('Invite code has expired')
 if(invite.max_uses!=null&&invite.uses>=invite.max_uses)throw new Error('Invite code has reached its usage limit')
 const {data:existing}=await client.from('tryamm_creator_attribution').select('id').eq('user_id',user.id).maybeSingle();if(existing)throw new Error('Your first-touch creator attribution is already locked')
 const {error:attrError}=await client.from('tryamm_creator_attribution').insert({user_id:user.id,invite_id:invite.id,agency_id:invite.agency_id||null,source_platform:invite.source_platform});if(attrError)throw attrError
 if(invite.agency_id){const {error:memberError}=await client.from('tryamm_agency_memberships').upsert({agency_id:invite.agency_id,user_id:user.id,role:'creator',status:'active'},{onConflict:'agency_id,user_id'});if(memberError)throw memberError}
 const {error:useError}=await client.from('tryamm_creator_invites').update({uses:(invite.uses||0)+1}).eq('id',invite.id).eq('uses',invite.uses||0);if(useError)throw useError
 return invite
}

export async function getMyAgencies(){const client=sb(),user=await currentUser();const {data,error}=await client.from('tryamm_agency_memberships').select('id,agency_id,role,status,tryamm_agencies(id,name,slug,status,markets,specialties)').eq('user_id',user.id);if(error)throw error;return data||[]}
export async function getMyAttribution(){const client=sb(),user=await currentUser();const {data,error}=await client.from('tryamm_creator_attribution').select('id,source_platform,agency_id,consented_at,tryamm_creator_invites(code,campaign)').eq('user_id',user.id).maybeSingle();if(error)throw error;return data}
