import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

function harness({status='blocked',moderation='approved',rights='original',destinations=['reel'],exists=true}={}){
 const writes=[];let deliveries=0;
 const job={id:'job',media_id:'media',owner_id:'owner',status,destinations};
 const media={id:'media',owner_id:'owner',processing_status:'ready',storage_path:'owner/video.mp4',moderation_status:moderation,rights_status:rights};
 const source=fs.readFileSync(new URL('../api/media/process-publish.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export default async function handler','async function handler');
 const context={crypto,json:(res,status,body)=>Object.assign(res,{status,body}),requireUser:async()=>({id:'owner'}),verifyStoredObject:async()=>exists,userRest:async(req,path,options={})=>{
  if(options.method==='PATCH'){writes.push({path,...options.body});return [{...job,...options.body}];}
  if(path==='media_publish_jobs')return [job];
  if(path==='media_catalog')return [media];
  if(path==='media_publications')return [];
  if(path==='rpc/release1_deliver_publication'){deliveries++;return [{status:'delivered',destination:options.body.p_destination}];}
  throw new Error('Unexpected path '+path);
 }};
 vm.createContext(context);vm.runInContext(source,context);
 return {writes,get deliveries(){return deliveries},async run(){const res={};await context.handler({method:'POST',body:{jobId:'job'}},res);return res;}};
}
test('approved held publication resumes and delivers',async()=>{const h=harness();const r=await h.run();assert.equal(r.status,200);assert.equal(h.deliveries,1);assert.equal(r.body.job.status,'delivered');});
test('retry cannot bypass moderation',async()=>{const h=harness({moderation:'pending'});const r=await h.run();assert.equal(r.status,202);assert.equal(h.deliveries,0);assert.equal(r.body.job.status,'blocked');});
test('retry cannot bypass rights clearance',async()=>{const h=harness({rights:'unknown'});const r=await h.run();assert.equal(r.status,202);assert.equal(h.deliveries,0);assert.equal(r.body.job.error_code,'RIGHTS_CLEARANCE_REQUIRED');});
test('invalid destination does not leave job processing',async()=>{const h=harness({status:'queued',destinations:['invalid']});const r=await h.run();assert.equal(r.status,409);assert.equal(h.writes.length,0);});
test('missing media cannot publish after approval',async()=>{const h=harness({exists:false});const r=await h.run();assert.equal(r.status,409);assert.equal(h.deliveries,0);});
test('terminal delivered job does not deliver twice',async()=>{const h=harness({status:'delivered'});const r=await h.run();assert.equal(r.body.reused,true);assert.equal(h.deliveries,0);});
