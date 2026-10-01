import fs from 'node:fs'

const headData=fs.readFileSync(new URL('../src/data/streetVerseCharacterHeadRig.ts',import.meta.url),'utf8')
const expressions=fs.readFileSync(new URL('../src/data/streetVerseFacialExpressions.ts',import.meta.url),'utf8')
const headRuntime=fs.readFileSync(new URL('../src/runtime/StreetVerseCharacterHeadRuntime.ts',import.meta.url),'utf8')
const expressionRuntime=fs.readFileSync(new URL('../src/runtime/StreetVerseFacialExpressionRuntime.ts',import.meta.url),'utf8')
const talkRuntime=fs.readFileSync(new URL('../src/runtime/StreetVerseLiveTalkRuntime.ts',import.meta.url),'utf8')
const talkUI=fs.readFileSync(new URL('../src/components/StreetVerseLiveTalkControl.tsx',import.meta.url),'utf8')
const panel=fs.readFileSync(new URL('../src/components/StreetVerseCharacterDevelopmentPanel.tsx',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const factory=fs.readFileSync(new URL('../src/data/streetVerseCharacterFactory.ts',import.meta.url),'utf8')

for(const x of ['jawOpen','mouthSmile','mouthFrown','mouthWide','mouthNarrow','browInnerUp','browDownLeft','browDownRight','cheekRaise'])if(!headData.includes(x))throw new Error('V5 face channel missing '+x)
for(const x of ["'warm-smile'","'serious'","'focused'","'concerned'","'skeptical'","'surprised'","'angry'","'laughing'","'proud'"])if(!expressions.includes(x))throw new Error('V5 expression missing '+x)
for(const x of ['applyMorphPose','applyProceduralPose','proceduralFallback','character-head-replacement'])if(!headRuntime.includes(x))throw new Error('V5 head expression support missing '+x)
for(const x of ['character-expression-request','character-expression-state','blendPose','requestAnimationFrame'])if(!expressionRuntime.includes(x))throw new Error('Expression runtime missing '+x)
for(const x of ['getUserMedia','AnalyserNode','tryamm:bj-live-talk-level','tryamm:streetverse-spoken-dialogue','SpeechRecognition','webkitSpeechRecognition'])if(!talkRuntime.includes(x))throw new Error('Live talk runtime missing '+x)
for(const x of ['Start live BJ microphone','VOICE LIP-SYNC','TAP TO TALK IRL'])if(!talkUI.includes(x))throw new Error('Live talk UI missing '+x)
for(const x of ['Facial Expression Test','requestStreetVerseExpression','warm-smile'])if(!panel.includes(x))throw new Error('Expression test UI missing '+x)
for(const x of ['installStreetVerseFacialExpressionRuntime','bjFacialExpressionsV5:true','bjLiveMicLipSync:true','StreetVerseLiveTalkControl'])if(!world.includes(x))throw new Error('V5 mobile facial system missing '+x)
for(const x of ["templateVersion:'bj-v5-photo-match-ready'","liveMicLipSyncReady:true","facialMorphChannelsReady:true"])if(!factory.includes(x))throw new Error('V5 factory readiness missing '+x)

console.log('BJ V5 facial expressions + live microphone + replaceable head contract: PASS')
