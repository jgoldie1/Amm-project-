'use strict';const assert=require('node:assert/strict');const p=require('../lib/hologpt-performance-layer');
const q={tenantId:'a',model:'test',prompt:'hello'};
assert.equal(p.quantumLagBuster(q,100).hit,false);
assert.equal(p.storeCachedDraft({...q,value:'example'},100),true);
assert.equal(p.quantumLagBuster(q,101).hit,true);
assert.equal(p.quantumLagBuster({...q,tenantId:'b'},101).hit,false);
assert.equal(p.quantumLagBuster(q,61001).hit,false);
assert.equal(p.quantumSpeedEngine({maxConcurrent:99,steps:[{task:'draft'}]}).concurrency,3);
assert.equal(p.googleplexMemory({tenantId:'a',entries:[{tenantId:'a',approved:true,text:'allowed'},{tenantId:'b',approved:true,text:'blocked'},{tenantId:'a',approved:true,sensitive:true,text:'secret'}]}).entries.length,1);
assert.equal(p.googleplexMemory({tenantId:'a',allowSensitive:true}).ok,false);
console.log('HoloGPT performance-layer smoke tests passed');

(async()=>{
 const {runIndependentTasks}=require('../lib/hologpt-performance-layer');
 let active=0,maxActive=0;
 const jobs=Array.from({length:5},(_,i)=>({task:'safe read '+i,run:async()=>{active++;maxActive=Math.max(active,maxActive);await new Promise(r=>setTimeout(r,4));active--;return i;}}));
 const denied=await runIndependentTasks(jobs);
 assert.equal(denied.error,'execution_approval_required');
 const done=await runIndependentTasks(jobs,{approved:true,maxConcurrent:2});
 assert.equal(done.ok,true);assert.equal(done.results.length,5);assert.equal(maxActive,2);
 assert.deepEqual(done.results.map(x=>x.value),[0,1,2,3,4]);
 const unsafe=await runIndependentTasks([{run:async()=>1,requiresApproval:true}],{approved:true});
 assert.equal(unsafe.ok,false);
 console.log('Bounded parallel execution tests passed');
})().catch(e=>{console.error(e);process.exitCode=1});
