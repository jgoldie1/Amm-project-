import test from 'node:test'
import assert from 'node:assert/strict'
import {createTemplateCatalogHandler} from '../api/templates/catalog.js'
import {hasTemplateAuthority,validateTemplateListing} from '../api/_lib/template-listing.js'
const id='custom-11111111-1111-4111-8111-111111111111'
const listing={id,name:'Cleaning starter',audience:'Local cleaning businesses',headline:'A cleaner space.',description:'A starter website for cleaning inquiries.',bestFor:'Residential and office cleaners.',benefit:'Helps customers describe the job.',includes:'A service inquiry demo. Scheduling is separate.',priceCents:7900,demo:{brand:'Fresh Start Cleaning',tagline:'Your clean space starts here.',tone:'#174a39',type:'inquiry',items:[['Home cleaning inquiry',0]]}}
const owner={id:'owner',app_metadata:{role:'template-admin'}}
const body={listing,status:'published',expectedRevision:0,rightsConfirmed:true,demoReviewed:true}
const response=()=>({setHeader(){},status(code){this.code=code;return this},json(data){this.data=data;return this}})
test('self-assigned user metadata and support role cannot publish',()=>{
 assert.equal(hasTemplateAuthority({id:'a',user_metadata:{role:'founder'}},''),false)
 assert.equal(hasTemplateAuthority({id:'a',app_metadata:{role:'support'}},''),false)
 assert.equal(hasTemplateAuthority(owner,''),true)
 assert.equal(hasTemplateAuthority({id:'listed'},' listed, another'),true)
})
test('validation rejects invalid prices, duplicate item names and unsafe demo colors',()=>{
 for(const priceCents of [0,-1,49.5,100000,NaN,'4900'])assert.equal(validateTemplateListing({...listing,priceCents}).ok,false)
 assert.equal(validateTemplateListing({...listing,demo:{...listing.demo,tone:'red;display:none'}}).ok,false)
 assert.equal(validateTemplateListing({...listing,demo:{...listing.demo,items:[['Same',1],['same',2]]}}).ok,false)
 assert.equal(validateTemplateListing({...listing,demo:{...listing.demo,items:[['Bad decimal',1.234]]}}).ok,false)
 assert.equal(validateTemplateListing({...listing,id:'01'}).ok,false)
})
test('validation strips unrecognized delivery links and owner claims',()=>{
 const r=validateTemplateListing({...listing,checkoutUrl:'https://evil.example',owner_user_id:'intruder',status:'paid'})
 assert.equal(r.ok,true);assert.equal(r.data.checkoutUrl,undefined);assert.equal(r.data.owner_user_id,undefined);assert.equal(r.data.status,undefined)
})
test('public catalog selects published rows and never exposes owner identity',async()=>{
 let query;const h=createTemplateCatalogHandler({userFor:()=>assert.fail('public read should not authenticate'),rest:async(_t,o)=>{query=o.query;return [{id,data:listing,revision:2,owner_user_id:'secret',status:'published'},{id:'bad',data:{}}]}})
 const r=response();await h({method:'GET',query:{status:'draft'}},r)
 assert.equal(r.code,200);assert.equal(query.status,'eq.published');assert.equal(r.data.templates.length,1);assert.equal(r.data.templates[0].owner_user_id,undefined);assert.equal(r.data.checkoutEnabled,false)
})
test('unauthenticated owner request never reaches storage',async()=>{
 const h=createTemplateCatalogHandler({userFor:(_q,r)=>{r.status(401).json({error:'Sign in'});return null},rest:()=>assert.fail('storage forbidden')})
 const r=response();await h({method:'POST',body},r);assert.equal(r.code,401)
})
test('ordinary customer cannot publish or read drafts',async()=>{
 for(const req of [{method:'POST',body},{method:'GET',query:{manage:'1'}}]){
  const h=createTemplateCatalogHandler({userFor:async()=>({id:'customer'}),rest:()=>assert.fail('storage forbidden')});const r=response();await h(req,r);assert.equal(r.code,403)
 }
})
test('publication requires demo review and rights confirmation',async()=>{
 for(const patch of [{demoReviewed:false},{rightsConfirmed:false}]){
  const h=createTemplateCatalogHandler({userFor:async()=>owner,rest:()=>assert.fail('no write allowed')});const r=response();await h({method:'POST',body:{...body,...patch}},r);assert.equal(r.code,400)
 }
})
test('server supplies owner and revision and confirms only a stored listing',async()=>{
 let inserted;const h=createTemplateCatalogHandler({userFor:async()=>owner,rest:async(_t,o)=>{inserted=o.body;return [inserted]}});const r=response()
 await h({method:'POST',body:{...body,owner_user_id:'attacker',revision:100}},r)
 assert.equal(r.code,201);assert.equal(inserted.owner_user_id,'owner');assert.equal(inserted.updated_by,'owner');assert.equal(inserted.revision,1);assert.equal(r.data.template.status,'published');assert.equal(r.data.checkoutEnabled,false)
})
test('stale revision cannot overwrite a newer listing',async()=>{
 let query;const h=createTemplateCatalogHandler({userFor:async()=>owner,rest:async(_t,o)=>{query=o.query;return []}});const r=response();await h({method:'PATCH',body:{...body,expectedRevision:2}},r)
 assert.equal(query.revision,'eq.2');assert.equal(r.code,409);assert.equal(r.data.template,undefined)
})
test('a successful revision update can archive a listing',async()=>{
 let update;const h=createTemplateCatalogHandler({userFor:async()=>owner,rest:async(_t,o)=>{update=o.body;return [{...update,id}]}});const r=response();await h({method:'PATCH',body:{...body,status:'archived',expectedRevision:2,demoReviewed:false}},r)
 assert.equal(r.code,200);assert.equal(update.revision,3);assert.equal(update.status,'archived')
})
test('duplicate creation does not claim success or overwrite a row',async()=>{
 const h=createTemplateCatalogHandler({userFor:async()=>owner,rest:async()=>{throw {details:{code:'23505'}}}});const r=response();await h({method:'POST',body},r);assert.equal(r.code,409)
})
test('storage failure never reports publication',async()=>{
 const h=createTemplateCatalogHandler({userFor:async()=>owner,rest:async()=>{throw new Error('upstream unavailable')}});const r=response();await h({method:'POST',body},r);assert.equal(r.code,503);assert.equal(r.data.template,undefined)
})
