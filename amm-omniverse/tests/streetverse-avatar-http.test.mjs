import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {createAvatarHttpHandler} from '../server/avatar/avatarHttpHandler.mjs';
import {bearerTokenAuth,memoryAvatarJobStore,avatarAssetFingerprint} from '../server/avatar/avatarPrivateAdapters.mjs';
const consent={granted:true,adultOrGuardianAuthorized:true};
const asset={kind:'derived-rigged-glb',mimeType:'model/gltf-binary',bytes:12000};
test('reject malformed GLB and accept valid header',()=>{
 assert.throws(()=>avatarAssetFingerprint(new Uint8Array(20)));
 const b=new Uint8Array(20),v=new DataView(b.buffer);v.setUint32(0,0x46546c67,true);v.setUint32(4,2,true);v.setUint32(8,20,true);
 assert.equal(avatarAssetFingerprint(b).bytes,20);
});
test('authenticated HTTP create/status/delete and cross-user isolation',async()=>{
 const authorize=bearerTokenAuth({verifyToken:async token=>token==='alice'?{sub:'alice'}:token==='bob'?{sub:'bob'}:null});
 const server=createServer(createAvatarHttpHandler({authorize,store:memoryAvatarJobStore()}));
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port+'/api/streetverse/avatars';
 const call=(url,method,token,body)=>fetch(url,{method,headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
 try{
  const unauthorized=await fetch(base,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({consent,asset})});assert.equal(unauthorized.status,401);
  const created=await call(base,'POST','alice',{consent,asset});assert.equal(created.status,201);const job=await created.json();
  assert.equal((await call(base+'/'+job.id,'GET','alice')).status,200);
  assert.equal((await call(base+'/'+job.id,'GET','bob')).status,404);
  assert.equal((await call(base+'/'+job.id,'DELETE','bob')).status,404);
  assert.equal((await call(base+'/'+job.id,'DELETE','alice')).status,200);
  assert.equal((await call(base+'/'+job.id,'GET','alice')).status,404);
 }finally{server.close();await once(server,'close')}
});
