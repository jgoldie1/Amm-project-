'use strict';
const crypto=require('node:crypto');
const RESERVED=/^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.test|.*\.invalid|.*\.example)$/i;
function clean(s,n=200){return String(s||'').trim().slice(0,n)}
function validateSource(raw){
 let u;try{u=new URL(String(raw||''))}catch{throw Object.assign(new Error('Valid HTTPS website URL required'),{status:400})}
 const host=u.hostname.toLowerCase();
 if(u.protocol!=='https:'||u.username||u.password||u.port||RESERVED.test(host)||!host.includes('.')||host.endsWith('.arpa')||/^\d+\.\d+\.\d+\.\d+$/.test(host)||host.includes(':'))throw Object.assign(new Error('Only externally hosted HTTPS domain URLs are accepted'),{status:400});
 // No request to the URL is ever made by this API. DNS checks and fetch protections are a future adapter responsibility.
 return u.origin;
}
const TARGETS=new Set(['tryamm-paid','streetverse','both']);
function ensure(store){if(!Array.isArray(store.websiteMigrationRequests))store.websiteMigrationRequests=[];return store.websiteMigrationRequests}
function createRequest(store,userId,body={}){
 const sourceUrl=validateSource(body.sourceUrl);
 if(body.ownsSite!==true||body.consent!==true)throw Object.assign(new Error('Ownership and privacy consent are required'),{status:400});
 const target=clean(body.target,40);
 if(!TARGETS.has(target))throw Object.assign(new Error('Unsupported target'),{status:400});
 const platform=['wordpress-org','wordpress-com','shopify','wix','squarespace','static-html','other'].includes(body.platform)?body.platform:'other';
 const item={id:'migration_'+crypto.randomUUID(),userId:clean(userId,120),sourceUrl,target,platform,businessName:clean(body.businessName,120),notes:clean(body.notes,800),status:'awaiting-ownership-verification',createdAt:new Date().toISOString(),steps:[
   {id:'authorization',state:'required'},
   {id:'content-export',state:'required'},
   {id:'asset-rights',state:'required'},
   {id:'preview',state:'blocked'},
   {id:'security-accessibility',state:'blocked'},
   {id:'customer-approval',state:'blocked'},
   {id:'deployment',state:'blocked'}
 ],deployedUrl:null,paid:false};
 ensure(store).push(item);return item;
}
function listForUser(store,user){return ensure(store).filter(x=>user?.role==='admin'||x.userId===user?.id)}
function reviewRequest(store,user,id,{status}={}){
 if(user.role!=='admin')throw Object.assign(new Error('Owner only'),{status:403});
 const item=ensure(store).find(x=>x.id===id);if(!item)throw Object.assign(new Error('Migration request not found'),{status:404});
 if(!['needs-export','needs-permission','preview-planned','rejected'].includes(status))throw Object.assign(new Error('Invalid review status'),{status:400});
 item.status=status;item.reviewedAt=new Date().toISOString();return item;
}
function customerView(item){return {id:item.id,sourceUrl:item.sourceUrl,target:item.target,platform:item.platform,businessName:item.businessName,status:item.status,steps:item.steps,createdAt:item.createdAt,deployedUrl:item.deployedUrl}}
module.exports={createRequest,listForUser,reviewRequest,customerView,validateSource,ensure};
