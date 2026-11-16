import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MYCELIUM_SCENES,MYCELIUM_BRANCH_KEY,selectMyceliumScene,readMyceliumScene,resetMyceliumScene} from '../public/warehouse-mycelium-scenes.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const storage=()=>{
 const data=new Map();
 return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
};
test('three original fictional NPC stories are available',()=>{
 assert.deepEqual(Object.keys(MYCELIUM_SCENES),['storefront-community','musicverse-showcase','warehouse-training']);
 assert.ok(Object.values(MYCELIUM_SCENES).every(s=>s.speaker&&s.dialogue&&s.mission));
});
test('cannot choose follow-up branch until six-checkpoint completion',()=>{
 const s=storage();
 assert.equal(selectMyceliumScene(s,'musicverse-showcase',false),null);
 assert.equal(s.getItem(MYCELIUM_BRANCH_KEY),null);
});
test('valid branch saves and reloads; invalid branch rejected',()=>{
 const s=storage();
 assert.equal(selectMyceliumScene(s,'fake-branch',true),null);
 const choice=selectMyceliumScene(s,'musicverse-showcase',true);
 assert.equal(choice.branch,'musicverse-showcase');
 assert.equal(choice.simulated,true);
 assert.equal(choice.authoritative,false);
 assert.equal(readMyceliumScene(s,true).speaker,'All American Records promoter');
});
test('replaying chapter resets only branch choice',()=>{
 const s=storage();
 s.setItem('real-order','must-preserve');
 selectMyceliumScene(s,'warehouse-training',true);
 resetMyceliumScene(s);
 assert.equal(readMyceliumScene(s,true),null);
 assert.equal(s.getItem('real-order'),'must-preserve');
});
test('both TRYAMM and Omniverse mission assets identical',()=>{
 for(const f of ['warehouse-missions.html','warehouse-mission-ui.mjs','warehouse-mycelium-scenes.mjs','warehouse-mycelium-bridge.mjs'])
 assert.equal(read('public/'+f),read('amm-omniverse/public/'+f),'mismatched '+f);
});
test('StreetVerse runtime reads chosen branch on startup and after navigation',()=>{
 const runtime=read('amm-omniverse/src/runtime/StreetVerseMyceliumTimelineRuntime.ts');
 assert.match(runtime,/STREETVERSE_MYCELIUM_BRANCH_SAVE_KEY/);
 assert.match(runtime,/chooseMyceliumBranch\(next,savedChoice/);
 assert.match(runtime,/if\(event.key===STREETVERSE_WAREHOUSE_SAVE_KEY\|\|event.key===STREETVERSE_MYCELIUM_BRANCH_SAVE_KEY\)/);
});
test('chapter UI presents large one-hand buttons and visible dialogue',()=>{
 const page=read('public/warehouse-missions.html'),ui=read('public/warehouse-mission-ui.mjs');
 assert.match(page,/data-mycelium-branch="musicverse-showcase"/);
 assert.match(page,/id="sceneDialogue" role="status"/);
 assert.match(ui,/selectMyceliumScene/);
 assert.match(ui,/resetMyceliumScene\(localStorage\)/);
});
