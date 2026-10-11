import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSource,chunkTranscript,searchApproved} from './ofri-oracle.mjs';
const sample={id:'sermon-001',platform:'youtube',url:'https://www.youtube.com/watch?v=example',title:'Approved sermon',permission:'owner-approved',transcript:'Faith and family. '.repeat(120)};
test('requires rights approval and HTTPS',()=>{
 assert.throws(()=>validateSource({...sample,permission:'unknown'}),/rights approval/);
 assert.throws(()=>validateSource({...sample,url:'http://example.com'}),/HTTPS/);
});
test('chunks content with provenance',()=>{
 const chunks=chunkTranscript(sample,1400);
 assert.ok(chunks.length>1);
 assert.ok(chunks.every(c=>c.sourceUrl===sample.url&&c.reviewed===false));
});
test('search ignores unreviewed sermon material',()=>{
 const chunks=chunkTranscript(sample);
 assert.deepEqual(searchApproved(chunks,'faith'),[]);
 assert.ok(searchApproved([{...chunks[0],reviewed:true}],'faith').length===1);
});
