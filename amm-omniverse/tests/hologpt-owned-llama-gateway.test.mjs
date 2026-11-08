import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createHoloLlamaGateway} from '../tools/owned-llama/holo-llama-gateway.mjs';

const token='test-token-not-a-real-secret-123456789123';
let backend,app,backendPort,appPort,lastRequest;
const serve=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server.address().port)));
const close=server=>new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(body))};
const api=(route,options={})=>fetch('http://127.0.0.1:'+appPort+route,{
  headers:{authorization:'Bearer '+token,...options.headers},...options
});

before(async()=>{
 backend=createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url==='/api/tags')return json(res,200,{models:[{name:'llama3.2:1b'}]});
  if(req.method==='POST'&&req.url==='/v1/chat/completions'){
   let body='';for await(const chunk of req)body+=chunk;
   lastRequest=JSON.parse(body);
   return json(res,200,{id:'mock-ollama',choices:[{message:{role:'assistant',content:'KIT AI: The fictional delivery is ready.'}}]});
  }
  return json(res,404,{error:'missing'});
 });
 backendPort=await serve(backend);
 app=createHoloLlamaGateway({upstream:'http://127.0.0.1:'+backendPort,token,model:'llama3.2:1b'});
 appPort=await serve(app);
});
after(async()=>{await close(app);await close(backend)});
test('requires a strong secret and a local upstream',()=>{
 assert.throws(()=>createHoloLlamaGateway({token:'short'}),/32\+ characters/);
 assert.throws(()=>createHoloLlamaGateway({token,upstream:'https://private.example'}),/local HTTP/);
 assert.throws(()=>createHoloLlamaGateway({token,upstream:'http://169.254.169.254'}),/local HTTP/);
});
test('does not expose metadata without authentication',async()=>{
 const r=await fetch('http://127.0.0.1:'+appPort+'/health');
 assert.equal(r.status,401);
});
test('authenticated health proves an installed model, not inference',async()=>{
 const r=await api('/health'),body=await r.json();
 assert.equal(r.status,200);assert.equal(body.model,'llama3.2:1b');assert.equal(body.ok,true);
});
test('routes the exact fixed Llama model and returns original dialogue',async()=>{
 const r=await api('/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json'},
 body:JSON.stringify({model:'llama3.2:1b',messages:[{role:'user',content:'Speak as KIT AI'}],max_tokens:9999,temperature:3})});
 const data=await r.json();
 assert.equal(r.status,200);assert.match(data.choices[0].message.content,/KIT AI/);
 assert.equal(lastRequest.model,'llama3.2:1b');assert.equal(lastRequest.max_tokens,1024);
 assert.equal(lastRequest.temperature,1);assert.equal(lastRequest.stream,false);
});
test('rejects unauthorized, wrong model, streaming, and non-JSON requests',async()=>{
 const base={method:'POST',headers:{'content-type':'application/json'},
 body:JSON.stringify({model:'something-else',messages:[{role:'user',content:'Hello'}]})};
 assert.equal((await api('/v1/chat/completions',{...base,headers:{authorization:'Bearer invalid','content-type':'application/json'}})).status,401);
 assert.equal((await api('/v1/chat/completions',base)).status,400);
 assert.equal((await api('/v1/chat/completions',{...base,body:JSON.stringify({model:'llama3.2:1b',stream:true,messages:[{role:'user',content:'Hi'}]})})).status,400);
 assert.equal((await api('/v1/chat/completions',{...base,headers:{'content-type':'text/plain'}})).status,415);
});
test('does not expose extra routes or accept image payloads',async()=>{
 assert.equal((await api('/admin')).status,404);
 const r=await api('/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json'},
 body:JSON.stringify({model:'llama3.2:1b',messages:[{role:'user',content:[{type:'image_url',image_url:'file:///etc/passwd'}]}]})});
 assert.equal(r.status,400);
});
test('rejects oversized prompts',async()=>{
 const r=await api('/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json'},
 body:JSON.stringify({model:'llama3.2:1b',messages:[{role:'user',content:'x'.repeat(70000)}]})});
 assert.equal(r.status,413);
});
