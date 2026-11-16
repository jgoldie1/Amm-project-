import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DIALOGUES,MYCELIUM_DIALOGUE_KEY,initialDialogue,validateDialogue,advanceDialogue,getDialogueNode,loadDialogue,storeDialogue,resetDialogue} from '../public/warehouse-dialogue-director.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
for(const branch of Object.keys(DIALOGUES)){
 test(branch+' has two different dialogue routes to a final objective',()=>{
  const start=initialDialogue(branch);assert.equal(validateDialogue(start),true);
  const choices=getDialogueNode(start).choices;assert.equal(choices.length,2);
  const endings=new Set();
  for(const choice of choices){
   const middle=advanceDialogue(start,choice.id);
   assert.equal(middle.completed,false);
   const last=advanceDialogue(middle,getDialogueNode(middle).choices[0].id);
   assert.equal(last.completed,true);
   assert.ok(last.objective);
   assert.equal(getDialogueNode(last).end,true);
   endings.add(middle.node);
   assert.equal(advanceDialogue(last,'fake'),last);
  }
  assert.equal(endings.size,2);
 });
}
test('no conversation until six-checkpoint chapter is completed',()=>{
 const s=storage();assert.equal(loadDialogue(s,'musicverse-showcase',false),null);
});
test('save and restore resumes NPC conversation at exact checkpoint',()=>{
 const s=storage();const state=advanceDialogue(initialDialogue('storefront-community'),'listen');
 storeDialogue(s,state);assert.deepEqual(loadDialogue(s,'storefront-community',true),state);
 assert.ok(s.getItem(MYCELIUM_DIALOGUE_KEY));
});
test('tampering or unauthorized response cannot create completion',()=>{
 const s=storage();assert.throws(()=>advanceDialogue(initialDialogue('warehouse-training'),'fake'));
 s.setItem(MYCELIUM_DIALOGUE_KEY,JSON.stringify({...initialDialogue('warehouse-training'),completed:true}));
 assert.equal(loadDialogue(s,'warehouse-training',true).completed,false);
});
test('replay dialogue only removes its own storage, never real orders',()=>{
 const s=storage();s.setItem('real-order','preserved');
 storeDialogue(s,initialDialogue('musicverse-showcase'));resetDialogue(s);
 assert.equal(s.getItem(MYCELIUM_DIALOGUE_KEY),null);
 assert.equal(s.getItem('real-order'),'preserved');
});
test('app and game share exact same dialogue runtime, UI and HTML',()=>{
 for(const file of ['warehouse-dialogue-director.mjs','warehouse-mission-ui.mjs','warehouse-missions.html'])assert.equal(read('public/'+file),read('amm-omniverse/public/'+file));
});
test('accessible response buttons and human-actor playback are opt-in, with no microphone API',()=>{
 const html=read('public/warehouse-missions.html'),ui=read('public/warehouse-mission-ui.mjs');
 for(const id of ['npcConversation','npcLine','npcChoices','npcObjective','npcSpeak','npcStop','npcRepeat'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('aria-live="polite"'));
 assert.match(ui,/SpeechSynthesisUtterance/);assert.match(ui,/speechSynthesis\.cancel/);
 assert.doesNotMatch(ui,/getUserMedia|SpeechRecognition|fetch\(/);
 assert.match(ui,/tryamm:mycelium-dialogue-complete/);
});
