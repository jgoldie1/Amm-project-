'use strict';const assert=require('node:assert/strict');const {makePlan}=require('../lib/hologpt-feature-planner');
assert.equal(makePlan({feature:'business',prompt:'hello'},{}).error,'no_confirmed_free_capacity');
assert.equal(makePlan({feature:'translation',prompt:'translate',containsSensitiveData:true},{}).error,'sensitive_data_requires_private_review');
assert.equal(makePlan({feature:'coding',prompt:'review code',allowPaid:true},{}).error,'paid_budget_not_approved');
assert.equal(makePlan({feature:'business',prompt:'draft',allowPaid:true,confirmedPaidBudget:true,provider:'openai'},{OPENAI_API_KEY:'test'}).ok,true);
assert.equal(makePlan({feature:'research',prompt:'check',allowPaid:false},{GEMINI_API_KEY:'test',CROSS_AI_GEMINI_FREE_CONFIRMED:'true'}).mode,'zero_spend');
assert.equal(makePlan({feature:'unknown',prompt:'x'},{}).error,'unsupported_feature');
console.log('HoloGPT feature planner tests passed');