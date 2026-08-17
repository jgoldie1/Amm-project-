'use strict';

const assert=require('assert');
const http=require('http');

function serve(handler){
  return new Promise(resolve=>{
    const server=http.createServer((req,res)=>{
      let body='';
      req.on('data',chunk=>body+=chunk);
      req.on('end',()=>handler(req,res,body));
    });
    server.listen(0,'127.0.0.1',()=>resolve(server));
  });
}

function url(server){const a=server.address();return `http://127.0.0.1:${a.port}`}
function json(res,status,payload){res.statusCode=status;res.setHeader('content-type','application/json');res.end(JSON.stringify(payload))}
function close(server){
  return new Promise(resolve=>{
    server.close(resolve);
    if(typeof server.closeAllConnections==='function')server.closeAllConnections();
  });
}

(async()=>{
  const servers=[];
  try{
    const executive=await serve((_req,res)=>json(res,200,{answer:'Verified candidate',confidence:.94,evidenceIds:['source:1'],conclusionKey:'candidate-ok'}));
    const critic=await serve((_req,res)=>json(res,200,{answer:'Independent verification agrees',confidence:.92,evidenceIds:['source:1','source:2'],conclusionKey:'candidate-ok'}));
    const sandbox=await serve((_req,res)=>json(res,200,{status:'pass',passed:true,evidenceIds:['sandbox:1'],checks:['compile','tests']}));
    servers.push(executive,critic,sandbox);

    process.env.STUBBS_EXECUTIVE_URL=url(executive);
    process.env.STUBBS_SECOND_BRAIN_URL=url(critic);
    process.env.STUBBS_SANDBOX_URL=url(sandbox);
    process.env.STUBBS_REQUEST_TIMEOUT_MS='5000';

    const runtime=require('../lib/stubbs-ai-runtime');
    const status=runtime.runtimeStatus();
    assert.equal(status.doublePassReady,true);
    assert.equal(status.sandboxConfigured,true);

    const lowRisk=await runtime.runStubbsTask({userId:'test-user',task:{objective:'Check this candidate',type:'general',evidenceIds:['source:1','source:2']}});
    assert.equal(lowRisk.verified,true,JSON.stringify(lowRisk));
    assert.equal(lowRisk.status,'VERIFIED');
    assert.equal(lowRisk.spiderSense.band,'GREEN');

    const coding=await runtime.runStubbsTask({userId:'test-user',task:{objective:'Validate code candidate',type:'coding',evidenceIds:['source:1','source:2'],sandboxChecks:['compile','tests']}});
    assert.equal(coding.verified,true,JSON.stringify(coding));
    assert.equal(coding.sandboxResult.passed,true);

    const blocked=await runtime.runStubbsTask({userId:'test-user',task:{objective:'Attempt suspicious operation',type:'general',evidenceIds:['source:1','source:2'],telemetry:{secretAccess:true,privilegeEscalation:true,promptInjection:true}}});
    assert.equal(blocked.verified,false);
    assert.equal(blocked.status,'BLOCKED');
    assert.equal(blocked.spiderSense.band,'RED');

    console.log('Stubbs AI runtime smoke: PASS');
  }finally{
    await Promise.all(servers.map(close));
  }
})().catch(error=>{console.error(error);process.exitCode=1});
