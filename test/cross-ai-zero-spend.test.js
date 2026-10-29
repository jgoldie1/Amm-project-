'use strict';const assert=require('node:assert/strict');const {planZeroSpend}=require('../lib/cross-ai-zero-spend');
const base={lane:'merchant',prompt:'Draft an accessible product title'};
assert.equal(planZeroSpend(base,{}).error,'no_confirmed_free_capacity');
assert.equal(planZeroSpend({...base,action:'payment'},{}).error,'approval_required');
assert.equal(planZeroSpend(base,{GEMINI_API_KEY:'test',CROSS_AI_GEMINI_FREE_CONFIRMED:'true'}).provider,'gemini');
assert.equal(planZeroSpend(base,{GEMINI_API_KEY:'test'}).ok,false);
assert.equal(planZeroSpend(base,{OLLAMA_BASE_URL:'http://localhost:11434',OLLAMA_MODEL:'test',CROSS_AI_LOCAL_FREE_APPROVED:'true'}).provider,'local');
console.log('Zero-spend Cross AI planning tests passed');