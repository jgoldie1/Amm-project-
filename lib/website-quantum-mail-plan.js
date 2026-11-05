'use strict';
// TRYAMM Quantum/OmniMail business email onboarding: integration with existing mail design.
// Does NOT create a mailbox, send email, alter MX/DNS or invent provider records.
const {validate}=require('./website-cloud-setup');
const PROVIDERS=Object.freeze({
 'keep-existing':{name:'Preserve current business email',steps:['Inventory existing MX, SPF, DKIM, DMARC, autodiscover and verification records','Test send/receive before DNS changes','Leave existing mail routing untouched during site cutover','Re-test mail delivery after website launch']},
 'google-workspace':{name:'Google Workspace',steps:['Customer starts or confirms their own Workspace subscription','Verify domain ownership with Google-provided records','Copy exact MX, SPF, DKIM and DMARC values from the customer tenant','Confirm mailboxes and migration/forwarding with customer','Review charges, test mail delivery, and approve DNS separately']},
 'microsoft-365':{name:'Microsoft 365 Business',steps:['Customer starts or confirms their own Microsoft 365 subscription','Verify domain using tenant-specific DNS records','Prepare exact MX, SPF, DKIM and DMARC values supplied by Microsoft','Check Outlook/Exchange mailboxes and existing mail migration','Review billing and test delivery before approving DNS cutover']},
 'zoho-mail':{name:'Zoho Mail',steps:['Customer selects a Zoho Mail plan under their own account','Verify their domain via Zoho-provided DNS instructions','Prepare tenant-specific MX, SPF, DKIM and DMARC values','Test mailboxes, aliases, and forwarding','Review provider terms and obtain approval before changing DNS']},
 'other':{name:'Another business email provider',steps:['Document the selected provider and existing mailboxes','Verify account and domain ownership','Collect authoritative DNS requirements from provider portal','Preserve existing mail delivery and prepare a rollback','Perform test send/receive before and after authorized changes']}
});
const localPart=/^[a-z0-9][a-z0-9._+-]{0,62}$/;
function mailPlan(input={}){
 const cloud=validate({...input,ownsAccount:true,authorizesPlanning:true});
 const provider=String(input.emailProvider||'keep-existing');
 if(!Object.hasOwn(PROVIDERS,provider))throw Object.assign(new Error('Unsupported business email provider'),{status:400});
 if(!cloud.domain)throw Object.assign(new Error('Business email setup needs a domain'),{status:400});
 if(input.confirmExistingMail!==true)throw Object.assign(new Error('Confirm existing email service must be preserved'),{status:400});
 const aliases=Array.isArray(input.aliases)?input.aliases.slice(0,8):[];
 if(aliases.some(x=>typeof x!=='string'||!localPart.test(x)||x.length>64))throw Object.assign(new Error('Invalid business email alias'),{status:400});
 const unique=[...new Set(aliases.map(x=>x.toLowerCase()))];
 return {domain:cloud.domain,projectId:cloud.projectId,provider,label:PROVIDERS[provider].name,
  requestedAddresses:unique.map(x=>x+'@'+cloud.domain),
  status:'PREPARED_NOT_PROVISIONED',steps:PROVIDERS[provider].steps.map((label,i)=>({id:i+1,label,status:'NOT_VERIFIED'})),
  requiredDnsTypes:['MX','TXT/SPF','TXT/DKIM','TXT/DMARC'],
  dnsChangesApplied:false,mailboxesCreated:false,providerSubscriptionStarted:false,sendTestPassed:false,receiveTestPassed:false,
  policy:'Email records must be backed up and preserved; do not submit passwords, recovery codes or API tokens.'};
}
module.exports={mailPlan,PROVIDERS};
