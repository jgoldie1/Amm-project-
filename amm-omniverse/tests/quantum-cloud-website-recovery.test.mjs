import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 emptyVault,createSite,applyChildTheme,softDeleteSite,restoreFromTrash,
 restoreVersion,mergeImportedVault,parseVault,PARENT_THEME_ID
} from '../src/runtime/AIWebsiteRecoveryVault.ts';
import {
 QUANTUM_CLOUD_LIMITS,routeQuantumCloudJob,estimatedSnapshotBytes,
 validateBackupBudget,fingerprintSnapshot
} from '../src/runtime/QuantumCloudCostPolicy.ts';

test('Website child themes inherit a stable parent and do not change other sites',()=>{
 let vault=createSite(emptyVault(),{name:'First TRYAMM',industry:'shop',city:'Chicago'});
 vault=createSite(vault,{name:'Second TRYAMM',industry:'beauty',city:'Tampa'});
 const a=vault.sites[0],b=vault.sites[1];
 const revised=applyChildTheme(vault,a.id,'royal');
 assert.equal(revised.sites[0].childTheme.parentId,PARENT_THEME_ID);
 assert.equal(revised.sites[0].childTheme.preset,'royal');
 assert.equal(revised.sites[1].childTheme.preset,'electric');
 assert.equal(b.childTheme.preset,'electric');
 assert.equal(revised.versions[0].site.childTheme.preset,'electric');
});
test('Website soft deletion never deletes site drafts permanently',()=>{
 const v=createSite(emptyVault(),{name:'Chicago Business',industry:'service',city:'Chicago'});
 const id=v.sites[0].id;
 const removed=softDeleteSite(v,id);
 assert.equal(removed.sites.length,0);
 assert.equal(removed.trash[0].site.id,id);
 assert.equal(removed.versions[0].reason,'before_soft_delete');
 const restored=restoreFromTrash(removed,id);
 assert.equal(restored.sites[0].name,'Chicago Business');
 assert.equal(restored.trash.length,0);
 assert.throws(()=>restoreFromTrash(restored,id),/trash_not_found/);
});
test('Version restore records previous state and reconstructs child theme',()=>{
 let v=createSite(emptyVault(),{name:'First',industry:'retail',city:'Chicago'});
 v=applyChildTheme(v,v.sites[0].id,'gold');
 const restored=restoreVersion(v,0);
 assert.equal(restored.sites[0].childTheme.preset,'electric');
 assert.equal(restored.versions[0].site.childTheme.preset,'gold');
});
test('Untrusted exports cannot create duplicate site IDs or retain secret fields',()=>{
 const v=createSite(emptyVault(),{name:'A',industry:'general',city:'Chicago'});
 assert.throws(()=>parseVault({...v,sites:[v.sites[0],v.sites[0]]}),/duplicate_site/);
 const suspicious={...v,sites:[{...v.sites[0],apiKey:'forbidden',childTheme:{parentId:'evil',preset:'royal'}}]};
 const scrubbed=parseVault(suspicious);
 assert.ok(!('apiKey' in scrubbed.sites[0]));
 assert.equal(scrubbed.sites[0].childTheme,undefined);
 const merged=mergeImportedVault(v,JSON.stringify(scrubbed));
 assert.equal(merged.sites.length,1);
});
test('Quantum cost router defaults to existing local/cloud resources and blocks paid services',()=>{
 assert.equal(routeQuantumCloudJob('website-draft',{signedIn:true,online:true}).route,'existing-supabase');
 assert.equal(routeQuantumCloudJob('website-draft',{signedIn:true,online:false}).route,'browser');
 assert.equal(routeQuantumCloudJob('website-draft',{signedIn:false,online:true}).route,'browser');
 assert.equal(routeQuantumCloudJob('video-render',{signedIn:true,online:true,webCodecs:true}).route,'browser');
 assert.equal(routeQuantumCloudJob('video-render',{signedIn:true,online:true,webCodecs:false}).route,'deferred');
 assert.equal(routeQuantumCloudJob('llm-inference',{signedIn:true,online:true}).route,'deferred');
 assert.equal(routeQuantumCloudJob('domain-purchase',{signedIn:true,online:true}).route,'manual-approval');
 assert.equal(routeQuantumCloudJob('live-broadcast',{signedIn:true,online:true}).route,'manual-approval');
 assert.equal(QUANTUM_CLOUD_LIMITS.automaticPaidCompute,false);
 assert.equal(QUANTUM_CLOUD_LIMITS.uploadVideoToDatabase,false);
});
test('Identical backup content fingerprints match and oversized payloads fail',async()=>{
 const payload=JSON.stringify({schema:'tryamm.website.vault.v1',sites:[],trash:[],versions:[],updatedAt:'2026-11-08'});
 assert.equal((await fingerprintSnapshot(payload)).length,64);
 assert.equal(await fingerprintSnapshot(payload),await fingerprintSnapshot(payload));
 assert.ok(estimatedSnapshotBytes(payload)>0);
 validateBackupBudget(payload);
 assert.throws(()=>validateBackupBudget('a'.repeat(QUANTUM_CLOUD_LIMITS.maximumBackupBytes+1)),/cloud_backup_size_cap_exceeded/);
});
test('Supabase schema is private, insertion-only and database-rotated to 40 backups',()=>{
 const sql=fs.readFileSync(new URL('../supabase/migrations/20261108193000_tryamm_website_recovery_snapshots.sql',import.meta.url),'utf8');
 for(const phrase of ['enable row level security','owner_id = (select auth.uid())','grant select','grant insert (owner_id,reason,fingerprint,payload)','offset 40','octet_length(payload::text) <= 256000','unique(owner_id,fingerprint)'])assert.ok(sql.includes(phrase),phrase);
 assert.doesNotMatch(sql,/grant (?:update|delete|all) on public\.tryamm_site_recovery_snapshots to authenticated/i);
});
test('Cloud client uses owner-scoped access, SHA256 dedup and no service-role key',()=>{
 const cloud=fs.readFileSync(new URL('../src/services/aiWebsiteCloudRecovery.ts',import.meta.url),'utf8');
 assert.match(cloud,/\.eq\('owner_id',userId\)/);
 assert.match(cloud,/ignoreDuplicates:true/);
 assert.match(cloud,/fingerprintSnapshot/);
 assert.doesNotMatch(cloud,/SERVICE_ROLE|service_role_key|adminRest/);
 const runtime=fs.readFileSync(new URL('../src/runtime/AIWebsiteBusinessBuilderRuntime.ts',import.meta.url),'utf8');
 assert.match(runtime,/scheduleCloud\(/);
 assert.match(runtime,/websiteDraftDebounceMs/);
 assert.match(runtime,/window\.addEventListener\('online'/);
 assert.match(runtime,/pendingCloud=null/);
 assert.match(runtime,/before_cloud_restore/);
});
