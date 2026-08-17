'use strict';
const assert=require('assert');
const {createInvention,triage,priorArtQueries}=require('../lib/ip-command-center');
const inv=createInvention({title:'Adaptive Holographic Runtime',summary:'Negotiates display network spatial audio presence accessibility and permissions.',inventors:['Human Inventor'],type:'patent-candidate'});
assert(inv.controls.confidential);assert.equal(inv.controls.externalAiAllowed,false);assert.equal(inv.controls.publicMarketingAllowed,false);
const t=triage(inv);assert.equal(t.route,'PRIOR_ART_SEARCH');assert.equal(t.automatedFilingAllowed,false);
const q=priorArtQueries(inv);assert(q.googlePatents.includes('adaptive'));assert(q.includeClaims&&q.includeCpc);
const disclosed=createInvention({title:'Disclosed Device',inventors:['Human Inventor'],publicDisclosure:true});assert(triage(disclosed).flags.includes('PUBLIC_DISCLOSURE_REVIEW_URGENT'));
console.log('IP Command Center smoke: PASS');
