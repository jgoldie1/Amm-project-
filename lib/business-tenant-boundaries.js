'use strict';
// Shared, framework-independent authorization policy. Not installed in live routes yet.
const TENANTS=Object.freeze({
  'raymond-jarreau':Object.freeze({name:'Raymond Jarreau',owner:'raymond'}),
  'jacobie-vision':Object.freeze({name:'Jacobie Vision Cybersecurity',owner:'jacobie'}),
  'omnicare360':Object.freeze({name:'OmniCare360',owner:'tryamm'}),
  'middleverse-ai':Object.freeze({name:'MiddleVerse AI',owner:'tryamm'})
});
const ACTIONS=new Set(['read','write','admin','billing','call','knowledge']);
const ROLES=Object.freeze({
  viewer:['read'],
  agent:['read','write','call','knowledge'],
  manager:['read','write','call','knowledge'],
  owner:['read','write','admin','billing','call','knowledge'],
  security_auditor:['read']
});
function authorize({actor,tenantId,action,resourceTenantId}={}){
  if(!Object.hasOwn(TENANTS,String(tenantId||'')))return{allowed:false,reason:'unknown-tenant'};
  if(!ACTIONS.has(action))return{allowed:false,reason:'unknown-action'};
  if(resourceTenantId!==tenantId)return{allowed:false,reason:'resource-tenant-mismatch'};
  if(!actor||actor.active!==true||typeof actor.id!=='string'||!actor.id)return{allowed:false,reason:'inactive-or-unknown-actor'};
  const memberships=Array.isArray(actor.memberships)?actor.memberships:[];
  const membership=memberships.find(m=>m&&m.tenantId===tenantId&&m.active===true);
  if(!membership||!Object.hasOwn(ROLES,String(membership.role||'')))return{allowed:false,reason:'no-active-membership'};
  if(!ROLES[membership.role].includes(action))return{allowed:false,reason:'insufficient-role'};
  // Healthcare tenant: clinical access is deliberately not represented by these administrative roles.
  if(tenantId==='omnicare360'&&action==='knowledge'&&membership.healthcareKnowledgeApproved!==true)return{allowed:false,reason:'healthcare-knowledge-not-approved'};
  return{allowed:true,reason:'authorized'};
}
function requireTenantAccess(action){
  return function(req,res,next){
    // Integration contract: req.authenticatedActor must be populated by verified auth middleware,
    // never from request body, query string or an unsigned client header.
    const tenantId=req.params&&req.params.tenantId;
    const resourceTenantId=req.tenantResource&&req.tenantResource.tenantId;
    const result=authorize({actor:req.authenticatedActor,tenantId,resourceTenantId,action});
    if(!result.allowed){res.setHeader('Cache-Control','no-store');return res.status(403).json({error:'Access denied'});}
    req.authorizedTenantId=tenantId;
    next();
  };
}
module.exports={TENANTS,ROLES,authorize,requireTenantAccess};
