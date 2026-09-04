import {adminReady,adminRest,json} from '../_lib/supabase-admin.js';

const ALLOWED_ROLES=new Set(['buyer','brand','creator','supplier','warehouse_3pl','carrier_logistics','investor_partner','other']);
const MAX={company:160,contact:120,email:254,phone:64,country:8,website:240,deal:80,product:600,message:2400};
const clean=(value,max)=>String(value??'').trim().slice(0,max);
const numberOrNull=value=>{const n=Number(value);return Number.isFinite(n)&&n>=0?n:null};
const validEmail=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&email.length<=MAX.email;
const publicUrl=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'https://fxluchtdfpediivhoksl.supabase.co';
const publicKey=()=>process.env.VITE_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'sb_publishable_y2OadDy1zy8QlWy-YAcdlg_uzAYMLzj';
const publicReady=()=>Boolean(publicUrl()&&publicKey());

async function publicInsert(payload){
  if(!publicReady())throw new Error('supabase_public_not_configured');
  const response=await fetch(`${publicUrl().replace(/\/$/,'')}/rest/v1/global_trade_partner_intakes`,{
    method:'POST',
    headers:{apikey:publicKey(),authorization:`Bearer ${publicKey()}`,'content-type':'application/json',prefer:'return=minimal'},
    body:JSON.stringify(payload)
  });
  if(!response.ok){let detail='';try{detail=(await response.json())?.message||''}catch{}throw new Error(detail||`supabase_public_${response.status}`)}
  return true;
}

function qualify({role,dealType,productOrService,estimatedMonthlyVolume,targetMoq,countryCode,website,ndaRequested,lowMoqRequested,message}){
  let score=0;
  if(['buyer','brand','creator'].includes(role))score+=20;
  if(['sourcing','sell_dtc','live_commerce','fulfillment','cold_chain','logistics'].includes(dealType))score+=10;
  if(productOrService&&productOrService.length>=8)score+=20;
  if(estimatedMonthlyVolume!==null&&estimatedMonthlyVolume>=1000)score+=15;
  if(estimatedMonthlyVolume!==null&&estimatedMonthlyVolume>=10000)score+=10;
  if(targetMoq!==null&&targetMoq>0)score+=10;
  if(countryCode)score+=5;
  if(website)score+=5;
  if(message&&message.length>=40)score+=5;
  if(ndaRequested||lowMoqRequested)score+=5;
  score=Math.min(100,score);
  const rfqCandidate=['buyer','brand','creator'].includes(role)&&Boolean(productOrService)&&(targetMoq!==null||estimatedMonthlyVolume!==null)&&score>=55;
  const priority=score>=80?'high':score>=55?'medium':'standard';
  return {score,priority,rfqCandidate,nextAction:rfqCandidate?'founder-review-then-authenticated-rfq':'founder-review'};
}

export default async function handler(req,res){
  const providerReady=adminReady()||publicReady();
  const providerMode=adminReady()?'service-role':publicReady()?'publishable-rls':'unconfigured';
  if(req.method==='GET')return json(res,200,{ok:true,providerReady,providerMode,storage:'global_trade_partner_intakes',rfqFlow:'intake -> founder qualification -> authenticated RFQ -> supplier quotes -> purchase order'});
  if(req.method!=='POST')return json(res,405,{ok:false,error:'Method not allowed'});
  if(!providerReady)return json(res,503,{ok:false,state:'INTAKE_PROVIDER_GATED',message:'Partner intake storage is not configured on this deployment.'});

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
  const submissionRef=clean(body.submissionRef,80)||`GT-${Date.now().toString(36).toUpperCase()}`;

  if(!ALLOWED_ROLES.has(role))return json(res,400,{ok:false,error:'Choose a valid partner role.'});
  if(companyName.length<2)return json(res,400,{ok:false,error:'Company or brand name is required.'});
  if(contactName.length<2)return json(res,400,{ok:false,error:'Contact name is required.'});
  if(!validEmail(email))return json(res,400,{ok:false,error:'Enter a valid business email.'});
  if(!consentToBusinessContact)return json(res,400,{ok:false,error:'Consent to business contact is required for Deal Desk submission.'});

  const qualification=qualify({role,dealType,productOrService,estimatedMonthlyVolume,targetMoq,countryCode,website,ndaRequested,lowMoqRequested,message});
  const payload={
    role,company_name:companyName,contact_name:contactName,email,phone,country_code:countryCode,website,
    deal_type:dealType,product_or_service:productOrService,estimated_monthly_volume:estimatedMonthlyVolume,target_moq:targetMoq,message,
    source:'global-supply-chain',status:'new',consent_to_business_contact:consentToBusinessContact,nda_requested:ndaRequested,low_moq_requested:lowMoqRequested,
    metadata:{offerId:clean(body.offerId,80)||null,submissionRef,submittedFrom:'tryamm.online/global-supply-chain',intakeVersion:'20260903-deal-desk-v4',providerMode,qualification}
  };

  try{
    if(adminReady()){
      const rows=await adminRest('global_trade_partner_intakes',{method:'POST',body:payload});
      const row=rows?.[0];
      if(!row?.id)throw new Error('intake_not_persisted');
      return json(res,201,{ok:true,state:'INTAKE_SAVED',intakeId:row.id,providerMode,qualification,message:'Your TRYAMM Global Trade request was received for founder review.'});
    }
    await publicInsert(payload);
    return json(res,201,{ok:true,state:'INTAKE_SAVED_RLS',intakeId:submissionRef,providerMode,qualification,message:'Your TRYAMM Global Trade request was received for founder review.'});
  }catch(error){
    console.error('global_trade_partner_intake_failed',String(error?.message||error));
    return json(res,500,{ok:false,error:'Unable to save this request right now.'});
  }
}
