'use strict';
const TYPES=new Set(['payments','identity','supplier','warehouse','shipping','tax','media-sfu','telephony','mail','search','storage']);
const clean=(v,m=500)=>String(v??'').trim().slice(0,m);
const DEFINITIONS=[
 {id:'stripe',type:'payments',required:['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET']},
 {id:'identity-primary',type:'identity',required:['IDENTITY_PROVIDER_URL','IDENTITY_PROVIDER_TOKEN']},
 {id:'supplier-primary',type:'supplier',required:['SUPPLIER_PROVIDER_URL','SUPPLIER_PROVIDER_TOKEN']},
 {id:'warehouse-primary',type:'warehouse',required:['WAREHOUSE_PROVIDER_URL','WAREHOUSE_PROVIDER_TOKEN']},
 {id:'shipping-primary',type:'shipping',required:['SHIPPING_PROVIDER_URL','SHIPPING_PROVIDER_TOKEN']},
 {id:'tax-primary',type:'tax',required:['TAX_PROVIDER_URL','TAX_PROVIDER_TOKEN']},
 {id:'holo-sfu',type:'media-sfu',required:['HOLO_SFU_JOIN_URL','HOLO_SFU_SERVICE_TOKEN']},
 {id:'telephony-primary',type:'telephony',required:['TELEPHONY_PROVIDER_URL','TELEPHONY_PROVIDER_TOKEN']},
 {id:'mail-primary',type:'mail',required:['TRYAMM_MAIL_TRANSPORT_URL','TRYAMM_MAIL_TRANSPORT_KEY']},
 {id:'supabase',type:'storage',required:['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']}
];
function status(def,env=process.env){const missing=def.required.filter(k=>!clean(env[k],4000));return {id:def.id,type:def.type,configured:missing.length===0,missing,liveTested:false,contractApproved:false,webhookVerified:false,status:missing.length?'not-configured':'configured-not-verified'};}
function registry(env=process.env,evidence={}){return DEFINITIONS.map(def=>{const s=status(def,env),e=evidence[def.id]||{};const verified=s.configured&&e.liveTested===true&&(e.contractApproved!==false)&&(['payments','identity','supplier','warehouse','shipping','telephony'].includes(def.type)?e.webhookVerified===true:true);return {...s,liveTested:e.liveTested===true,contractApproved:e.contractApproved===true,webhookVerified:e.webhookVerified===true,lastVerifiedAt:clean(e.lastVerifiedAt,40)||null,status:verified?'verified-live':s.configured?'configured-not-verified':'not-configured'};});}
function gate({type,providers=[],requireWebhook=false}={}){if(!TYPES.has(type))return {allowed:false,reason:'unknown_provider_type'};const candidates=providers.filter(p=>p.type===type&&p.status==='verified-live'&&(!requireWebhook||p.webhookVerified));return {allowed:candidates.length>0,reason:candidates.length?'verified_provider_available':'no_verified_live_provider',providers:candidates.map(p=>p.id)};}
function adapterConfig(id,env=process.env){const def=DEFINITIONS.find(x=>x.id===id);if(!def)throw new Error('provider_unknown');const prefix=({
 'identity-primary':'IDENTITY_PROVIDER','supplier-primary':'SUPPLIER_PROVIDER','warehouse-primary':'WAREHOUSE_PROVIDER','shipping-primary':'SHIPPING_PROVIDER','tax-primary':'TAX_PROVIDER','telephony-primary':'TELEPHONY_PROVIDER'
})[id];if(!prefix)throw new Error('provider_has_specialized_adapter');const base=clean(env[`${prefix}_URL`],2000),token=clean(env[`${prefix}_TOKEN`],4000);if(!base||!token)throw new Error('provider_not_configured');const u=new URL(base);if(u.protocol!=='https:')throw new Error('provider_https_required');return {id,type:def.type,baseUrl:u.toString().replace(/\/$/,''),token};}
module.exports={TYPES,DEFINITIONS,status,registry,gate,adapterConfig};
