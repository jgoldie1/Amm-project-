import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIO_HANDOFFS,createNpcRecordingCueSheet,exportCueSheetText} from '../public/warehouse-vocal-studio-handoff.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('vocal studio and Holo Music use existing TRYAMM routes',()=>{
 assert.equal(STUDIO_HANDOFFS.voiceRecording,'/aniyah-studio');
 assert.equal(STUDIO_HANDOFFS.musicShowcase,'/music-hub.html');
 const app=read('amm-omniverse/src/App.tsx');
 assert.match(app,/route === '\/aniyah-studio'/);
});
test('human actor cue sheets contain every dialogue node and are not fake audio',()=>{
 for(const branch of ['storefront-community','musicverse-showcase','warehouse-training']){
  const sheet=createNpcRecordingCueSheet(branch);
  assert.equal(sheet.records.length,4);
  assert.ok(sheet.records.every(x=>x.status==='unrecorded'&&x.actorConsentVerified===false&&x.licenseReviewed===false));
  assert.match(exportCueSheetText(branch),/does not grant licensing or distribution rights/);
 }
 assert.throws(()=>createNpcRecordingCueSheet('fake'));
});
test('existing studio and broadcast links are visible and protected by completed chapter',()=>{
 const page=read('public/warehouse-missions.html'),ui=read('public/warehouse-mission-ui.mjs');
 for(const text of ['npcCueSheet','npcStudioStatus','/aniyah-studio','/music-hub.html'])assert.ok(page.includes(text));
 assert.match(ui,/if\(!state\.completed\|\|!dialogue\)/);
 assert.match(ui,/exportCueSheetText\(dialogue\.branch\)/);
});
test('studio handoff matches game and app asset copies',()=>{
 for(const file of ['warehouse-vocal-studio-handoff.mjs','warehouse-mission-ui.mjs','warehouse-missions.html'])
  assert.equal(read('public/'+file),read('amm-omniverse/public/'+file),file+' differs');
});
