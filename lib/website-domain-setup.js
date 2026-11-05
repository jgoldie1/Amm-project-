'use strict';
// Provider-neutral domain onboarding. PREPARE ONLY: no DNS, registrar or billing mutations.
const {validate}=require('./website-cloud-setup');
const OPERATIONS=new Set(['connect-existing-domain','transfer-registration']);
function planDomain(input={}){
 const cloud=validate({...input,ownsAccount:true,authorizesPlanning:true});
 if(!cloud.domain)throw Object.assign(new Error('Enter a domain you own'),{status:400});
 const operation=String(input.operation||'').trim();
 if(!OPERATIONS.has(operation))throw Object.assign(new Error('Choose domain connection or registrar transfer'),{status:400});
 if(input.domainOwnershipConfirmed!==true||input.preserveEmailConfirmed!==true)throw Object.assign(new Error('Domain ownership and email-continuity confirmations required'),{status:400});
 if(/\b(password|secret|auth.?code|epp.?code|api.?key|token)\b/i.test(cloud.notes))throw Object.assign(new Error('Never include credentials or domain transfer codes'),{status:400});
 const checklist=[
  'Verify domain ownership using your registrar account; do not provide passwords to TRYAMM',
  'Export current DNS zone, including A, AAAA, CNAME, MX, TXT, CAA, SPF, DKIM, DMARC and verification records',
  'Confirm which website, email, shop, API and subdomains must continue working',
  'Build and test a staging website; verify forms, payments, redirects, TLS and accessibility',
  'Add your custom domain in your hosting provider to obtain the exact required records',
  'Review proposed changes, account permissions, downtime risk and rollback before authorization',
  'Verify the live site and business email after the authorized cutover'
 ];
 if(operation==='transfer-registration')checklist.splice(1,0,
  'Check registrar eligibility, current lock status, transfer fees and timing',
  'Start a registrar-to-registrar transfer in the destination registrar account; obtain and enter any required authorization code there, never in TRYAMM');
 const providerNotes={
  vercel:'Use the customer project Domain Settings to get its exact A/CNAME/TXT verification values; an external DNS registrar may retain DNS management.',
  cloudflare:'For Cloudflare Pages, configure the custom domain from Workers & Pages first. Apex domains require a Cloudflare zone and nameserver configuration; subdomains can use provider-provided CNAME values.',
  'wordpress-managed':'Use the selected host domain instructions. Confirm WordPress hosting, plugins, database, mail and backup compatibility before switching DNS.',
  'customer-existing':'Keep the current provider until a staging deployment and rollback plan are confirmed.',
  other:'Use the verified instructions returned by the chosen provider for that exact account and project.'
 };
 return {projectId:cloud.projectId,domain:cloud.domain,provider:cloud.provider,operation,
   readiness:'PREPARED_NOT_EXECUTED',requiresOwnerApproval:true,requiresRegistrarAuthorization:operation==='transfer-registration',
   providerInstructions:providerNotes[cloud.provider],checklist,
   dnsRecords:[],dnsRecordsStatus:'AWAITING_PROVIDER_SPECIFIC_RECORDS',
   safety:{liveDnsChanged:false,registrarTransferStarted:false,emailRecordsPreserved:'NOT_YET_VERIFIED',rollbackTested:false},
   createdAt:new Date().toISOString()};
}
module.exports={planDomain,OPERATIONS};
