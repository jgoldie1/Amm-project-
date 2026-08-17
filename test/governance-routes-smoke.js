'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const routes=fs.readFileSync(path.join(root,'lib','governance-routes.js'),'utf8');
for(const token of ['/api/governance/status','/api/governance/ip/inventions','/api/governance/warehouse/quote','/api/governance/compliance/readiness','/api/governance/legal/gate','/api/governance/credentials/gate','/api/governance/trust/passport/:subjectId','/api/governance/disputes','/api/governance/holds','/api/governance/claims'])assert(routes.includes(token),token);
assert(routes.includes("req.user.role==='admin'")||routes.includes('admin,'));
assert(routes.includes('providerCustody:true'));
console.log('governance routes smoke: PASS');
