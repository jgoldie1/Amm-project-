'use strict';
// Preparation-only provider selection: never stores API keys or changes live DNS.
const crypto=require('node:crypto');
const providers={
 'customer-existing':{label:'My current hosting',kind:'review',steps:['Verify ownership and export/backup access','Check site runtime and data requirements','Prepare staging preview','Review DNS and email records before cutover','Approve and test rollback']},
 'wordpress-managed':{label:'Managed WordPress hosting',kind:'wordpress',steps:['Select a WordPress-capable host under your account','Confirm PHP, database and HTTPS support','Export content and licensed media','Restore on staging and test links, forms and plugins','Confirm DNS, email and rollback before launch']},
 'vercel':{label:'Vercel (compatible static/JavaScript sites)',kind:'static',steps:['Create or choose your own Vercel account and project','Link an authorized repository or prebuilt site','Test the preview deployment','Add a custom domain in Vercel and follow provider-specific DNS instructions','Verify HTTPS, form submissions and rollback']},
 'cloudflare':{label:'Cloudflare Workers / Pages (compatible static sites)',kind:'static',steps:['Choose customer-owned Cloudflare account','Deploy eligible static or Workers project to preview','Confirm build output and runtime limitations','Add domain through Cloudflare project settings before changing DNS','Verify SSL, forms and rollback']},
 'other':{label:'Other hosting provider',kind:'review',steps:['Document selected provider and cost/terms','Verify supported runtime, domains, storage and backups','Build a staged export and preview','Verify HTTPS, DNS and email preservation','Obtain customer approval before cutover']}
};
function validate(input={}){
 const provider=String(input.provider||'').trim();
 if(!Object.hasOwn(providers,provider))throw Object.assign(new Error('Unsupported cloud provider'),{status:400});
 const projectId=String(input.projectId||'').trim();
 if(!/^[a-f0-9-]{36}$/i.test(projectId))throw Object.assign(new Error('Valid brand project required'),{status:400});
 const domain=String(input.domain||'').trim().toLowerCase();
 if(domain&&(!/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)||domain.includes('..')))throw Object.assign(new Error('Enter a valid public domain without protocol'),{status:400});
 if(input.ownsAccount!==true||input.authorizesPlanning!==true)throw Object.assign(new Error('Cloud account ownership and planning consent required'),{status:400});
 const notes=String(input.notes||'').trim().slice(0,500);
 return {projectId,provider,domain,notes};
}
function plan(userId,input){
 const data=validate(input),p=providers[data.provider];
 return {id:crypto.randomUUID(),ownerId:userId,...data,status:'draft-setup-checklist',steps:p.steps.map((label,i)=>({id:i+1,label,status:'not-verified'})),environment:'customer-owned',customerApprovalRequired:true,requiresCredentials:false,createdAt:new Date().toISOString()};
}
function publicPlan(item){return {id:item.id,projectId:item.projectId,provider:item.provider,domain:item.domain,notes:item.notes,status:item.status,steps:item.steps,createdAt:item.createdAt,customerApprovalRequired:true}}
module.exports={providers,validate,plan,publicPlan};
