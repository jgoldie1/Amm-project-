'use strict';
const assert=require('assert');
const c=require('../lib/quantum-crawler');
const rules=c.parseRobots('User-agent: *\nDisallow: /private\nAllow: /private/public\nUser-agent: TRYAMMBot\nDisallow: /no-ai\nAllow: /no-ai/open');
assert.equal(c.allowedByRules(new URL('https://example.com/no-ai/x'),rules),false);
assert.equal(c.allowedByRules(new URL('https://example.com/no-ai/open/x'),rules),true);
const doc={status:'fetched',canonicalUrl:'https://example.com/a',host:'example.com',title:'A',text:'evidence text',contentHash:'abc',fetchedAt:new Date().toISOString()};
const idx=c.indexDocument(doc);assert(idx&&idx.sourceType==='quantum_index');assert(idx.id);
console.log('quantum-crawler-smoke: PASS');
