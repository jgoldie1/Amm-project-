'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {parseEvent,interpret}=require('../lib/stubbs-sensory-core');
test('owner identity is not accepted as sensory input',()=>{
 const e=parseEvent({type:'game',source:'streetverse',text:'Circle Park Laflin',consent:true,userId:'other'});
 assert.equal(Object.hasOwn(e,'userId'),false);assert.equal(e.consent,true);
});
test('Laflin/Ashland mission facts are preserved',()=>{
 const e=parseEvent({type:'game',source:'streetverse',text:'Circle Park Laflin',consent:true});
 const r=interpret(e);assert.equal(r.proposal.action,'mission_hint');assert.match(r.proposal.message,/senior building/);assert.equal(r.executed,false);
});
test('unconsented events are blocked',()=>{
 const e=parseEvent({type:'vision',source:'camera',text:'holographic display'});
 assert.equal(interpret(e).decision,'BLOCK');
});
test('unverified smell/taste hardware never implies real sensing',()=>{
 for(const type of ['smell','taste']){const r=interpret(parseEvent({type,source:'sensor',text:'sample',consent:true}));assert.equal(r.decision,'UNVERIFIED_HARDWARE');}
});
test('reject oversized, malformed, and unsupported events',()=>{
 assert.throws(()=>parseEvent({type:'game',source:'bad space',text:'ok',consent:true}),/invalid event source/);
 assert.throws(()=>parseEvent({type:'agi',source:'game',text:'ok'}),/unsupported/);
 assert.throws(()=>parseEvent({type:'game',source:'game',text:'x'.repeat(8000)}),/too large/);
});
