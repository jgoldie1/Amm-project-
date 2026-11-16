import {WAREHOUSE_MISSION_STAGES,WAREHOUSE_MISSION_ID,readWarehouseMission,saveWarehouseMission,resetWarehouseMission,advanceWarehouseMission} from './warehouse-mission-engine.mjs';
import {installWarehouseMyceliumBridge} from './warehouse-mycelium-bridge.mjs';
import {MYCELIUM_SCENES,readMyceliumScene,selectMyceliumScene,resetMyceliumScene} from './warehouse-mycelium-scenes.mjs';
import {initialDialogue,advanceDialogue,getDialogueNode,loadDialogue,storeDialogue,resetDialogue} from './warehouse-dialogue-director.mjs';
import {resolveHumanVoiceAsset,validateLocalVoicePreview} from './warehouse-human-voice.mjs';
installWarehouseMyceliumBridge(window);
const $=id=>document.getElementById(id);
let state=readWarehouseMission(localStorage);
let dialogue=null;
let voicePreviewUrl=null;
function stopVoice(){const p=$('npcVoicePlayer');p.pause();p.currentTime=0;}
function clearVoicePreview(){stopVoice();if(voicePreviewUrl){URL.revokeObjectURL(voicePreviewUrl);voicePreviewUrl=null;} $('npcVoicePlayer').removeAttribute('src');$('npcVoicePlayer').load();$('npcVoiceFile').value='';$('npcVoiceConsent').checked=false;}
function startDialogue(branch){dialogue=loadDialogue(localStorage,branch,state.completed);renderDialogue();}
function renderDialogue(){
 const panel=$('npcConversation');
 const scene=readMyceliumScene(localStorage,state.completed);
 if(!state.completed||!scene||!dialogue||dialogue.branch!==scene.branch){panel.hidden=true;return;}
 const node=getDialogueNode(dialogue);
 if(!node){panel.hidden=true;return;}
 panel.hidden=false;
 const asset=resolveHumanVoiceAsset(dialogue.branch,dialogue.node);
 $('npcVoiceStatus').textContent=asset?'Approved human recording available. Tap Play Human Voice.':voicePreviewUrl?'Local human-recorded preview ready; tap the player.':'No licensed actor recording for this line yet. Captions are available.';
 $('npcSpeaker').textContent=node.speaker;
 $('npcLine').textContent=node.line;
 $('npcObjective').textContent=dialogue.completed?'NEXT OBJECTIVE (PREVIEW): '+(dialogue.objective||'Story complete'):'Choose BJ’s response below.';
 const buttons=$('npcChoices');
 buttons.replaceChildren();
 for(const choice of node.choices||[]){
  const button=document.createElement('button');
  button.type='button';button.textContent='BJ: '+choice.label;
  button.addEventListener('click',()=>{
   try{clearVoicePreview();dialogue=advanceDialogue(dialogue,choice.id);storeDialogue(localStorage,dialogue);
    if(dialogue.completed)emit('tryamm:mycelium-dialogue-complete',{branch:dialogue.branch,objective:dialogue.objective,simulated:true,affectsInventory:false,createsBlockchainAnchor:false});
    renderDialogue();
   }catch{ $('npcObjective').textContent='Unable to save conversation; retry.'; }
  });
  buttons.append(button);
 }
}
function emit(name,detail){dispatchEvent(new CustomEvent(name,{detail:{...detail,source:'tryamm-warehouse-demo',authoritative:false,realMoney:false}}));}
function render(message=''){
 const finished=state.completed;
 const step=WAREHOUSE_MISSION_STAGES[Math.min(state.stage,WAREHOUSE_MISSION_STAGES.length-1)];
 $('counter').textContent=finished?'SIX-MISSION CHAPTER COMPLETE':`Checkpoint ${state.stage+1} of ${WAREHOUSE_MISSION_STAGES.length}`;
 $('progress').style.width=`${state.stage/WAREHOUSE_MISSION_STAGES.length*100}%`;
 $('missionTitle').textContent=finished?'Delivery complete — Chicago checkpoint reached':step.title;
 $('instruction').textContent=finished?'Your fictional customer has received the package. You may replay safely without duplicate rewards.':step.instruction;
 $('next').hidden=finished;$('next').textContent=step.action;
 $('message').textContent=message||(finished?'SIMULATED RECEIPT SAVED — NO MONEY OR XP AWARDED':'Ready for your next action.');
 $('myceliumScene').hidden=!finished;
 const scene=readMyceliumScene(localStorage,finished);
 $('sceneDialogue').textContent=scene?`${scene.speaker}: “${scene.dialogue}”`:'Select a story to meet the next NPC.';
 $('sceneMission').textContent=scene?scene.mission:'';
 document.querySelectorAll('[data-mycelium-branch]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.myceliumBranch===scene?.branch))});
 if(scene){if(!dialogue||dialogue.branch!==scene.branch)dialogue=loadDialogue(localStorage,scene.branch,finished);}
 renderDialogue();
 $('receipt').textContent=finished?`Demo receipt: ${state.receipt.reference} · Fictional mission only; not proof of stock, shipping or payment.`:'A demo-only completion receipt will appear here.';
}
$('next').addEventListener('click',()=>{
 try{
  if(state.completed)return;
  const step=WAREHOUSE_MISSION_STAGES[state.stage];
  state=advanceWarehouseMission(state,step.id);
  saveWarehouseMission(localStorage,state);
  emit('tryamm:warehouse-mission-progress',{missionId:WAREHOUSE_MISSION_ID,checkpoint:step.id,completed:state.completed});
  if(state.completed)emit('tryamm:streetverse-mission-complete',{missionId:WAREHOUSE_MISSION_ID,id:WAREHOUSE_MISSION_ID,simulated:true,noRewards:true});
  render(state.completed?'SIX-MISSION CHAPTER COMPLETE — DEMO RECEIPT READY':`✓ ${step.title.toUpperCase()}`);
 }catch(err){render(err.message||'Unable to save mission');}
});
$('replay').addEventListener('click',()=>{try{state=resetWarehouseMission(localStorage);resetMyceliumScene(localStorage);resetDialogue(localStorage);dialogue=null;clearVoicePreview();render('Chapter reset; no real inventory or earned credits changed.')}catch(e){render('Browser storage unavailable.')}});
document.querySelectorAll('[data-mycelium-branch]').forEach(button=>button.addEventListener('click',()=>{
 try{
  const scene=selectMyceliumScene(localStorage,button.dataset.myceliumBranch,state.completed);
  if(!scene){render('Complete all six checkpoints to unlock follow-up stories.');return;}
  clearVoicePreview();resetDialogue(localStorage);startDialogue(scene.branch);
  emit('tryamm:mycelium-choose-branch',{branch:scene.branch,fictional:true});
  render(`✓ ${scene.label.toUpperCase()} STORY SELECTED`);
 }catch{render('Cannot save scene choice on this device.')}
}));
$('npcSpeak').addEventListener('click',async()=>{
 const url=dialogue&&resolveHumanVoiceAsset(dialogue.branch,dialogue.node);
 if(!url){$('npcVoiceStatus').textContent='No approved recording for this NPC line yet. You can locally preview an actor recording below.';return;}
 clearVoicePreview();const p=$('npcVoicePlayer');p.src=url;
 try{await p.play();$('npcVoiceStatus').textContent='Playing approved actor recording.';}catch{$('npcVoiceStatus').textContent='Tap the audio player to begin playback.';}
});
$('npcVoiceFile').addEventListener('change',()=>{
 const file=$('npcVoiceFile').files?.[0];
 const consent=$('npcVoiceConsent').checked;
 const valid=validateLocalVoicePreview(file,consent);
 stopVoice();
 if(voicePreviewUrl){URL.revokeObjectURL(voicePreviewUrl);voicePreviewUrl=null;}
 $('npcVoicePlayer').removeAttribute('src');
 $('npcVoicePlayer').load();
 if(!valid.ok){$('npcVoiceStatus').textContent=valid.reason;return;}
 voicePreviewUrl=URL.createObjectURL(file);
 $('npcVoicePlayer').src=voicePreviewUrl;
 $('npcVoiceStatus').textContent='Local performer recording ready. Play with the audio control. This does not publish or license the recording.';
});
$('npcVoiceConsent').addEventListener('change',()=>{
 if(!$('npcVoiceConsent').checked&&voicePreviewUrl)clearVoicePreview();
});
$('npcStop').addEventListener('click',stopVoice);
$('npcRepeat').addEventListener('click',()=>{
 if(!state.completed||!dialogue)return;
 clearVoicePreview();dialogue=initialDialogue(dialogue.branch);
 try{storeDialogue(localStorage,dialogue)}catch{}
 renderDialogue();
});
window.addEventListener('pagehide',clearVoicePreview);
emit('tryamm:streetverse-mission-start',{missionId:WAREHOUSE_MISSION_ID,label:'All American Warehouse Delivery',simulated:true});
render();
