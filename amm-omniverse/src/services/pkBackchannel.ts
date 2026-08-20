import { getSupabaseClient } from './supabaseClient'

export type PKTeam='alpha'|'beta'|'host'|'moderator'
export type PKRole='player'|'captain'|'host'|'moderator'
export type PKChannel='team-alpha'|'team-beta'|'hosts'|'moderators'
export type PKBackchannelMessage={id:string;room_id:string;sender_user_id:string;channel:PKChannel;body:string;created_at:string}

function sb(){const client=getSupabaseClient();if(!client)throw new Error('Supabase is not configured');return client}

export async function joinPKBackchannel(input:{roomId:string;team:PKTeam;role:PKRole;displayName:string}){
 const client=sb();const {data:{user}}=await client.auth.getUser();if(!user)throw new Error('Sign in is required for PK backchannel')
 const {error}=await client.from('pk_backchannel_members').upsert({room_id:input.roomId,user_id:user.id,team:input.team,role:input.role,display_name:input.displayName.slice(0,80),active:true},{onConflict:'room_id,user_id'});if(error)throw error
 return user.id
}

export async function leavePKBackchannel(roomId:string){const client=sb();const {data:{user}}=await client.auth.getUser();if(!user)return;const {error}=await client.from('pk_backchannel_members').update({active:false}).eq('room_id',roomId).eq('user_id',user.id);if(error)throw error}

export async function listPKMessages(roomId:string,channel:PKChannel,limit=50){const client=sb();const {data,error}=await client.from('pk_backchannel_messages').select('*').eq('room_id',roomId).eq('channel',channel).order('created_at',{ascending:true}).limit(Math.min(100,Math.max(1,limit)));if(error)throw error;return (data||[]) as PKBackchannelMessage[]}

export async function sendPKMessage(roomId:string,channel:PKChannel,body:string){const text=body.trim().slice(0,500);if(!text)throw new Error('Message is empty');const client=sb();const {data:{user}}=await client.auth.getUser();if(!user)throw new Error('Sign in is required for PK backchannel');const {data,error}=await client.from('pk_backchannel_messages').insert({room_id:roomId,sender_user_id:user.id,channel,body:text}).select().single();if(error)throw error;return data as PKBackchannelMessage}

export function subscribePKMessages(roomId:string,channel:PKChannel,onMessage:(message:PKBackchannelMessage)=>void){const client=sb();const subscription=client.channel(`pk:${roomId}:${channel}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'pk_backchannel_messages',filter:`room_id=eq.${roomId}`},payload=>{const message=payload.new as PKBackchannelMessage;if(message.channel===channel)onMessage(message)}).subscribe();return()=>{void client.removeChannel(subscription)}}
