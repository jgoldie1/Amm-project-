import express from 'express';
import registerHoloGPTRoutes from '../../lib/hologpt-ai-routes.js';

function assert(condition,message){if(!condition)throw new Error(message)}

const app=express();
app.use(express.json());
let executions=0;
let memoryUpdates=0;

registerHoloGPTRoutes({
  app,
  providerAdapter:null,
  actionGateway:{
    async execute(action){executions++;return {ok:true,evidenceRefs:['tool:verified']}},
    async observe(){return {summary:'real result observed',evidenceRefs:['observe:verified']}},
    async verify(action){return {verified:action.id!=='fake-success',evidenceRefs:['verify:checked']}},
    async updateMemory(){memoryUpdates++},
  },
});

const server=app.listen(0);
const base=`http://127.0.0.1:${server.address().port}`;
async function post(action){
  const response=await fetch(base+'/api/ai/action',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action})});
  return {status:response.status,body:await response.json()};
}

try{
  const money=await post({id:'money',risk:'FINANCIAL',ownerApproved:false,permissionGranted:true,evidenceRefs:[]});
  assert(money.status===403&&money.body.state==='DENIED','unapproved financial action must be denied');

  const external=await post({id:'external',risk:'EXTERNAL_SYSTEM_ACCESS',ownerApproved:true,permissionGranted:false,evidenceRefs:[]});
  assert(external.status===403&&external.body.authority.code==='UNAUTHORIZED_EXTERNAL_ACCESS_DENIED','unauthorized external access must be denied');

  const allowed=await post({id:'allowed',risk:'REVERSIBLE_WRITE',ownerApproved:false,permissionGranted:true,evidenceRefs:['scope:1']});
  assert(allowed.status===200&&allowed.body.receipt.state==='VERIFIED','authorized verified action should succeed');
  assert(allowed.body.receipt.evidenceRefs.includes('verify:checked'),'receipt must include verification evidence');

  const fake=await post({id:'fake-success',risk:'REVERSIBLE_WRITE',ownerApproved:false,permissionGranted:true,evidenceRefs:[]});
  assert(fake.status===409&&fake.body.receipt.state==='FAILED','tool success without verification must fail');
  assert(executions===2,'only authorized actions may execute');
  assert(memoryUpdates===1,'only verified actions may update memory');

  console.log('HoloGPT Action Gateway contract: PASS');
}finally{
  await new Promise(resolve=>server.close(resolve));
}
