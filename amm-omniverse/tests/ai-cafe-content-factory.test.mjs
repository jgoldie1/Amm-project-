import test from 'node:test'
import assert from 'node:assert/strict'
import {createContentCampaign,evaluateContentRelease,CONTENT_FACTORY_LIMITS} from '../api/_lib/ai-cafe-content-factory.js'
test('each business starts an isolated draft with no posting',()=>{
 const c=createContentCampaign({businessId:'sculptify',brief:'Introduce our massage services',rightsApproved:true,platforms:['instagram','facebook']});
 assert.equal(c.postsPublished,false);assert.equal(c.postsScheduled,false)
 assert.equal(c.stages.length,6);assert.equal(c.status,'draft')
 assert.equal(evaluateContentRelease(c).approved,false)
});
test('release needs evidence for six verified steps and posting approval',()=>{
 const c=createContentCampaign({businessId:'tryamm',brief:'StreetVerse launch',rightsApproved:true,platforms:['instagram']})
 for(const s of c.stages){s.status='verified';s.evidence=['reviewed-file']}
 assert.ok(evaluateContentRelease(c).errors.includes('posting_requires_approval'))
 c.stages.find(s=>s.stage==='posting').humanApproved=true
 assert.equal(evaluateContentRelease(c).action,'ready_for_explicit_scheduling')
 assert.equal(CONTENT_FACTORY_LIMITS.automaticPosting,false)
});
test('invalid cross-business, platform and blank briefs blocked',()=>{
 assert.throws(()=>createContentCampaign({businessId:'../x',brief:'ok'}))
 assert.throws(()=>createContentCampaign({businessId:'a',brief:' '}))
 assert.throws(()=>createContentCampaign({businessId:'a',brief:'ok',platforms:['unknown']}))
});
