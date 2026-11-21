import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NPC_VOICE_ROLES,NPC_VOICE_ASSETS,resolveHumanVoiceAsset,validateLocalVoicePreview} from '../public/warehouse-human-voice.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const licensed={branch:'storefront-community',nodeId:'greet',actorConsentVerified:true,licenseReviewed:true,useAuthorized:true,humanRecorded:true,url:'/media/npc-human-voices/shopkeeper_greet.mp3'};
test('human voice is not available until approved licensed actor recording supplied',()=>{
 assert.deepEqual(NPC_VOICE_ASSETS,[]);
 assert.equal(resolveHumanVoiceAsset('storefront-community','greet'),null);
 assert.equal(resolveHumanVoiceAsset('storefront-community','greet',[licensed]),licensed.url);
});
test('blocks cloned or unconsented performer and arbitrary remote URLs',()=>{
 for(const key of ['actorConsentVerified','licenseReviewed','useAuthorized','humanRecorded'])
  assert.equal(resolveHumanVoiceAsset('storefront-community','greet',[{...licensed,[key]:false}]),null);
 assert.equal(resolveHumanVoiceAsset('storefront-community','greet',[{...licensed,url:'https://unsafe.example/audio.mp3'}]),null);
 assert.equal(resolveHumanVoiceAsset('unknown','greet',[licensed]),null);
});
test('requires performer permission for local preview and restricts size/type',()=>{
 const good={type:'audio/mpeg',size:2048};
 assert.equal(validateLocalVoicePreview(good,false).ok,false);
 assert.equal(validateLocalVoicePreview(good,true).ok,true);
 assert.equal(validateLocalVoicePreview({type:'text/html',size:2048},true).ok,false);
 assert.equal(validateLocalVoicePreview({type:'audio/wav',size:13*1024*1024},true).ok,false);
 assert.equal(validateLocalVoicePreview({type:'audio/ogg',size:0},true).ok,false);
});
test('app and StreetVerse have identical voice modules and no synthesized speech or microphone recording',()=>{
 for(const f of ['warehouse-human-voice.mjs','warehouse-missions.html','warehouse-mission-ui.mjs'])
  assert.equal(read('public/'+f),read('amm-omniverse/public/'+f));
 const ui=read('public/warehouse-mission-ui.mjs');
 const html=read('public/warehouse-missions.html');
 assert.doesNotMatch(ui,/SpeechSynthesisUtterance|speechSynthesis|getUserMedia|SpeechRecognition|fetch\(/);
 assert.match(ui,/URL\.createObjectURL\(file\)/);
 assert.match(ui,/URL\.revokeObjectURL\(voicePreviewUrl\)/);
 assert.match(html,/npcVoiceConsent/);
 assert.match(html,/npcVoicePlayer/);
});
test('file picker checks consent and selected file before preview is cleared',()=>{
 const ui=read('public/warehouse-mission-ui.mjs');
 assert.match(ui,/const file=\$\('npcVoiceFile'\)\.files\?\.\[0\]/);
 assert.match(ui,/const valid=validateLocalVoicePreview\(file,consent\)/);
 assert.doesNotMatch(ui,/\$\('npcVoiceFile'\)\.addEventListener\('change',\(\)=>\{\s*clearVoicePreview\(\)/);
});
