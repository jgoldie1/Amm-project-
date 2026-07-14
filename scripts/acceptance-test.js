const assert=require('assert');

const base=String(process.env.TRYAMM_API_URL||'http://localhost:10000').replace(/\/$/,'');
const token=process.env.TEST_SUPABASE_ACCESS_TOKEN||'';
const headers={'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})};

async function call(path,options={}){
  const response=await fetch(`${base}${path}`,{...options,headers:{...headers,...(options.headers||{})}});
  const text=await response.text();
  let body;try{body=JSON.parse(text);}catch{body=text;}
  return {status:response.status,body};
}

async function main(){
  const results=[];
  const health=await call('/api/health');
  assert.equal(health.status,200,'Health endpoint failed');
  results.push({name:'health',passed:true,body:health.body});

  const integrations=await call('/api/memory/global/integrations/status');
  assert.equal(integrations.status,200,'Integration status endpoint failed');
  results.push({name:'integration-status',passed:true,body:integrations.body});

  if(token){
    const livekit=await call('/api/memory/global/integrations/livekit/token',{method:'POST',body:JSON.stringify({room:'acceptance-room',role:'viewer',name:'Acceptance Viewer'})});
    assert.ok([200,201].includes(livekit.status),`LiveKit token failed: ${livekit.status}`);
    assert.equal(Boolean(livekit.body.permissions?.canPublish),false,'Viewer unexpectedly received publish permission');
    results.push({name:'livekit-viewer-role',passed:true});

    const budget=await call('/api/memory/global/integrations/claude/budget-check',{method:'POST',body:JSON.stringify({estimatedInputTokens:500,requestedOutputTokens:500,spentTodayUsd:0})});
    assert.equal(budget.status,200,'Claude budget gate failed');
    results.push({name:'claude-budget-gate',passed:true,body:budget.body});
  }else{
    results.push({name:'authenticated-tests',passed:false,skipped:true,reason:'TEST_SUPABASE_ACCESS_TOKEN not configured'});
  }

  console.log(JSON.stringify({passed:true,base,results},null,2));
}

main().catch(error=>{console.error(JSON.stringify({passed:false,error:error.message},null,2));process.exit(1);});
