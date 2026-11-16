import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ANIYAH_VOICE_HANDOFF_KEY,buildAniyahStudioBrief,saveAniyahStudioBrief,readAniyahStudioBrief} from '../public/aniyah-voice-handoff.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const memory=()=>{const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}};
test('studio handoff preserves NPC line as a non-published recording brief',()=>{
 const storage=memory();
 const b=buildAniyahStudioBrief({branch:'storefront-community',nodeId:'greet',speaker:'Chicago shopkeeper',line:'Hello BJ'});
 assert.equal(b.mode,'npc-dialogue');
 assert.equal(b.publishAuthorized,false);
 assert.equal(b.distributionAuthorized,false);
 assert.equal(b.recordingStatus,'not-recorded');
 saveAniyahStudioBrief(storage,b);
 assert.deepEqual(readAniyahStudioBrief(storage),b);
 assert.ok(storage.getItem(ANIYAH_VOICE_HANDOFF_KEY));
});
test('music-show branch routes through existing Aniyah recording studio',()=>{
 const b=buildAniyahStudioBrief({branch:'musicverse-showcase',nodeId:'rights',speaker:'All American Records promoter',line:'Rights come first.'});
 assert.equal(b.mode,'music-show');
 assert.match(b.project,/Who Wants to Be a Star/);
});
test('rejects invalid branch, empty line and attempts to grant distribution',()=>{
 const storage=memory();
 assert.equal(buildAniyahStudioBrief({branch:'fake',nodeId:'greet',speaker:'X',line:'Y'}),null);
 assert.equal(buildAniyahStudioBrief({branch:'musicverse-showcase',nodeId:'greet',speaker:'X',line:''}),null);
 const b=buildAniyahStudioBrief({branch:'warehouse-training',nodeId:'greet',speaker:'Supervisor',line:'Test'});
 assert.throws(()=>saveAniyahStudioBrief(storage,{...b,publishAuthorized:true}));
 storage.setItem(ANIYAH_VOICE_HANDOFF_KEY,JSON.stringify({...b,distributionAuthorized:true}));
 assert.equal(readAniyahStudioBrief(storage),null);
});
test('root and game use the same local project handoff and NPC page assets',()=>{
 for(const f of ['aniyah-voice-handoff.mjs','warehouse-mission-ui.mjs','warehouse-missions.html'])
  assert.equal(read('public/'+f),read('amm-omniverse/public/'+f),'out of sync: '+f);
 const ui=read('public/warehouse-mission-ui.mjs'),html=read('public/warehouse-missions.html');
 assert.match(ui,/saveAniyahStudioBrief/);
 assert.match(html,/id="npcStudioHandoff"/);
 assert.match(html,/href="\/aniyah-studio"/);
});
test('Aniyah 64 Track Studio shows the incoming brief without auto-recording or publishing',()=>{
 const studio=read('amm-omniverse/src/components/Aniyah64TrackStudio.tsx');
 assert.match(studio,/ANIYAH_VOICE_HANDOFF_KEY/);
 assert.match(studio,/INCOMING MYCELIUM RECORDING BRIEF/);
 assert.match(studio,/OPEN ENGINEER MODE TO RECORD/);
 assert.match(studio,/No publishing or distribution authorized/);
});
