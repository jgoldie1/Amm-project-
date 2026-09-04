import {adminReady,adminRest,json} from '../_lib/supabase-admin.js';

const ALLOWED_ROLES=new Set(['buyer','brand','creator','supplier','warehouse_3pl','carrier_logistics','investor_partner','other']);
const MAX={company:160,contact:120,email:254,phone:64,country:8,website:240,deal:80,product:600,message:2400};
const clean=(value,max)=>String(value??'').trim().slice(0,max);
const numberOrNull=value=>{const n=Number(value);return Number.isFinite(n)&&n>=0?n:null};
const validEmail=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&email.length<=MAX.email;

export default async function handler(req,res){
  if(req.method==='GET')return json(res,200,{ok:true,providerReady:adminReady(),storage:'global_trade_partner_intakes'});
  if(req.method!=='POST')return json(res,405,{ok:false,error:'Method not allowed'});
  if(!adminReady())return json(res,503,{ok:false,state:'INTAKE_PROVIDER_GATED',message:'Partner intake storage is not configured on this deployment.'});

  const body=req.body||{};
  if(clean(body.website_confirm,120))return json(res,200,{ok:true,state:'RECEIVED'});

  const role=clean(body.role,40);
  const companyName=clean(body.companyName,MAX.company);
  const contactName=clean(body.contactName,MAX.contact);
  const email=clean(body.email,MAX.email).toLowerCase();
  const phone=clean(body.phone,MAX.phone)||null;
  const countryCode=clean(body.countryCode,MAX.country).toUpperCase()||null;
  const website=clean(body.website,MAX.website)||null;
  const dealType=clean(body.dealType,MAX.deal)||'general';
  const productOrService=clean(body.productOrService,MAX.product)||null;
  const message=clean(body.message,MAX.message)||null;
  const estimatedMonthlyVolume=numberOrNull(body.estimatedMonthlyVolume);
  const targetMoq=numberOrNull(body.targetMoq);
  const consentToBusinessContact=Boolean(body.consentToBusinessContact);
  const ndaRequested=Boolean(body.ndaRequested);
  const lowMoqRequested=Boolean(body.lowMoqRequested);

  if(!ALLOWED_ROLES.has(role))return json(res,400,{ok:false,error:'Choose a valid partner role.'});
  if(companyName.length<2)return json(res,400,{ok:false,error:'Company or brand name is required.'});
  if(contactName.length<2)return json(res,400,{ok:false,error:'Contact name is required.'});
  if(!validEmail(email))return json(res,400,{ok:false,error:'Enter a valid business email.'});
  if(!consentToBusinessContact)return json(res,400,{ok:false,error:'Consent to business contact is required for Deal Desk submission.'});

  const payload={
    role,
    company_name:companyName,
    contact_name:contactName,
    email,
    phone,
    country_code:countryCode,
    website,
    deal_type:dealType,
    product_or_service:productOrService,
    estimated_monthly_volume:estimatedMonthlyVolume,
    target_moq:targetMoq,
    message,
    source:'global-supply-chain',
    status:'new',
    consent_to_business_contact:consentToBusinessContact,
    nda_requested:ndaRequested,
    low_moq_requested:lowMoqRequested,
    metadata:{
      offerId:clean(body.offerId,80)||null,
      submissionRef:clean(body.submissionRef,80)||null,
      submittedFrom:'tryamm.online/global-supply-chain',
      intakeVersion:'20260903-deal-desk-v2'
    }
  };

  try{
    const rows=await adminRest('global_trade_partner_intakes',{method:'POST',body:payload});
    const row=rows?.[0];
    if(!row?.id)throw new Error('intake_not_persisted');
    return json(res,201,{ok:true,state:'INTAKE_SAVED',intakeId:row.id,message:'Your TRYAMM Global Trade request was received for founder review.'});
  }catch(error){
    console.error('global_trade_partner_intake_failed',String(error?.message||error));
    return json(res,500,{ok:false,error:'Unable to save this request right now.'});
  }
}
