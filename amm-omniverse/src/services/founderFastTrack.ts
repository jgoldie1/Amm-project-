import { getSupabaseClient } from './supabaseClient'

function sb(){const client=getSupabaseClient();if(!client)throw new Error('Supabase is not configured');return client}

export async function createFounderFastTrackInvite(input:{code:string;email?:string;note?:string;maxUses?:number;expiresAt?:string|null}){
 const client=sb();const {data,error}=await client.rpc('create_founder_fast_track_invite',{p_code:input.code,p_intended_email:input.email||null,p_note:input.note||null,p_max_uses:input.maxUses??1,p_expires_at:input.expiresAt||null});if(error)throw error;return data
}

export async function redeemFounderFastTrackInvite(code:string){
 const client=sb();const {data,error}=await client.rpc('redeem_founder_fast_track_invite',{p_code:code});if(error)throw error;return data as {status:string;can_start_agency:boolean;skip_waitlist:boolean;still_required:string[];truth:string}
}

export async function canManageFounderFastTrack(){
 const client=sb();const {data,error}=await client.rpc('tryamm_is_founder_admin');if(error)return false;return data===true
}

export const FOUNDER_FAST_TRACK_PATH='FOUNDER APPROVAL → VIP CODE → SIGN IN → EMAIL/EXPIRY/USE CHECK → SKIP AGENCY WAITLIST → START AGENCY SETUP → REQUIRED VERIFICATION/TERMS/SECURITY → ACTIVE AGENCY'
