import test from 'node:test';
import assert from 'node:assert/strict';
import {newCircleParkRecord,applyCircleParkAction,createCircleParkAuthority} from '../server/circle-park/circleParkAuthority.mjs';
test('rejects unauthorized player and out-of-order repair',()=>{
 const state=newCircleParkRecord('bj');assert.throws(()=>applyCircleParkAction(state,'enter','other'),/unauthorized/);
 assert.throws(()=>applyCircleParkAction(state,'finish-repair','bj'),/sequence/);
});
test('entire Circle Park mission gives reward exactly once and remembers repair',()=>{
 let record=newCircleParkRecord('bj');
 for(const action of ['enter','elevator','meet','react','accept-repair','finish-repair','story'])record=applyCircleParkAction(record,action,'bj').record;
 assert.equal(record.step,7);assert.equal(record.xp,140);assert.equal(record.credits,40);
 assert.equal(record.memories.find(m=>m.id==='ms-pearl-plumbing-fixed')?.npcId,'ms-pearl');
 const again=applyCircleParkAction(record,'finish-repair','bj');assert.equal(again.applied,false);assert.equal(again.record.credits,40);
});
test('authenticated storage contract supports returning player',async()=>{
 const saved=new Map();
 const store={async transaction(id,update){const next=update(saved.get(id));saved.set(id,next);return next},async read(id){return saved.get(id)}};
 const api=createCircleParkAuthority(store);
 await api.progress('bj','enter');await api.progress('bj','elevator');await api.progress('bj','meet');
 const returned=await api.load('bj');assert.equal(returned.step,3);assert.equal(returned.memories[0].npcId,'ms-pearl');
 await assert.rejects(()=>api.progress('','enter'),/unauthorized/);
});
