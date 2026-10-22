'use strict';
// Reusable registration policy for future TRYAMM businesses.
// In-memory only: production must persist registrations and verify ownership.
const SLUG=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const RESERVED=new Set(['admin','api','system','root','support','tryamm']);
const BASELINE=Object.freeze(['https','mfa','least-privilege','backups','secret-scanning','tenant-isolation','payment-webhook-verification']);
function createBusinessRegistry(seed=[]){
  const entries=new Map();
  function register({id,name,ownerId,category,consent=false}={}){
    if(typeof id!=='string'||id.length>64||!SLUG.test(id)||RESERVED.has(id))return{ok:false,error:'invalid-id'};
    if(typeof name!=='string'||!name.trim()||name.length>120||typeof ownerId!=='string'||!ownerId.trim()||ownerId.length>120)return{ok:false,error:'invalid-identity'};
    if(typeof category!=='string'||!category.trim()||category.length>80)return{ok:false,error:'invalid-category'};
    if(consent!==true)return{ok:false,error:'owner-authorization-required'};
    if(entries.has(id))return{ok:false,error:'already-registered'};
    const entry=Object.freeze({id,name:name.trim(),ownerId:ownerId.trim(),category:category.trim(),securityBaseline:BASELINE,optionalJacobieVisionPlan:'none',status:'pending-verification'});
    entries.set(id,entry);
    return{ok:true,business:entry};
  }
  function get(id){return entries.get(id)||null}
  function list(){return [...entries.values()]}
  for(const b of seed){const result=register({...b,consent:true});if(!result.ok)throw new Error('Invalid seed business: '+result.error)}
  return Object.freeze({register,get,list});
}
module.exports={createBusinessRegistry,BASELINE};
