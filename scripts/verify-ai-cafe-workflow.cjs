'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=process.env.TRYAMM_ROOT||path.resolve(__dirname,'..');
const results=[];
const add=(name,ok,detail)=>results.push({name,status:ok?'PASS':'BLOCKED',detail});
const file=p=>fs.existsSync(path.join(root,p));
const env=k=>Boolean(String(process.env[k]||'').trim());
for(const [name,p] of [
  ['API server','server.js'],
  ['HoloGPT','lib/hologpt-chat.js'],
  ['StubbsAI','lib/stubbs-ai-runtime.js'],
  ['Poyo','lib/poyo-routes.js'],
  ['Payments','lib/payment-routes.js'],
  ['Internal chain','amm-omniverse/docs/THREE_LAYER_INTERNAL_BLOCKCHAIN.md']
])add(name,file(p),p);
add('Ollama configured',env('OLLAMA_BASE_URL')&&env('OLLAMA_MODEL'),'Set OLLAMA_BASE_URL and OLLAMA_MODEL; do not expose Ollama publicly');
add('Executive + critic',env('STUBBS_EXECUTIVE_URL')&&env('STUBBS_SECOND_BRAIN_URL'),'StubbsAI double-pass requires both');
add('Persistent private memory',env('SUPABASE_URL')&&env('SUPABASE_SERVICE_ROLE_KEY'),'Service-role key only server-side');
add('Stripe verification',env('STRIPE_SECRET_KEY')&&env('STRIPE_WEBHOOK_SECRET'),'Only payment processor confirmation may mark paid');
add('Media generation provider',env('POYO_GENERATE_URL')&&env('POYO_STATUS_URL')||env('COMFYUI_API_URL'),'Adapter required');
add('Production URL',env('APP_URL'),'Public website must be separately live-tested');
add('Paid AI opt-in',process.env.TRYAMM_PAID_AI_ENABLED!=='true','Keep paid API calls disabled unless approved');
const output={checkedAt:new Date().toISOString(),pass:results.filter(x=>x.status==='PASS').length,blocked:results.filter(x=>x.status==='BLOCKED').length,results};
console.log(JSON.stringify(output,null,2));
if(output.blocked)process.exitCode=1;