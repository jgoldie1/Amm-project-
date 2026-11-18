'use strict'
// Routing boundaries for Raymond Jarreau's previously planned insurance/retirement services.
// The project owner reports that Raymond has an insurance license. Scope, state and active
// status must still be verified against the state insurance producer registry.
// THIS MODULE DOES NOT PROCESS APPLICATIONS, FINANCIAL ACCOUNTS, HIPAA DATA OR TRADES.
const SERVICES=Object.freeze({
  insurance_education:{label:'Insurance and protection',domain:'insurance',required:['producer_license','line_of_authority','state','carrier_appointment_if_required']},
  retirement_401k_education:{label:'401(k) and retirement education',domain:'education',required:['marketing_approval','scope_review']},
  infinite_banking_education:{label:'Infinite banking education',domain:'insurance',required:['producer_license','approved_product_explanation','state','carrier_appointment_if_required']},
  legacy_planning_referral:{label:'Estate, trust and legacy planning referrals',domain:'referral',required:['referral_consent','counsel_or_professional_referral']},
  omnicare_insurance_navigation:{label:'OmniCare360 insurance navigation',domain:'insurance',required:['insurance_license_scope_review','state','disclosure_review']},
  clinical_telehealth:{label:'Clinical telehealth',domain:'clinical',required:['licensed_clinical_operator','provider_location_check','hipaa_review','signed_vendor_agreements']}
});
const PROHIBITED=new Set(['diagnosis','treatment','prescription','live_trade','manage_401k_assets','guaranteed_returns','automated_policies','collect_health_history'])
function assessService(request={}){
 const service=SERVICES[String(request.service||'')]
 if(!service)return{allowed:false,reason:'unknown-service'}
 if(service.domain==='clinical'||PROHIBITED.has(request.action))return{allowed:false,reason:'regulated-service-unavailable',requirements:service.required}
 if(request.containsHealthData===true||request.hasPaymentInfo===true||request.hasAccountCredentials===true)return{allowed:false,reason:'sensitive-information-isolated'}
 if(request.action==='public_education'||request.action==='view_service_description')return{allowed:true,reason:'public-education-only'}
 return{allowed:false,reason:'licensed-service-needs-verification-and-authorized-system',requirements:service.required}
}
module.exports={SERVICES,assessService}
