'use strict';
// Reusable in-memory reference implementation for tenant-scoped records.
// Not a production database, not suitable for PHI or payment data.
const {authorize,TENANTS}=require('./business-tenant-boundaries');
function createTenantRecordStore(){
  const rows=new Map();
  const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(x);
  function put({actor,tenantId,recordId,value}){
    if(!Object.hasOwn(TENANTS,String(tenantId||''))||!safeId(recordId))return{ok:false,error:'invalid-record'};
    if(!authorize({actor,tenantId,resourceTenantId:tenantId,action:'write'}).allowed)return{ok:false,error:'access-denied'};
    if(!value||typeof value!=='object'||Array.isArray(value))return{ok:false,error:'invalid-value'};
    // The caller must supply a validated schema; never use this for secrets or sensitive records.
    const key=tenantId+':'+recordId;
    const record={...value,tenantId,id:recordId};
    rows.set(key,structuredClone(record));
    return{ok:true};
  }
  function get({actor,tenantId,recordId}){
    if(!Object.hasOwn(TENANTS,String(tenantId||''))||!safeId(recordId))return{ok:false,error:'invalid-record'};
    if(!authorize({actor,tenantId,resourceTenantId:tenantId,action:'read'}).allowed)return{ok:false,error:'access-denied'};
    const record=rows.get(tenantId+':'+recordId);
    return record?{ok:true,record:structuredClone(record)}:{ok:false,error:'not-found'};
  }
  return Object.freeze({put,get});
}
module.exports={createTenantRecordStore};
