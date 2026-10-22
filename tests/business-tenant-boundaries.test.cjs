'use strict';
const assert=require('node:assert/strict');
const {TENANTS,authorize,requireTenantAccess}=require('../lib/business-tenant-boundaries');
const ids=Object.keys(TENANTS);
const owner=id=>({id:'verified-owner',active:true,memberships:[{tenantId:id,role:'owner',active:true}]});
let checks=0;
for(const tenantId of ids){
  for(const other of ids){
    const allowed=authorize({actor:owner(tenantId),tenantId:other,resourceTenantId:other,action:'read'}).allowed;
    assert.equal(allowed,tenantId===other,tenantId+' -> '+other);checks++;
  }
  assert.equal(authorize({actor:owner(tenantId),tenantId,resourceTenantId:tenantId,action:'billing'}).allowed,true);checks++;
  assert.equal(authorize({actor:owner(tenantId),tenantId,resourceTenantId:'other',action:'read'}).allowed,false);checks++;
}
assert.equal(authorize({actor:{id:'a',active:true,memberships:[{tenantId:'omnicare360',role:'manager',active:true}]},tenantId:'omnicare360',resourceTenantId:'omnicare360',action:'knowledge'}).allowed,false);checks++;
assert.equal(authorize({actor:{id:'a',active:true,memberships:[{tenantId:'jacobie-vision',role:'security_auditor',active:true}]},tenantId:'jacobie-vision',resourceTenantId:'jacobie-vision',action:'billing'}).allowed,false);checks++;
assert.equal(authorize({actor:owner('raymond-jarreau'),tenantId:'missing',resourceTenantId:'missing',action:'read'}).allowed,false);checks++;
assert.equal(authorize({actor:owner('raymond-jarreau'),tenantId:'raymond-jarreau',resourceTenantId:'raymond-jarreau',action:'delete'}).allowed,false);checks++;
let nextCalled=false;
const req={params:{tenantId:'raymond-jarreau'},tenantResource:{tenantId:'jacobie-vision'},authenticatedActor:owner('raymond-jarreau')};
const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(v){this.body=v;return this}};
requireTenantAccess('read')(req,res,()=>nextCalled=true);
assert.equal(nextCalled,false);assert.equal(res.statusCode,403);checks++;
console.log('Business tenant isolation: '+checks+' checks passed');
