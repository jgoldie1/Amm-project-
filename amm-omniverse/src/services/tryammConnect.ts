import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

function sb(){const c=getSupabaseClient();if(!c)throw new Error('Supabase not configured');return c}
async function uid(){const id=await getAuthenticatedUserId();if(!id)throw new Error('Authentication required');return id}

export type Provider={provider_key:string;name:string;provider_type:string;service_regions:string[];capabilities:string[];integration_status:string;regulated:boolean;metadata:Record<string,unknown>}
export type Market={market_code:string;market_name:string;status:string;mobile_voice:boolean;mobile_data:boolean;esim:boolean;wifi:boolean;fixed_wireless:boolean;satellite_ntn:boolean;lifeline_or_subsidy:boolean;regulatory_notes:string|null}
export type HoloFonLine={id:string;nickname:string;line_type:string;provider_key:string|null;esim_status:string;phone_number_masked:string|null;preferred_networks:string[];satellite_fallback:boolean;roaming_enabled:boolean;status:string}
export type QuantumEmail={id:string;handle:string;domain:string;security_mode:string;translation_enabled:boolean;hologpt_assist:boolean;status:string}

export async function listConnectivityProviders(){const {data,error}=await sb().from('connectivity_providers').select('*').order('name');if(error)throw error;return (data??[]) as Provider[]}
export async function listConnectivityMarkets(){const {data,error}=await sb().from('connectivity_market_readiness').select('*').order('market_name');if(error)throw error;return (data??[]) as Market[]}
export async function listMyHoloFonLines(){const id=await uid();const {data,error}=await sb().from('holo_fon_lines').select('*').eq('user_id',id).order('created_at',{ascending:false});if(error)throw error;return (data??[]) as HoloFonLine[]}
export async function createHoloFonLine(lineType='personal'){const id=await uid();const {data,error}=await sb().from('holo_fon_lines').insert({user_id:id,line_type:lineType,nickname:'Holo Fon',status:'planning',esim_status:'not-provisioned',preferred_networks:['wifi','cellular']}).select('*').single();if(error)throw error;return data as HoloFonLine}
export async function reserveQuantumEmail(handle:string){const id=await uid();const safe=handle.trim().toLowerCase().replace(/[^a-z0-9._-]/g,'').slice(0,40);if(!safe)throw new Error('Enter a valid handle');const {data,error}=await sb().from('quantum_email_accounts').insert({user_id:id,handle:safe,domain:'tryamm.online',security_mode:'pq-ready',translation_enabled:true,hologpt_assist:true,status:'reserved'}).select('*').single();if(error)throw error;return data as QuantumEmail}
export async function listMyQuantumEmail(){const id=await uid();const {data,error}=await sb().from('quantum_email_accounts').select('*').eq('user_id',id).order('created_at',{ascending:false});if(error)throw error;return (data??[]) as QuantumEmail[]}
export async function applyConnectivityRole(marketCode:string,roleType:string,businessName?:string){const id=await uid();const {data,error}=await sb().from('connectivity_dealer_applications').insert({user_id:id,market_code:marketCode,role_type:roleType,business_name:businessName||null,status:'submitted'}).select('*').single();if(error)throw error;return data}
