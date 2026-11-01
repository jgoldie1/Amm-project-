import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createAvatarJobService,validateDerivedAvatarRequest} from '../server/avatar/avatarJobApi.mjs';
const consent={granted:true,adultOrGuardianAuthorized:true};
const asset={kind:'derived-rigged-glb',mimeType:'model/gltf-binary',bytes:12000};
test('reject raw biometrics',()=>{
 for(const extra of [{rawPhotos:['private']},{video:true},{faceEmbeddings:[1]}])
  assert.throws(()=>validateDerivedAvatarRequest({userId:'p1',consent,asset:{...asset,...extra}}));
});
test('reject missing consent or owner',()=>{
 assert.throws(()=>validateDerivedAvatarRequest({userId:'p1',asset}));
 assert.throws(()=>validateDerivedAvatarRequest({consent,asset}));
});
test('isolate jobs by authenticated owner and allow deletion',async()=>{
 const map=new Map();
 const store={save:async j=>map.set(j.id,j),get:async id=>map.get(id),remove:async id=>map.delete(id)};
 const service=createAvatarJobService({authorize:async ctx=>ctx.userId,store});
 const a=await service.create({userId:'p1'},{consent,asset});
 assert.equal((await service.status({userId:'p1'},a.id)).status,'awaiting-private-asset');
 await assert.rejects(service.status({userId:'p2'},a.id));
 await assert.rejects(service.delete({userId:'p2'},a.id));
 assert.deepEqual(await service.delete({userId:'p1'},a.id),{deleted:true});
 await assert.rejects(service.status({userId:'p1'},a.id));
});
