import fs from'node:fs';import assert from'node:assert/strict';
for(const [file,tokens] of [
 ['ConnectedVerseSessionRuntime.ts',['street-to-faith','faith-to-music','music-to-star','star-to-sport','sport-to-holo','holo-to-street','saveConnectedVerseSession','connectedVerseSpawn']],
 ['ConnectedVerseWorldStreamingRuntime.ts',['circle-park','roosevelt','taylor','pilsen','npcBudget','vehicleBudget','activeInteriors']],
 ['ConnectedVerseCompanionRuntime.ts',['CompanionMood','relationship','memoryKeys','speaking','lookAt','companionSchedule']]
]){const src=fs.readFileSync(new URL('../src/runtime/'+file,import.meta.url),'utf8');for(const t of tokens)assert.ok(src.includes(t),`missing ${file}: ${t}`)}
console.log('Connected Verse session/streaming/companion contract: PASS');
