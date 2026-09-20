'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {raceProviders,classifyIntent}=require('../lib/hologpt-race');

(async()=>{
  assert.strictEqual(classifyIntent('fix my GitHub build error'),'coding');
  assert.strictEqual(classifyIntent('open StreetVerse'),'action');

  const started=Date.now();
  const result=await raceProviders({
    message:'test fast failover',
    memory:[],
    context:{},
    hedgeDelayMs:10,
    width:2,
    providers:[
      {name:'openai-responses',run:async()=>{await new Promise(r=>setTimeout(r,180));return {answer:'slow',provider:'slow'}}},
      {name:'vercel-ai-gateway',run:async()=>{await new Promise(r=>setTimeout(r,20));return {answer:'fast',provider:'fast'}}}
    ]
  });
  assert.strictEqual(result.answer,'fast');
  assert.strictEqual(result.orchestration.mode,'hedged-model-race');
  assert(result.orchestration.totalLatencyMs<170,'hedged race should beat slow primary');
  assert(result.orchestration.progress.includes('COMPLETE'));

  const root=path.join(__dirname,'..');
  const chat=fs.readFileSync(path.join(root,'lib/hologpt-chat.js'),'utf8');
  const widget=fs.readFileSync(path.join(root,'public/hologpt-widget.js'),'utf8');
  const omniAnswer=fs.readFileSync(path.join(root,'amm-omniverse/api/ai/answer.js'),'utf8');
  const omniRace=fs.readFileSync(path.join(root,'amm-omniverse/api/ai/_lib/holo-race.js'),'utf8');
  const worldMemory=fs.readFileSync(path.join(root,'lib/hologpt-world-memory.js'),'utf8');
  const routes=fs.readFileSync(path.join(root,'lib/stubbs-ai-routes.js'),'utf8');

  assert(chat.includes("require('./hologpt-race')"),'production HoloGPT must use race router');
  assert(chat.includes("orchestration:'hedged-model-race'"),'health must report race orchestration');
  assert(omniAnswer.includes('raceHoloProviders'),'Omniverse HoloGPT must use race router');
  assert(omniRace.includes("mode:'hedged-model-race'"),'Omniverse race module missing');
  assert(widget.includes('RACING MODELS'),'widget must expose visible model-race progress');
  assert(widget.includes('RECOVERY · retrying from checkpoint'),'widget must auto-recover from checkpoint');
  assert(widget.includes("sessionStorage.setItem(CHECKPOINT_KEY"),'widget must save session checkpoint');
  assert(widget.includes("'open-streetverse':'/streetverse'"),'action-first fallback must open StreetVerse');
  assert(widget.includes("'open-live':'/live'"),'action-first fallback must open LIVE');
  assert(widget.includes('SpeechRecognition'),'widget must support feature-detected voice input');
  assert(widget.includes('LISTENING · voice-first input'),'widget must expose voice progress');
  assert(worldMemory.includes("PREFIX='HOLOGPT_WORLD_V1:'"),'structured world-memory marker missing');
  assert(worldMemory.includes('expiresAt'),'world memory must carry expiry metadata');
  assert(routes.includes("/api/hologpt/world-memory"),'world-memory API route missing');

  const elapsed=Date.now()-started;
  console.log('HOLOGPT AI RACE PASS',JSON.stringify({elapsedMs:elapsed,winner:result.orchestration.winner}));
})().catch(error=>{console.error(error);process.exit(1)});
