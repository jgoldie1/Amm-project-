'use strict';const assert=require('node:assert/strict');const {createMission}=require('../lib/hologpt-mission-orchestrator');
const a=createMission({mission:'launch_website'},{});assert.equal(a.ok,true);assert.equal(a.steps.length,3);assert.equal(a.steps[0].status,'blocked');assert.equal(a.paidFallback,false);
assert.equal(createMission({mission:'streetverse_repair',context:'Fix mobile joystick',containsSensitiveData:true},{}).error,'sensitive_data_requires_review');
assert.equal(createMission({mission:'unknown'},{}).error,'unknown_mission');
const b=createMission({mission:'creator_campaign'},{GEMINI_API_KEY:'test',CROSS_AI_GEMINI_FREE_CONFIRMED:'true'});assert.equal(b.steps[0].route,'gemini');assert.equal(b.execution,'not_started');
console.log('HoloGPT mission orchestrator tests passed');